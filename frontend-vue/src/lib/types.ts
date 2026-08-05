export enum HouseholdRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum RecurrenceFrequency {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SplitMethod {
  EQUAL = 'equal',
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum SplitStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
  CASH = 'cash',
  OTHER = 'other',
}

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  ELO = 'elo',
  AMEX = 'amex',
  HIPERCARD = 'hipercard',
  OTHER = 'other',
}

export enum GoalStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum NotificationType {
  INVITE_RECEIVED = 'invite_received',
  INVITE_ACCEPTED = 'invite_accepted',
  BILL_DUE = 'bill_due',
  BUDGET_EXCEEDED = 'budget_exceeded',
  GOAL_REACHED = 'goal_reached',
  SPLIT_CHARGE = 'split_charge',
  SPLIT_SETTLED = 'split_settled',
  TRANSACTION_CREATED = 'transaction_created',
  SYSTEM = 'system',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  themePreference: 'light' | 'dark' | 'system';
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Household {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: string;
  currency: string;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: HouseholdRole;
  joinedAt: string;
  user: User;
}

export interface Invite {
  id: string;
  householdId: string;
  email: string;
  token: string;
  role: HouseholdRole;
  status: InviteStatus;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  household?: Household;
  inviter?: User;
}

export interface Category {
  id: string;
  householdId: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface BankAccount {
  id: string;
  householdId: string;
  ownerId: string;
  name: string;
  bank?: string;
  type: AccountType;
  balance: number;
  color: string;
  isActive: boolean;
  includeInTotal: boolean;
  owner?: User;
}

export interface CreditCard {
  id: string;
  householdId: string;
  ownerId: string;
  name: string;
  brand: CardBrand;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  isActive: boolean;
  owner?: User;
}

export interface CreditCardInvoice {
  cardId: string;
  cycleStart: string;
  cycleEnd: string;
  total: number;
  availableLimit: number;
  usedPercentage: number;
  transactions: Transaction[];
}

export interface TransactionSplit {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  percentage?: number;
  status: SplitStatus;
  settledAt?: string;
  user?: User;
}

export interface Transaction {
  id: string;
  householdId: string;
  payerId: string;
  bankAccountId?: string;
  creditCardId?: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  status: TransactionStatus;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceEndDate?: string;
  isShared: boolean;
  category?: Category;
  payer?: User;
  bankAccount?: BankAccount;
  creditCard?: CreditCard;
  splits?: TransactionSplit[];
  createdAt: string;
}

export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
  alertThreshold: number;
  category?: Category;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isExceeded: boolean;
  isNearLimit: boolean;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: string;
  note?: string;
  user?: User;
}

export interface Goal {
  id: string;
  householdId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
  status: GoalStatus;
  contributions?: GoalContribution[];
}

export interface Notification {
  id: string;
  userId: string;
  householdId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  householdId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
  user?: User;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  accountsCount: number;
  creditCardsCount: number;
  activeGoalsCount: number;
  goals: { id: string; name: string; targetAmount: number; currentAmount: number; progress: number }[];
  recentTransactions: Transaction[];
}

export interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

export interface MemberSpending {
  userId: string;
  name: string;
  total: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiEnvelope<T> {
  data: T;
  meta: { timestamp: string };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
