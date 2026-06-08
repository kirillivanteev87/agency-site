import type { ReactNode } from "react";
import type { SectionId, SectionSpacing } from "@/lib/section-spacing";

const HTML_IDS: Partial<Record<SectionId, string>> = {
  projects: "projects",
  cases: "cases",
  services: "services",
  pricing: "pricing",
  faq: "faq",
};

type Props = {
  id: SectionId;
  spacing: SectionSpacing;
  children: ReactNode;
  className?: string;
};

export function SiteSection({ id, spacing, children, className = "" }: Props) {
  return (
    <section
      id={HTML_IDS[id]}
      data-section={id}
      className={`section-container scroll-mt-20 min-w-0 ${className}`.trim()}
      style={{
        paddingTop: `var(--section-${id}-pt, ${spacing.paddingTop}px)`,
        paddingBottom: `var(--section-${id}-pb, ${spacing.paddingBottom}px)`,
      }}
    >
      {children}
    </section>
  );
}
