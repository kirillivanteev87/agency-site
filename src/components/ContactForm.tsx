"use client";

import { Check } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ButtonLabels } from "@/lib/site-data";
import { DEFAULT_BUTTON_LABELS } from "@/lib/button-labels";

export function ContactForm({ buttonLabels = DEFAULT_BUTTON_LABELS }: { buttonLabels?: ButtonLabels }) {
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
    <form onSubmit={handleSubmit} className="card-surface flex h-full w-full flex-col space-y-4 p-6">
      <div>
        <h3 className="text-lg font-semibold">Заявка</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Заполните форму — менеджер свяжется с вами и предложит решение под вашу задачу.
        </p>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--text-muted)]">Имя</span>
        <input
          name="name"
          required
          placeholder="Как к вам обращаться"
          className="form-field"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--text-muted)]">Email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="name@company.ru"
          className="form-field"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--text-muted)]">Телефон</span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+7 (999) 123-45-67"
          className="form-field"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--text-muted)]">Что нужно сделать?</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Кратко опишите проект, сроки и бюджет (если есть)"
          className="form-field resize-none"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {status === "success" && (
        <p className="text-sm text-green-400">
          Заявка принята! Мы свяжемся с вами в ближайшие 2 часа в рабочее время.
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
        <label className="relative inline-flex h-[18px] w-[18px] shrink-0 cursor-pointer self-start rounded-sm">
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
            className={`pointer-events-none flex h-[18px] w-[18px] items-center justify-center rounded-sm border-2 border-[var(--accent)] transition-colors ${
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
        <label htmlFor="contact-data-consent" className="cursor-pointer select-none">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
        </label>
      </div>
    </form>
  );
}
