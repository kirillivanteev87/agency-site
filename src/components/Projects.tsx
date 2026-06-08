"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  getProjectAwardBadgeUrl,
  getProjectCardDescription,
  getProjectCardResultText,
  getProjectCardTitle,
} from "@/lib/project-landing";
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
        {projects.map((project, index) => {
          const awardBadgeUrl = getProjectAwardBadgeUrl(project);
          const cardDescription = getProjectCardDescription(project);
          const cardResultText = getProjectCardResultText(project);
          return (
            <Reveal key={project.id} delay={index * 60}>
            <Link
              href={`/projects/${project.id}`}
              className="group relative block min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
              <article
                className="project-card card-surface card-interactive grid min-w-0 transition-colors md:h-[400px] md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] lg:grid-cols-[minmax(0,1fr)_minmax(280px,700px)]"
              >
                <div className="flex min-h-0 flex-col justify-center gap-3 overflow-hidden p-6 md:p-7">
                  <h3 className="text-2xl font-semibold [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-accent">
                    {getProjectCardTitle(project)}
                  </h3>
                  <div className="space-y-2 text-[var(--text-muted)]">
                    <p>{cardDescription}</p>
                    {cardResultText ? (
                      <div>
                        <strong className="font-semibold text-[#BE123C]">Результат:</strong>
                        <p className="mt-1 whitespace-pre-line">{cardResultText}</p>
                      </div>
                    ) : null}
                  </div>
                  <span
                    className="btn-outline pointer-events-none inline-flex w-fit text-sm"
                    data-button-field="projectsCard"
                  >
                    {btn.projectsCard}
                    <ArrowUpRight size={16} />
                  </span>
                </div>
                <div className="project-card-media relative min-h-0 border-t border-[var(--border)] md:border-l md:border-t-0">
                  <SiteImage
                      src={String(project.projectCardImageUrl || project.imageUrl)}
                      alt={getProjectCardTitle(project)}
                      fill
                      className="transition-transform duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03]"
                      style={{
                        objectPosition: `${Math.max(0, Math.min(100, Number(project.coverFocusX ?? 50)))}% ${Math.max(
                          0,
                          Math.min(100, Number(project.coverFocusY ?? 50)),
                        )}%`,
                      }}
                    />
                </div>
              </article>
              {awardBadgeUrl ? (
                <div className="project-card-award">
                  <SiteImage
                    src={awardBadgeUrl}
                    alt="Web Guru Awards — Winner"
                    width={120}
                    height={88}
                    className="project-card-award__img object-contain"
                  />
                </div>
              ) : null}
            </Link>
            </Reveal>
          );
        })}
      </div>
      <div className="mt-10">
        <CtaBanner
          title="Нужен сайт или продукт под вашу нишу?"
          subtitle="Расскажите о задаче — предложим формат, сроки и ориентир по бюджету за 24 часа."
          primaryLabel={btn.projectsCtaPrimary}
          secondaryLabel={btn.projectsCtaSecondary}
          secondaryHref="/brief"
          primaryButtonField="projectsCtaPrimary"
          secondaryButtonField="projectsCtaSecondary"
        />
      </div>
    </div>
  );
}
