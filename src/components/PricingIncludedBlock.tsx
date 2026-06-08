import {
  Code2,
  FileInput,
  Globe,
  Lock,
  Megaphone,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type IncludedFeature = {
  label: string;
  icon: LucideIcon;
};

const INCLUDED_FEATURES: IncludedFeature[] = [
  { label: "Адаптив под мобильные", icon: Smartphone },
  { label: "Базовая анимация", icon: Sparkles },
  { label: "Чистый код", icon: Code2 },
  { label: "Подключение домена", icon: Globe },
  { label: "SSL", icon: Lock },
  { label: "Формы", icon: FileInput },
  { label: "Подготовка к рекламе", icon: Megaphone },
];

export function PricingIncludedBlock() {
  return (
    <article className="pricing-base card-surface">
      <span className="pricing-card__badge pricing-card__badge--soft">Во всех тарифах</span>

      <div className="pricing-card__head pricing-base__head">
        <p className="pricing-card__name">База</p>
        <p className="pricing-card__summary">
          Что входит во все тарифы — уже в стоимости «Старт», «Бизнес» и «Продукт»
        </p>
      </div>

      <div className="pricing-base__panel">
        <ul className="pricing-base__grid" aria-label="Включено во все тарифы">
          {INCLUDED_FEATURES.map(({ label, icon: Icon }) => (
            <li key={label} className="pricing-base__cell">
              <span className="pricing-base__cell-icon" aria-hidden="true">
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <span className="pricing-base__cell-label">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="pricing-base__footer">Доплата за базовые пункты не требуется</p>
    </article>
  );
}
