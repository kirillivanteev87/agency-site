import type { SiteSettingsView } from "@/components/types";

export type FooterLink = {
  key: string;
  label: string;
  href: string;
  external?: boolean;
};

export function buildFooterLinks(settings: Pick<
  SiteSettingsView,
  "footerBehanceUrl" | "footerGithubUrl" | "socialLinks"
>): FooterLink[] {
  const links: FooterLink[] = [];

  const behance = settings.footerBehanceUrl?.trim();
  if (behance) {
    links.push({ key: "behance", label: "Behance", href: behance, external: true });
  }

  const github = settings.footerGithubUrl?.trim();
  if (github) {
    links.push({ key: "github", label: "GitHub", href: github, external: true });
  }

  for (const [index, link] of settings.socialLinks.entries()) {
    const url = link.url?.trim();
    if (!url) continue;
    links.push({
      key: `social-${index}`,
      label: link.label?.trim() || "Ссылка",
      href: url,
      external: true,
    });
  }

  return links;
}
