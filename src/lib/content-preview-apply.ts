import { collectHighlightIndexes } from "@/lib/brand-highlight";
import { parseButtonLabels, type ButtonLabelKey } from "@/lib/button-labels";
import { parseJsonArray } from "@/lib/parse-json";

export type SocialLinkPayload = { label: string; url: string };

export type ContentHighlightField =
  | "brandName"
  | "brandHighlightText"
  | "brandHighlightColor"
  | "heroTitle"
  | "heroHighlight"
  | "heroSubtitle"
  | "heroMeta"
  | "statValue"
  | "statText"
  | "footerCopyright"
  | "phones"
  | "emails"
  | "addresses"
  | "socialLinks";

const HIGHLIGHT_SELECTORS: Record<ContentHighlightField, string> = {
  brandName: '[data-content-field="brandName"]',
  brandHighlightText: '[data-content-field="brandName"]',
  brandHighlightColor: '[data-content-field="brandName"]',
  heroTitle: '[data-content-field="heroTitle"]',
  heroHighlight: '[data-content-field="heroHighlight"]',
  heroSubtitle: '[data-content-field="heroSubtitle"]',
  heroMeta: '[data-content-field="heroMeta"]',
  statValue: '[data-content-field="statValue"]',
  statText: '[data-content-field="statText"]',
  footerCopyright: '[data-content-field="footerCopyright"]',
  phones: '[data-contact="phone"]',
  emails: '[data-contact="email"]',
  addresses: '[data-contact="address"]',
  socialLinks: "[data-social-links-root]",
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
  renderBrand(
    document.querySelector("[data-content-field=\"brandName\"]"),
    stringify(settings.brandName),
    stringify(settings.brandHighlightText),
    stringify(settings.brandHighlightColor),
  );

  applyPlainField("heroTitle", settings.heroTitle);
  applyPlainField("heroHighlight", settings.heroHighlight);
  applyPlainField("heroSubtitle", settings.heroSubtitle);
  applyPlainField("heroMeta", settings.heroMeta);

  applyPlainField("statValue", settings.statValue);
  applyPlainField("statText", settings.statText);

  applyPlainField("footerCopyright", settings.footerCopyright);

  const phones = parseJsonArray<string>(stringify(settings.phones) || "[]", []);
  applyContactAnchor("[data-contact=\"phone\"]", phones[0], (p) => `tel:${p.replace(/\s/g, "")}`);

  const emails = parseJsonArray<string>(stringify(settings.emails) || "[]", []);
  applyContactAnchor("[data-contact=\"email\"]", emails[0], (e) => `mailto:${e}`);

  const addresses = parseJsonArray<string>(stringify(settings.addresses) || "[]", []);
  applyTextNodes("[data-contact=\"address\"]", addresses[0] ?? "");

  if (settings.buttonLabels !== undefined) {
    applyButtonLabelsPreview(parseButtonLabels(stringify(settings.buttonLabels)));
  }

  const links = parseSocialLinksSafe(stringify(settings.socialLinks) || "[]");
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

function applyTextNodes(selector: string, text: string) {
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = text;
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

