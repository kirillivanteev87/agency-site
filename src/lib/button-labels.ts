export const BUTTON_LABEL_KEYS = [
  "headerCta",
  "heroPrimary",
  "heroSecondary",
  "statsCta",
  "serviceCard",
  "servicesCtaPrimary",
  "servicesCtaSecondary",
  "projectsCard",
  "projectsCtaPrimary",
  "projectsCtaSecondary",
  "casesCard",
  "faqCta",
  "contactSubmit",
  "contactSubmitLoading",
  "marketplaceSubscribe",
  "marketplaceCtaPrimary",
  "marketplaceCtaSecondary",
  "projectDetailPrimary",
  "projectDetailSecondary",
  "caseDetailPrimary",
  "caseDetailSecondary",
  "aiChatLead",
  "aiChatLeadLoading",
] as const;

export type ButtonLabelKey = (typeof BUTTON_LABEL_KEYS)[number];
export type ButtonLabels = Record<ButtonLabelKey, string>;

export const DEFAULT_BUTTON_LABELS: ButtonLabels = {
  headerCta: "Бесплатная консультация",
  heroPrimary: "Получить смету за 24 часа",
  heroSecondary: "Заполнить бриф",
  statsCta: "Обсудить ваш проект",
  serviceCard: "Узнать стоимость →",
  servicesCtaPrimary: "Получить рекомендацию",
  servicesCtaSecondary: "Задать вопрос в FAQ",
  projectsCard: "Подробнее о проекте",
  projectsCtaPrimary: "Получить предложение",
  projectsCtaSecondary: "Заполнить бриф",
  casesCard: "Хочу похожий результат",
  faqCta: "Задать свой вопрос",
  contactSubmit: "Получить консультацию",
  contactSubmitLoading: "Отправка…",
  marketplaceSubscribe: "Оформить подписку",
  marketplaceCtaPrimary: "Обсудить подписку",
  marketplaceCtaSecondary: "Вернуться на главную",
  projectDetailPrimary: "Хочу такой же проект",
  projectDetailSecondary: "Открыть проект",
  caseDetailPrimary: "Хочу похожий результат",
  caseDetailSecondary: "Открыть ссылку",
  aiChatLead: "Записаться на созвон",
  aiChatLeadLoading: "Отправка…",
};

/** Группы для админки */
export const BUTTON_LABEL_GROUPS: {
  title: string;
  description?: string;
  keys: { key: ButtonLabelKey; label: string; hint?: string }[];
}[] = [
  {
    title: "Шапка и Hero",
    keys: [
      { key: "headerCta", label: "Кнопка в шапке" },
      { key: "heroPrimary", label: "Hero — основная" },
      { key: "heroSecondary", label: "Hero — вторичная" },
    ],
  },
  {
    title: "Секции главной",
    keys: [
      { key: "statsCta", label: "Блок статистики" },
      { key: "serviceCard", label: "Карточка услуги" },
      { key: "servicesCtaPrimary", label: "Услуги — CTA основная" },
      { key: "servicesCtaSecondary", label: "Услуги — CTA вторичная" },
      { key: "projectsCard", label: "Карточка проекта" },
      { key: "projectsCtaPrimary", label: "Проекты — CTA основная" },
      { key: "projectsCtaSecondary", label: "Проекты — CTA вторичная" },
      { key: "casesCard", label: "Карточка кейса" },
      { key: "faqCta", label: "FAQ — кнопка" },
    ],
  },
  {
    title: "Контакты и формы",
    keys: [
      { key: "contactSubmit", label: "Форма заявки" },
      { key: "contactSubmitLoading", label: "Форма — при отправке" },
      { key: "aiChatLead", label: "AI-чат — отправить контакты" },
      { key: "aiChatLeadLoading", label: "AI-чат — при отправке" },
    ],
  },
  {
    title: "Marketplace и детальные страницы",
    keys: [
      { key: "marketplaceSubscribe", label: "Карточка продукта" },
      { key: "marketplaceCtaPrimary", label: "Marketplace — CTA основная" },
      { key: "marketplaceCtaSecondary", label: "Marketplace — CTA вторичная" },
      { key: "projectDetailPrimary", label: "Страница проекта — основная" },
      { key: "projectDetailSecondary", label: "Страница проекта — ссылка" },
      { key: "caseDetailPrimary", label: "Страница кейса — основная" },
      { key: "caseDetailSecondary", label: "Страница кейса — ссылка" },
    ],
  },
];

function isButtonLabelKey(k: string): k is ButtonLabelKey {
  return (BUTTON_LABEL_KEYS as readonly string[]).includes(k);
}

const LEGACY_VIEW_CASES_LABELS = new Set([
  "Смотреть кейсы с цифрами",
  "Смотреть кейсы",
]);

export function parseButtonLabels(raw: string | null | undefined): ButtonLabels {
  const merged = { ...DEFAULT_BUTTON_LABELS };
  if (!raw?.trim()) return merged;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null) return merged;
    for (const key of BUTTON_LABEL_KEYS) {
      const v = parsed[key];
      if (typeof v === "string") merged[key] = v;
    }
  } catch {
    /* legacy / invalid */
  }

  if (LEGACY_VIEW_CASES_LABELS.has(merged.heroSecondary)) {
    merged.heroSecondary = DEFAULT_BUTTON_LABELS.heroSecondary;
  }
  if (LEGACY_VIEW_CASES_LABELS.has(merged.projectsCtaSecondary)) {
    merged.projectsCtaSecondary = DEFAULT_BUTTON_LABELS.projectsCtaSecondary;
  }

  return merged;
}

/** Сохраняет как есть — без trim, чтобы в админке нормально набирать текст с пробелами */
export function serializeButtonLabels(labels: Partial<ButtonLabels>): string {
  const out: Partial<ButtonLabels> = {};
  for (const key of BUTTON_LABEL_KEYS) {
    const v = labels[key];
    if (typeof v === "string") out[key] = v;
  }
  return JSON.stringify(out);
}

/** В БД пусто или «{}» — подставляем полный JSON для сохранения и отображения */
export function ensureStoredButtonLabelsJson(raw: string | null | undefined): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed || trimmed === "{}") {
    return serializeButtonLabels(DEFAULT_BUTTON_LABELS);
  }
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0) {
      return trimmed;
    }
  } catch {
    /* invalid JSON */
  }
  return serializeButtonLabels(DEFAULT_BUTTON_LABELS);
}

/** Обрезка пробелов только при записи в БД */
export function normalizeButtonLabelsForSave(labels: ButtonLabels): ButtonLabels {
  const out = { ...labels };
  for (const key of BUTTON_LABEL_KEYS) {
    out[key] = out[key].trim();
  }
  return out;
}

/** Для превью: плоский объект с ключами btn* в settings payload */
export function buttonLabelsToPreviewPayload(labels: ButtonLabels): Record<string, string> {
  const payload: Record<string, string> = { buttonLabels: serializeButtonLabels(labels) };
  return payload;
}
