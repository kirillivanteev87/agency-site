import { Reveal } from "./Reveal";

type SectionLeadProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionLead({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionLeadProps) {
  const centered = align === "center";

  return (
    <Reveal className={`mb-10 md:mb-12 ${className}`.trim()}>
      <div className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
        )}
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        {subtitle && (
          <p className={`mt-4 text-lg text-[var(--text-muted)] ${centered ? "mx-auto" : ""}`}>{subtitle}</p>
        )}
      </div>
    </Reveal>
  );
}
