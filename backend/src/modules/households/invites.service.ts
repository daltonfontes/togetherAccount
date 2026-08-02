import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Invite } from '@/database/entities/invite.entity';
import { HouseholdMember } from '@/database/entities/household-member.entity';
import { Household } from '@/database/entities/household.entity';
import { HouseholdRole, InviteStatus, AuditAction, NotificationType } from '@/common/enums';
import { UsersService } from '@/modules/users/users.service';
import { AuditService } from '@/modules/audit/audit.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { EmailQueueService } from '@/queues/email/email-queue.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/configuration';
import { CreateInviteDto } from './dto/create-invite.dto';

const INVITE_EXPIRY_DAYS = 7;

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite) private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(HouseholdMember)
    private readonly memberRepository: Repository<HouseholdMember>,
    @InjectRepository(Household)
    private readonly householdRepository: Repository<Household>,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async create(
    householdId: string,
    invitedBy: string,
    dto: CreateInviteDto,
  ): Promise<Invite> {
    const email = dto.email.toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      const alreadyMember = await this.memberRepository.findOne({
        where: { householdId, userId: existingUser.id },
      });
      if (alreadyMember) {
        throw new ConflictException('This person is already a member of the household');
      }
    }

    const pendingInvite = await this.inviteRepository.findOne({
      where: { householdId, email, status: InviteStatus.PENDING },
    });
    if (pendingInvite) {
      throw new ConflictException('An invite for this email is already pending');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = await this.inviteRepository.save(
      this.inviteRepository.create({
        householdId,
        email,
        role: dto.role || HouseholdRole.MEMBER,
        token: randomBytes(24).toString('hex'),
        invitedBy,
        expiresAt,
      }),
    );

    const household = await this.householdRepository.findOneOrFail({
      where: { id: householdId },
    });

    if (existingUser) {
      await this.notificationsService.create({
        userId: existingUser.id,
        householdId,
        type: NotificationType.INVITE_RECEIVED,
        title: 'Novo convite recebido',
        message: `Você foi convidado para participar de "${household.name}"`,
        metadata: { inviteId: invite.id, token: invite.token },
      });
    }

    const inviter = await this.usersService.findById(invitedBy);
    await this.emailQueueService.queueInviteEmail({
      to: email,
      householdName: household.name,
      inviterName: inviter?.fullName ?? 'Um membro da casa',
      inviteToken: invite.token,
      frontendUrl: this.configService.get('frontendUrl', { infer: true })!,
    });

    await this.auditService.log({
      householdId,
      userId: invitedBy,
      action: AuditAction.INVITE,
      entityType: 'Invite',
      entityId: invite.id,
      newValue: { email, role: invite.role },
    });

    return invite;
  }

  async listForHousehold(householdId: string): Promise<Invite[]> {
    return this.inviteRepository.find({
      where: { householdId },
      order: { createdAt: 'DESC' },
      relations: ['inviter'],
    });
  }

  async listForUser(email: string): Promise<Invite[]> {
    return this.inviteRepository.find({
      where: { email: email.toLowerCase(), status: InviteStatus.PENDING },
      relations: ['household', 'inviter'],
      order: { createdAt: 'DESC' },
    });
  }

  async accept(token: string, userId: string, userEmail: string): Promise<HouseholdMember> {
    const invite = await this.findValidInvite(token);

    if (invite.email !== userEmail.toLowerCase()) {
      throw new BadRequestException('This invite was issued for a different email address');
    }

    const alreadyMember = await this.memberRepository.findOne({
      where: { householdId: invite.householdId, userId },
    });
    if (alreadyMember) {
      invite.status = InviteStatus.ACCEPTED;
      await this.inviteRepository.save(invite);
      return alreadyMember;
    }

    const member = await this.memberRepository.save(
      this.memberRepository.create({
        householdId: invite.householdId,
        userId,
        role: invite.role,
      }),
    );

    invite.status = InviteStatus.ACCEPTED;
    await this.inviteRepository.save(invite);

    await this.auditService.log({
      householdId: invite.householdId,
      userId,
      action: AuditAction.ACCEPT_INVITE,
      entityType: 'Invite',
      entityId: invite.id,
    });

    await this.notificationsService.create({
      userId: invite.invitedBy,
      householdId: invite.householdId,
      type: NotificationType.INVITE_ACCEPTED,
      title: 'Convite aceito',
      message: `Seu convite foi aceito`,
      metadata: { inviteId: invite.id },
    });

    return member;
  }

  async decline(token: string, userEmail: string): Promise<void> {
    const invite = await this.findValidInvite(token);
    if (invite.email !== userEmail.toLowerCase()) {
      throw new BadRequestException('This invite was issued for a different email address');
    }
    invite.status = InviteStatus.DECLINED;
    await this.inviteRepository.save(invite);
  }

  async revoke(householdId: string, inviteId: string): Promise<void> {
    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId, householdId },
    });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    invite.status = InviteStatus.REVOKED;
    await this.inviteRepository.save(invite);
  }

  private async findValidInvite(token: string): Promise<Invite> {
    const invite = await this.inviteRepository.findOne({ where: { token } });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('This invite is no longer valid');
    }
    if (invite.expiresAt < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await this.inviteRepository.save(invite);
      throw new BadRequestException('This invite has expired');
    }
    return invite;
  }
}
