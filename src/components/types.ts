import type { CaseStudy, Faq, HeroFeature, Project, Service } from "@prisma/client";
import type { PricingPlanView } from "@/lib/pricing";
import type { ButtonLabels, SocialLink } from "@/lib/site-data";
import type { LogoMode } from "@/lib/logo-settings";

export type SiteSettingsView = {
  brandName: string;
  brandHighlightText: string;
  brandHighlightColor: string;
  logoMode: LogoMode;
  logoImageUrl: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  /** Строка под кнопками на Hero */
  heroMeta: string;
  /** Пункты с галочками под подзаголовком Hero */
  heroBenefit1: string;
  heroBenefit2: string;
  heroBenefit3: string;
  /** Фоновое видео за первым экраном hero; пусто — только фон страницы */
  heroVideoUrl: string;
  heroVideoUrlLight: string;
  /** WebP poster derived from hero video URLs (server-resolved) */
  heroVideoPosterUrl: string;
  heroVideoPosterUrlLight: string;
  statValue: string;
  statText: string;
  footerCopyright: string;
  footerDescriptor: string;
  footerBehanceUrl: string;
  footerGithubUrl: string;
  phones: string[];
  emails: string[];
  addresses: string[];
  socialLinks: SocialLink[];
  buttonLabels: ButtonLabels;
  pricingEyebrow: string;
  pricingTitle: string;
  pricingSubtitle: string;
  pricingNote: string;
  contactEyebrow: string;
  contactTitle: string;
  contactSubtitle: string;
  contactBullet1: string;
  contactBullet2: string;
  contactBullet3: string;
  contactLabelPhone: string;
  contactLabelEmail: string;
  contactLabelAddress: string;
  contactWhatsappUrl: string;
  contactWhatsappLabel: string;
  contactWhatsappLinkText: string;
  contactTelegramUrl: string;
  contactTelegramLabel: string;
  contactTelegramLinkText: string;
  contactMaxUrl: string;
  contactMaxLabel: string;
  contactMaxLinkText: string;
  contactFormTitle: string;
  contactFormLead: string;
  contactNameLabel: string;
  contactNamePlaceholder: string;
  contactEmailLabel: string;
  contactEmailPlaceholder: string;
  contactPhoneLabel: string;
  contactPhonePlaceholder: string;
  contactMessageLabel: string;
  contactMessagePlaceholder: string;
  contactSuccessMessage: string;
  contactConsentText: string;
};

export type SiteContent = {
  settings: SiteSettingsView;
  heroFeatures: HeroFeature[];
  projects: Project[];
  caseStudies: CaseStudy[];
  services: Service[];
  pricingPlans: PricingPlanView[];
  faqs: Faq[];
};
