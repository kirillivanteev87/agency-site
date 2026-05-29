"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import type { SiteContent } from "./types";

export function Faq({ faqs, settings }: Pick<SiteContent, "faqs" | "settings">) {
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (faqs[0]?.id != null) setOpenId(faqs[0].id);
  }, [faqs]);

  return (
    <div>
      <div className="grid gap-10 md:grid-cols-2">
        <Reveal direction="left">
          <div className="card-surface card-interactive flex h-full flex-col justify-between p-8">
            <div>
              <h2 className="text-3xl font-bold">Снимаем возражения до созвона</h2>
              <p className="mt-4 text-[var(--text-muted)]">
                Ответы про сроки, договор, бюджет и поддержку. Остались сомнения — напишите, разберём вашу задачу
                бесплатно.
              </p>
            </div>
            <a href="#contact" className="btn-primary mt-8 inline-flex w-fit" data-button-field="faqCta">
              {settings.buttonLabels.faqCta}
              <ArrowRight size={18} />
            </a>
          </div>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((item, index) => {
            const open = openId === item.id;
            return (
              <Reveal key={item.id} delay={index * 40}>
                <div className="card-surface card-interactive overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <span className="font-medium">{item.question}</span>
                    <Plus
                      className={`faq-icon shrink-0 text-accent ${open ? "faq-icon-open" : ""}`}
                      size={20}
                    />
                  </button>
                  <div className={`faq-answer ${open ? "faq-answer-open" : ""}`}>
                    <div className="faq-answer-inner">
                      <div className="border-t border-[var(--border)] px-5 pb-5 pt-3 text-[var(--text-muted)]">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
