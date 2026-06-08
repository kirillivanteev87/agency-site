export type AdminDashboardTab =
  | "settings"
  | "buttons"
  | "hero"
  | "services"
  | "pricing"
  | "contact"
  | "marketplace"
  | "faq"
  | "messages";

export const ADMIN_PREVIEW_PATHS: Record<AdminDashboardTab, string> = {
  settings: "/?preview=content",
  buttons: "/?preview=content",
  hero: "/?preview=content",
  services: "/?preview=content#services",
  pricing: "/?preview=content#pricing",
  contact: "/?preview=content#contact",
  marketplace: "/marketplace",
  faq: "/?preview=content#faq",
  messages: "/?preview=content#contact",
};

export const ADMIN_PREVIEW_LABELS: Record<AdminDashboardTab, string> = {
  settings: "Главная — тексты и контакты",
  buttons: "Главная — подписи на кнопках",
  hero: "Главная — блок Hero",
  services: "Секция «Услуги»",
  pricing: "Секция «Тарифы»",
  contact: "Секция «Контакты» — форма",
  marketplace: "Marketplace",
  faq: "Секция «FAQ»",
  messages: "Секция «Контакты» — заявки",
};
