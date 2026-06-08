"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import type { SiteContent } from "./types";

const FAQ_EYEBROW = "FAQ";
const FAQ_TITLE = "Снимаем возражения до созвона";
const FAQ_LEAD =
  "Ответы про сроки, договор, бюджет и поддержку. Остались сомнения — напишите, разберём вашу задачу бесплатно.";

function formatFaqIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function Faq({ faqs, settings }: Pick<SiteContent, "faqs" | "settings">) {
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (faqs[0]?.id != null) setOpenId(faqs[0].id);
  }, [faqs]);

  return (
    <div className="faq-section">
      <div className="faq-section__grid">
        <Reveal direction="none" className="faq-section__intro-wrap">
          <div className="faq-section__intro">
            <div className="faq-section__intro-sticky-slot">
              <div className="faq-section__intro-sticky">
                <p className="faq-section__eyebrow">{FAQ_EYEBROW}</p>

                <div className="faq-section__title-row">
                  <span className="faq-section__accent-bar" aria-hidden="true" />
                  <h2 className="faq-section__title">{FAQ_TITLE}</h2>
                </div>

                <p className="faq-section__lead">{FAQ_LEAD}</p>
              </div>
            </div>

            <a href="#contact" className="btn-primary faq-section__cta" data-button-field="faqCta">
              {settings.buttonLabels.faqCta}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </Reveal>

        <div className="faq-section__list" role="list">
          {faqs.map((item, index) => {
            const open = openId === item.id;
            return (
              <Reveal key={item.id} delay={index * 40} className="faq-section__item-wrap">
                <div className={`faq-section__item ${open ? "faq-section__item--open" : ""}`} role="listitem">
                  <button
                    type="button"
                    className="faq-section__item-trigger"
                    onClick={() => setOpenId(open ? null : item.id)}
                    aria-expanded={open}
                  >
                    <span className="faq-section__item-main">
                      <span className="faq-section__question">{item.question}</span>
                      <div className={`faq-answer ${open ? "faq-answer-open" : ""}`}>
                        <div className="faq-answer-inner">
                          <p className="faq-section__answer">{item.answer}</p>
                        </div>
                      </div>
                    </span>

                    <span className="faq-section__item-meta">
                      <span className="faq-section__index" aria-hidden="true">
                        {formatFaqIndex(index)}
                      </span>
                      <Plus
                        className={`faq-icon faq-section__toggle ${open ? "faq-icon-open" : ""}`}
                        size={22}
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
