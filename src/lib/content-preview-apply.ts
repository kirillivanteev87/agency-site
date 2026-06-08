import { collectHighlightIndexes } from "@/lib/brand-highlight";
import { filterFooterSocialLinks } from "@/lib/footer-social-links";
import { parseButtonLabels, type ButtonLabelKey } from "@/lib/button-labels";
import { parseLogoImageUrl, parseLogoMode } from "@/lib/logo-settings";
import { parseJsonArray } from "@/lib/parse-json";
import { applyLineBreaksToElement } from "@/lib/text-line-breaks";

export type SocialLinkPayload = { label: string; url: string };

export type ContentHighlightField =
  | "brandName"
  | "brandHighlightText"
  | "brandHighlightColor"
  | "heroTitle"
  | "heroHighlight"
  | "heroSubtitle"
  | "heroBenefit1"
  | "heroBenefit2"
  | "heroBenefit3"
  | "heroMeta"
  | "statValue"
  | "statText"
  | "footerCopyright"
  | "footerDescriptor"
  | "footerBehanceUrl"
  | "footerGithubUrl"
  | "phones"
  | "emails"
  | "addresses"
  | "socialLinks"
  | "contactEyebrow"
  | "contactTitle"
  | "contactSubtitle"
  | "contactBullet1"
  | "contactBullet2"
  | "contactBullet3"
  | "contactLabelPhone"
  | "contactLabelEmail"
  | "contactLabelAddress"
  | "contactWhatsappUrl"
  | "contactWhatsappLabel"
  | "contactWhatsappLinkText"
  | "contactTelegramUrl"
  | "contactTelegramLabel"
  | "contactTelegramLinkText"
  | "contactMaxUrl"
  | "contactMaxLabel"
  | "contactMaxLinkText"
  | "contactFormTitle"
  | "contactFormLead"
  | "contactNameLabel"
  | "contactNamePlaceholder"
  | "contactEmailLabel"
  | "contactEmailPlaceholder"
  | "contactPhoneLabel"
  | "contactPhonePlaceholder"
  | "contactMessageLabel"
  | "contactMessagePlaceholder"
  | "contactSuccessMessage"
  | "contactConsentText";

const HIGHLIGHT_SELECTORS: Record<ContentHighlightField, string> = {
  brandName: '[data-content-field="brandName"]',
  brandHighlightText: '[data-content-field="brandName"]',
  brandHighlightColor: '[data-content-field="brandName"]',
  heroTitle: '[data-content-field="heroTitle"]',
  heroHighlight: '[data-content-field="heroHighlight"]',
  heroSubtitle: '[data-content-field="heroSubtitle"]',
  heroBenefit1: '[data-content-field="heroBenefit1"]',
  heroBenefit2: '[data-content-field="heroBenefit2"]',
  heroBenefit3: '[data-content-field="heroBenefit3"]',
  heroMeta: '[data-content-field="heroMeta"]',
  statValue: '[data-content-field="statValue"]',
  statText: '[data-content-field="statText"]',
  footerCopyright: '[data-content-field="footerCopyright"]',
  footerDescriptor: '[data-content-field="footerDescriptor"]',
  footerBehanceUrl: '[data-footer-link="behance"]',
  footerGithubUrl: '[data-footer-link="github"]',
  phones: '[data-contact="phone"]',
  emails: '[data-contact="email"]',
  addresses: '[data-contact="address"]',
  socialLinks: "[data-social-links-root]",
  contactEyebrow: '[data-content-field="contactEyebrow"]',
  contactTitle: '[data-content-field="contactTitle"]',
  contactSubtitle: '[data-content-field="contactSubtitle"]',
  contactBullet1: '[data-content-field="contactBullet1"]',
  contactBullet2: '[data-content-field="contactBullet2"]',
  contactBullet3: '[data-content-field="contactBullet3"]',
  contactLabelPhone: '[data-content-field="contactLabelPhone"]',
  contactLabelEmail: '[data-content-field="contactLabelEmail"]',
  contactLabelAddress: '[data-content-field="contactLabelAddress"]',
  contactWhatsappUrl: '[data-contact="whatsapp"]',
  contactWhatsappLabel: '[data-content-field="contactWhatsappLabel"]',
  contactWhatsappLinkText: '[data-content-field="contactWhatsappLinkText"]',
  contactTelegramUrl: '[data-contact="telegram"]',
  contactTelegramLabel: '[data-content-field="contactTelegramLabel"]',
  contactTelegramLinkText: '[data-content-field="contactTelegramLinkText"]',
  contactMaxUrl: '[data-contact="max"]',
  contactMaxLabel: '[data-content-field="contactMaxLabel"]',
  contactMaxLinkText: '[data-content-field="contactMaxLinkText"]',
  contactFormTitle: '[data-content-field="contactFormTitle"]',
  contactFormLead: '[data-content-field="contactFormLead"]',
  contactNameLabel: '[data-content-field="contactNameLabel"]',
  contactNamePlaceholder: '[data-placeholder-field="contactNamePlaceholder"]',
  contactEmailLabel: '[data-content-field="contactEmailLabel"]',
  contactEmailPlaceholder: '[data-placeholder-field="contactEmailPlaceholder"]',
  contactPhoneLabel: '[data-content-field="contactPhoneLabel"]',
  contactPhonePlaceholder: '[data-placeholder-field="contactPhonePlaceholder"]',
  contactMessageLabel: '[data-content-field="contactMessageLabel"]',
  contactMessagePlaceholder: '[data-placeholder-field="contactMessagePlaceholder"]',
  contactSuccessMessage: '[data-content-field="contactSuccessMessage"]',
  contactConsentText: '[data-content-field="contactConsentText"]',
};

const BUTTON_LABEL_SELECTORS: Record<ButtonLabelKey, string> = {
  headerCta: '[data-button-field="headerCta"]',
  heroPrimary: '[data-button-field="heroPrimary"]',
  heroSecondary: '[data-button-field="heroSecondary"]',
  statsCta: '[data-button-field="statsCta"]',
  serviceCard: '[data-button-field="serviceCard"]',
  servicesCtaPrimary: '[data-button-field="servicesCtaPrimary"]',
  servicesCtaSecondary: '[data-button-field="servicesCtaSecondary"]',
  projectsCard: '[data-button-field="projectsCard"]',
  projectsCtaPrimary: '[data-button-field="projectsCtaPrimary"]',
  projectsCtaSecondary: '[data-button-field="projectsCtaSecondary"]',
  casesCard: '[data-button-field="casesCard"]',
  faqCta: '[data-button-field="faqCta"]',
  contactSubmit: '[data-button-field="contactSubmit"]',
  contactSubmitLoading: '[data-button-field="contactSubmitLoading"]',
  marketplaceSubscribe: '[data-button-field="marketplaceSubscribe"]',
  marketplaceCtaPrimary: '[data-button-field="marketplaceCtaPrimary"]',
  marketplaceCtaSecondary: '[data-button-field="marketplaceCtaSecondary"]',
  projectDetailPrimary: '[data-button-field="projectDetailPrimary"]',
  projectDetailSecondary: '[data-button-field="projectDetailSecondary"]',
  caseDetailPrimary: '[data-button-field="caseDetailPrimary"]',
  caseDetailSecondary: '[data-button-field="caseDetailSecondary"]',
  aiChatLead: '[data-button-field="aiChatLead"]',
  aiChatLeadLoading: '[data-button-field="aiChatLeadLoading"]',
};

/**
 * Применить значения текстов сайта из админ-превью (ключи как у /api/admin/settings).
 */
export function applyContentPreview(settings: Record<string, unknown>): void {
  applyLogoPreview(settings);

  applyMultilineField("heroTitle", settings.heroTitle);
  applyMultilineField("heroHighlight", settings.heroHighlight);
  applyPlainField("heroSubtitle", settings.heroSubtitle);
  applyPlainField("heroBenefit1", settings.heroBenefit1);
  applyPlainField("heroBenefit2", settings.heroBenefit2);
  applyPlainField("heroBenefit3", settings.heroBenefit3);
  applyPlainField("heroMeta", settings.heroMeta);

  applyPlainField("statValue", settings.statValue);
  applyPlainField("statText", settings.statText);

  applyPlainField("footerCopyright", settings.footerCopyright);
  applyPlainField("footerDescriptor", settings.footerDescriptor);

  applyFooterLink("behance", stringify(settings.footerBehanceUrl), "Behance");
  applyFooterLink("github", stringify(settings.footerGithubUrl), "GitHub");

  applyPlainField("contactEyebrow", settings.contactEyebrow);
  applyPlainField("contactTitle", settings.contactTitle);
  applyPlainField("contactSubtitle", settings.contactSubtitle);
  applyPlainField("contactBullet1", settings.contactBullet1);
  applyPlainField("contactBullet2", settings.contactBullet2);
  applyPlainField("contactBullet3", settings.contactBullet3);
  applyPlainField("contactLabelPhone", settings.contactLabelPhone);
  applyPlainField("contactLabelEmail", settings.contactLabelEmail);
  applyPlainField("contactLabelAddress", settings.contactLabelAddress);
  applyPlainField("contactWhatsappLabel", settings.contactWhatsappLabel);
  applyPlainField("contactTelegramLabel", settings.contactTelegramLabel);
  applyPlainField("contactMaxLabel", settings.contactMaxLabel);
  applyMessengerContact(
    "whatsapp",
    stringify(settings.contactWhatsappUrl),
    messengerLinkText(
      settings.contactWhatsappLinkText,
      settings.contactWhatsappLabel,
    ),
  );
  applyMessengerContact(
    "telegram",
    stringify(settings.contactTelegramUrl),
    messengerLinkText(
      settings.contactTelegramLinkText,
      settings.contactTelegramLabel,
    ),
  );
  applyMessengerContact(
    "max",
    stringify(settings.contactMaxUrl),
    messengerLinkText(settings.contactMaxLinkText, settings.contactMaxLabel),
  );
  applyPlainField("contactFormTitle", settings.contactFormTitle);
  applyPlainField("contactFormLead", settings.contactFormLead);
  applyPlainField("contactNameLabel", settings.contactNameLabel);
  applyPlaceholderField("contactNamePlaceholder", settings.contactNamePlaceholder);
  applyPlainField("contactEmailLabel", settings.contactEmailLabel);
  applyPlaceholderField("contactEmailPlaceholder", settings.contactEmailPlaceholder);
  applyPlainField("contactPhoneLabel", settings.contactPhoneLabel);
  applyPlaceholderField("contactPhonePlaceholder", settings.contactPhonePlaceholder);
  applyPlainField("contactMessageLabel", settings.contactMessageLabel);
  applyPlaceholderField("contactMessagePlaceholder", settings.contactMessagePlaceholder);
  applyPlainField("contactSuccessMessage", settings.contactSuccessMessage);
  applyPlainField("contactConsentText", settings.contactConsentText);

  const phones = parseJsonArray<string>(stringify(settings.phones) || "[]", []);
  applyContactAnchor("[data-contact=\"phone\"]", phones[0], (p) => `tel:${p.replace(/\s/g, "")}`);

  const emails = parseJsonArray<string>(stringify(settings.emails) || "[]", []);
  applyContactAnchor("[data-contact=\"email\"]", emails[0], (e) => `mailto:${e}`);

  const addresses = parseJsonArray<string>(stringify(settings.addresses) || "[]", []);
  applyTextNodes("[data-contact=\"address\"]", addresses[0] ?? "");

  if (settings.buttonLabels !== undefined) {
    applyButtonLabelsPreview(parseButtonLabels(stringify(settings.buttonLabels)));
  }

  const links = filterFooterSocialLinks(
    parseSocialLinksSafe(stringify(settings.socialLinks) || "[]"),
  );
  document.querySelectorAll<HTMLAnchorElement>("a[data-social-link-index]").forEach((anchor) => {
    const raw = anchor.getAttribute("data-social-link-index");
    const index = Number(raw);
    const link = links[index];
    if (!link) {
      anchor.style.opacity = "0.35";
      anchor.textContent = "—";
      anchor.href = "#";
      return;
    }
    anchor.style.opacity = "";
    anchor.textContent = link.label;
    anchor.href = link.url || "#";
  });
}

export function applyButtonLabelsPreview(labels: ReturnType<typeof parseButtonLabels>): void {
  for (const [key, text] of Object.entries(labels) as [ButtonLabelKey, string][]) {
    const selector = BUTTON_LABEL_SELECTORS[key];
    if (!selector) continue;
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = text;
    });
  }
}

export function flashButtonHighlight(key: ButtonLabelKey): void {
  document
    .querySelectorAll("[data-content-highlight-active]")
    .forEach((node) => node.removeAttribute("data-content-highlight-active"));

  const el = document.querySelector(BUTTON_LABEL_SELECTORS[key]);
  if (!el) return;

  el.setAttribute("data-content-highlight-active", "true");
  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  window.setTimeout(() => el.removeAttribute("data-content-highlight-active"), 2600);
}

export function flashContentHighlight(field: ContentHighlightField): void {
  document
    .querySelectorAll("[data-content-highlight-active]")
    .forEach((node) => node.removeAttribute("data-content-highlight-active"));

  const selector = HIGHLIGHT_SELECTORS[field];
  const el = document.querySelector(selector);
  if (!el) return;

  el.setAttribute("data-content-highlight-active", "true");
  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  window.setTimeout(() => {
    el.removeAttribute("data-content-highlight-active");
  }, 2600);
}

function stringify(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v);
}

function applyLogoPreview(settings: Record<string, unknown>): void {
  const root = document.querySelector("[data-brand-logo]");
  if (!root) return;

  const mode = parseLogoMode(stringify(settings.logoMode));
  const name = stringify(settings.brandName);
  const highlightText = stringify(settings.brandHighlightText);
  const highlightColor = stringify(settings.brandHighlightColor);
  const imageUrl = parseLogoImageUrl(stringify(settings.logoImageUrl));

  if (mode === "image") {
    const img = root.querySelector("img.brand-logo-image");
    if (img instanceof HTMLImageElement) {
      img.src = imageUrl;
      img.alt = name || "Logo";
      return;
    }

    root.replaceChildren();
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = name || "Logo";
    image.className = "brand-logo-image h-8 w-auto max-w-[180px] object-contain object-left";
    root.append(image);
    return;
  }

  if (root.querySelector("img.brand-logo-image")) {
    root.replaceChildren();
  }

  if (!(root instanceof HTMLElement)) return;
  root.setAttribute("data-content-field", "brandName");
  renderBrand(root, name, highlightText, highlightColor);
}

function renderBrand(el: Element | null, name: string, highlightText: string, highlightColor: string) {
  if (!el) return;
  el.replaceChildren();
  const rule = highlightText.trim();
  const color = sanitizeHexColor(highlightColor);

  if (!rule) {
    const fallbackAccent = document.createElement("span");
    fallbackAccent.className = "text-accent";
    fallbackAccent.textContent = name.slice(0, 3);
    el.append(fallbackAccent, name.slice(3));
    return;
  }

  const highlightIndexes = collectHighlightIndexes(name, rule);
  if (highlightIndexes.size === 0) {
    el.textContent = name;
    return;
  }

  const chars = Array.from(name);
  let i = 0;
  while (i < chars.length) {
    const active = highlightIndexes.has(i);
    const start = i;
    i += 1;
    while (i < chars.length && highlightIndexes.has(i) === active) {
      i += 1;
    }
    const part = chars.slice(start, i).join("");
    if (!part) continue;
    if (active) {
      const accent = document.createElement("span");
      if (color) accent.style.color = color;
      else accent.className = "text-accent";
      accent.textContent = part;
      el.append(accent);
      continue;
    }
    el.append(document.createTextNode(part));
  }
}

function sanitizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : null;
}

/** Только ключи типа heroTitle из админ формы — без пользовательских строк в имени атрибута */
function applyPlainField(field: string, value: unknown) {
  const text = stringify(value);
  document.querySelectorAll(`[data-content-field="${field}"]`).forEach((el) => {
    el.textContent = text;
  });
}

function applyPlaceholderField(field: string, value: unknown) {
  const text = stringify(value);
  document.querySelectorAll(`[data-placeholder-field="${field}"]`).forEach((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.placeholder = text;
    }
  });
}

function applyMultilineField(field: string, value: unknown) {
  const text = stringify(value);
  document.querySelectorAll(`[data-content-field="${field}"]`).forEach((el) => {
    if (el instanceof HTMLElement) applyLineBreaksToElement(el, text);
  });
}

function applyTextNodes(selector: string, text: string) {
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = text;
  });
}

function applyFooterLink(
  key: string,
  value: string | undefined,
  label: string,
  hrefFn: (v: string) => string = (v) => v,
) {
  const trimmed = value?.trim();
  document.querySelectorAll<HTMLAnchorElement>(`[data-footer-link="${key}"]`).forEach((anchor) => {
    if (!trimmed) {
      anchor.style.opacity = "0.35";
      anchor.textContent = label;
      anchor.href = "#";
      return;
    }
    anchor.style.opacity = "";
    anchor.textContent = label;
    anchor.href = hrefFn(trimmed);
  });
}

function applyContactAnchor(
  selector: string,
  value: string | undefined,
  hrefFn: (v: string) => string,
) {
  document.querySelectorAll<HTMLAnchorElement>(selector).forEach((anchor) => {
    if (!value) {
      anchor.style.opacity = "0.35";
      anchor.textContent = "—";
      anchor.href = "#";
      return;
    }
    anchor.style.opacity = "";
    anchor.textContent = value;
    anchor.href = hrefFn(value);
  });
}

function messengerLinkText(
  linkText: unknown,
  label: unknown,
): string | undefined {
  const text = stringify(linkText).trim();
  if (text) return text;
  const fallback = stringify(label).trim();
  return fallback || undefined;
}

function applyMessengerContact(
  contactKey: string,
  url: string | undefined,
  linkText: string | undefined,
) {
  const href = typeof url === "string" ? url.trim() : "";
  const text = typeof linkText === "string" ? linkText.trim() : "";
  document.querySelectorAll<HTMLAnchorElement>(`[data-contact="${contactKey}"]`).forEach((anchor) => {
    if (!href) {
      anchor.style.opacity = "0.35";
      anchor.textContent = "—";
      anchor.href = "#";
      return;
    }
    anchor.style.opacity = "";
    anchor.href = href;
    anchor.textContent = text || href;
  });
}

function parseSocialLinksSafe(raw: string): SocialLinkPayload[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (!item || typeof item !== "object") return { label: "", url: "#" };
      const o = item as Record<string, unknown>;
      return {
        label: String(o.label ?? ""),
        url: String(o.url ?? "#"),
      };
    });
  } catch {
    return [];
  }
}

