"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProjectCardDescription, getProjectCardTitle } from "@/lib/project-landing";
import { CtaBanner } from "./CtaBanner";
import { Reveal } from "./Reveal";
import { SectionLead } from "./SectionLead";
import { SiteImage } from "./SiteImage";
import type { SiteContent } from "./types";

export function Projects({ projects, settings }: Pick<SiteContent, "projects" | "settings">) {
  const btn = settings.buttonLabels;

  return (
    <div>
      <SectionLead
        eyebrow="Портфолио"
        title="Проекты, которые приносят измеримый результат"
        subtitle="Каждый проект — это не просто дизайн, а рост метрик: заявки, конверсия, скорость процессов. Откройте страницу проекта, чтобы увидеть детали реализации."
      />
      <div className="flex w-full min-w-0 flex-col gap-6">
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={index * 60}>
            <Link
              href={`/projects/${project.id}`}
              className="group block min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
              <article className="card-surface card-interactive grid min-w-0 overflow-hidden transition-colors md:h-[400px] md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] lg:grid-cols-[minmax(0,1fr)_minmax(280px,700px)]">
                <div className="flex flex-col justify-center gap-3 p-6 md:p-7">
                  <h3 className="text-2xl font-semibold group-hover:text-accent">{getProjectCardTitle(project)}</h3>
                  <p className="text-[var(--text-muted)]">{getProjectCardDescription(project)}</p>
                  <span
                    className="btn-outline pointer-events-none inline-flex w-fit text-sm"
                    data-button-field="projectsCard"
                  >
                    {btn.projectsCard}
                    <ArrowUpRight size={16} />
                  </span>
                </div>
                <div className="project-card-media relative border-t border-[var(--border)] md:border-l md:border-t-0">
                  <SiteImage
                      src={String(project.projectCardImageUrl || project.imageUrl)}
                      alt={getProjectCardTitle(project)}
                      fill
                      className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      style={{
                        objectPosition: `${Math.max(0, Math.min(100, Number(project.coverFocusX ?? 50)))}% ${Math.max(
                          0,
                          Math.min(100, Number(project.coverFocusY ?? 50)),
                        )}%`,
                      }}
                    />
                </div>
              </article>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-10">
        <CtaBanner
          title="Нужен сайт или продукт под вашу нишу?"
          subtitle="Расскажите о задаче — предложим формат, сроки и ориентир по бюджету за 24 часа."
          primaryLabel={btn.projectsCtaPrimary}
          secondaryLabel={btn.projectsCtaSecondary}
          secondaryHref="#cases"
          primaryButtonField="projectsCtaPrimary"
          secondaryButtonField="projectsCtaSecondary"
        />
      </div>
    </div>
  );
}
