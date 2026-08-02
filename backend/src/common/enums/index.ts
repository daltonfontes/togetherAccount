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

export enum SplitStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
}

export enum SplitMethod {
  EQUAL = 'equal',
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
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

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  INVITE = 'invite',
  ACCEPT_INVITE = 'accept_invite',
  REMOVE_MEMBER = 'remove_member',
}

export enum GoalStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}
