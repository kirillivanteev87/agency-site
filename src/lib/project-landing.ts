import { parseJsonArray } from "./parse-json";
import { buildDetailPhotos } from "./project-gallery";
import type { Project } from "@prisma/client";

export type LandingBenefit = { title: string; text: string };
export type LandingStep = { title: string; text: string };

export type ProjectLandingView = Project & {
  metrics: string[];
  photos: string[];
  scopeItemsList: string[];
  benefitsList: LandingBenefit[];
  stepsList: LandingStep[];
  display: {
    heroMeta: string;
    challengeText: string;
    solutionText: string;
    resultsText: string;
    body: string;
  };
};

export function parseLandingMetrics(raw: string | null | undefined): string[] {
  return parseJsonArray<string>(raw ?? "[]", []).filter(Boolean);
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

function defaultMetrics(project: Project): string[] {
  return ["Сроки и бюджет под контролем", "Фокус на конверсии", "Поддержка после релиза"];
}

function defaultScopeItems(): string[] {
  return [
    "Бизнес-анализ и формализация задач",
    "Прототип и дизайн интерфейса",
    "Разработка и интеграции",
    "Тестирование и запуск",
  ];
}

function defaultBenefits(project: Project): LandingBenefit[] {
  return [
    { title: "Продающая структура", text: "Страницы и сценарии выстроены под целевые действия пользователей." },
    { title: "Технологический запас", text: "Архитектура рассчитана на рост функционала и нагрузки." },
    { title: "Измеримый результат", text: "Метрики и аналитика встроены в продукт с первого релиза." },
    { title: "Быстрые итерации", text: "Проект легко масштабируется и дополняется новыми блоками." },
  ];
}

function defaultSteps(project: Project): LandingStep[] {
  const pageTitle = getProjectPageTitle(project);
  return [
    { title: "Бриф и аудит", text: `Разобрали цели проекта «${pageTitle}» и приоритеты бизнеса.` },
    { title: "Прототипирование", text: "Собрали логику экранов и воронку взаимодействия с продуктом." },
    { title: "Разработка", text: "Реализовали интерфейс, backend-интеграции и тестирование сценариев." },
    { title: "Запуск", text: "Вывели проект в прод и настроили улучшения по фактическим данным." },
  ];
}

function resolveDisplayTexts(project: Project): ProjectLandingView["display"] {
  const lead = getProjectPageDescription(project);
  const pageTitle = getProjectPageTitle(project);
  return {
    heroMeta: project.landingHeroMeta.trim() || "Проект REDLINE · Под ключ · От идеи до результата",
    challengeText:
      project.challengeText.trim() ||
      `Нужно было реализовать проект «${pageTitle}» так, чтобы он приносил бизнес-результат, а не только визуальный эффект. ${lead}`,
    solutionText:
      project.solutionText.trim() ||
      `Мы выстроили решение вокруг задач бизнеса: UX, структура, разработка и интеграции. ${lead}`,
    resultsText:
      project.resultsText.trim() ||
      `После запуска команда получила рабочий инструмент для роста метрик и масштабирования. ${lead}`,
    body:
      project.body.trim() ||
      `${lead}\n\nЭтот текст можно полностью заменить в админке в секции «О проекте».`,
  };
}

export function getProjectCardTitle(project: Pick<Project, "cardTitle" | "title">): string {
  return project.cardTitle.trim() || project.title;
}

export function getProjectCardDescription(project: Pick<Project, "cardDescription" | "description">): string {
  return project.cardDescription.trim() || project.description;
}

export function getProjectPageTitle(project: Pick<Project, "pageTitle" | "title">): string {
  return project.pageTitle.trim() || project.title;
}

export function getProjectPageDescription(project: Pick<Project, "pageDescription" | "description">): string {
  return project.pageDescription.trim() || project.description;
}

export function normalizeProjectRow(project: Project): Project {
  const baseImage = project.imageUrl ?? "";
  return {
    ...project,
    body: project.body ?? "",
    gallery: project.gallery ?? "[]",
    landingHeroMeta: project.landingHeroMeta ?? "",
    landingMetrics: project.landingMetrics ?? "[]",
    challengeTitle: project.challengeTitle ?? "Задача проекта",
    challengeText: project.challengeText ?? "",
    solutionTitle: project.solutionTitle ?? "Наше решение",
    solutionText: project.solutionText ?? "",
    benefitsTitle: project.benefitsTitle ?? "Преимущества проекта",
    benefitsItems: project.benefitsItems ?? "[]",
    howItWorksTitle: project.howItWorksTitle ?? "Как мы реализовали",
    howItWorksSteps: project.howItWorksSteps ?? "[]",
    scopeTitle: project.scopeTitle ?? "Что было сделано",
    scopeItems: project.scopeItems ?? "[]",
    resultsTitle: project.resultsTitle ?? "Результат для бизнеса",
    resultsText: project.resultsText ?? "",
    storyTitle: project.storyTitle ?? "О проекте",
    testimonialQuote: project.testimonialQuote ?? "",
    testimonialAuthor: project.testimonialAuthor ?? "",
    testimonialRole: project.testimonialRole ?? "",
    ctaTitle: project.ctaTitle ?? "Хотите такой же проект?",
    ctaSubtitle:
      project.ctaSubtitle ?? "Подготовим план и оценку по срокам и бюджету в течение 24 часов.",
    coverFocusX: project.coverFocusX ?? 50,
    coverFocusY: project.coverFocusY ?? 50,
    projectPageFocusX: project.projectPageFocusX ?? 50,
    projectPageFocusY: project.projectPageFocusY ?? 50,
    projectCardImageUrl: project.projectCardImageUrl ?? baseImage,
    projectPageImageUrl: project.projectPageImageUrl ?? baseImage,
    cardTitle: project.cardTitle ?? "",
    cardDescription: project.cardDescription ?? "",
    pageTitle: project.pageTitle ?? "",
    pageDescription: project.pageDescription ?? "",
  };
}

export function buildProjectLandingView(project: Project): ProjectLandingView {
  const normalized = normalizeProjectRow(project);
  const metrics = parseLandingMetrics(normalized.landingMetrics);
  const scopeItemsList = parseScopeItems(normalized.scopeItems);
  const benefitsList = parseLandingBenefits(normalized.benefitsItems);
  const stepsList = parseLandingSteps(normalized.howItWorksSteps);
  return {
    ...normalized,
    title: getProjectPageTitle(normalized),
    description: getProjectPageDescription(normalized),
    metrics: metrics.length > 0 ? metrics : defaultMetrics(normalized),
    photos: buildDetailPhotos(normalized.projectPageImageUrl || normalized.imageUrl, normalized.gallery),
    scopeItemsList: scopeItemsList.length > 0 ? scopeItemsList : defaultScopeItems(),
    benefitsList: benefitsList.length > 0 ? benefitsList : defaultBenefits(normalized),
    stepsList: stepsList.length > 0 ? stepsList : defaultSteps(normalized),
    display: resolveDisplayTexts(normalized),
  };
}

export function getProjectLandingByProject(project: Project): ProjectLandingView {
  return buildProjectLandingView(project);
}

export const PROJECT_LANDING_DEFAULTS = {
  cardTitle: "",
  cardDescription: "",
  pageTitle: "",
  pageDescription: "",
  landingHeroMeta: "",
  landingMetrics: "[]",
  challengeTitle: "Задача проекта",
  challengeText: "",
  solutionTitle: "Наше решение",
  solutionText: "",
  benefitsTitle: "Преимущества проекта",
  benefitsItems: "[]",
  howItWorksTitle: "Как мы реализовали",
  howItWorksSteps: "[]",
  scopeTitle: "Что было сделано",
  scopeItems: "[]",
  resultsTitle: "Результат для бизнеса",
  resultsText: "",
  storyTitle: "О проекте",
  testimonialQuote: "",
  testimonialAuthor: "",
  testimonialRole: "",
  ctaTitle: "Хотите такой же проект?",
  ctaSubtitle: "Подготовим план и оценку по срокам и бюджету в течение 24 часов.",
  coverFocusX: 50,
  coverFocusY: 50,
  projectPageFocusX: 50,
  projectPageFocusY: 50,
  projectCardImageUrl: "",
  projectPageImageUrl: "",
} as const;
