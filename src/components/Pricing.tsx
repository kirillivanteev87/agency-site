import { ArrowRight, Check } from "lucide-react";
import { getPlanBadgeLabel } from "@/lib/pricing";
import { PricingIncludedBlock } from "./PricingIncludedBlock";
import { Reveal } from "./Reveal";
import { SectionLead } from "./SectionLead";
import type { SiteContent } from "./types";

export function Pricing({ settings, pricingPlans }: Pick<SiteContent, "settings" | "pricingPlans">) {
  const ctaLabel = settings.buttonLabels.serviceCard.replace(/\s*→\s*$/, "");

  if (pricingPlans.length === 0) return null;

  return (
    <div className="pricing-section">
      <SectionLead
        eyebrow={settings.pricingEyebrow}
        title={settings.pricingTitle}
        subtitle={settings.pricingSubtitle}
        align="center"
      />

      <div className="pricing-section__grid">
        {pricingPlans.map((plan, index) => {
          const badge = getPlanBadgeLabel(plan);
          return (
            <Reveal key={plan.id} delay={index * 50}>
              <article
                className={`pricing-card card-surface ${plan.featured ? "pricing-card--featured" : ""}`}
              >
                <div className="pricing-card__accent" aria-hidden="true" />

                {badge ? <span className="pricing-card__badge">{badge}</span> : null}

                <header className="pricing-card__head">
                  {plan.eyebrow ? <p className="pricing-card__eyebrow">{plan.eyebrow}</p> : null}
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  {plan.summary ? <p className="pricing-card__summary">{plan.summary}</p> : null}
                </header>

                <div className="pricing-card__price-block">
                  <p className="pricing-card__price">
                    <span className="pricing-card__price-value">{plan.price}</span>
                    <span className="pricing-card__price-currency"> ₽</span>
                  </p>
                  <span className="pricing-card__price-note">фиксированный старт</span>
                </div>

                {plan.audienceLabel ? (
                  <p className="pricing-card__audience">
                    <span className="pricing-card__context-label">Для кого</span>
                    <span className="pricing-card__context-text">{plan.audienceLabel}</span>
                  </p>
                ) : null}
                {plan.outcomeText ? (
                  <p className="pricing-card__outcome">
                    <span className="pricing-card__context-label">Результат</span>
                    <span className="pricing-card__context-text">{plan.outcomeText}</span>
                  </p>
                ) : null}

                {plan.features.length > 0 ? (
                  <ul className="pricing-card__features">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check className="pricing-card__check" size={15} aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <a href="#contact" className="btn-primary pricing-card__cta">
                  {ctaLabel}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </article>
            </Reveal>
          );
        })}

        <Reveal delay={pricingPlans.length * 50 + 40} className="pricing-section__span">
          <PricingIncludedBlock />
        </Reveal>
      </div>

      {settings.pricingNote ? <p className="pricing-section__note">{settings.pricingNote}</p> : null}
    </div>
  );
}
