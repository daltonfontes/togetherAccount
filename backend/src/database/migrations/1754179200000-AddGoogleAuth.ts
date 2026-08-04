import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleAuth1754179200000 implements MigrationInterface {
  name = 'AddGoogleAuth1754179200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
      ALTER TABLE "users" ADD COLUMN "google_id" varchar;
      ALTER TABLE "users" ADD CONSTRAINT "uq_users_google_id" UNIQUE ("google_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT "uq_users_google_id";
      ALTER TABLE "users" DROP COLUMN "google_id";
      ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
    `);
  }
}
