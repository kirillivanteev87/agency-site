/** Метрики по порядку кейсов (sortOrder), как на главной */
export const CASE_STUDY_METRICS: string[][] = [
  ["Запуск за 3 мес.", "×2 заявки с сайта"],
  ["1200+ пользователей", "MRR с первого квартала"],
  ["−18% время доставки", "Рост повторных заказов"],
];

export function metricsForCaseStudyIndex(index: number): string[] {
  return CASE_STUDY_METRICS[index] ?? [];
}
