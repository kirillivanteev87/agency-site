export type FooterSocialLink = { label: string; url: string };

const FOOTER_EXCLUDED_SOCIAL = /telegram|whatsapp|t\.me|wa\.me/i;

/** Соцссылки в подвале: без Telegram и WhatsApp (есть карточки в секции контактов). */
export function filterFooterSocialLinks(links: FooterSocialLink[]): FooterSocialLink[] {
  return links.filter(
    (link) =>
      !FOOTER_EXCLUDED_SOCIAL.test(link.label) && !FOOTER_EXCLUDED_SOCIAL.test(link.url),
  );
}
