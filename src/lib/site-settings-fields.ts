/** Поля SiteSettings, которые можно менять через админку */
export const SITE_SETTINGS_FIELDS = [
  "brandName",
  "brandHighlightText",
  "brandHighlightColor",
  "heroTitle",
  "heroHighlight",
  "heroSubtitle",
  "heroMeta",
  "heroVideoUrl",
  "heroVideoUrlLight",
  "statValue",
  "statText",
  "footerCopyright",
  "phones",
  "emails",
  "addresses",
  "socialLinks",
  "sectionSpacing",
  "buttonLabels",
] as const;

export type SiteSettingsField = (typeof SITE_SETTINGS_FIELDS)[number];

export function pickSiteSettingsPayload(
  body: Record<string, unknown>,
): Partial<Record<SiteSettingsField, string>> {
  const data: Partial<Record<SiteSettingsField, string>> = {};
  for (const key of SITE_SETTINGS_FIELDS) {
    if (body[key] === undefined || body[key] === null) continue;
    const value = String(body[key]);
    // Не затираем кнопки пустой строкой при сохранении вкладки «Сайт»
    if (key === "buttonLabels") {
      const trimmed = value.trim();
      if (!trimmed || trimmed === "{}") continue;
    }
    data[key] = value;
  }
  return data;
}
