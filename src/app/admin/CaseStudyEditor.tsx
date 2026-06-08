"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { blobToFile, CASE_COVER_ASPECT, PROJECT_GALLERY_ASPECT } from "@/lib/crop-image";
import {
  parseLandingBenefits,
  parseLandingSteps,
  parseScopeItems,
  type LandingBenefit,
  type LandingStep,
} from "@/lib/case-study-landing";
import { parseJsonArray } from "@/lib/parse-json";
import { parseProjectGalleryItems, serializeProjectGallery, type ProjectGalleryItem } from "@/lib/project-gallery";
import { AdminCardListEditor, AdminGalleryEditor, AdminStringListEditor } from "./AdminListEditors";
import { ImageCropDialog } from "./ImageCropDialog";

type CaseStudyEditorProps = {
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

export function CaseStudyEditor({ item, onSave, onDelete, onUpload }: CaseStudyEditorProps) {
  const id = Number(item.id);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [tag, setTag] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

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
  const [gallery, setGallery] = useState<ProjectGalleryItem[]>([]);

  const [testimonialQuote, setTestimonialQuote] = useState("");
  const [testimonialAuthor, setTestimonialAuthor] = useState("");
  const [testimonialRole, setTestimonialRole] = useState("");

  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaSubtitle, setCtaSubtitle] = useState("");

  const syncKey = useMemo(() => JSON.stringify(item), [item]);

  useEffect(() => {
    setTag(String(item.tag ?? ""));
    setTitle(String(item.title ?? ""));
    setDescription(String(item.description ?? ""));
    setImageUrl(String(item.imageUrl ?? ""));
    setLink(String(item.link ?? ""));
    setSortOrder(Number(item.sortOrder ?? 0));

    setLandingHeroMeta(String(item.landingHeroMeta ?? ""));
    setMetrics(parseJsonArray<string>(String(item.landingMetrics ?? "[]"), []).filter(Boolean));

    setChallengeTitle(String(item.challengeTitle ?? "Задача клиента"));
    setChallengeText(String(item.challengeText ?? ""));
    setSolutionTitle(String(item.solutionTitle ?? "Наше решение"));
    setSolutionText(String(item.solutionText ?? ""));

    setBenefitsTitle(String(item.benefitsTitle ?? "Преимущества продукта"));
    setBenefits(parseLandingBenefits(String(item.benefitsItems ?? "[]")));

    setHowItWorksTitle(String(item.howItWorksTitle ?? "Как мы это сделали"));
    setSteps(parseLandingSteps(String(item.howItWorksSteps ?? "[]")));

    setScopeTitle(String(item.scopeTitle ?? "Что входит в решение"));
    setScopeItems(parseScopeItems(String(item.scopeItems ?? "[]")));

    setResultsTitle(String(item.resultsTitle ?? "Результат для бизнеса"));
    setResultsText(String(item.resultsText ?? ""));

    setStoryTitle(String(item.storyTitle ?? "О проекте"));
    setBody(String(item.body ?? ""));
    setGallery(parseProjectGalleryItems(String(item.gallery ?? "[]")));

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
    const file = blobToFile(blob, `cover-${Date.now()}.jpg`);
    const url = await onUpload(file);
    setImageUrl(url);
  }

  function buildPayload(): Record<string, unknown> {
    const cleanMetrics = metrics.map((m) => m.trim()).filter(Boolean);
    const cleanScope = scopeItems.map((s) => s.trim()).filter(Boolean);
    const cleanBenefits = benefits
      .map((b) => ({ title: b.title.trim(), text: b.text.trim() }))
      .filter((b) => b.title);
    const cleanSteps = steps
      .map((s) => ({ title: s.title.trim(), text: s.text.trim() }))
      .filter((s) => s.title);
    const cleanGallery = gallery.filter((g) => g.displayUrl);

    return {
      tag: tag.trim(),
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      link: link.trim() || null,
      sortOrder,
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
      gallery: serializeProjectGallery(cleanGallery),
      testimonialQuote: testimonialQuote.trim(),
      testimonialAuthor: testimonialAuthor.trim(),
      testimonialRole: testimonialRole.trim(),
      ctaTitle: ctaTitle.trim(),
      ctaSubtitle: ctaSubtitle.trim(),
    };
  }

  const previewMetrics = metrics.filter(Boolean);

  return (
    <>
      {cropSrc ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={CASE_COVER_ASPECT}
          title="Обрезка обложки"
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
            <p className="text-xs uppercase tracking-wide text-accent">Редактор страницы кейса</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Все блоки соответствуют секциям на странице /cases/{id}
            </p>
          </div>
          <Link
            href={`/cases/${id}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline text-sm"
          >
            Открыть страницу →
          </Link>
        </div>

        <Section title="Карточка на главной" desc="Блок в секции «Кейсы» на главной странице">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Тег / название продукта">
              <input value={tag} onChange={(e) => setTag(e.target.value)} />
            </Field>
            <Field label="Порядок">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Заголовок">
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Краткое описание">
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <AdminStringListEditor
            label="Метрики на карточке"
            hint="Например: «1200+ пользователей». Пустой список — подставятся метрики по умолчанию."
            items={metrics}
            onChange={setMetrics}
            placeholder="×2 заявки с сайта"
          />
          <Field label="Внешняя ссылка (опционально)">
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="#contact или https://..." />
          </Field>
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-medium">Обложка (Hero и карточка)</p>
            {imageUrl ? (
              <div className="admin-cover-preview aspect-[4/3] max-w-xs overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <label className="block text-sm text-[var(--text-muted)]">
              Загрузить — откроется обрезка 4:3
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) openCropWithFile(file);
                }}
              />
            </label>
            {imageUrl ? (
              <button type="button" className="btn-outline text-sm" onClick={() => setCropSrc(imageUrl)}>
                Обрезать заново
              </button>
            ) : null}
          </div>
        </Section>

        <Section title="Hero страницы кейса" desc="Первый экран на странице кейса">
          <Field label="Строка под заголовком" hint="Например: SaaS · 6 месяцев · Подписка">
            <input value={landingHeroMeta} onChange={(e) => setLandingHeroMeta(e.target.value)} />
          </Field>
          {previewMetrics.length > 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              Метрики в Hero берутся из блока «Карточка на главной» ({previewMetrics.length} шт.)
            </p>
          ) : null}
        </Section>

        <Section title="Задача и решение" desc="Два блока под Hero">
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

        <Section title="Преимущества продукта" desc="Сетка карточек с иконками">
          <Field label="Заголовок секции">
            <input value={benefitsTitle} onChange={(e) => setBenefitsTitle(e.target.value)} />
          </Field>
          <AdminCardListEditor
            label="Карточки преимуществ"
            hint="Каждая карточка — заголовок и описание"
            items={benefits}
            onChange={setBenefits}
          />
        </Section>

        <Section title="Как мы это сделали" desc="Этапы процесса (01, 02, 03…)">
          <Field label="Заголовок секции">
            <input value={howItWorksTitle} onChange={(e) => setHowItWorksTitle(e.target.value)} />
          </Field>
          <AdminCardListEditor
            label="Этапы"
            items={steps}
            onChange={setSteps}
          />
        </Section>

        <Section title="Что входит в решение" desc="Список с галочками">
          <Field label="Заголовок секции">
            <input value={scopeTitle} onChange={(e) => setScopeTitle(e.target.value)} />
          </Field>
          <AdminStringListEditor
            label="Пункты"
            items={scopeItems}
            onChange={setScopeItems}
            placeholder="Прототип и UI"
          />
        </Section>

        <Section title="Результат для бизнеса" desc="Блок «Итог» с метриками">
          <Field label="Заголовок">
            <input value={resultsTitle} onChange={(e) => setResultsTitle(e.target.value)} />
          </Field>
          <Field label="Текст результата">
            <textarea rows={5} value={resultsText} onChange={(e) => setResultsText(e.target.value)} />
          </Field>
        </Section>

        <Section title="О проекте" desc="Текст справа, галерея с миниатюрами слева">
          <Field label="Заголовок секции">
            <input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} />
          </Field>
          <Field label="Подробный текст">
            <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <AdminGalleryEditor
            label="Дополнительные фото галереи"
            hint="Обложка выше всегда первое фото. Здесь — дополнительные кадры для переключения. В полноэкранном просмотре — оригинал до обрезки."
            items={gallery}
            onChange={setGallery}
            onUpload={onUpload}
            cropAspect={PROJECT_GALLERY_ASPECT}
          />
        </Section>

        <Section title="Отзыв" desc="Необязательный блок. Оставьте цитату пустой — блок скроется">
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

        <Section title="Финальный CTA" desc="Призыв внизу страницы">
          <Field label="Заголовок">
            <input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} />
          </Field>
          <Field label="Подзаголовок">
            <textarea rows={2} value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} />
          </Field>
        </Section>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button type="button" className="btn-primary text-sm" onClick={() => void onSave(id, buildPayload())}>
            Сохранить страницу
          </button>
          <button type="button" className="btn-outline text-sm" onClick={() => void onDelete(id)}>
            Удалить кейс
          </button>
        </div>
      </div>
    </>
  );
}
