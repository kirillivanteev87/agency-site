"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import type { SiteSettingsView } from "./types";

const links = [
  { href: "/marketplace", label: "Лаборатория" },
  { href: "/#projects", label: "Проекты" },
  { href: "/#cases", label: "Продукты" },
  { href: "/#services", label: "Услуги" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Контакты" },
];

export function Header({
  brandName,
  brandHighlightText,
  brandHighlightColor,
  logoMode,
  logoImageUrl,
  buttonLabels,
  overlay = false,
}: Pick<
  SiteSettingsView,
  | "brandName"
  | "brandHighlightText"
  | "brandHighlightColor"
  | "logoMode"
  | "logoImageUrl"
  | "buttonLabels"
> & {
  overlay?: boolean;
}) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const hero = document.querySelector('[data-section="hero"]');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSolid(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -40% 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [overlay]);

  const headerClass = overlay
    ? `header-enter header--overlay fixed top-0 right-0 left-0 z-50 border-b${solid ? " header--overlay-solid" : ""}`
    : "header-enter sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md";

  return (
    <header className={headerClass}>
      <div className="section-container flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="transition-opacity [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80"
        >
          <BrandLogo
            brandName={brandName}
            highlightText={brandHighlightText}
            highlightColor={brandHighlightColor}
            logoMode={logoMode}
            logoImageUrl={logoImageUrl}
            dataContentField="brandName"
            className="text-lg font-bold tracking-tight"
          />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) =>
            link.href.startsWith("/marketplace") ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--text-muted)] transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--text)]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--text-muted)] transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--text)]"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <a
            href="/#contact"
            className="btn-primary btn-shimmer inline-flex shrink-0 px-3 py-2 text-xs sm:px-4 sm:text-sm"
          >
            <span className="relative z-10" data-button-field="headerCta">
              {buttonLabels.headerCta}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
