import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('magic_link_tokens')
export class MagicLinkToken extends BaseEntity {
  @Index()
  @Column()
  email: string;

  // Hashed (sha256) rather than stored in plaintext like Invite.token: a
  // magic link token is a full-login bearer credential (closer to a
  // refresh token in sensitivity), so a DB leak shouldn't hand out live
  // sessions the way a leaked plaintext token would.
  @Index({ unique: true })
  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', name: 'consumed_at', nullable: true })
  consumedAt?: Date;
}
