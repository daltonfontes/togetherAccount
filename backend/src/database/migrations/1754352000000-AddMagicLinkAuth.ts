import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMagicLinkAuth1754352000000 implements MigrationInterface {
  name = 'AddMagicLinkAuth1754352000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "magic_link_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "email" varchar NOT NULL,
        "token_hash" varchar NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "consumed_at" timestamptz
      );
      CREATE INDEX "idx_magic_link_tokens_email" ON "magic_link_tokens" ("email");
      CREATE UNIQUE INDEX "uq_magic_link_tokens_token_hash" ON "magic_link_tokens" ("token_hash");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "magic_link_tokens"`);
  }
}
