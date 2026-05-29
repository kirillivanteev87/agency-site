-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseStudy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "landingHeroMeta" TEXT NOT NULL DEFAULT '',
    "landingMetrics" TEXT NOT NULL DEFAULT '[]',
    "challengeTitle" TEXT NOT NULL DEFAULT 'Задача клиента',
    "challengeText" TEXT NOT NULL DEFAULT '',
    "solutionTitle" TEXT NOT NULL DEFAULT 'Наше решение',
    "solutionText" TEXT NOT NULL DEFAULT '',
    "scopeTitle" TEXT NOT NULL DEFAULT 'Что сделали',
    "scopeItems" TEXT NOT NULL DEFAULT '[]',
    "storyTitle" TEXT NOT NULL DEFAULT 'О проекте',
    "testimonialQuote" TEXT NOT NULL DEFAULT '',
    "testimonialAuthor" TEXT NOT NULL DEFAULT '',
    "testimonialRole" TEXT NOT NULL DEFAULT '',
    "ctaTitle" TEXT NOT NULL DEFAULT 'Хотите такой же результат?',
    "ctaSubtitle" TEXT NOT NULL DEFAULT 'Обсудим вашу задачу и предложим план с оценкой сроков и бюджета за 24 часа.'
);
INSERT INTO "new_CaseStudy" ("body", "description", "gallery", "id", "imageUrl", "link", "sortOrder", "tag", "title") SELECT "body", "description", "gallery", "id", "imageUrl", "link", "sortOrder", "tag", "title" FROM "CaseStudy";
DROP TABLE "CaseStudy";
ALTER TABLE "new_CaseStudy" RENAME TO "CaseStudy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
