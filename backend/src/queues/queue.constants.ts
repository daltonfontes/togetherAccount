export const QUEUE_NAMES = {
  RECURRING_TRANSACTIONS: 'recurring-transactions',
  EMAIL: 'email',
  NOTIFICATIONS: 'notifications',
} as const;

export const JOB_NAMES = {
  GENERATE_RECURRING: 'generate-recurring',
  SEND_INVITE_EMAIL: 'send-invite-email',
  SEND_MAGIC_LINK_EMAIL: 'send-magic-link-email',
  BUDGET_ALERT: 'budget-alert',
  BILL_DUE_REMINDER: 'bill-due-reminder',
} as const;
