import { CheckCircle2 } from "lucide-react";
import { Reveal } from "./Reveal";

const TRUST_ITEMS = [
  "Бесплатный разбор задачи",
  "Смета за 20 минут",
  "Фиксированная цена в договоре",
  "Ответ менеджера за 2 часа",
] as const;

export function TrustBar() {
  return (
    <Reveal delay={120}>
      <ul
        className="card-surface card-surface--flat flex flex-wrap gap-x-6 gap-y-3 px-4 py-4 sm:gap-x-8 sm:px-6 sm:py-5"
        aria-label="Преимущества работы со студией"
      >
        {TRUST_ITEMS.map((item) => (
          <li key={item} className="flex min-w-0 max-w-full items-center gap-2 text-sm text-[var(--text-muted)]">
            <CheckCircle2 size={16} className="shrink-0 text-accent" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
