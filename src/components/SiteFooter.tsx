import { buildFooterLinks } from "@/lib/footer-links";
import type { SiteSettingsView } from "./types";

type Props = {
  settings: SiteSettingsView;
  className?: string;
  id?: string;
};

export function SiteFooter({ settings, className = "", id = "site-bottom" }: Props) {
  const links = buildFooterLinks(settings);
  const descriptor = settings.footerDescriptor?.trim();
  const copyright = settings.footerCopyright?.trim();

  return (
    <footer
      id={id}
      className={`site-footer scroll-mt-24 border-t border-[var(--border)] pt-10 text-sm text-[var(--text-muted)] ${className}`.trim()}
    >
      <div className="site-footer__inner flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="site-footer__brand max-w-xl">
          {descriptor ? (
            <p
              className="text-base leading-relaxed text-[var(--text)]"
              data-content-field="footerDescriptor"
            >
              {descriptor}
            </p>
          ) : null}
          {copyright ? (
            <p
              className={descriptor ? "mt-3" : undefined}
              data-content-field="footerCopyright"
            >
              {copyright}
            </p>
          ) : null}
        </div>

        {links.length > 0 ? (
          <nav
            aria-label="Контакты и соцсети"
            className="site-footer__links"
            data-footer-links-root
          >
            <ul className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
              {links.map((link) => {
                const socialIndex = link.key.startsWith("social-")
                  ? link.key.slice("social-".length)
                  : undefined;

                return (
                <li key={link.key}>
                  <a
                    data-footer-link={socialIndex !== undefined ? "social" : link.key}
                    {...(socialIndex !== undefined
                      ? { "data-social-link-index": socialIndex }
                      : {})}
                    href={link.href}
                    className="font-medium text-[var(--text)] transition-colors hover:text-accent"
                    {...(link.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </a>
                </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
