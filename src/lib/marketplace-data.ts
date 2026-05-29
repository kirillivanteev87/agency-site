import { prisma } from "./prisma";

export type MarketplaceCategory = "redline" | "ready";

export async function getPublishedMarketplaceApps() {
  return prisma.marketplaceApp.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getMarketplaceAppsByCategory(category: MarketplaceCategory) {
  const apps = await getPublishedMarketplaceApps();
  return apps.filter((app) => app.category === category);
}
