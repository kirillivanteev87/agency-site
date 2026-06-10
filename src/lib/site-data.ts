import { prisma } from "./prisma";
import { buildCaseStudyLandingView } from "./case-study-landing";
import { buildProjectLandingView } from "./project-landing";
import { parseJsonArray } from "./parse-json";
import { DEFAULT_BUTTON_LABELS, parseButtonLabels, type ButtonLabels } from "./button-labels";
import { parseLogoImageUrl, parseLogoMode } from "./logo-settings";
import { DEFAULT_SPACING, parseSpacingConfig, type SpacingConfig } from "./section-spacing";
import { mapPricingPlan } from "./pricing";
import { DEFAULT_CONTACT_SECTION } from "./contact-defaults";
import { DEFAULT_FOOTER } from "./footer-defaults";
import { DEFAULT_PRICING_SECTION } from "./pricing-defaults";
import { filterFooterSocialLinks } from "./footer-social-links";
import {
  DEFAULT_HERO_VIDEO_DARK,
  DEFAULT_HERO_VIDEO_LIGHT,
  resolveHeroVideoPosterUrl,
  resolveHeroVideoUrl,
} from "./hero-video-urls";
import type { PricingPlan, SiteSettings } from "@prisma/client";

/** Used when DB is migrated but not seeded yet (e.g. first Vercel build). */
const FALLBACK_SITE_SETTINGS: SiteSettings = {
  id: 1,
  brandName: "STUDIO",
  brandHighlightText: "",
  brandHighlightColor: "",
  logoMode: "image",
  logoImageUrl: "/images/qnox-logo.png",
  heroTitle: "Создаём цифровые продукты",
  heroHighlight: "которые работают",
  heroSubtitle: "Веб-студия полного цикла: дизайн, разработка, продвижение",
  heroMeta: "Ответим в течение 2 часов · Без обязательств · NDA по запросу",
  heroBenefit1: "Рост заявок и продаж",
  heroBenefit2: "Сроки и бюджет в договоре",
  heroBenefit3: "Поддержка после запуска",
  heroVideoUrl: "",
  heroVideoUrlLight: "",
  statValue: "70+",
  statText: "успешных проектов за 5 лет работы",
  footerCopyright: "© 2026 Studio. Все права защищены.",
  footerDescriptor: "Студия цифровых продуктов: SaaS, AI и веб-платформы.",
  footerBehanceUrl: "",
  footerGithubUrl: "",
  phones: '["+7 (999) 123-45-67"]',
  emails: '["hello@studio.ru"]',
  addresses: '["Москва, ул. Примерная, 1"]',
  socialLinks: "[]",
  sectionSpacing: "{}",
  buttonLabels: "{}",
  pricingEyebrow: "Тарифы",
  pricingTitle: "Прозрачные пакеты под вашу задачу",
  pricingSubtitle:
    "Фиксированная стоимость старта — без скрытых строк. Точную смету уточним после брифа и созвона.",
  pricingNote:
    "Цены указаны за типовой объём. Нестандартный функционал, контент и интеграции считаем отдельно — смета за 20 минут после брифа.",
  contactEyebrow: "Следующий шаг",
  contactTitle: "Получите расчёт проекта за 24 часа",
  contactSubtitle:
    "Опишите задачу — предложим формат, сроки и ориентир по бюджету. Перезвоним в течение 2 часов в рабочее время.",
  contactBullet1: "Бесплатная консультация",
  contactBullet2: "NDA по запросу",
  contactBullet3: "Без навязчивых продаж",
  contactLabelPhone: "Телефон",
  contactLabelEmail: "Email",
  contactLabelAddress: "Адрес",
  contactWhatsappUrl: "https://wa.me",
  contactWhatsappLabel: "WhatsApp",
  contactWhatsappLinkText: "WhatsApp",
  contactTelegramUrl: "https://t.me",
  contactTelegramLabel: "Telegram",
  contactTelegramLinkText: "Telegram",
  contactMaxUrl: "https://max.ru",
  contactMaxLabel: "MAX",
  contactMaxLinkText: "MAX",
  contactFormTitle: "Заявка",
  contactFormLead:
    "Заполните форму — менеджер свяжется с вами и предложит решение под вашу задачу.",
  contactNameLabel: "Имя",
  contactNamePlaceholder: "Как к вам обращаться",
  contactEmailLabel: "Email",
  contactEmailPlaceholder: "name@company.ru",
  contactPhoneLabel: "Телефон",
  contactPhonePlaceholder: "+7 (999) 123-45-67",
  contactMessageLabel: "Что нужно сделать?",
  contactMessagePlaceholder: "Кратко опишите проект, сроки и бюджет (если есть)",
  contactSuccessMessage:
    "Заявка принята! Мы свяжемся с вами в ближайшие 2 часа в рабочее время.",
  contactConsentText: "Нажимая кнопку, вы соглашаетесь на обработку персональных данных.",
};

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function safeQuery<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasDatabaseUrl()) return fallback;
  try {
    return await query();
  } catch (e) {
    console.error(`[getSiteContent] ${label} failed:`, e);
    return fallback;
  }
}

async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const delegate = (
    prisma as unknown as { pricingPlan?: { findMany: (args: object) => Promise<PricingPlan[]> } }
  ).pricingPlan;
  if (!delegate?.findMany) {
    console.warn(
      "[getSiteContent] Prisma Client без модели pricingPlan — выполните npx prisma generate и перезапустите dev-сервер",
    );
    return [];
  }
  return safeQuery("pricingPlan.findMany", () => delegate.findMany({ orderBy: { sortOrder: "asc" } }), []);
}

export type { ButtonLabels };
export { DEFAULT_BUTTON_LABELS, parseButtonLabels };

export type SocialLink = { label: string; url: string };

export async function getProjectById(id: number) {
  if (!Number.isFinite(id) || id < 1) return null;
  return prisma.project.findUnique({ where: { id } });
}

export async function getProjectLanding(id: number) {
  const project = await getProjectById(id);
  if (!project) return null;
  return buildProjectLandingView(project);
}

export async function getCaseStudyById(id: number) {
  if (!Number.isFinite(id) || id < 1) return null;
  return prisma.caseStudy.findUnique({ where: { id } });
}

export async function getCaseStudyWithMetrics(id: number) {
  const study = await getCaseStudyById(id);
  if (!study) return null;
  const ordered = await prisma.caseStudy.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  const idx = ordered.findIndex((c) => c.id === id);
  return buildCaseStudyLandingView(study, idx >= 0 ? idx : 0);
}

export async function getCaseStudyLanding(id: number) {
  return getCaseStudyWithMetrics(id);
}

export async function getSiteContent() {
  const [settings, heroFeatures, projects, caseStudies, services, pricingPlans, faqs] =
    await Promise.all([
      safeQuery("siteSettings.findUnique", () => prisma.siteSettings.findUnique({ where: { id: 1 } }), null),
      safeQuery("heroFeature.findMany", () => prisma.heroFeature.findMany({ orderBy: { sortOrder: "asc" } }), []),
      safeQuery("project.findMany", () => prisma.project.findMany({ orderBy: { sortOrder: "asc" } }), []),
      safeQuery("caseStudy.findMany", () => prisma.caseStudy.findMany({ orderBy: { sortOrder: "asc" } }), []),
      safeQuery("service.findMany", () => prisma.service.findMany({ orderBy: { sortOrder: "asc" } }), []),
      fetchPricingPlans(),
      safeQuery("faq.findMany", () => prisma.faq.findMany({ orderBy: { sortOrder: "asc" } }), []),
    ]);

  const s = settings ?? FALLBACK_SITE_SETTINGS;
  const sectionSpacing: SpacingConfig = parseSpacingConfig(s.sectionSpacing);
  const heroVideoUrl = resolveHeroVideoUrl(s.heroVideoUrl, DEFAULT_HERO_VIDEO_DARK);
  const heroVideoUrlLightResolved = resolveHeroVideoUrl(s.heroVideoUrlLight, DEFAULT_HERO_VIDEO_LIGHT);
  const heroVideoUrlLight =
    heroVideoUrlLightResolved === heroVideoUrl ? DEFAULT_HERO_VIDEO_LIGHT : heroVideoUrlLightResolved;

  return {
    settings: {
      brandName: s.brandName,
      brandHighlightText: s.brandHighlightText ?? "",
      brandHighlightColor: s.brandHighlightColor ?? "",
      logoMode: parseLogoMode(s.logoMode),
      logoImageUrl: parseLogoImageUrl(s.logoImageUrl),
      heroTitle: s.heroTitle,
      heroHighlight: s.heroHighlight,
      heroSubtitle: s.heroSubtitle,
      heroMeta: s.heroMeta ?? "",
      heroBenefit1: s.heroBenefit1 ?? "Рост заявок и продаж",
      heroBenefit2: s.heroBenefit2 ?? "Сроки и бюджет в договоре",
      heroBenefit3: s.heroBenefit3 ?? "Поддержка после запуска",
      heroVideoUrl,
      heroVideoUrlLight,
      heroVideoPosterUrl: resolveHeroVideoPosterUrl(heroVideoUrl),
      heroVideoPosterUrlLight: resolveHeroVideoPosterUrl(heroVideoUrlLight),
      statValue: s.statValue,
      statText: s.statText,
      footerCopyright: s.footerCopyright,
      footerDescriptor: s.footerDescriptor?.trim() || DEFAULT_FOOTER.footerDescriptor,
      footerBehanceUrl: s.footerBehanceUrl?.trim() || DEFAULT_FOOTER.footerBehanceUrl,
      footerGithubUrl: s.footerGithubUrl?.trim() || DEFAULT_FOOTER.footerGithubUrl,
      phones: parseJsonArray<string>(s.phones, []),
      emails: parseJsonArray<string>(s.emails, []),
      addresses: parseJsonArray<string>(s.addresses, []),
      socialLinks: filterFooterSocialLinks(parseJsonArray<SocialLink>(s.socialLinks, [])),
      buttonLabels: parseButtonLabels(s.buttonLabels),
      pricingEyebrow: s.pricingEyebrow?.trim() || DEFAULT_PRICING_SECTION.pricingEyebrow,
      pricingTitle: s.pricingTitle?.trim() || DEFAULT_PRICING_SECTION.pricingTitle,
      pricingSubtitle: s.pricingSubtitle?.trim() || DEFAULT_PRICING_SECTION.pricingSubtitle,
      pricingNote: s.pricingNote?.trim() || DEFAULT_PRICING_SECTION.pricingNote,
      contactEyebrow: s.contactEyebrow?.trim() || DEFAULT_CONTACT_SECTION.contactEyebrow,
      contactTitle: s.contactTitle?.trim() || DEFAULT_CONTACT_SECTION.contactTitle,
      contactSubtitle: s.contactSubtitle?.trim() || DEFAULT_CONTACT_SECTION.contactSubtitle,
      contactBullet1: s.contactBullet1?.trim() || DEFAULT_CONTACT_SECTION.contactBullet1,
      contactBullet2: s.contactBullet2?.trim() || DEFAULT_CONTACT_SECTION.contactBullet2,
      contactBullet3: s.contactBullet3?.trim() || DEFAULT_CONTACT_SECTION.contactBullet3,
      contactLabelPhone: s.contactLabelPhone?.trim() || DEFAULT_CONTACT_SECTION.contactLabelPhone,
      contactLabelEmail: s.contactLabelEmail?.trim() || DEFAULT_CONTACT_SECTION.contactLabelEmail,
      contactLabelAddress: s.contactLabelAddress?.trim() || DEFAULT_CONTACT_SECTION.contactLabelAddress,
      contactWhatsappUrl: s.contactWhatsappUrl?.trim() || DEFAULT_CONTACT_SECTION.contactWhatsappUrl,
      contactWhatsappLabel: s.contactWhatsappLabel?.trim() || DEFAULT_CONTACT_SECTION.contactWhatsappLabel,
      contactWhatsappLinkText:
        s.contactWhatsappLinkText?.trim() ||
        s.contactWhatsappLabel?.trim() ||
        DEFAULT_CONTACT_SECTION.contactWhatsappLinkText,
      contactTelegramUrl: s.contactTelegramUrl?.trim() || DEFAULT_CONTACT_SECTION.contactTelegramUrl,
      contactTelegramLabel: s.contactTelegramLabel?.trim() || DEFAULT_CONTACT_SECTION.contactTelegramLabel,
      contactTelegramLinkText:
        s.contactTelegramLinkText?.trim() ||
        s.contactTelegramLabel?.trim() ||
        DEFAULT_CONTACT_SECTION.contactTelegramLinkText,
      contactMaxUrl: s.contactMaxUrl?.trim() || DEFAULT_CONTACT_SECTION.contactMaxUrl,
      contactMaxLabel: s.contactMaxLabel?.trim() || DEFAULT_CONTACT_SECTION.contactMaxLabel,
      contactMaxLinkText:
        s.contactMaxLinkText?.trim() ||
        s.contactMaxLabel?.trim() ||
        DEFAULT_CONTACT_SECTION.contactMaxLinkText,
      contactFormTitle: s.contactFormTitle?.trim() || DEFAULT_CONTACT_SECTION.contactFormTitle,
      contactFormLead: s.contactFormLead?.trim() || DEFAULT_CONTACT_SECTION.contactFormLead,
      contactNameLabel: s.contactNameLabel?.trim() || DEFAULT_CONTACT_SECTION.contactNameLabel,
      contactNamePlaceholder:
        s.contactNamePlaceholder?.trim() || DEFAULT_CONTACT_SECTION.contactNamePlaceholder,
      contactEmailLabel: s.contactEmailLabel?.trim() || DEFAULT_CONTACT_SECTION.contactEmailLabel,
      contactEmailPlaceholder:
        s.contactEmailPlaceholder?.trim() || DEFAULT_CONTACT_SECTION.contactEmailPlaceholder,
      contactPhoneLabel: s.contactPhoneLabel?.trim() || DEFAULT_CONTACT_SECTION.contactPhoneLabel,
      contactPhonePlaceholder:
        s.contactPhonePlaceholder?.trim() || DEFAULT_CONTACT_SECTION.contactPhonePlaceholder,
      contactMessageLabel:
        s.contactMessageLabel?.trim() || DEFAULT_CONTACT_SECTION.contactMessageLabel,
      contactMessagePlaceholder:
        s.contactMessagePlaceholder?.trim() || DEFAULT_CONTACT_SECTION.contactMessagePlaceholder,
      contactSuccessMessage:
        s.contactSuccessMessage?.trim() || DEFAULT_CONTACT_SECTION.contactSuccessMessage,
      contactConsentText: s.contactConsentText?.trim() || DEFAULT_CONTACT_SECTION.contactConsentText,
    },
    sectionSpacing,
    heroFeatures,
    projects,
    caseStudies,
    services,
    pricingPlans: pricingPlans.map(mapPricingPlan),
    faqs,
  };
}

export { DEFAULT_SPACING };
