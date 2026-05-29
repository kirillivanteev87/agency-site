import { HeroMosaicCornerGlow } from "./HeroMosaicCornerGlow";
import { Reveal } from "./Reveal";
import { SectionLead } from "./SectionLead";

const STEPS = [
  {
    step: "01",
    title: "Бриф и аудит",
    text: "Разбираем бизнес-цели, аудиторию и конкурентов. Фиксируем KPI проекта.",
  },
  {
    step: "02",
    title: "Прототип и смета",
    text: "Показываем структуру и логику. Даём прозрачную смету со сроками — без сюрпризов.",
  },
  {
    step: "03",
    title: "Дизайн и разработка",
    text: "Делаем интерфейс под конверсию и собираем продукт на современном стеке.",
  },
  {
    step: "04",
    title: "Запуск и рост",
    text: "Выводим в прод, подключаем аналитику и помогаем улучшать метрики после старта.",
  },
] as const;

export function Process() {
  return (
    <div>
      <SectionLead
        eyebrow="Как мы работаем"
        title="От идеи до заявок — понятный процесс"
        subtitle="Вы всегда знаете, на каком этапе проект, что сделано и что будет дальше."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item, index) => (
          <Reveal key={item.step} delay={index * 50}>
            <div className="process-card card-surface card-interactive relative h-full overflow-hidden p-6">
              <HeroMosaicCornerGlow variant="process" />
              <div className="relative z-10">
                <p className="text-3xl font-bold text-accent">{item.step}</p>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
