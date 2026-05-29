-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "brandName" TEXT NOT NULL DEFAULT 'STUDIO',
    "heroTitle" TEXT NOT NULL DEFAULT 'Создаём цифровые продукты',
    "heroHighlight" TEXT NOT NULL DEFAULT 'которые работают',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Веб-студия полного цикла: дизайн, разработка, продвижение',
    "statValue" TEXT NOT NULL DEFAULT '70+',
    "statText" TEXT NOT NULL DEFAULT 'успешных проектов за 5 лет работы',
    "footerCopyright" TEXT NOT NULL DEFAULT '© 2026 Studio. Все права защищены.',
    "phones" TEXT NOT NULL DEFAULT '["+7 (999) 123-45-67"]',
    "emails" TEXT NOT NULL DEFAULT '["hello@studio.ru"]',
    "addresses" TEXT NOT NULL DEFAULT '["Москва, ул. Примерная, 1"]',
    "socialLinks" TEXT NOT NULL DEFAULT '[{"label":"Telegram","url":"https://t.me"}]',
    "sectionSpacing" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_SiteSettings" ("addresses", "brandName", "emails", "footerCopyright", "heroHighlight", "heroSubtitle", "heroTitle", "id", "phones", "socialLinks", "statText", "statValue") SELECT "addresses", "brandName", "emails", "footerCopyright", "heroHighlight", "heroSubtitle", "heroTitle", "id", "phones", "socialLinks", "statText", "statValue" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
