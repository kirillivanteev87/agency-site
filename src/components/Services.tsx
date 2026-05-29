import { DynamicIcon } from "./icons";
import { CtaBanner } from "./CtaBanner";
import { Reveal } from "./Reveal";
import { SectionLead } from "./SectionLead";
import type { SiteContent } from "./types";

export function Services({ services, settings }: Pick<SiteContent, "services" | "settings">) {
  const btn = settings.buttonLabels;
  return (
    <div>
      <SectionLead
        eyebrow="Услуги"
        title="Всё для роста продаж в одной команде"
        subtitle="Не нужно искать подрядчиков на дизайн, разработку и маркетинг — закрываем весь цикл и отвечаем за результат."
        align="center"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const featured = index === 1;
          return (
            <Reveal key={service.id} delay={index * 45}>
              <div
                className="card-surface card-interactive relative flex h-full flex-col gap-4 p-6"
              >
                {featured && (
                  <span className="absolute right-4 top-4 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-semibold text-white">
                    Популярно
                  </span>
                )}
                <DynamicIcon name={service.icon} className="text-accent" />
                <h3 className="text-lg font-semibold">{service.title}</h3>
                {service.description && (
                  <p className="text-sm text-[var(--text-muted)]">{service.description}</p>
                )}
                <a
                  href="#contact"
                  className="mt-auto text-sm font-medium text-accent hover:underline"
                  data-button-field="serviceCard"
                >
                  {btn.serviceCard}
                </a>
              </div>
            </Reveal>
          );
        })}
      </div>
      <div className="mt-10">
        <CtaBanner
          variant="accent"
          title="Не знаете, с чего начать?"
          subtitle="Оставьте заявку — предложим оптимальный набор услуг под ваш бюджет и сроки."
          primaryLabel={btn.servicesCtaPrimary}
          secondaryLabel={btn.servicesCtaSecondary}
          secondaryHref="#faq"
          primaryButtonField="servicesCtaPrimary"
          secondaryButtonField="servicesCtaSecondary"
        />
      </div>
    </div>
  );
}
