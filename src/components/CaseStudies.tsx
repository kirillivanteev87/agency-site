import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionLead } from "./SectionLead";
import { SiteImage } from "./SiteImage";
import { parseCaseStudyMetrics } from "@/lib/case-study-landing";
import type { SiteContent } from "./types";

export function CaseStudies({ caseStudies, settings }: Pick<SiteContent, "caseStudies" | "settings">) {
  return (
    <div>
      <SectionLead
        eyebrow="Products"
        title="Собственные разработки команды"
        subtitle="Внутренние сервисы и SaaS-продукты, созданные нашей студией. От идеи и UX до архитектуры, интерфейсов и запуска в продакшн."
      />
      <div className="space-y-24 md:space-y-16">
        {caseStudies.map((item, index) => {
          const metrics = parseCaseStudyMetrics(item.landingMetrics, index);
          return (
            <Reveal key={item.id} delay={index * 50}>
              <article
                className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${
                  index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Link
                  href={`/cases/${item.id}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <SiteImage
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="transition-transform duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.05]"
                  />
                </Link>
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{item.tag}</p>
                  <h3 className="mb-4 text-3xl font-bold">
                    <Link
                      href={`/cases/${item.id}`}
                      className="transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:text-accent"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mb-6 leading-relaxed text-[var(--text-muted)]">{item.description}</p>
                  {metrics.length > 0 && (
                    <ul className="mb-8 flex flex-wrap gap-2">
                      {metrics.map((metric) => (
                        <li
                          key={metric}
                          className="rounded-full border border-[var(--accent)]/30 bg-[rgba(225,29,72,0.08)] px-3 py-1 text-sm font-medium text-accent"
                        >
                          {metric}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link href={`/cases/${item.id}`} className="btn-outline inline-flex w-fit">
                      Читать кейс
                      <ArrowRight size={18} />
                    </Link>
                    <a href="/#contact" className="btn-primary inline-flex w-fit" data-button-field="casesCard">
                      {settings.buttonLabels.casesCard}
                      <ArrowRight size={18} />
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
