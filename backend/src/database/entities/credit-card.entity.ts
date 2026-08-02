import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { CardBrand } from '@/common/enums';
import { Household } from './household.entity';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('credit_cards')
export class CreditCard extends BaseEntity {
  @Index()
  @Column({ name: 'household_id' })
  householdId: string;

  @ManyToOne(() => Household, (household) => household.creditCards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household: Household;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CardBrand, default: CardBrand.OTHER })
  brand: CardBrand;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'credit_limit' })
  creditLimit: number;

  @Column({ type: 'int', name: 'closing_day' })
  closingDay: number;

  @Column({ type: 'int', name: 'due_day' })
  dueDay: number;

  @Column({ default: '#8b5cf6' })
  color: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.creditCard)
  transactions: Transaction[];
}
