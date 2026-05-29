-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "landingHeroMeta" TEXT NOT NULL DEFAULT '',
    "landingMetrics" TEXT NOT NULL DEFAULT '[]',
    "challengeTitle" TEXT NOT NULL DEFAULT 'Задача проекта',
    "challengeText" TEXT NOT NULL DEFAULT '',
    "solutionTitle" TEXT NOT NULL DEFAULT 'Наше решение',
    "solutionText" TEXT NOT NULL DEFAULT '',
    "benefitsTitle" TEXT NOT NULL DEFAULT 'Преимущества проекта',
    "benefitsItems" TEXT NOT NULL DEFAULT '[]',
    "howItWorksTitle" TEXT NOT NULL DEFAULT 'Как мы реализовали',
    "howItWorksSteps" TEXT NOT NULL DEFAULT '[]',
    "scopeTitle" TEXT NOT NULL DEFAULT 'Что было сделано',
    "scopeItems" TEXT NOT NULL DEFAULT '[]',
    "resultsTitle" TEXT NOT NULL DEFAULT 'Результат для бизнеса',
    "resultsText" TEXT NOT NULL DEFAULT '',
    "storyTitle" TEXT NOT NULL DEFAULT 'О проекте',
    "testimonialQuote" TEXT NOT NULL DEFAULT '',
    "testimonialAuthor" TEXT NOT NULL DEFAULT '',
    "testimonialRole" TEXT NOT NULL DEFAULT '',
    "ctaTitle" TEXT NOT NULL DEFAULT 'Хотите такой же проект?',
    "ctaSubtitle" TEXT NOT NULL DEFAULT 'Подготовим план и оценку по срокам и бюджету в течение 24 часов.',
    "coverFocusX" INTEGER NOT NULL DEFAULT 50,
    "coverFocusY" INTEGER NOT NULL DEFAULT 50
);
INSERT INTO "new_Project" ("benefitsItems", "benefitsTitle", "body", "challengeText", "challengeTitle", "ctaSubtitle", "ctaTitle", "description", "gallery", "howItWorksSteps", "howItWorksTitle", "id", "imageUrl", "landingHeroMeta", "landingMetrics", "link", "resultsText", "resultsTitle", "scopeItems", "scopeTitle", "solutionText", "solutionTitle", "sortOrder", "storyTitle", "testimonialAuthor", "testimonialQuote", "testimonialRole", "title") SELECT "benefitsItems", "benefitsTitle", "body", "challengeText", "challengeTitle", "ctaSubtitle", "ctaTitle", "description", "gallery", "howItWorksSteps", "howItWorksTitle", "id", "imageUrl", "landingHeroMeta", "landingMetrics", "link", "resultsText", "resultsTitle", "scopeItems", "scopeTitle", "solutionText", "solutionTitle", "sortOrder", "storyTitle", "testimonialAuthor", "testimonialQuote", "testimonialRole", "title" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
