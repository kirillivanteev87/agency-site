-- AlterTable
ALTER TABLE "Project" ADD COLUMN "cardTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN "cardDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN "pageTitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN "pageDescription" TEXT NOT NULL DEFAULT '';

-- Backfill from legacy shared fields
UPDATE "Project"
SET
  "cardTitle" = "title",
  "cardDescription" = "description",
  "pageTitle" = "title",
  "pageDescription" = "description"
WHERE "cardTitle" = '' AND "pageTitle" = '';
