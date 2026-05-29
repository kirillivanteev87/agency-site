-- CreateTable
CREATE TABLE "MarketplaceApp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "priceLabel" TEXT NOT NULL DEFAULT 'от 0 ₽/мес',
    "badge" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'ready',
    "icon" TEXT NOT NULL DEFAULT 'layout',
    "features" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);
