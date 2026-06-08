"use client";

import { Eye } from "lucide-react";
import type { SiteSettingsField } from "@/lib/site-settings-fields";

const SECTION_HEADING_FIELDS = [
  "contactEyebrow",
  "contactTitle",
  "contactSubtitle",
  "contactBullet1",
  "contactBullet2",
  "contactBullet3",
  "contactLabelPhone",
  "contactLabelEmail",
  "contactLabelAddress",
] as const satisfies readonly SiteSettingsField[];

const MESSENGER_GROUPS = [
  {
    title: "WhatsApp",
    fields: [
      "contactWhatsappLabel",
      "contactWhatsappLinkText",
      "contactWhatsappUrl",
    ] as const,
  },
  {
    title: "Telegram",
    fields: [
      "contactTelegramLabel",
      "contactTelegramLinkText",
      "contactTelegramUrl",
    ] as const,
  },
  {
    title: "MAX",
    fields: ["contactMaxLabel", "contactMaxLinkText", "contactMaxUrl"] as const,
  },
] as const;

const MESSENGER_FIELDS = MESSENGER_GROUPS.flatMap((g) => [...g.fields]);

const FORM_FIELDS = [
  "contactFormTitle",
  "contactFormLead",
  "contactNameLabel",
  "contactNamePlaceholder",
  "contactEmailLabel",
  "contactEmailPlaceholder",
  "contactPhoneLabel",
  "contactPhonePlaceholder",
  "contactMessageLabel",
  "contactMessagePlaceholder",
  "contactSuccessMessage",
  "contactConsentText",
] as const satisfies readonly SiteSettingsField[];

type ContactField =
  | (typeof SECTION_HEADING_FIELDS)[number]
  | (typeof MESSENGER_FIELDS)[number]
  | (typeof FORM_FIELDS)[number];

const FIELD_LABELS: Record<ContactField, string> = {
  contactEyebrow: "Подпись над заголовком",
  contactTitle: "Заголовок секции",
  contactSubtitle: "Подзаголовок",
  contactBullet1: "Преимущество 1 (с галочкой)",
  contactBullet2: "Преимущество 2",
  contactBullet3: "Преимущество 3",
  contactLabelPhone: "Подпись карточки «Телефон»",
  contactLabelEmail: "Подпись карточки «Email»",
  contactLabelAddress: "Подпись карточки «Адрес»",
  contactWhatsappLabel: "Подпись карточки",
  contactWhatsappLinkText: "Текст ссылки на карточке",
  contactWhatsappUrl: "URL при клике",
  contactTelegramLabel: "Подпись карточки",
  contactTelegramLinkText: "Текст ссылки на карточке",
  contactTelegramUrl: "URL при клике",
  contactMaxLabel: "Подпись карточки",
  contactMaxLinkText: "Текст ссылки на карточке",
  contactMaxUrl: "URL при клике",
  contactFormTitle: "Заголовок формы",
  contactFormLead: "Текст под заголовком формы",
  contactNameLabel: "Поле «Имя» — подпись",
  contactNamePlaceholder: "Поле «Имя» — placeholder",
  contactEmailLabel: "Поле «Email» — подпись",
  contactEmailPlaceholder: "Поле «Email» — placeholder",
  contactPhoneLabel: "Поле «Телефон» — подпись",
  contactPhonePlaceholder: "Поле «Телефон» — placeholder",
  contactMessageLabel: "Поле «Сообщение» — подпись",
  contactMessagePlaceholder: "Поле «Сообщение» — placeholder",
  contactSuccessMessage: "Сообщение после успешной отправки",
  contactConsentText: "Текст согласия на обработку данных",
};

const FIELD_HINTS: Partial<Record<ContactField, string>> = {
  contactEyebrow: "Например: Следующий шаг",
  contactTitle: "Например: Получите расчёт проекта за 24 часа",
  contactWhatsappLabel: "Мелкая подпись над ссылкой, например: WhatsApp",
  contactWhatsappLinkText: "Как выглядит ссылка в карточке, например: +7 (999) 123-45-67",
  contactWhatsappUrl: "Куда ведёт клик, например: https://wa.me/79991234567",
  contactTelegramLabel: "Мелкая подпись над ссылкой, например: Telegram",
  contactTelegramLinkText: "Как выглядит ссылка в карточке, например: @username",
  contactTelegramUrl: "Куда ведёт клик, например: https://t.me/username",
  contactMaxLabel: "Мелкая подпись над ссылкой, например: MAX",
  contactMaxLinkText: "Как выглядит ссылка в карточке, например: Написать в MAX",
  contactMaxUrl: "Куда ведёт клик, например: https://max.ru/u/...",
};

const MULTILINE_FIELDS = new Set<SiteSettingsField>([
  "contactSubtitle",
  "contactFormLead",
  "contactMessagePlaceholder",
  "contactSuccessMessage",
  "contactConsentText",
]);

type Props = {
  settings: Partial<Record<SiteSettingsField, string>>;
  onChange: (next: Partial<Record<SiteSettingsField, string>>) => void;
  onHighlight?: (field: SiteSettingsField) => void;
  onSave: () => void;
  saving?: boolean;
};

function ContactFields({
  fields,
  settings,
  onChange,
  onHighlight,
  fieldLabelPrefix,
}: Pick<Props, "settings" | "onChange" | "onHighlight"> & {
  fields: readonly ContactField[];
  fieldLabelPrefix?: string;
}) {
  return (
    <>
      {fields.map((key) => (
        <label key={key} className="admin-field block">
          <span className="admin-field-label flex items-center gap-2">
            {fieldLabelPrefix ? `${fieldLabelPrefix} — ${FIELD_LABELS[key]}` : FIELD_LABELS[key]}
            {onHighlight ? (
              <button
                type="button"
                className="admin-preview-eye"
                title="Показать на сайте"
                onClick={() => onHighlight(key)}
              >
                <Eye size={14} />
              </button>
            ) : null}
          </span>
          {FIELD_HINTS[key] ? <span className="admin-field-hint">{FIELD_HINTS[key]}</span> : null}
          {MULTILINE_FIELDS.has(key) ? (
            <textarea
              rows={key === "contactConsentText" ? 3 : 2}
              value={settings[key] ?? ""}
              onChange={(e) => onChange({ ...settings, [key]: e.target.value })}
            />
          ) : (
            <input
              value={settings[key] ?? ""}
              onChange={(e) => onChange({ ...settings, [key]: e.target.value })}
            />
          )}
        </label>
      ))}
    </>
  );
}

export function AdminContactPanel({ settings, onChange, onHighlight, onSave, saving }: Props) {
  return (
    <section className="admin-card">
      <div className="admin-card-body space-y-6">
        <div>
          <p className="text-sm font-semibold">Секция «Контакты» и форма заявки</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Заголовок блока, сетка карточек контактов (2×3) и поля формы на главной. Кнопка отправки — во
            вкладке «Кнопки» («Форма заявки»). Телефон, email и адрес — во вкладке «Сайт».
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Заголовок секции «Контакты»</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Подпись, основной заголовок, подзаголовок и преимущества над карточками
            </p>
          </div>
          <ContactFields
            fields={SECTION_HEADING_FIELDS}
            settings={settings}
            onChange={onChange}
            onHighlight={onHighlight}
          />
        </div>

        <div className="space-y-4 border-t border-[var(--border)] pt-6">
          <div>
            <p className="text-sm font-semibold">Форма заявки и мессенджеры</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Карточки WhatsApp, Telegram и MAX в сетке слева от формы; заголовок и поля формы справа.
              Карточка скрывается, если URL при клике пустой.
            </p>
          </div>
          <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Мессенджеры (карточки)
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              У каждой карточки три поля: подпись (мелкий текст), текст ссылки (крупная строка) и URL при
              нажатии.
            </p>
            {MESSENGER_GROUPS.map((group) => (
              <div
                key={group.title}
                className="space-y-3 rounded-md border border-[var(--border)]/80 bg-[var(--background)]/50 p-3"
              >
                <p className="text-sm font-semibold">{group.title}</p>
                <ContactFields
                  fields={group.fields}
                  settings={settings}
                  onChange={onChange}
                  onHighlight={onHighlight}
                  fieldLabelPrefix={group.title}
                />
              </div>
            ))}
          </div>
          <ContactFields
            fields={FORM_FIELDS}
            settings={settings}
            onChange={onChange}
            onHighlight={onHighlight}
          />
        </div>

        <button type="button" className="btn-primary text-sm" disabled={saving} onClick={onSave}>
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </section>
  );
}
