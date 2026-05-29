import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import type { SiteContent } from "./types";

export function Stats({ settings }: Pick<SiteContent, "settings">) {
  return (
    <div>
      <Reveal>
        <div className="stats-card card-surface card-interactive flex min-h-[420px] min-w-0 flex-col items-start justify-center gap-8 p-10 md:flex-row md:items-center md:gap-16 md:py-12">
          <p
            className="stat-glow w-full min-w-0 shrink-0 text-center text-[clamp(4.5rem,16vw,13rem)] font-black leading-none text-accent md:w-auto md:text-left"
            data-content-field="statValue"
          >
            {settings.statValue}
          </p>
          <div className="flex max-w-xl flex-col gap-6">
            <p
              className="text-xl text-[var(--text-muted)] md:text-2xl"
              data-content-field="statText"
            >
              {settings.statText}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Средний срок запуска лендинга — 3 недели. Работаем по договору с фиксированными этапами и KPI.
            </p>
            <a href="#contact" className="btn-primary inline-flex w-fit text-sm" data-button-field="statsCta">
              {settings.buttonLabels.statsCta}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
