/** Поля SiteSettings, которые можно менять через админку */
export const SITE_SETTINGS_FIELDS = [
  "brandName",
  "brandHighlightText",
  "brandHighlightColor",
  "logoMode",
  "logoImageUrl",
  "heroTitle",
  "heroHighlight",
  "heroSubtitle",
  "heroMeta",
  "heroBenefit1",
  "heroBenefit2",
  "heroBenefit3",
  "heroVideoUrl",
  "heroVideoUrlLight",
  "statValue",
  "statText",
  "footerCopyright",
  "footerDescriptor",
  "footerBehanceUrl",
  "footerGithubUrl",
  "phones",
  "emails",
  "addresses",
  "socialLinks",
  "sectionSpacing",
  "buttonLabels",
  "pricingEyebrow",
  "pricingTitle",
  "pricingSubtitle",
  "pricingNote",
  "contactEyebrow",
  "contactTitle",
  "contactSubtitle",
  "contactBullet1",
  "contactBullet2",
  "contactBullet3",
  "contactLabelPhone",
  "contactLabelEmail",
  "contactLabelAddress",
  "contactWhatsappUrl",
  "contactWhatsappLabel",
  "contactWhatsappLinkText",
  "contactTelegramUrl",
  "contactTelegramLabel",
  "contactTelegramLinkText",
  "contactMaxUrl",
  "contactMaxLabel",
  "contactMaxLinkText",
  "contactFormTitle",
  "contactFormLead",
  "contactNameLabel",
  "contactNamePlaceholder",
  "contactEmailLabel",
  "contactEmailPlaceholder",
  "contactPhoneLabel",
  "contactPhonePlaceholder",
  "contactMessageLabel",
  "contactMessagePlaceholder",
  "contactSuccessMessage",
  "contactConsentText",
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
