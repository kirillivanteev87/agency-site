import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Quote, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { CtaBanner } from "./CtaBanner";
import { CaseStudyAboutBlock } from "./CaseStudyAboutBlock";
import { Reveal } from "./Reveal";
import { SiteImage } from "./SiteImage";
import type { ButtonLabels } from "@/lib/site-data";
import type { ProjectLandingView } from "@/lib/project-landing";

const BENEFIT_ICONS = [Target, Zap, TrendingUp, Sparkles] as const;

function externalHref(link: string | null) {
  if (!link || link === "#" || link.startsWith("#")) return null;
  return link;
}

function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className="case-landing__header">
      {eyebrow ? <p className="case-landing__eyebrow">{eyebrow}</p> : null}
      <h2 className="case-landing__title">{title}</h2>
    </header>
  );
}

export function ProjectLandingPage({
  data,
  buttonLabels,
}: {
  data: ProjectLandingView;
  buttonLabels: ButtonLabels;
}) {
  const external = externalHref(data.link);
  const quote = data.testimonialQuote.trim();
  const { display } = data;

  return (
    <article className="case-landing">
      <section className="case-landing__hero">
        <div className="case-landing__inner">
          <Link href="/#projects" className="case-landing__back">
            <ArrowLeft size={16} aria-hidden />
            Все проекты
          </Link>

          <div className="case-landing__hero-grid">
            <div>
              <p className="case-landing__eyebrow">Проект QNOX</p>
              <h1>{data.title}</h1>
              <p className="case-landing__hero-desc">{data.description}</p>
              <p className="case-landing__hero-meta">{display.heroMeta}</p>

              {data.metrics.length > 0 && (
                <ul className="case-landing__metrics" aria-label="Ключевые показатели проекта">
                  {data.metrics.map((metric) => (
                    <li key={metric} className="case-landing__metric-pill">
                      {metric}
                    </li>
                  ))}
                </ul>
              )}

              <div className="case-landing__actions">
                <a
                  href="/#contact"
                  className="btn-primary inline-flex justify-center"
                  data-button-field="projectDetailPrimary"
                >
                  {buttonLabels.projectDetailPrimary}
                </a>
                {external ? (
                  <a
                    href={external}
                    className="btn-outline inline-flex justify-center"
                    target="_blank"
                    rel="noreferrer"
                    data-button-field="projectDetailSecondary"
                  >
                    {buttonLabels.projectDetailSecondary}
                    <ArrowUpRight size={16} />
                  </a>
                ) : null}
              </div>
            </div>

            <Reveal delay={80}>
              <div className="case-landing__cover">
                <div className="case-landing__cover-glow" aria-hidden />
                <div className="case-landing__cover-frame">
                  <div className="relative aspect-[16/10]">
                    <SiteImage
                      src={String(data.projectPageImageUrl || data.imageUrl)}
                      alt={data.title}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: `${Math.max(0, Math.min(100, Number(data.projectPageFocusX ?? 50)))}% ${Math.max(
                          0,
                          Math.min(100, Number(data.projectPageFocusY ?? 50)),
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="case-landing__cover-caption">
                    <strong>{data.title}</strong>
                    <span>Digital product by QNOX</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="case-landing__section">
        <div className="case-landing__inner">
          <div className="case-landing__grid case-landing__grid--2">
            <Reveal>
              <div className="case-landing__card">
                <p className="case-landing__card-label">01 · Задача</p>
                <h3>{data.challengeTitle}</h3>
                <p className="whitespace-pre-wrap">{display.challengeText}</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="case-landing__card case-landing__card--accent">
                <p className="case-landing__card-label">02 · Решение</p>
                <h3>{data.solutionTitle}</h3>
                <p className="whitespace-pre-wrap">{display.solutionText}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="case-landing__section case-landing__band">
        <div className="case-landing__inner">
          <Reveal>
            <SectionHeader eyebrow="Преимущества" title={data.benefitsTitle} />
          </Reveal>
          <div className="case-landing__grid case-landing__grid--2">
            {data.benefitsList.map((item, index) => {
              const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
              return (
                <Reveal key={`${item.title}-${index}`} delay={index * 50}>
                  <div className="case-landing__card card-interactive case-landing__card--with-icon">
                    <div className="case-landing__benefit-icon">
                      <Icon size={22} aria-hidden />
                    </div>
                    <h3>{item.title}</h3>
                    {item.text ? <p>{item.text}</p> : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="case-landing__section">
        <div className="case-landing__inner">
          <Reveal>
            <SectionHeader eyebrow="Процесс" title={data.howItWorksTitle} />
          </Reveal>
          <div className="case-landing__grid case-landing__grid--4">
            {data.stepsList.map((step, index) => (
              <Reveal key={`${step.title}-${index}`} delay={index * 50}>
                <div className="case-landing__card">
                  <p className="case-landing__step-num">{String(index + 1).padStart(2, "0")}</p>
                  <h3>{step.title}</h3>
                  {step.text ? <p>{step.text}</p> : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="case-landing__section case-landing__band">
        <div className="case-landing__inner">
          <Reveal>
            <SectionHeader title={data.scopeTitle} />
          </Reveal>
          <ul className="case-landing__grid case-landing__grid--3">
            {data.scopeItemsList.map((item, index) => (
              <Reveal key={`${item}-${index}`} delay={index * 40}>
                <li className="case-landing__scope-item">
                  <CheckCircle2 size={22} className="shrink-0 text-accent" aria-hidden />
                  <span>{item}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="case-landing__section">
        <div className="case-landing__inner">
          <Reveal>
            <div className="case-landing__results">
              <p className="case-landing__eyebrow">Итог</p>
              <h2 className="case-landing__title">{data.resultsTitle}</h2>
              <p className="whitespace-pre-wrap">{display.resultsText}</p>
              {data.metrics.length > 0 && (
                <ul className="case-landing__metrics !mt-8">
                  {data.metrics.map((metric) => (
                    <li key={metric} className="case-landing__metric-pill">
                      {metric}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="case-landing__section case-landing__band">
        <div className="case-landing__inner">
          <Reveal>
            <SectionHeader title={data.storyTitle} />
          </Reveal>
          {data.photos.length > 0 || display.body ? (
            <CaseStudyAboutBlock
              photos={data.photos}
              alt={data.title}
              body={display.body}
              resetKey={data.id}
              galleryLabel="Галерея проекта"
            />
          ) : null}
        </div>
      </section>

      {quote ? (
        <section className="case-landing__section case-landing__section--tight-top">
          <div className="case-landing__inner">
            <Reveal>
              <blockquote className="case-landing__card case-landing__quote">
                <Quote size={48} className="case-landing__quote-icon" aria-hidden />
                <p>&ldquo;{quote}&rdquo;</p>
                {(data.testimonialAuthor.trim() || data.testimonialRole.trim()) && (
                  <footer className="mt-6 text-sm text-[var(--text-muted)]">
                    {data.testimonialAuthor.trim() ? (
                      <cite className="not-italic font-semibold text-[var(--text)]">{data.testimonialAuthor}</cite>
                    ) : null}
                    {data.testimonialRole.trim() ? (
                      <span>{data.testimonialAuthor.trim() ? " · " : ""}{data.testimonialRole}</span>
                    ) : null}
                  </footer>
                )}
              </blockquote>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="case-landing__cta-wrap">
        <div className="case-landing__inner">
          <CtaBanner
            className="case-landing-cta"
            title={data.ctaTitle}
            subtitle={data.ctaSubtitle}
            primaryLabel={buttonLabels.projectDetailPrimary}
            primaryHref="/#contact"
            secondaryLabel={external ? buttonLabels.projectDetailSecondary : undefined}
            secondaryHref={external ?? undefined}
            variant="accent"
            primaryButtonField="projectDetailPrimary"
            secondaryButtonField="projectDetailSecondary"
          />
        </div>
      </section>
    </article>
  );
}
