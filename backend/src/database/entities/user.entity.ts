import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@/common/entities/base.entity';
import { HouseholdMember } from './household-member.entity';
import { RefreshToken } from './refresh-token.entity';
import { Notification } from './notification.entity';

export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column()
  email: string;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'phone', nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: ThemePreference,
    default: ThemePreference.SYSTEM,
    name: 'theme_preference',
  })
  themePreference: ThemePreference;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  @OneToMany(() => HouseholdMember, (member) => member.user)
  householdMemberships: HouseholdMember[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
