import { Prisma } from "@prisma/client";
import { SITE_SETTINGS_FIELDS } from "@/lib/site-settings-fields";

/** Поля SiteSettings из админки — если их нет в DMMF, Client сгенерирован по старой schema. */
export const REQUIRED_SITE_SETTINGS_DMMF_FIELDS = SITE_SETTINGS_FIELDS;

const REQUIRED_DELEGATES = ["pricingPlan", "siteSettings"] as const;

export function dmmfSiteSettingsFieldNames(): Set<string> {
  const model = Prisma.dmmf.datamodel.models.find((m) => m.name === "SiteSettings");
  return new Set(model?.fields.map((f) => f.name) ?? []);
}

export function missingSiteSettingsDmmfFields(): string[] {
  const fields = dmmfSiteSettingsFieldNames();
  return REQUIRED_SITE_SETTINGS_DMMF_FIELDS.filter((name) => !fields.has(name));
}

export function prismaDmmfIsCurrent(): boolean {
  return missingSiteSettingsDmmfFields().length === 0;
}

export function prismaDelegatesAvailable(client: object): boolean {
  return REQUIRED_DELEGATES.every(
    (key) => key in client && (client as Record<string, unknown>)[key],
  );
}

export function prismaRuntimeLooksStale(client: object): boolean {
  return !prismaDelegatesAvailable(client) || !prismaDmmfIsCurrent();
}

export const STALE_PRISMA_DEV_HINT =
  "Остановите dev-сервер (Ctrl+C), выполните npm run db:ensure и снова npm run dev (или npm run dev:fix).";

/** Извлекает имя поля из Prisma «Unknown argument …». */
export function parseUnknownPrismaArgument(raw: string): string | null {
  const match =
    raw.match(/Unknown argument [`'`](\w+)[`'`]/) ??
    raw.match(/Unknown arg [`'`](\w+)[`'']/);
  return match?.[1] ?? null;
}

export function formatStalePrismaError(raw: string): string | null {
  if (!raw.includes("Unknown argument") && !raw.includes("Unknown arg")) return null;

  const unknownField = parseUnknownPrismaArgument(raw);
  const missingInDmmf = missingSiteSettingsDmmfFields();

  if (unknownField) {
    const inSchemaHint = missingInDmmf.includes(unknownField)
      ? ` (поле есть в schema, но отсутствует в загруженном Prisma Client)`
      : "";
    return `Сервер использует устаревший Prisma Client: поле «${unknownField}» не поддерживается${inSchemaHint}. ${STALE_PRISMA_DEV_HINT}`;
  }

  if (missingInDmmf.length > 0) {
    const sample = missingInDmmf.slice(0, 5).join(", ");
    const more = missingInDmmf.length > 5 ? ` и ещё ${missingInDmmf.length - 5}` : "";
    return `Устарел Prisma Client: в Client нет полей ${sample}${more}. ${STALE_PRISMA_DEV_HINT}`;
  }

  return `Устарел Prisma Client относительно схемы. ${STALE_PRISMA_DEV_HINT}`;
}
