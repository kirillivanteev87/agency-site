import { Mail, MapPin, MessageCircle, MessagesSquare, Phone, Send, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ContactForm } from "./ContactForm";
import { SiteFooter } from "./SiteFooter";
import { Reveal } from "./Reveal";
import type { SiteContent } from "./types";

function ContactInfoCard({
  icon: Icon,
  label,
  children,
  className = "",
  labelField,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
  labelField: string;
}) {
  return (
    <div
      className={`card-surface card-interactive flex h-full min-h-0 flex-col justify-between p-4 ${className}`.trim()}
    >
      <div>
        <Icon className="mb-2 text-accent" size={18} strokeWidth={1.5} />
        <p className="text-sm font-medium text-[var(--text-muted)]" data-content-field={labelField}>
          {label}
        </p>
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function ContactLinkCard({
  icon,
  label,
  labelField,
  href,
  linkText,
  linkTextField,
  contactKey,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  labelField: string;
  href: string;
  linkText: string;
  linkTextField: string;
  contactKey: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="h-full min-h-0">
      <ContactInfoCard icon={icon} label={label} labelField={labelField}>
        <a
          data-contact={contactKey}
          data-content-field={linkTextField}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="block text-sm font-semibold leading-snug hover:text-accent md:text-base"
        >
          {linkText}
        </a>
      </ContactInfoCard>
    </Reveal>
  );
}

export function Contact({ settings }: Pick<SiteContent, "settings">) {
  const phone = settings.phones[0];
  const email = settings.emails[0];
  const address = settings.addresses[0];
  const bullets = [settings.contactBullet1, settings.contactBullet2, settings.contactBullet3].filter(
    Boolean,
  );

  return (
    <div>
      <Reveal>
        <p
          className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent"
          data-content-field="contactEyebrow"
        >
          {settings.contactEyebrow}
        </p>
        <h2 className="text-3xl font-bold md:text-4xl" data-content-field="contactTitle">
          {settings.contactTitle}
        </h2>
        <p
          className="mt-4 max-w-2xl text-lg text-[var(--text-muted)]"
          data-content-field="contactSubtitle"
        >
          {settings.contactSubtitle}
        </p>
        {bullets.length > 0 ? (
          <ul className="mt-6 mb-10 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
            {bullets.map((text, index) => {
              const field = `contactBullet${index + 1}` as const;
              return (
                <li key={field}>
                  ✓ <span data-content-field={field}>{text}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mb-10" />
        )}
      </Reveal>

      <div
        id="contact"
        className="contact-section grid scroll-mt-24 gap-8 lg:grid-cols-2 lg:items-stretch"
      >
        <div className="contact-cards-grid grid min-h-0 grid-cols-2 grid-rows-3 gap-4">
          {phone ? (
            <Reveal delay={40} className="h-full min-h-0">
              <ContactInfoCard
                icon={Phone}
                label={settings.contactLabelPhone}
                labelField="contactLabelPhone"
              >
                <a
                  data-contact="phone"
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="block text-sm font-semibold leading-snug hover:text-accent md:text-base"
                >
                  {phone}
                </a>
              </ContactInfoCard>
            </Reveal>
          ) : (
            <div className="min-h-0" aria-hidden />
          )}

          {email ? (
            <Reveal delay={60} className="h-full min-h-0">
              <ContactInfoCard
                icon={Mail}
                label={settings.contactLabelEmail}
                labelField="contactLabelEmail"
              >
                <a
                  data-contact="email"
                  href={`mailto:${email}`}
                  className="block break-all text-sm font-semibold leading-snug hover:text-accent md:text-base"
                >
                  {email}
                </a>
              </ContactInfoCard>
            </Reveal>
          ) : (
            <div className="min-h-0" aria-hidden />
          )}

          {settings.contactWhatsappUrl ? (
            <ContactLinkCard
              icon={MessageCircle}
              label={settings.contactWhatsappLabel}
              labelField="contactWhatsappLabel"
              href={settings.contactWhatsappUrl}
              linkText={settings.contactWhatsappLinkText}
              linkTextField="contactWhatsappLinkText"
              contactKey="whatsapp"
              delay={80}
            />
          ) : (
            <div className="min-h-0" aria-hidden />
          )}

          {settings.contactTelegramUrl ? (
            <ContactLinkCard
              icon={Send}
              label={settings.contactTelegramLabel}
              labelField="contactTelegramLabel"
              href={settings.contactTelegramUrl}
              linkText={settings.contactTelegramLinkText}
              linkTextField="contactTelegramLinkText"
              contactKey="telegram"
              delay={100}
            />
          ) : (
            <div className="min-h-0" aria-hidden />
          )}

          {settings.contactMaxUrl ? (
            <ContactLinkCard
              icon={MessagesSquare}
              label={settings.contactMaxLabel}
              labelField="contactMaxLabel"
              href={settings.contactMaxUrl}
              linkText={settings.contactMaxLinkText}
              linkTextField="contactMaxLinkText"
              contactKey="max"
              delay={120}
            />
          ) : (
            <div className="min-h-0" aria-hidden />
          )}

          {address ? (
            <Reveal delay={140} className="h-full min-h-0">
              <ContactInfoCard
                icon={MapPin}
                label={settings.contactLabelAddress}
                labelField="contactLabelAddress"
              >
                <p
                  data-contact="address"
                  className="text-sm font-semibold leading-snug md:text-base"
                >
                  {address}
                </p>
              </ContactInfoCard>
            </Reveal>
          ) : (
            <div className="min-h-0" aria-hidden />
          )}
        </div>

        <Reveal delay={80} direction="right" className="flex min-h-0 items-start">
          <ContactForm settings={settings} />
        </Reveal>
      </div>

      <Reveal delay={100}>
        <SiteFooter settings={settings} className="mt-16" />
      </Reveal>
    </div>
  );
}
