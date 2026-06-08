/** Поля брифа с публичной формы /brief */
export type BriefFormPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  productTypes: string[];
  goals: string;
  successMetric: string;
  scope: string;
  featuresMustHave: string;
  featuresOutOfScope: string;
  targetAudience: string;
  competitors: string;
  references: string;
  integrations: string;
  adminNeeded: string;
  contentSource: string;
  designNotes: string;
  brandAssets: string;
  deadline: string;
  budget: string;
  additional: string;
};

export const BRIEF_PRODUCT_TYPE_OPTIONS = [
  { value: "site", label: "Сайт" },
  { value: "webapp", label: "Веб-приложение" },
  { value: "mobile", label: "Мобильное приложение" },
  { value: "redesign", label: "Редизайн / доработка" },
  { value: "other", label: "Другое" },
] as const;

export const BRIEF_SCOPE_OPTIONS = [
  { value: "landing", label: "Лендинг" },
  { value: "corporate", label: "Корпоративный сайт" },
  { value: "catalog", label: "Каталог / интернет-магазин" },
  { value: "portal", label: "Портал / личный кабинет" },
  { value: "mvp", label: "MVP продукта" },
  { value: "unsure", label: "Пока не определились" },
] as const;

function line(label: string, value: string | undefined) {
  const v = value?.trim();
  if (!v) return null;
  return `${label}: ${v}`;
}

function block(title: string, lines: (string | null)[]) {
  const body = lines.filter(Boolean) as string[];
  if (body.length === 0) return null;
  return [`— ${title} —`, ...body, ""].join("\n");
}

export function formatBriefMessage(data: BriefFormPayload): string {
  const types =
    data.productTypes.length > 0
      ? data.productTypes
          .map((v) => BRIEF_PRODUCT_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v)
          .join(", ")
      : "—";

  const parts = [
    "=== БРИФ НА РАЗРАБОТКУ САЙТА / ПРИЛОЖЕНИЯ ===",
    "",
    block("КОНТАКТЫ", [
      line("Имя", data.name),
      line("Email", data.email),
      line("Телефон", data.phone),
      line("Компания", data.company),
      line("Должность", data.role),
    ]),
    block("ЦЕЛИ", [
      line("Тип продукта", types),
      line("Цели", data.goals),
      line("Метрика успеха", data.successMetric),
    ]),
    block("ОБЪЁМ", [
      line(
        "Формат",
        BRIEF_SCOPE_OPTIONS.find((o) => o.value === data.scope)?.label ?? data.scope,
      ),
      line("Обязательно в v1", data.featuresMustHave),
      line("Не входит в v1", data.featuresOutOfScope),
    ]),
    block("АУДИТОРИЯ И РЕФЕРЕНСЫ", [
      line("Целевая аудитория", data.targetAudience),
      line("Конкуренты", data.competitors),
      line("Референсы", data.references),
    ]),
    block("ФУНКЦИИ", [
      line("Интеграции", data.integrations),
      line("Админка / CMS", data.adminNeeded),
    ]),
    block("КОНТЕНТ И ДИЗАЙН", [
      line("Контент", data.contentSource),
      line("Пожелания по дизайну", data.designNotes),
      line("Бренд / материалы", data.brandAssets),
    ]),
    block("СРОКИ И БЮДЖЕТ", [line("Сроки", data.deadline), line("Бюджет", data.budget)]),
    block("ДОПОЛНИТЕЛЬНО", [data.additional.trim() ? data.additional.trim() : null]),
  ].filter(Boolean);

  return parts.join("\n");
}
