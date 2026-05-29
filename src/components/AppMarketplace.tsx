import { MarketplaceProductCard } from "./MarketplaceProductCard";
import { CtaBanner } from "./CtaBanner";
import { Reveal } from "./Reveal";
import { SectionLead } from "./SectionLead";
import type { ButtonLabels } from "@/lib/site-data";
import type { MarketplaceApp } from "@prisma/client";

type Props = {
  redlineApps: MarketplaceApp[];
  readyApps: MarketplaceApp[];
  buttonLabels: ButtonLabels;
};

export function AppMarketplace({ redlineApps, readyApps, buttonLabels }: Props) {
  return (
    <>
      <SectionLead
        eyebrow="Marketplace приложений"
        title="Готовые продукты и решения REDLINE по подписке"
        subtitle="Запускайте за дни, а не месяцы: шаблоны, SaaS и собственные продукты студии с ежемесячной поддержкой и обновлениями."
        align="center"
      />

      {redlineApps.length > 0 ? (
        <section className="mb-16 md:mb-20">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">От REDLINE</p>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">Собственные продукты студии</h2>
              </div>
              <p className="max-w-md text-sm text-[var(--text-muted)]">
                Развиваем сами: обновления, поддержка и доработки включены в подписку.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {redlineApps.map((app, index) => (
              <MarketplaceProductCard key={app.id} app={app} index={index} subscribeLabel={buttonLabels.marketplaceSubscribe} />
            ))}
          </div>
        </section>
      ) : null}

      {readyApps.length > 0 ? (
        <section className="mb-16 md:mb-20">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">Готовые решения</p>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">Шаблоны и приложения под ключ</h2>
              </div>
              <p className="max-w-md text-sm text-[var(--text-muted)]">
                Проверенные основы для бизнеса — подключаем, настраиваем под вашу нишу и сопровождаем.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {readyApps.map((app, index) => (
              <MarketplaceProductCard key={app.id} app={app} index={index} subscribeLabel={buttonLabels.marketplaceSubscribe} />
            ))}
          </div>
        </section>
      ) : null}

      <Reveal>
        <CtaBanner
          variant="accent"
          title="Нужен продукт под вашу нишу?"
          subtitle="Соберём кастомный пакет: готовое ядро + брендинг, интеграции и сопровождение по подписке."
          primaryLabel={buttonLabels.marketplaceCtaPrimary}
          primaryHref="/#contact"
          secondaryLabel={buttonLabels.marketplaceCtaSecondary}
          secondaryHref="/"
          primaryButtonField="marketplaceCtaPrimary"
          secondaryButtonField="marketplaceCtaSecondary"
        />
      </Reveal>
    </>
  );
}
