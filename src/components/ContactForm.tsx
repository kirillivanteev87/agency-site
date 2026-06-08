"use client";

import { Check } from "lucide-react";
import { FormEvent, useState } from "react";
import { DEFAULT_BUTTON_LABELS } from "@/lib/button-labels";
import type { SiteSettingsView } from "./types";

type Props = {
  settings: Pick<
    SiteSettingsView,
    | "buttonLabels"
    | "contactFormTitle"
    | "contactFormLead"
    | "contactNameLabel"
    | "contactNamePlaceholder"
    | "contactEmailLabel"
    | "contactEmailPlaceholder"
    | "contactPhoneLabel"
    | "contactPhonePlaceholder"
    | "contactMessageLabel"
    | "contactMessagePlaceholder"
    | "contactSuccessMessage"
    | "contactConsentText"
  >;
};

export function ContactForm({ settings }: Props) {
  const buttonLabels = settings.buttonLabels ?? DEFAULT_BUTTON_LABELS;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [dataConsent, setDataConsent] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dataConsent) {
      setError("Нужно согласие на обработку данных, чтобы мы могли с вами связаться.");
      return;
    }
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        message: data.get("message"),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Не удалось отправить");
      setStatus("error");
      return;
    }

    setStatus("success");
    form.reset();
    setDataConsent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface flex h-auto w-full shrink-0 flex-col space-y-4 p-6">
      <div>
        <h3 className="text-lg font-semibold" data-content-field="contactFormTitle">
          {settings.contactFormTitle}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]" data-content-field="contactFormLead">
          {settings.contactFormLead}
        </p>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--text-muted)]" data-content-field="contactNameLabel">
          {settings.contactNameLabel}
        </span>
        <input
          name="name"
          required
          placeholder={settings.contactNamePlaceholder}
          data-placeholder-field="contactNamePlaceholder"
          className="form-field"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--text-muted)]" data-content-field="contactEmailLabel">
          {settings.contactEmailLabel}
        </span>
        <input
          name="email"
          type="email"
          required
          placeholder={settings.contactEmailPlaceholder}
          data-placeholder-field="contactEmailPlaceholder"
          className="form-field"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--text-muted)]" data-content-field="contactPhoneLabel">
          {settings.contactPhoneLabel}
        </span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder={settings.contactPhonePlaceholder}
          data-placeholder-field="contactPhonePlaceholder"
          className="form-field"
        />
      </label>
      <label className="block">
        <span
          className="mb-1 block text-sm text-[var(--text-muted)]"
          data-content-field="contactMessageLabel"
        >
          {settings.contactMessageLabel}
        </span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder={settings.contactMessagePlaceholder}
          data-placeholder-field="contactMessagePlaceholder"
          className="form-field resize-none"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {status === "success" && (
        <p className="text-sm text-green-400" data-content-field="contactSuccessMessage">
          {settings.contactSuccessMessage}
        </p>
      )}
      <button
        type="submit"
        className="btn-primary btn-shimmer mt-auto w-full uppercase tracking-wide"
        disabled={status === "loading" || !dataConsent}
      >
        <span
          className="relative z-10"
          data-button-field={status === "loading" ? "contactSubmitLoading" : "contactSubmit"}
        >
          {status === "loading" ? buttonLabels.contactSubmitLoading : buttonLabels.contactSubmit}
        </span>
      </button>
      <div className="flex gap-3 text-left text-xs leading-relaxed text-[var(--text-muted)]">
        <label className="relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center self-start rounded-sm">
          <input
            id="contact-data-consent"
            type="checkbox"
            checked={dataConsent}
            onChange={(e) => {
              setDataConsent(e.target.checked);
              if (e.target.checked) setError("");
            }}
            className="absolute inset-0 cursor-pointer opacity-0 outline-none ring-0 focus:outline-none focus-visible:outline-none"
          />
          <span
            className={`pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded-sm border-2 border-[var(--accent)] transition-colors ${
              dataConsent ? "bg-[var(--accent)]" : "bg-transparent"
            }`}
            aria-hidden
          >
            <Check
              size={12}
              strokeWidth={3}
              className={`text-white transition-opacity duration-150 ${dataConsent ? "opacity-100" : "opacity-0"}`}
            />
          </span>
        </label>
        <label htmlFor="contact-data-consent" className="cursor-pointer select-none" data-content-field="contactConsentText">
          {settings.contactConsentText}
        </label>
      </div>
    </form>
  );
}
