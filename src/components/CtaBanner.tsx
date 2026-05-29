import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

type CtaBannerProps = {
  title: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: "default" | "accent";
  primaryButtonField?: string;
  secondaryButtonField?: string;
  className?: string;
};

export function CtaBanner({
  title,
  subtitle,
  primaryLabel = "Получить бесплатную консультацию",
  primaryHref = "#contact",
  secondaryLabel,
  secondaryHref = "#projects",
  variant = "default",
  primaryButtonField,
  secondaryButtonField,
  className = "",
}: CtaBannerProps) {
  const accent = variant === "accent";

  return (
    <Reveal>
      <div
        className={`card-surface card-interactive flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-10 ${
          accent ? "cta-banner--accent" : ""
        } ${className}`.trim()}
      >
        <div className="max-w-2xl">
          <h3 className="text-2xl font-bold md:text-3xl">{title}</h3>
          {subtitle && <p className="mt-3 text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
          <a href={primaryHref} className="btn-primary btn-shimmer inline-flex">
            <span className="relative z-10" data-button-field={primaryButtonField}>
              {primaryLabel}
            </span>
            <ArrowRight size={18} className="relative z-10" />
          </a>
          {secondaryLabel && (
            <a
              href={secondaryHref}
              className="btn-outline inline-flex justify-center"
              data-button-field={secondaryButtonField}
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}
