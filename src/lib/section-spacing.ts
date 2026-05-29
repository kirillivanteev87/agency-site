export const SECTION_IDS = [
  "hero",
  "stats",
  "process",
  "projects",
  "cases",
  "services",
  "faq",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export type SectionSpacing = {
  paddingTop: number;
  paddingBottom: number;
};

export type SpacingConfig = Record<SectionId, SectionSpacing>;

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero — главный экран",
  stats: "Статистика (70+)",
  process: "Процесс работы",
  projects: "Портфолио",
  cases: "Кейсы",
  services: "Услуги",
  faq: "FAQ",
  contact: "Контакты",
};

export const DEFAULT_SPACING: SpacingConfig = {
  hero: { paddingTop: 64, paddingBottom: 96 },
  stats: { paddingTop: 64, paddingBottom: 80 },
  process: { paddingTop: 48, paddingBottom: 80 },
  projects: { paddingTop: 64, paddingBottom: 96 },
  cases: { paddingTop: 64, paddingBottom: 96 },
  services: { paddingTop: 64, paddingBottom: 96 },
  faq: { paddingTop: 64, paddingBottom: 96 },
  contact: { paddingTop: 64, paddingBottom: 96 },
};

export function parseSpacingConfig(raw: string | null | undefined): SpacingConfig {
  const base = { ...DEFAULT_SPACING };
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<SpacingConfig>;
    for (const id of SECTION_IDS) {
      const item = parsed[id];
      if (item && typeof item.paddingTop === "number" && typeof item.paddingBottom === "number") {
        base[id] = {
          paddingTop: clamp(item.paddingTop, 0, 240),
          paddingBottom: clamp(item.paddingBottom, 0, 240),
        };
      }
    }
  } catch {
    /* use defaults */
  }
  return base;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function spacingToCssVars(config: SpacingConfig): string {
  const lines = SECTION_IDS.flatMap((id) => [
    `--section-${id}-pt: ${config[id].paddingTop}px;`,
    `--section-${id}-pb: ${config[id].paddingBottom}px;`,
  ]);
  return `:root { ${lines.join(" ")} }`;
}

export function applySpacingToDocument(config: SpacingConfig) {
  const root = document.documentElement;
  for (const id of SECTION_IDS) {
    root.style.setProperty(`--section-${id}-pt`, `${config[id].paddingTop}px`);
    root.style.setProperty(`--section-${id}-pb`, `${config[id].paddingBottom}px`);
  }
}
