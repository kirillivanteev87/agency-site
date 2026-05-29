import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";
import type { SiteContent } from "./types";

function ContactInfoCard({
  icon: Icon,
  label,
  children,
  variant = "tall",
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  variant?: "compact" | "tall";
  className?: string;
}) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`card-surface card-interactive flex flex-col justify-between ${
        isCompact ? "h-[280px] p-4" : "h-full min-h-0 flex-1 p-5"
      } ${className}`.trim()}
    >
      <div>
        <Icon
          className={`text-accent ${isCompact ? "mb-2" : "mb-3"}`}
          size={isCompact ? 18 : 22}
          strokeWidth={1.5}
        />
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
      </div>
      <div className={isCompact ? "pt-2" : "mt-auto pt-4"}>{children}</div>
    </div>
  );
}

export function Contact({ settings }: Pick<SiteContent, "settings">) {
  const phone = settings.phones[0];
  const email = settings.emails[0];
  const address = settings.addresses[0];

  return (
    <div>
      <Reveal>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">Следующий шаг</p>
        <h2 className="text-3xl font-bold md:text-4xl">Получите расчёт проекта за 24 часа</h2>
        <p className="mt-4 max-w-2xl text-lg text-[var(--text-muted)]">
          Опишите задачу — предложим формат, сроки и ориентир по бюджету. Перезвоним в течение 2 часов в рабочее
          время.
        </p>
        <ul className="mt-6 mb-10 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
          <li>✓ Бесплатная консультация</li>
          <li>✓ NDA по запросу</li>
          <li>✓ Без навязчивых продаж</li>
        </ul>
      </Reveal>

      <div
        id="contact"
        className="grid scroll-mt-24 gap-8 lg:grid-cols-2 lg:items-stretch"
      >
        {/* Левая колонка = высота формы; адрес тянется вниз до кнопки «Отправить» */}
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
            {phone && (
              <Reveal delay={40} className="h-[280px]">
                <ContactInfoCard icon={Phone} label="Телефон" variant="compact" className="h-full">
                  <a
                    data-contact="phone"
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="block text-sm font-semibold leading-snug hover:text-accent md:text-base"
                  >
                    {phone}
                  </a>
                </ContactInfoCard>
              </Reveal>
            )}
            {email && (
              <Reveal delay={60} className="h-[280px]">
                <ContactInfoCard icon={Mail} label="Email" variant="compact" className="h-full">
                  <a
                    data-contact="email"
                    href={`mailto:${email}`}
                    className="block break-all text-sm font-semibold leading-snug hover:text-accent md:text-base"
                  >
                    {email}
                  </a>
                </ContactInfoCard>
              </Reveal>
            )}
          </div>

          {address && (
            <Reveal delay={80} className="flex min-h-0 flex-1 flex-col">
              <ContactInfoCard icon={MapPin} label="Адрес" variant="tall" className="w-full">
                <p
                  data-contact="address"
                  className="text-base font-semibold leading-snug md:text-lg"
                >
                  {address}
                </p>
              </ContactInfoCard>
            </Reveal>
          )}
        </div>

        <Reveal delay={80} direction="right" className="flex h-full w-full min-h-0">
          <ContactForm buttonLabels={settings.buttonLabels} />
        </Reveal>
      </div>

      <Reveal delay={100}>
        <footer
          id="site-bottom"
          className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 text-sm text-[var(--text-muted)] md:flex-row scroll-mt-24"
        >
          <p data-content-field="footerCopyright">{settings.footerCopyright}</p>
          <div data-social-links-root className="flex gap-4">
            {settings.socialLinks.map((link, index) => (
              <a
                key={`${link.label}-${link.url}-${index}`}
                data-social-link-index={index}
                href={link.url}
                className="transition-colors hover:text-[var(--text)]"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </footer>
      </Reveal>
    </div>
  );
}
