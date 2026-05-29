import { prisma } from "./prisma";
import { buildCaseStudyLandingView } from "./case-study-landing";
import { buildProjectLandingView } from "./project-landing";
import { parseJsonArray } from "./parse-json";
import { DEFAULT_BUTTON_LABELS, parseButtonLabels, type ButtonLabels } from "./button-labels";
import { DEFAULT_SPACING, parseSpacingConfig, type SpacingConfig } from "./section-spacing";

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
  const [settings, heroFeatures, projects, caseStudies, services, faqs] =
    await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.heroFeature.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.caseStudy.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.faq.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

  const s = settings!;
  const sectionSpacing: SpacingConfig = parseSpacingConfig(s.sectionSpacing);

  return {
    settings: {
      brandName: s.brandName,
      brandHighlightText: s.brandHighlightText ?? "",
      brandHighlightColor: s.brandHighlightColor ?? "",
      heroTitle: s.heroTitle,
      heroHighlight: s.heroHighlight,
      heroSubtitle: s.heroSubtitle,
      heroMeta: s.heroMeta ?? "",
      heroVideoUrl: s.heroVideoUrl ?? "",
      heroVideoUrlLight: s.heroVideoUrlLight ?? "",
      statValue: s.statValue,
      statText: s.statText,
      footerCopyright: s.footerCopyright,
      phones: parseJsonArray<string>(s.phones, []),
      emails: parseJsonArray<string>(s.emails, []),
      addresses: parseJsonArray<string>(s.addresses, []),
      socialLinks: parseJsonArray<SocialLink>(s.socialLinks, []),
      buttonLabels: parseButtonLabels(s.buttonLabels),
    },
    sectionSpacing,
    heroFeatures,
    projects,
    caseStudies,
    services,
    faqs,
  };
}

export { DEFAULT_SPACING };
