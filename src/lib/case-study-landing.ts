import { metricsForCaseStudyIndex } from "./case-study-metrics";
import { parseJsonArray } from "./parse-json";
import { buildDetailPhotos } from "./project-gallery";
import type { CaseStudy } from "@prisma/client";

export type LandingBenefit = { title: string; text: string };
export type LandingStep = { title: string; text: string };

export type CaseStudyLandingView = CaseStudy & {
  metrics: string[];
  photos: string[];
  scopeItemsList: string[];
  benefitsList: LandingBenefit[];
  stepsList: LandingStep[];
  /** Тексты с автоподстановкой, если в админке пусто */
  display: {
    heroMeta: string;
    challengeText: string;
    solutionText: string;
    resultsText: string;
    body: string;
  };
};

export function parseCaseStudyMetrics(raw: string | null | undefined, index: number): string[] {
  const custom = parseJsonArray<string>(raw ?? "[]", []).filter(Boolean);
  if (custom.length > 0) return custom;
  return metricsForCaseStudyIndex(index);
}

export function parseScopeItems(raw: string | null | undefined): string[] {
  return parseJsonArray<string>(raw ?? "[]", []).filter(Boolean);
}

export function parseLandingBenefits(raw: string | null | undefined): LandingBenefit[] {
  const parsed = parseJsonArray<unknown>(raw ?? "[]", []);
  return parsed
    .map((item) => {
      if (typeof item === "string" && item.trim()) return { title: item.trim(), text: "" };
      if (item && typeof item === "object" && "title" in item) {
        const row = item as { title?: unknown; text?: unknown };
        const title = String(row.title ?? "").trim();
        const text = String(row.text ?? "").trim();
        if (title) return { title, text };
      }
      return null;
    })
    .filter((item): item is LandingBenefit => item != null);
}

export function parseLandingSteps(raw: string | null | undefined): LandingStep[] {
  const parsed = parseJsonArray<unknown>(raw ?? "[]", []);
  return parsed
    .map((item) => {
      if (typeof item === "string" && item.trim()) return { title: item.trim(), text: "" };
      if (item && typeof item === "object" && "title" in item) {
        const row = item as { title?: unknown; text?: unknown };
        const title = String(row.title ?? "").trim();
        const text = String(row.text ?? "").trim();
        if (title) return { title, text };
      }
      return null;
    })
    .filter((item): item is LandingStep => item != null);
}

function defaultScopeItems(study: CaseStudy): string[] {
  return [
    "Исследование задачи и сценариев пользователей",
    "Прототип и UI под ключевые действия",
    "Разработка MVP и интеграции",
    "Запуск, аналитика и сопровождение",
  ];
}

function defaultBenefits(study: CaseStudy): LandingBenefit[] {
  const product = study.tag.trim() || "Продукт";
  return [
    {
      title: "Решает конкретную задачу",
      text: `${product}: ${study.title}. Фокус на результате, а не на «красивой обёртке».`,
    },
    {
      title: "Понятный пользовательский путь",
      text: "Продумали путь от первого экрана до целевого действия — без лишних шагов.",
    },
    {
      title: "Готово к масштабированию",
      text: "Архитектура и интерфейс рассчитаны на рост аудитории и новые функции.",
    },
    {
      title: "Измеримый эффект",
      text: "Заложили метрики и точки аналитики, чтобы видеть влияние на бизнес.",
    },
  ];
}

function defaultSteps(study: CaseStudy): LandingStep[] {
  return [
    {
      title: "Бриф и аудит",
      text: `Разобрали задачу «${study.title}», зафиксировали KPI и ограничения.`,
    },
    {
      title: "Прототип и дизайн",
      text: "Согласовали структуру экранов, сценарии и визуальный стиль продукта.",
    },
    {
      title: "Разработка",
      text: "Собрали MVP, подключили интеграции и провели тестирование ключевых сценариев.",
    },
    {
      title: "Запуск и рост",
      text: "Вывели продукт в прод и настроили улучшения по метрикам после старта.",
    },
  ];
}

function resolveDisplayTexts(study: CaseStudy): CaseStudyLandingView["display"] {
  const product = study.tag.trim() || "продукт";
  const lead = study.description.trim();

  return {
    heroMeta: study.landingHeroMeta.trim() || `${product} · Кейс REDLINE · Продукт под ключ`,
    challengeText:
      study.challengeText.trim() ||
      `Клиенту нужно было ${study.title.toLowerCase()}. ${lead || "Задача требовала быстрого и понятного цифрового решения без лишней сложности для пользователя."}`,
    solutionText:
      study.solutionText.trim() ||
      `Мы спроектировали и запустили ${product}: продумали UX, архитектуру и ключевые сценарии. ${lead || "Решение заточено под конверсию в целевое действие и масштабирование после релиза."}`,
    resultsText:
      study.resultsText.trim() ||
      `После запуска ${product} команда получила работающий инструмент с понятными метриками. ${lead}`,
    body:
      study.body.trim() ||
      `${lead}\n\nМы выстроили продукт вокруг реальных сценариев пользователей — от первого экрана до ключевого действия. Текст можно полностью заменить в админке в блоке «О проекте».`,
  };
}

export function normalizeCaseStudyRow(study: CaseStudy): CaseStudy {
  return {
    ...study,
    body: study.body ?? "",
    gallery: study.gallery ?? "[]",
    landingHeroMeta: study.landingHeroMeta ?? "",
    landingMetrics: study.landingMetrics ?? "[]",
    challengeTitle: study.challengeTitle ?? "Задача клиента",
    challengeText: study.challengeText ?? "",
    solutionTitle: study.solutionTitle ?? "Наше решение",
    solutionText: study.solutionText ?? "",
    benefitsTitle: study.benefitsTitle ?? "Преимущества продукта",
    benefitsItems: study.benefitsItems ?? "[]",
    howItWorksTitle: study.howItWorksTitle ?? "Как мы это сделали",
    howItWorksSteps: study.howItWorksSteps ?? "[]",
    scopeTitle: study.scopeTitle ?? "Что входит в решение",
    scopeItems: study.scopeItems ?? "[]",
    resultsTitle: study.resultsTitle ?? "Результат для бизнеса",
    resultsText: study.resultsText ?? "",
    storyTitle: study.storyTitle ?? "О проекте",
    testimonialQuote: study.testimonialQuote ?? "",
    testimonialAuthor: study.testimonialAuthor ?? "",
    testimonialRole: study.testimonialRole ?? "",
    ctaTitle: study.ctaTitle ?? "Хотите такой же результат?",
    ctaSubtitle:
      study.ctaSubtitle ??
      "Обсудим вашу задачу и предложим план с оценкой сроков и бюджета за 24 часа.",
  };
}

export function buildCaseStudyLandingView(study: CaseStudy, index: number): CaseStudyLandingView {
  const normalized = normalizeCaseStudyRow(study);
  const scopeItemsList = parseScopeItems(normalized.scopeItems);
  const benefitsList = parseLandingBenefits(normalized.benefitsItems);
  const stepsList = parseLandingSteps(normalized.howItWorksSteps);

  return {
    ...normalized,
    metrics: parseCaseStudyMetrics(normalized.landingMetrics, index),
    photos: buildDetailPhotos(normalized.imageUrl, normalized.gallery),
    scopeItemsList: scopeItemsList.length > 0 ? scopeItemsList : defaultScopeItems(normalized),
    benefitsList: benefitsList.length > 0 ? benefitsList : defaultBenefits(normalized),
    stepsList: stepsList.length > 0 ? stepsList : defaultSteps(normalized),
    display: resolveDisplayTexts(normalized),
  };
}

export const CASE_LANDING_DEFAULTS = {
  landingHeroMeta: "",
  landingMetrics: "[]",
  challengeTitle: "Задача клиента",
  challengeText: "",
  solutionTitle: "Наше решение",
  solutionText: "",
  benefitsTitle: "Преимущества продукта",
  benefitsItems: "[]",
  howItWorksTitle: "Как мы это сделали",
  howItWorksSteps: "[]",
  scopeTitle: "Что входит в решение",
  scopeItems: "[]",
  resultsTitle: "Результат для бизнеса",
  resultsText: "",
  storyTitle: "О проекте",
  testimonialQuote: "",
  testimonialAuthor: "",
  testimonialRole: "",
  ctaTitle: "Хотите такой же результат?",
  ctaSubtitle: "Обсудим вашу задачу и предложим план с оценкой сроков и бюджета за 24 часа.",
} as const;

export const CASE_LANDING_JSON_HINT = `[{"title":"Заголовок","text":"Описание"}]`;
