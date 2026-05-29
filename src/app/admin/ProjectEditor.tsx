"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { blobToFile } from "@/lib/crop-image";
import {
  parseLandingBenefits,
  parseLandingSteps,
  parseLandingMetrics,
  parseScopeItems,
  type LandingBenefit,
  type LandingStep,
} from "@/lib/project-landing";
import { AdminCardListEditor, AdminGalleryEditor, AdminStringListEditor } from "./AdminListEditors";
import { ImageCropDialog } from "./ImageCropDialog";

const PROJECT_COVER_ASPECT = 16 / 10;

export type ProjectEditorMode = "card" | "page";

type ProjectEditorProps = {
  mode: ProjectEditorMode;
  item: Record<string, unknown>;
  onSave: (id: number, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-medium text-[var(--text)]">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-case-section">
      <header className="admin-case-section__head">
        <h3 className="admin-case-section__title">{title}</h3>
        {desc ? <p className="admin-case-section__desc">{desc}</p> : null}
      </header>
      <div className="admin-case-section__body space-y-4">{children}</div>
    </section>
  );
}

export function ProjectEditor({ mode, item, onSave, onDelete, onUpload }: ProjectEditorProps) {
  const id = Number(item.id);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"card" | "page">("card");

  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [projectCardImageUrl, setProjectCardImageUrl] = useState("");
  const [projectPageImageUrl, setProjectPageImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [coverFocusX, setCoverFocusX] = useState(50);
  const [coverFocusY, setCoverFocusY] = useState(50);
  const [projectPageFocusX, setProjectPageFocusX] = useState(50);
  const [projectPageFocusY, setProjectPageFocusY] = useState(50);

  const [landingHeroMeta, setLandingHeroMeta] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);

  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionText, setSolutionText] = useState("");

  const [benefitsTitle, setBenefitsTitle] = useState("");
  const [benefits, setBenefits] = useState<LandingBenefit[]>([]);

  const [howItWorksTitle, setHowItWorksTitle] = useState("");
  const [steps, setSteps] = useState<LandingStep[]>([]);

  const [scopeTitle, setScopeTitle] = useState("");
  const [scopeItems, setScopeItems] = useState<string[]>([]);

  const [resultsTitle, setResultsTitle] = useState("");
  const [resultsText, setResultsText] = useState("");

  const [storyTitle, setStoryTitle] = useState("");
  const [body, setBody] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);

  const [testimonialQuote, setTestimonialQuote] = useState("");
  const [testimonialAuthor, setTestimonialAuthor] = useState("");
  const [testimonialRole, setTestimonialRole] = useState("");

  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaSubtitle, setCtaSubtitle] = useState("");

  const syncKey = useMemo(() => JSON.stringify(item), [item]);

  useEffect(() => {
    setCardTitle(String(item.cardTitle ?? item.title ?? ""));
    setCardDescription(String(item.cardDescription ?? item.description ?? ""));
    setPageTitle(String(item.pageTitle ?? item.title ?? ""));
    setPageDescription(String(item.pageDescription ?? item.description ?? ""));
    setImageUrl(String(item.imageUrl ?? ""));
    setProjectCardImageUrl(String(item.projectCardImageUrl ?? item.imageUrl ?? ""));
    setProjectPageImageUrl(String(item.projectPageImageUrl ?? item.imageUrl ?? ""));
    setLink(String(item.link ?? ""));
    setSortOrder(Number(item.sortOrder ?? 0));
    setCoverFocusX(Number(item.coverFocusX ?? 50));
    setCoverFocusY(Number(item.coverFocusY ?? 50));
    setProjectPageFocusX(Number(item.projectPageFocusX ?? 50));
    setProjectPageFocusY(Number(item.projectPageFocusY ?? 50));

    setLandingHeroMeta(String(item.landingHeroMeta ?? ""));
    setMetrics(parseLandingMetrics(String(item.landingMetrics ?? "[]")));

    setChallengeTitle(String(item.challengeTitle ?? "Задача проекта"));
    setChallengeText(String(item.challengeText ?? ""));
    setSolutionTitle(String(item.solutionTitle ?? "Наше решение"));
    setSolutionText(String(item.solutionText ?? ""));

    setBenefitsTitle(String(item.benefitsTitle ?? "Преимущества проекта"));
    setBenefits(parseLandingBenefits(String(item.benefitsItems ?? "[]")));

    setHowItWorksTitle(String(item.howItWorksTitle ?? "Как мы реализовали"));
    setSteps(parseLandingSteps(String(item.howItWorksSteps ?? "[]")));

    setScopeTitle(String(item.scopeTitle ?? "Что было сделано"));
    setScopeItems(parseScopeItems(String(item.scopeItems ?? "[]")));

    setResultsTitle(String(item.resultsTitle ?? "Результат для бизнеса"));
    setResultsText(String(item.resultsText ?? ""));

    setStoryTitle(String(item.storyTitle ?? "О проекте"));
    setBody(String(item.body ?? ""));
    setGallery(parseScopeItems(String(item.gallery ?? "[]")));

    setTestimonialQuote(String(item.testimonialQuote ?? ""));
    setTestimonialAuthor(String(item.testimonialAuthor ?? ""));
    setTestimonialRole(String(item.testimonialRole ?? ""));

    setCtaTitle(String(item.ctaTitle ?? ""));
    setCtaSubtitle(String(item.ctaSubtitle ?? ""));
  }, [syncKey, item]);

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  function openCropWithFile(file: File) {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
  }

  async function uploadCroppedBlob(blob: Blob) {
    const file = blobToFile(blob, `project-cover-${Date.now()}.jpg`);
    const url = await onUpload(file);
    if (cropTarget === "card") setProjectCardImageUrl(url);
    else setProjectPageImageUrl(url);
  }

  function buildCardPayload(): Record<string, unknown> {
    return {
      cardTitle: cardTitle.trim(),
      cardDescription: cardDescription.trim(),
      imageUrl: imageUrl.trim(),
      projectCardImageUrl: projectCardImageUrl.trim(),
      link: link.trim() || null,
      sortOrder,
      coverFocusX: Math.max(0, Math.min(100, Math.round(coverFocusX))),
      coverFocusY: Math.max(0, Math.min(100, Math.round(coverFocusY))),
    };
  }

  function buildPagePayload(): Record<string, unknown> {
    const cleanMetrics = metrics.map((m) => m.trim()).filter(Boolean);
    const cleanScope = scopeItems.map((s) => s.trim()).filter(Boolean);
    const cleanBenefits = benefits
      .map((b) => ({ title: b.title.trim(), text: b.text.trim() }))
      .filter((b) => b.title);
    const cleanSteps = steps
      .map((s) => ({ title: s.title.trim(), text: s.text.trim() }))
      .filter((s) => s.title);
    const cleanGallery = gallery.filter(Boolean);

    return {
      pageTitle: pageTitle.trim(),
      pageDescription: pageDescription.trim(),
      projectPageImageUrl: projectPageImageUrl.trim(),
      projectPageFocusX: Math.max(0, Math.min(100, Math.round(projectPageFocusX))),
      projectPageFocusY: Math.max(0, Math.min(100, Math.round(projectPageFocusY))),
      landingHeroMeta: landingHeroMeta.trim(),
      landingMetrics: JSON.stringify(cleanMetrics),
      challengeTitle: challengeTitle.trim(),
      challengeText: challengeText.trim(),
      solutionTitle: solutionTitle.trim(),
      solutionText: solutionText.trim(),
      benefitsTitle: benefitsTitle.trim(),
      benefitsItems: JSON.stringify(cleanBenefits),
      howItWorksTitle: howItWorksTitle.trim(),
      howItWorksSteps: JSON.stringify(cleanSteps),
      scopeTitle: scopeTitle.trim(),
      scopeItems: JSON.stringify(cleanScope),
      resultsTitle: resultsTitle.trim(),
      resultsText: resultsText.trim(),
      storyTitle: storyTitle.trim(),
      body: body.trim(),
      gallery: JSON.stringify(cleanGallery),
      testimonialQuote: testimonialQuote.trim(),
      testimonialAuthor: testimonialAuthor.trim(),
      testimonialRole: testimonialRole.trim(),
      ctaTitle: ctaTitle.trim(),
      ctaSubtitle: ctaSubtitle.trim(),
    };
  }

  const isCard = mode === "card";

  return (
    <>
      {cropSrc ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={PROJECT_COVER_ASPECT}
          title={cropTarget === "card" ? "Обрезка обложки карточки" : "Обрезка обложки страницы"}
          onClose={() => {
            if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onConfirm={uploadCroppedBlob}
        />
      ) : null}

      <div className="admin-card admin-case-editor space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-accent">
              {isCard ? "Карточка на главной" : "Страница проекта"}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {isCard
                ? "Секция «Портфолио» на главной странице"
                : `Все блоки на странице /projects/${id}`}
            </p>
          </div>
          {isCard ? (
            <Link href={`/admin/projects/pages`} className="btn-outline text-sm">
              Редактировать страницу →
            </Link>
          ) : (
            <Link href={`/projects/${id}`} target="_blank" rel="noreferrer" className="btn-outline text-sm">
              Открыть страницу →
            </Link>
          )}
        </div>

        {isCard ? (
          <Section title="Карточка в портфолио" desc="Только для главной страницы — не влияет на страницу проекта">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Порядок">
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              </Field>
              <Field label="Внешняя ссылка (опционально)" hint="Если задана, карточка ведёт не на страницу проекта">
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="#contact или https://..." />
              </Field>
            </div>
            <Field label="Заголовок карточки">
              <input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
            </Field>
            <Field label="Описание на карточке">
              <textarea rows={3} value={cardDescription} onChange={(e) => setCardDescription(e.target.value)} />
            </Field>
            <div className="space-y-4 border-t border-[var(--border)] pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Обложка карточки</p>
                {projectCardImageUrl ? (
                  <div className="admin-cover-preview aspect-[16/10] max-w-md overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={projectCardImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${Math.max(0, Math.min(100, coverFocusX))}% ${Math.max(
                          0,
                          Math.min(100, coverFocusY),
                        )}%`,
                      }}
                    />
                  </div>
                ) : null}
                <label className="block text-sm text-[var(--text-muted)]">
                  Загрузить (кроп 16:10)
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setCropTarget("card");
                      openCropWithFile(file);
                    }}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-[var(--text-muted)]">
                  Фокус по горизонтали: {Math.round(coverFocusX)}%
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={coverFocusX}
                    onChange={(e) => setCoverFocusX(Number(e.target.value))}
                    className="mt-1"
                  />
                </label>
                <label className="block text-xs text-[var(--text-muted)]">
                  Фокус по вертикали: {Math.round(coverFocusY)}%
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={coverFocusY}
                    onChange={(e) => setCoverFocusY(Number(e.target.value))}
                    className="mt-1"
                  />
                </label>
              </div>
              <Field label="Резервное поле imageUrl (для старых записей)">
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </Field>
            </div>
          </Section>
        ) : (
          <>
            <Section title="Hero страницы" desc="Заголовок и текст только для страницы /projects/… — карточка на главной не меняется">
              <Field label="Заголовок страницы">
                <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
              </Field>
              <Field label="Описание под заголовком">
                <textarea rows={3} value={pageDescription} onChange={(e) => setPageDescription(e.target.value)} />
              </Field>
              <Field label="Строка под описанием (meta)">
                <input value={landingHeroMeta} onChange={(e) => setLandingHeroMeta(e.target.value)} />
              </Field>
              <AdminStringListEditor
                label="Метрики в Hero"
                hint="Короткие тезисы в шапке и блоке результата"
                items={metrics}
                onChange={setMetrics}
              />
              <div className="space-y-4 border-t border-[var(--border)] pt-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Обложка страницы проекта</p>
                  {projectPageImageUrl ? (
                    <div className="admin-cover-preview aspect-[16/10] max-w-md overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={projectPageImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{
                          objectPosition: `${Math.max(0, Math.min(100, projectPageFocusX))}% ${Math.max(
                            0,
                            Math.min(100, projectPageFocusY),
                          )}%`,
                        }}
                      />
                    </div>
                  ) : null}
                  <label className="block text-sm text-[var(--text-muted)]">
                    Загрузить (кроп 16:10)
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        setCropTarget("page");
                        openCropWithFile(file);
                      }}
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-[var(--text-muted)]">
                    Фокус X: {Math.round(projectPageFocusX)}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={projectPageFocusX}
                      onChange={(e) => setProjectPageFocusX(Number(e.target.value))}
                      className="mt-1"
                    />
                  </label>
                  <label className="block text-xs text-[var(--text-muted)]">
                    Фокус Y: {Math.round(projectPageFocusY)}%
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={projectPageFocusY}
                      onChange={(e) => setProjectPageFocusY(Number(e.target.value))}
                      className="mt-1"
                    />
                  </label>
                </div>
              </div>
            </Section>

        <Section title="Задача и решение">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Field label="Заголовок «Задача»">
                <input value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} />
              </Field>
              <Field label="Текст задачи">
                <textarea rows={6} value={challengeText} onChange={(e) => setChallengeText(e.target.value)} />
              </Field>
            </div>
            <div className="space-y-3">
              <Field label="Заголовок «Решение»">
                <input value={solutionTitle} onChange={(e) => setSolutionTitle(e.target.value)} />
              </Field>
              <Field label="Текст решения">
                <textarea rows={6} value={solutionText} onChange={(e) => setSolutionText(e.target.value)} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Преимущества проекта">
          <Field label="Заголовок секции">
            <input value={benefitsTitle} onChange={(e) => setBenefitsTitle(e.target.value)} />
          </Field>
          <AdminCardListEditor label="Карточки преимуществ" items={benefits} onChange={setBenefits} />
        </Section>

        <Section title="Как мы реализовали">
          <Field label="Заголовок секции">
            <input value={howItWorksTitle} onChange={(e) => setHowItWorksTitle(e.target.value)} />
          </Field>
          <AdminCardListEditor label="Этапы" items={steps} onChange={setSteps} />
        </Section>

        <Section title="Что было сделано">
          <Field label="Заголовок секции">
            <input value={scopeTitle} onChange={(e) => setScopeTitle(e.target.value)} />
          </Field>
          <AdminStringListEditor label="Пункты" items={scopeItems} onChange={setScopeItems} />
        </Section>

        <Section title="Результат проекта">
          <Field label="Заголовок">
            <input value={resultsTitle} onChange={(e) => setResultsTitle(e.target.value)} />
          </Field>
          <Field label="Текст результата">
            <textarea rows={5} value={resultsText} onChange={(e) => setResultsText(e.target.value)} />
          </Field>
        </Section>

        <Section title="О проекте">
          <Field label="Заголовок секции">
            <input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} />
          </Field>
          <Field label="Подробный текст">
            <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <AdminGalleryEditor
            label="Фото галереи"
            hint="Дополнительные фото для блока «О проекте»"
            urls={gallery}
            onChange={setGallery}
            onUpload={onUpload}
            cropAspect={PROJECT_COVER_ASPECT}
          />
        </Section>

        <Section title="Отзыв (опционально)">
          <Field label="Цитата">
            <textarea rows={3} value={testimonialQuote} onChange={(e) => setTestimonialQuote(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Автор">
              <input value={testimonialAuthor} onChange={(e) => setTestimonialAuthor(e.target.value)} />
            </Field>
            <Field label="Должность / компания">
              <input value={testimonialRole} onChange={(e) => setTestimonialRole(e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Финальный CTA">
          <Field label="Заголовок">
            <input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} />
          </Field>
          <Field label="Подзаголовок">
            <textarea rows={2} value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} />
          </Field>
        </Section>
          </>
        )}

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() => void onSave(id, isCard ? buildCardPayload() : buildPagePayload())}
          >
            {isCard ? "Сохранить карточку" : "Сохранить страницу"}
          </button>
          <button type="button" className="btn-outline text-sm" onClick={() => void onDelete(id)}>
            Удалить проект
          </button>
        </div>
      </div>
    </>
  );
}
