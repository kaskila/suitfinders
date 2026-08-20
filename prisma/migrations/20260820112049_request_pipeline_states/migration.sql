-- Replace CustomRequestStatus's bespoke-fulfillment states with the
-- pipeline actually operated (see docs/domain-model.md). Existing rows are
-- remapped via CASE rather than a bare text cast, since the old and new
-- enums share no labels and a bare cast would fail on any existing row.
BEGIN;
CREATE TYPE "CustomRequestStatus_new" AS ENUM ('NEW', 'CONTACTED', 'MATCHED', 'CLOSED', 'LOST');
ALTER TABLE "CustomRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CustomRequest" ALTER COLUMN "status" TYPE "CustomRequestStatus_new" USING (
  CASE "status"::text
    WHEN 'SUBMITTED'   THEN 'NEW'
    WHEN 'REVIEWING'   THEN 'CONTACTED'
    WHEN 'QUOTED'      THEN 'CONTACTED'
    WHEN 'ACCEPTED'    THEN 'MATCHED'
    WHEN 'IN_PROGRESS' THEN 'MATCHED'
    WHEN 'COMPLETED'   THEN 'CLOSED'
    WHEN 'CANCELLED'   THEN 'LOST'
  END::"CustomRequestStatus_new"
);
ALTER TYPE "CustomRequestStatus" RENAME TO "CustomRequestStatus_old";
ALTER TYPE "CustomRequestStatus_new" RENAME TO "CustomRequestStatus";
DROP TYPE "CustomRequestStatus_old";
ALTER TABLE "CustomRequest" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "CustomRequest" ADD COLUMN "adminNotes" TEXT;
