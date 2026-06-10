/**
 * Import content from prisma/dev.db (SQLite) into PostgreSQL (DATABASE_URL).
 *
 * Usage:
 *   npx tsx scripts/sqlite-to-postgres.ts
 *   SQLITE_PATH=prisma/dev.db DATABASE_URL="postgresql://..." npx tsx scripts/sqlite-to-postgres.ts
 *
 * Production (Neon/Vercel): set DATABASE_URL to the pooled or direct Postgres URL, then run the same command.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
const sqlitePath = process.env.SQLITE_PATH ?? join(root, "prisma/dev.db");
const contentJsonPath = process.env.CONTENT_JSON;

const contentJsonExport = contentJsonPath
  ? (JSON.parse(readFileSync(contentJsonPath, "utf8")) as Record<string, Record<string, unknown>[]>)
  : null;

function querySqlite<T extends Record<string, unknown>>(table: string): T[] {
  if (contentJsonExport) {
    return (contentJsonExport[table] ?? []) as T[];
  }
  const out = execSync(`sqlite3 -json "${sqlitePath}" "SELECT * FROM ${table}"`, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (!out.trim()) return [];
  return JSON.parse(out) as T[];
}

function asBool(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

function asDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

function pickImageUrl(row: Record<string, unknown>): string {
  const imageUrl = String(row.imageUrl ?? "").trim();
  if (imageUrl) return imageUrl;
  const card = String(row.projectCardImageUrl ?? "").trim();
  if (card) return card;
  const page = String(row.projectPageImageUrl ?? "").trim();
  if (page) return page;
  return "/images/project-1.svg";
}

async function resetSequence(prisma: PrismaClient, table: string, column = "id") {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', '${column}'), COALESCE((SELECT MAX("${column}") FROM "${table}"), 1), true)`,
  );
}

async function main() {
  if (!contentJsonExport && !existsSync(sqlitePath)) {
    throw new Error(`SQLite database not found: ${sqlitePath}`);
  }
  if (contentJsonPath && !existsSync(contentJsonPath)) {
    throw new Error(`Content export not found: ${contentJsonPath}`);
  }

  const prisma = new PrismaClient();
  const countsBefore = {
    project: await prisma.project.count(),
    caseStudy: await prisma.caseStudy.count(),
    siteSettings: await prisma.siteSettings.count(),
  };
  console.log("[import] PostgreSQL before:", countsBefore);
  console.log("[import] Reading from:", contentJsonPath ?? sqlitePath);

  const sqliteCounts = {
    project: querySqlite("Project").length,
    caseStudy: querySqlite("CaseStudy").length,
    siteSettings: querySqlite("SiteSettings").length,
    service: querySqlite("Service").length,
    heroFeature: querySqlite("HeroFeature").length,
    faq: querySqlite("Faq").length,
    pricingPlan: querySqlite("PricingPlan").length,
    marketplaceApp: querySqlite("MarketplaceApp").length,
    adminUser: querySqlite("AdminUser").length,
    contactSubmission: querySqlite("ContactSubmission").length,
  };
  console.log("[import] SQLite source:", sqliteCounts);

  await prisma.$transaction(async (tx) => {
    await tx.contactSubmission.deleteMany();
    await tx.marketplaceApp.deleteMany();
    await tx.pricingPlan.deleteMany();
    await tx.faq.deleteMany();
    await tx.service.deleteMany();
    await tx.caseStudy.deleteMany();
    await tx.project.deleteMany();
    await tx.heroFeature.deleteMany();
    await tx.adminUser.deleteMany();

    const settingsRows = querySqlite<Record<string, unknown>>("SiteSettings");
    if (settingsRows.length > 0) {
      const { id, ...data } = settingsRows[0];
      await tx.siteSettings.upsert({
        where: { id: Number(id) },
        update: data as Parameters<typeof tx.siteSettings.upsert>[0]["update"],
        create: { id: Number(id), ...data } as Parameters<typeof tx.siteSettings.upsert>[0]["create"],
      });
    }

    const adminUsers = querySqlite<Record<string, unknown>>("AdminUser");
    if (adminUsers.length > 0) {
      await tx.adminUser.createMany({
        data: adminUsers.map((row) => ({
          id: Number(row.id),
          username: String(row.username),
          passwordHash: String(row.passwordHash),
        })),
      });
    }

    const heroFeatures = querySqlite<Record<string, unknown>>("HeroFeature");
    if (heroFeatures.length > 0) {
      await tx.heroFeature.createMany({
        data: heroFeatures.map((row) => ({
          id: Number(row.id),
          title: String(row.title),
          subtitle: row.subtitle == null ? null : String(row.subtitle),
          icon: String(row.icon ?? "sparkles"),
          variant: String(row.variant ?? "default"),
          sortOrder: Number(row.sortOrder ?? 0),
          imageUrl: row.imageUrl == null ? null : String(row.imageUrl),
        })),
      });
    }

    const projects = querySqlite<Record<string, unknown>>("Project");
    if (projects.length > 0) {
      await tx.project.createMany({
        data: projects.map((row) => ({
          id: Number(row.id),
          title: String(row.title),
          description: String(row.description),
          cardTitle: String(row.cardTitle ?? ""),
          cardDescription: String(row.cardDescription ?? ""),
          cardResultText: String(row.cardResultText ?? ""),
          pageTitle: String(row.pageTitle ?? ""),
          pageDescription: String(row.pageDescription ?? ""),
          body: String(row.body ?? ""),
          gallery: String(row.gallery ?? "[]"),
          imageUrl: pickImageUrl(row),
          projectCardImageUrl: String(row.projectCardImageUrl ?? ""),
          projectPageImageUrl: String(row.projectPageImageUrl ?? ""),
          link: row.link == null ? null : String(row.link),
          sortOrder: Number(row.sortOrder ?? 0),
          landingHeroMeta: String(row.landingHeroMeta ?? ""),
          landingMetrics: String(row.landingMetrics ?? "[]"),
          challengeTitle: String(row.challengeTitle ?? "Задача проекта"),
          challengeText: String(row.challengeText ?? ""),
          solutionTitle: String(row.solutionTitle ?? "Наше решение"),
          solutionText: String(row.solutionText ?? ""),
          benefitsTitle: String(row.benefitsTitle ?? "Преимущества проекта"),
          benefitsItems: String(row.benefitsItems ?? "[]"),
          howItWorksTitle: String(row.howItWorksTitle ?? "Как мы реализовали"),
          howItWorksSteps: String(row.howItWorksSteps ?? "[]"),
          scopeTitle: String(row.scopeTitle ?? "Что было сделано"),
          scopeItems: String(row.scopeItems ?? "[]"),
          resultsTitle: String(row.resultsTitle ?? "Результат для бизнеса"),
          resultsText: String(row.resultsText ?? ""),
          storyTitle: String(row.storyTitle ?? "О проекте"),
          testimonialQuote: String(row.testimonialQuote ?? ""),
          testimonialAuthor: String(row.testimonialAuthor ?? ""),
          testimonialRole: String(row.testimonialRole ?? ""),
          ctaTitle: String(row.ctaTitle ?? "Хотите такой же проект?"),
          ctaSubtitle: String(
            row.ctaSubtitle ??
              "Подготовим план и оценку по срокам и бюджету в течение 24 часов.",
          ),
          coverFocusX: Number(row.coverFocusX ?? 50),
          coverFocusY: Number(row.coverFocusY ?? 50),
          projectPageFocusX: Number(row.projectPageFocusX ?? 50),
          projectPageFocusY: Number(row.projectPageFocusY ?? 50),
        })),
      });
    }

    const cases = querySqlite<Record<string, unknown>>("CaseStudy");
    if (cases.length > 0) {
      await tx.caseStudy.createMany({
        data: cases.map((row) => ({
          id: Number(row.id),
          tag: String(row.tag),
          title: String(row.title),
          description: String(row.description),
          body: String(row.body ?? ""),
          gallery: String(row.gallery ?? "[]"),
          imageUrl: String(row.imageUrl),
          link: row.link == null ? null : String(row.link),
          sortOrder: Number(row.sortOrder ?? 0),
          landingHeroMeta: String(row.landingHeroMeta ?? ""),
          landingMetrics: String(row.landingMetrics ?? "[]"),
          challengeTitle: String(row.challengeTitle ?? "Задача клиента"),
          challengeText: String(row.challengeText ?? ""),
          solutionTitle: String(row.solutionTitle ?? "Наше решение"),
          solutionText: String(row.solutionText ?? ""),
          benefitsTitle: String(row.benefitsTitle ?? "Преимущества продукта"),
          benefitsItems: String(row.benefitsItems ?? "[]"),
          howItWorksTitle: String(row.howItWorksTitle ?? "Как мы это сделали"),
          howItWorksSteps: String(row.howItWorksSteps ?? "[]"),
          scopeTitle: String(row.scopeTitle ?? "Что входит в решение"),
          scopeItems: String(row.scopeItems ?? "[]"),
          resultsTitle: String(row.resultsTitle ?? "Результат для бизнеса"),
          resultsText: String(row.resultsText ?? ""),
          storyTitle: String(row.storyTitle ?? "О проекте"),
          testimonialQuote: String(row.testimonialQuote ?? ""),
          testimonialAuthor: String(row.testimonialAuthor ?? ""),
          testimonialRole: String(row.testimonialRole ?? ""),
          ctaTitle: String(row.ctaTitle ?? "Хотите такой же результат?"),
          ctaSubtitle: String(
            row.ctaSubtitle ??
              "Обсудим вашу задачу и предложим план с оценкой сроков и бюджета за 24 часа.",
          ),
        })),
      });
    }

    const services = querySqlite<Record<string, unknown>>("Service");
    if (services.length > 0) {
      await tx.service.createMany({
        data: services.map((row) => ({
          id: Number(row.id),
          icon: String(row.icon ?? "layout"),
          title: String(row.title),
          description: row.description == null ? null : String(row.description),
          sortOrder: Number(row.sortOrder ?? 0),
        })),
      });
    }

    const faqs = querySqlite<Record<string, unknown>>("Faq");
    if (faqs.length > 0) {
      await tx.faq.createMany({
        data: faqs.map((row) => ({
          id: Number(row.id),
          question: String(row.question),
          answer: String(row.answer),
          sortOrder: Number(row.sortOrder ?? 0),
        })),
      });
    }

    const pricingPlans = querySqlite<Record<string, unknown>>("PricingPlan");
    if (pricingPlans.length > 0) {
      await tx.pricingPlan.createMany({
        data: pricingPlans.map((row) => ({
          id: Number(row.id),
          name: String(row.name),
          eyebrow: String(row.eyebrow ?? ""),
          summary: String(row.summary ?? ""),
          audienceLabel: String(row.audienceLabel ?? ""),
          outcomeText: String(row.outcomeText ?? ""),
          price: String(row.price),
          features: String(row.features ?? "[]"),
          featured: asBool(row.featured),
          badgeLabel: String(row.badgeLabel ?? ""),
          sortOrder: Number(row.sortOrder ?? 0),
        })),
      });
    }

    const marketplaceApps = querySqlite<Record<string, unknown>>("MarketplaceApp");
    if (marketplaceApps.length > 0) {
      await tx.marketplaceApp.createMany({
        data: marketplaceApps.map((row) => ({
          id: Number(row.id),
          title: String(row.title),
          description: String(row.description),
          imageUrl: String(row.imageUrl ?? ""),
          priceLabel: String(row.priceLabel ?? "от 0 ₽/мес"),
          badge: String(row.badge ?? ""),
          category: String(row.category ?? "ready"),
          icon: String(row.icon ?? "layout"),
          features: String(row.features ?? "[]"),
          featured: asBool(row.featured),
          published: asBool(row.published ?? 1),
          sortOrder: Number(row.sortOrder ?? 0),
        })),
      });
    }

    const submissions = querySqlite<Record<string, unknown>>("ContactSubmission");
    if (submissions.length > 0) {
      await tx.contactSubmission.createMany({
        data: submissions.map((row) => ({
          id: Number(row.id),
          name: String(row.name),
          email: String(row.email),
          phone: String(row.phone ?? ""),
          message: String(row.message),
          createdAt: asDate(row.createdAt),
          read: asBool(row.read),
        })),
      });
    }
  });

  const sequenceTables = [
    "AdminUser",
    "HeroFeature",
    "Project",
    "CaseStudy",
    "Service",
    "Faq",
    "PricingPlan",
    "MarketplaceApp",
    "ContactSubmission",
  ];
  for (const table of sequenceTables) {
    await resetSequence(prisma, table);
  }

  const countsAfter = {
    project: await prisma.project.count(),
    caseStudy: await prisma.caseStudy.count(),
    siteSettings: await prisma.siteSettings.count(),
    service: await prisma.service.count(),
    heroFeature: await prisma.heroFeature.count(),
    faq: await prisma.faq.count(),
    pricingPlan: await prisma.pricingPlan.count(),
    marketplaceApp: await prisma.marketplaceApp.count(),
    adminUser: await prisma.adminUser.count(),
    contactSubmission: await prisma.contactSubmission.count(),
  };
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, imageUrl: true },
  });
  const cases = await prisma.caseStudy.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, imageUrl: true },
  });

  console.log("[import] PostgreSQL after:", countsAfter);
  console.log("[import] brandName:", settings?.brandName, "| heroTitle:", settings?.heroTitle?.slice(0, 60));
  console.log("[import] projects:", projects);
  console.log("[import] cases:", cases);
  console.log("[import] Done. Uploaded image paths preserved from SQLite.");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("[import] Failed:", error);
  process.exit(1);
});
