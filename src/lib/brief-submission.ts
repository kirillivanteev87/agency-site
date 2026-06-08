export function isBriefSubmission(message: string): boolean {
  return message.includes("=== БРИФ");
}

export type BriefSection = {
  title: string;
  lines: string[];
};

/** Разбор текста заявки, сохранённого formatBriefMessage */
export function parseBriefMessage(message: string): BriefSection[] {
  const sections: BriefSection[] = [];
  let current: BriefSection | null = null;

  for (const rawLine of message.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const sectionMatch = line.match(/^—\s*(.+?)\s*—$/);
    if (sectionMatch) {
      if (current) sections.push(current);
      current = { title: sectionMatch[1], lines: [] };
      continue;
    }

    if (line.startsWith("===")) continue;

    if (current) {
      current.lines.push(line);
    }
  }

  if (current) sections.push(current);

  return sections;
}
