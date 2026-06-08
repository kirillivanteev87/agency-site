import type { Metadata } from "next";
import { BriefForm } from "@/components/brief/BriefForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Заполнить бриф",
  description:
    "Бриф на разработку сайта или приложения: цели, функции, сроки и бюджет. Подготовим смету после изучения ответов.",
};

export default function BriefPage() {
  return (
    <main className="brief-page overflow-x-clip">
      <div className="section-container">
        <Reveal className="brief-page__header">
          <p className="brief-page__eyebrow">Бриф</p>
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">Расскажите о проекте</h1>
          <p className="mt-4 text-lg text-[var(--text-muted)]">
            Ответьте на вопросы — это займёт 10–15 минут. Мы подготовим смету и предложим созвон, чтобы
            уточнить детали. Поля со звёздочкой обязательны.
          </p>
        </Reveal>
        <BriefForm />
      </div>
    </main>
  );
}
