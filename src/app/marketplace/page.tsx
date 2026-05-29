import type { Metadata } from "next";
import { AppMarketplace } from "@/components/AppMarketplace";
import { getMarketplaceAppsByCategory } from "@/lib/marketplace-data";
import { getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Marketplace приложений — REDLINE",
  description:
    "Готовые приложения и продукты REDLINE по подписке: запуск за дни, поддержка и обновления включены.",
};

export default async function MarketplacePage() {
  const [redlineApps, readyApps, content] = await Promise.all([
    getMarketplaceAppsByCategory("redline"),
    getMarketplaceAppsByCategory("ready"),
    getSiteContent(),
  ]);

  return (
    <main className="section-container py-10 md:py-14">
      <AppMarketplace
        redlineApps={redlineApps}
        readyApps={readyApps}
        buttonLabels={content.settings.buttonLabels}
      />
      <footer className="mt-16 border-t border-[var(--border)] pt-8 text-center text-sm text-[var(--text-muted)]">
        <p>{content.settings.footerCopyright}</p>
      </footer>
    </main>
  );
}
