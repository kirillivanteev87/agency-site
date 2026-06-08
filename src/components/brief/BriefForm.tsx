"use client";

import { Check } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  BRIEF_PRODUCT_TYPE_OPTIONS,
  BRIEF_SCOPE_OPTIONS,
} from "@/lib/brief-form";

export function BriefForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [dataConsent, setDataConsent] = useState(true);
  const [productTypes, setProductTypes] = useState<string[]>([]);

  function toggleProductType(value: string) {
    setProductTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dataConsent) {
      setError("Нужно согласие на обработку данных.");
      return;
    }
    if (productTypes.length === 0) {
      setError("Выберите хотя бы один тип продукта.");
      return;
    }
    setStatus("loading");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      company: data.get("company"),
      role: data.get("role"),
      productTypes,
      goals: data.get("goals"),
      successMetric: data.get("successMetric"),
      scope: data.get("scope"),
      featuresMustHave: data.get("featuresMustHave"),
      featuresOutOfScope: data.get("featuresOutOfScope"),
      targetAudience: data.get("targetAudience"),
      competitors: data.get("competitors"),
      references: data.get("references"),
      integrations: data.get("integrations"),
      adminNeeded: data.get("adminNeeded"),
      contentSource: data.get("contentSource"),
      designNotes: data.get("designNotes"),
      brandAssets: data.get("brandAssets"),
      deadline: data.get("deadline"),
      budget: data.get("budget"),
      additional: data.get("additional"),
    };

    const res = await fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Не удалось отправить бриф");
      setStatus("error");
      return;
    }

    setStatus("success");
    form.reset();
    setProductTypes([]);
    setDataConsent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (status === "success") {
    return (
      <div className="brief-form-success card-surface p-8 md:p-10">
        <h2 className="text-2xl font-bold">Бриф отправлен</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          Спасибо! Мы изучим ответы и свяжемся с вами в ближайшие 2 часа в рабочее время. Смету и план
          обычно готовим в течение 24 часов после уточняющего созвона.
        </p>
        <a href="/" className="btn-primary mt-6 inline-flex">
          На главную
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="brief-form space-y-6">
      <section className="brief-form-section card-surface p-6 md:p-8">
        <h2 className="brief-form-section__title">Контакты</h2>
        <p className="brief-form-section__lead">Кому отправить смету и приглашение на созвон</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="brief-form-label">Имя *</span>
            <input name="name" required className="form-field" placeholder="Иван Иванов" />
          </label>
          <label className="block">
            <span className="brief-form-label">Email *</span>
            <input
              name="email"
              type="email"
              required
              className="form-field"
              placeholder="name@company.ru"
            />
          </label>
          <label className="block">
            <span className="brief-form-label">Телефон *</span>
            <input
              name="phone"
              type="tel"
              required
              className="form-field"
              placeholder="+7 (999) 123-45-67"
            />
          </label>
          <label className="block">
            <span className="brief-form-label">Компания</span>
            <input name="company" className="form-field" placeholder="ООО «Пример»" />
          </label>
          <label className="block">
            <span className="brief-form-label">Должность</span>
            <input name="role" className="form-field" placeholder="Директор, маркетолог…" />
          </label>
        </div>
      </section>

      <section className="brief-form-section card-surface p-6 md:p-8">
        <h2 className="brief-form-section__title">Цели проекта</h2>
        <p className="brief-form-section__lead">Зачем нужен сайт или приложение</p>
        <fieldset className="mt-5">
          <legend className="brief-form-label mb-3">Что планируете *</legend>
          <div className="flex flex-wrap gap-2">
            {BRIEF_PRODUCT_TYPE_OPTIONS.map((opt) => {
              const checked = productTypes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleProductType(opt.value)}
                  className={`brief-form-chip ${checked ? "brief-form-chip--active" : ""}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="mt-4 block">
          <span className="brief-form-label">Цели и задачи *</span>
          <textarea
            name="goals"
            required
            rows={4}
            className="form-field resize-none"
            placeholder="Например: больше заявок с рекламы, автоматизация заявок, запуск MVP…"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Как поймёте, что проект успешен?</span>
          <input
            name="successMetric"
            className="form-field"
            placeholder="Конверсия, количество лидов, срок запуска…"
          />
        </label>
      </section>

      <section className="brief-form-section card-surface p-6 md:p-8">
        <h2 className="brief-form-section__title">Объём и функции</h2>
        <label className="mt-5 block">
          <span className="brief-form-label">Формат проекта *</span>
          <select name="scope" required className="form-field" defaultValue="">
            <option value="" disabled>
              Выберите вариант
            </option>
            {BRIEF_SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Обязательно в первой версии</span>
          <textarea
            name="featuresMustHave"
            rows={3}
            className="form-field resize-none"
            placeholder="Формы, каталог, личный кабинет, оплата, интеграция с CRM…"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Точно не входит в первую версию</span>
          <textarea
            name="featuresOutOfScope"
            rows={2}
            className="form-field resize-none"
            placeholder="Что отложить на потом"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Интеграции</span>
          <textarea
            name="integrations"
            rows={2}
            className="form-field resize-none"
            placeholder="amoCRM, Bitrix24, 1С, платёжные системы, API…"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Нужна админка для правок контента?</span>
          <input name="adminNeeded" className="form-field" placeholder="Кто будет обновлять сайт" />
        </label>
      </section>

      <section className="brief-form-section card-surface p-6 md:p-8">
        <h2 className="brief-form-section__title">Аудитория и дизайн</h2>
        <label className="mt-5 block">
          <span className="brief-form-label">Целевая аудитория</span>
          <textarea
            name="targetAudience"
            rows={2}
            className="form-field resize-none"
            placeholder="B2B/B2C, география, кто принимает решение"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Конкуренты</span>
          <textarea
            name="competitors"
            rows={2}
            className="form-field resize-none"
            placeholder="Ссылки или названия"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Референсы (что нравится)</span>
          <textarea
            name="references"
            rows={2}
            className="form-field resize-none"
            placeholder="Ссылки на сайты / приложения"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Пожелания по дизайну</span>
          <textarea
            name="designNotes"
            rows={2}
            className="form-field resize-none"
            placeholder="Стиль, цвета, светлая/тёмная тема"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Контент и бренд</span>
          <textarea
            name="contentSource"
            rows={2}
            className="form-field resize-none"
            placeholder="Кто готовит тексты и фото"
          />
        </label>
        <label className="mt-4 block">
          <span className="brief-form-label">Есть ли логотип, брендбук, материалы</span>
          <input name="brandAssets" className="form-field" placeholder="Да / нет / ссылка на папку" />
        </label>
      </section>

      <section className="brief-form-section card-surface p-6 md:p-8">
        <h2 className="brief-form-section__title">Сроки и бюджет</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="brief-form-label">Желаемый срок запуска</span>
            <input name="deadline" className="form-field" placeholder="Дата или «через 2 месяца»" />
          </label>
          <label className="block">
            <span className="brief-form-label">Бюджетный коридор</span>
            <input name="budget" className="form-field" placeholder="От … ₽ или «обсудим»" />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="brief-form-label">Дополнительно</span>
          <textarea
            name="additional"
            rows={3}
            className="form-field resize-none"
            placeholder="Всё, что важно учесть"
          />
        </label>
      </section>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="brief-form-footer card-surface p-6 md:p-8">
        <button
          type="submit"
          className="btn-primary btn-shimmer w-full uppercase tracking-wide sm:w-auto sm:min-w-[240px]"
          disabled={status === "loading" || !dataConsent}
        >
          <span className="relative z-10">
            {status === "loading" ? "Отправка…" : "Отправить бриф"}
          </span>
        </button>
        <div className="mt-4 flex gap-3 text-left text-xs leading-relaxed text-[var(--text-muted)]">
          <label className="relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center self-start rounded-sm">
            <input
              id="brief-data-consent"
              type="checkbox"
              checked={dataConsent}
              onChange={(e) => {
                setDataConsent(e.target.checked);
                if (e.target.checked) setError("");
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <span
              className={`pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded-sm border-2 border-[var(--accent)] ${
                dataConsent ? "bg-[var(--accent)]" : "bg-transparent"
              }`}
              aria-hidden
            >
              <Check
                size={12}
                strokeWidth={3}
                className={`text-white ${dataConsent ? "opacity-100" : "opacity-0"}`}
              />
            </span>
          </label>
          <label htmlFor="brief-data-consent" className="cursor-pointer select-none">
            Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
          </label>
        </div>
      </div>
    </form>
  );
}
