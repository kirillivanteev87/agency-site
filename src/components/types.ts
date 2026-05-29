import type { CaseStudy, Faq, HeroFeature, Project, Service } from "@prisma/client";
import type { ButtonLabels, SocialLink } from "@/lib/site-data";

export type SiteSettingsView = {
  brandName: string;
  brandHighlightText: string;
  brandHighlightColor: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  /** Строка под кнопками на Hero */
  heroMeta: string;
  /** Фоновое видео за первым экраном hero; пусто — только фон страницы */
  heroVideoUrl: string;
  heroVideoUrlLight: string;
  statValue: string;
  statText: string;
  footerCopyright: string;
  phones: string[];
  emails: string[];
  addresses: string[];
  socialLinks: SocialLink[];
  buttonLabels: ButtonLabels;
};

export type SiteContent = {
  settings: SiteSettingsView;
  heroFeatures: HeroFeature[];
  projects: Project[];
  caseStudies: CaseStudy[];
  services: Service[];
  faqs: Faq[];
};
