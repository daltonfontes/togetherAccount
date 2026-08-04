import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { In, Repository } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  fullName: string;
  avatarUrl?: string;
  googleId?: string;
  emailVerified?: boolean;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(input: CreateUserInput): Promise<User> {
    const user = this.usersRepository.create(input);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async linkGoogleAccount(id: string, googleId: string, avatarUrl?: string): Promise<User> {
    const user = await this.findByIdOrFail(id);
    user.googleId = googleId;
    user.avatarUrl = user.avatarUrl ?? avatarUrl;
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findByIdOrFail(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findByIdOrFail(id);
    if (!user.passwordHash) {
      throw new BadRequestException(
        'This account signs in with Google and has no password to change',
      );
    }
    const isValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    user.passwordHash = await argon2.hash(dto.newPassword);
    await this.usersRepository.save(user);
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return this.usersRepository.findBy({ id: In(ids) });
  }
}
