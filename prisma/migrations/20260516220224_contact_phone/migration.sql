-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ContactSubmission" ("createdAt", "email", "id", "message", "name", "read") SELECT "createdAt", "email", "id", "message", "name", "read" FROM "ContactSubmission";
DROP TABLE "ContactSubmission";
ALTER TABLE "new_ContactSubmission" RENAME TO "ContactSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
