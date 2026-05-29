function parsePositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function collectIndexesFromExpression(chars: string[], expression: string): Set<number> {
  const indexes = new Set<number>();
  const parts = expression
    .split(/[,\s;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const from = parsePositiveInt(rangeMatch[1]);
      const to = parsePositiveInt(rangeMatch[2]);
      if (!from || !to) continue;
      const start = Math.min(from, to);
      const end = Math.max(from, to);
      for (let value = start; value <= end; value += 1) {
        const index = value - 1;
        if (index >= 0 && index < chars.length) indexes.add(index);
      }
      continue;
    }

    const single = parsePositiveInt(part);
    if (!single) continue;
    const index = single - 1;
    if (index >= 0 && index < chars.length) indexes.add(index);
  }

  return indexes;
}

function collectIndexesByLetters(chars: string[], expression: string): Set<number> {
  const cleaned = expression.replace(/[,\s;]+/g, "");
  const requested = new Set(Array.from(cleaned.toLowerCase()).filter(Boolean));
  const indexes = new Set<number>();
  if (!requested.size) return indexes;

  chars.forEach((char, idx) => {
    if (requested.has(char.toLowerCase())) indexes.add(idx);
  });

  return indexes;
}

/** Bare numeric rules like `1,6` or `2-5` must never fall back to letter matching. */
export function looksLikeIndexRule(rule: string): boolean {
  const trimmed = rule.trim();
  if (!trimmed) return false;
  if (/^(indexes|step)\s*:/i.test(trimmed)) return true;
  return /^[\d\s,\-;]+$/.test(trimmed) && /\d/.test(trimmed);
}

export function collectHighlightIndexes(brandName: string, rawRule: string): Set<number> {
  const chars = Array.from(brandName);
  const rule = rawRule.trim();

  if (!chars.length || !rule) return new Set<number>();

  const separator = rule.indexOf(":");
  if (separator > 0) {
    const mode = rule.slice(0, separator).trim().toLowerCase();
    const value = rule.slice(separator + 1).trim();
    if (!value) return new Set<number>();

    if (mode === "letters") return collectIndexesByLetters(chars, value);
    if (mode === "indexes") return collectIndexesFromExpression(chars, value);
    if (mode === "step") {
      const indexes = new Set<number>();
      const step = parsePositiveInt(value);
      if (!step) return indexes;
      for (let i = step - 1; i < chars.length; i += step) {
        indexes.add(i);
      }
      return indexes;
    }
  }

  if (looksLikeIndexRule(rule)) {
    return collectIndexesFromExpression(chars, rule);
  }

  const byIndexes = collectIndexesFromExpression(chars, rule);
  if (byIndexes.size > 0) return byIndexes;

  return collectIndexesByLetters(chars, rule);
}
