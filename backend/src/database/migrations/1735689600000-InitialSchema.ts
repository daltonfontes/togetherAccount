import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1735689600000 implements MigrationInterface {
  name = 'InitialSchema1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TYPE "theme_preference_enum" AS ENUM ('light', 'dark', 'system');
      CREATE TYPE "household_role_enum" AS ENUM ('owner', 'admin', 'member');
      CREATE TYPE "invite_status_enum" AS ENUM ('pending', 'accepted', 'declined', 'expired', 'revoked');
      CREATE TYPE "transaction_type_enum" AS ENUM ('income', 'expense', 'transfer');
      CREATE TYPE "transaction_status_enum" AS ENUM ('pending', 'completed', 'canceled');
      CREATE TYPE "recurrence_frequency_enum" AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');
      CREATE TYPE "split_status_enum" AS ENUM ('pending', 'settled');
      CREATE TYPE "account_type_enum" AS ENUM ('checking', 'savings', 'investment', 'cash', 'other');
      CREATE TYPE "card_brand_enum" AS ENUM ('visa', 'mastercard', 'elo', 'amex', 'hipercard', 'other');
      CREATE TYPE "notification_type_enum" AS ENUM (
        'invite_received', 'invite_accepted', 'bill_due', 'budget_exceeded',
        'goal_reached', 'split_charge', 'split_settled', 'transaction_created', 'system'
      );
      CREATE TYPE "audit_action_enum" AS ENUM (
        'create', 'update', 'delete', 'login', 'logout', 'invite', 'accept_invite', 'remove_member'
      );
      CREATE TYPE "goal_status_enum" AS ENUM ('in_progress', 'completed', 'archived');
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "email" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "full_name" varchar NOT NULL,
        "avatar_url" varchar,
        "phone" varchar,
        "theme_preference" theme_preference_enum NOT NULL DEFAULT 'system',
        "is_active" boolean NOT NULL DEFAULT true,
        "email_verified" boolean NOT NULL DEFAULT false,
        "last_login_at" timestamptz
      );
      CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email");
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" varchar NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "user_agent" varchar,
        "ip_address" varchar
      );
      CREATE INDEX "idx_refresh_tokens_user" ON "refresh_tokens" ("user_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "households" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "name" varchar NOT NULL,
        "description" varchar,
        "invite_code" varchar NOT NULL,
        "owner_id" uuid NOT NULL,
        "currency" varchar NOT NULL DEFAULT 'BRL'
      );
      CREATE UNIQUE INDEX "idx_households_invite_code" ON "households" ("invite_code");
    `);

    await queryRunner.query(`
      CREATE TABLE "household_members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role" household_role_enum NOT NULL DEFAULT 'member',
        "joined_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_household_members_household_user" UNIQUE ("household_id", "user_id")
      );
      CREATE INDEX "idx_household_members_household" ON "household_members" ("household_id");
      CREATE INDEX "idx_household_members_user" ON "household_members" ("user_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "invites" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "email" varchar NOT NULL,
        "token" varchar NOT NULL,
        "role" household_role_enum NOT NULL DEFAULT 'member',
        "status" invite_status_enum NOT NULL DEFAULT 'pending',
        "invited_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "expires_at" timestamptz NOT NULL
      );
      CREATE INDEX "idx_invites_household" ON "invites" ("household_id");
      CREATE INDEX "idx_invites_email" ON "invites" ("email");
      CREATE UNIQUE INDEX "idx_invites_token" ON "invites" ("token");
    `);

    await queryRunner.query(`
      CREATE TABLE "bank_accounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" varchar NOT NULL,
        "bank" varchar,
        "type" account_type_enum NOT NULL DEFAULT 'checking',
        "balance" decimal(14,2) NOT NULL DEFAULT 0,
        "color" varchar NOT NULL DEFAULT '#3b82f6',
        "is_active" boolean NOT NULL DEFAULT true,
        "include_in_total" boolean NOT NULL DEFAULT true
      );
      CREATE INDEX "idx_bank_accounts_household" ON "bank_accounts" ("household_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "credit_cards" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" varchar NOT NULL,
        "brand" card_brand_enum NOT NULL DEFAULT 'other',
        "credit_limit" decimal(14,2) NOT NULL,
        "closing_day" int NOT NULL,
        "due_day" int NOT NULL,
        "color" varchar NOT NULL DEFAULT '#8b5cf6',
        "is_active" boolean NOT NULL DEFAULT true
      );
      CREATE INDEX "idx_credit_cards_household" ON "credit_cards" ("household_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "name" varchar NOT NULL,
        "type" transaction_type_enum NOT NULL DEFAULT 'expense',
        "icon" varchar NOT NULL DEFAULT 'circle',
        "color" varchar NOT NULL DEFAULT '#64748b',
        "is_default" boolean NOT NULL DEFAULT false
      );
      CREATE INDEX "idx_categories_household" ON "categories" ("household_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "payer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "bank_account_id" uuid REFERENCES "bank_accounts"("id") ON DELETE SET NULL,
        "credit_card_id" uuid REFERENCES "credit_cards"("id") ON DELETE SET NULL,
        "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
        "type" transaction_type_enum NOT NULL,
        "amount" decimal(14,2) NOT NULL,
        "description" varchar NOT NULL,
        "notes" varchar,
        "date" date NOT NULL,
        "status" transaction_status_enum NOT NULL DEFAULT 'completed',
        "is_recurring" boolean NOT NULL DEFAULT false,
        "recurrence_frequency" recurrence_frequency_enum NOT NULL DEFAULT 'none',
        "recurrence_end_date" date,
        "parent_transaction_id" uuid,
        "is_shared" boolean NOT NULL DEFAULT false,
        "attachments" text
      );
      CREATE INDEX "idx_transactions_household" ON "transactions" ("household_id");
      CREATE INDEX "idx_transactions_date" ON "transactions" ("date");
    `);

    await queryRunner.query(`
      CREATE TABLE "transaction_splits" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "transaction_id" uuid NOT NULL REFERENCES "transactions"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "amount" decimal(14,2) NOT NULL,
        "percentage" decimal(5,2),
        "status" split_status_enum NOT NULL DEFAULT 'pending',
        "settled_at" timestamptz
      );
      CREATE INDEX "idx_transaction_splits_transaction" ON "transaction_splits" ("transaction_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "budgets" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        "month" int NOT NULL,
        "year" int NOT NULL,
        "limit_amount" decimal(14,2) NOT NULL,
        "alert_threshold" decimal(5,2) NOT NULL DEFAULT 80,
        CONSTRAINT "uq_budgets_household_category_month_year" UNIQUE ("household_id", "category_id", "month", "year")
      );
      CREATE INDEX "idx_budgets_household" ON "budgets" ("household_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "goals" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
        "name" varchar NOT NULL,
        "description" varchar,
        "target_amount" decimal(14,2) NOT NULL,
        "current_amount" decimal(14,2) NOT NULL DEFAULT 0,
        "deadline" date,
        "color" varchar NOT NULL DEFAULT '#22c55e',
        "icon" varchar NOT NULL DEFAULT 'target',
        "status" goal_status_enum NOT NULL DEFAULT 'in_progress'
      );
      CREATE INDEX "idx_goals_household" ON "goals" ("household_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "goal_contributions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "goal_id" uuid NOT NULL REFERENCES "goals"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "amount" decimal(14,2) NOT NULL,
        "date" date NOT NULL,
        "note" varchar
      );
      CREATE INDEX "idx_goal_contributions_goal" ON "goal_contributions" ("goal_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "household_id" uuid,
        "type" notification_type_enum NOT NULL,
        "title" varchar NOT NULL,
        "message" varchar NOT NULL,
        "metadata" jsonb,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" timestamptz
      );
      CREATE INDEX "idx_notifications_user" ON "notifications" ("user_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "household_id" uuid REFERENCES "households"("id") ON DELETE CASCADE,
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "action" audit_action_enum NOT NULL,
        "entity_type" varchar NOT NULL,
        "entity_id" varchar,
        "old_value" jsonb,
        "new_value" jsonb,
        "ip_address" varchar,
        "user_agent" varchar
      );
      CREATE INDEX "idx_audit_logs_household" ON "audit_logs" ("household_id");
      CREATE INDEX "idx_audit_logs_user" ON "audit_logs" ("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goal_contributions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "budgets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction_splits"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bank_accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invites"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "household_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "households"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "goal_status_enum";
      DROP TYPE IF EXISTS "audit_action_enum";
      DROP TYPE IF EXISTS "notification_type_enum";
      DROP TYPE IF EXISTS "card_brand_enum";
      DROP TYPE IF EXISTS "account_type_enum";
      DROP TYPE IF EXISTS "split_status_enum";
      DROP TYPE IF EXISTS "recurrence_frequency_enum";
      DROP TYPE IF EXISTS "transaction_status_enum";
      DROP TYPE IF EXISTS "transaction_type_enum";
      DROP TYPE IF EXISTS "invite_status_enum";
      DROP TYPE IF EXISTS "household_role_enum";
      DROP TYPE IF EXISTS "theme_preference_enum";
    `);
  }
}
