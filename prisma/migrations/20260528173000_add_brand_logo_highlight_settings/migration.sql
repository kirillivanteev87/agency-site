-- Add configurable brand highlight settings for logo rendering
ALTER TABLE "SiteSettings" ADD COLUMN "brandHighlightText" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "brandHighlightColor" TEXT NOT NULL DEFAULT '';
