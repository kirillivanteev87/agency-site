import type { CSSProperties, ReactNode } from "react";
import { collectHighlightIndexes } from "@/lib/brand-highlight";

type BrandLogoProps = {
  brandName: string;
  highlightText?: string;
  highlightColor?: string;
  className?: string;
  dataContentField?: string;
};

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeHexColor(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  return HEX_COLOR_RE.test(trimmed) ? trimmed : null;
}

function renderHighlightedByIndexes(
  text: string,
  highlightIndexes: Set<number>,
  color: string | null,
) {
  const chars = Array.from(text);
  const result: ReactNode[] = [];
  let i = 0;

  while (i < chars.length) {
    const active = highlightIndexes.has(i);
    const start = i;
    i += 1;
    while (i < chars.length && highlightIndexes.has(i) === active) {
      i += 1;
    }
    const part = chars.slice(start, i).join("");
    if (!part) continue;
    if (active) {
      const style: CSSProperties | undefined = color ? { color } : undefined;
      result.push(
        <span key={`${start}-${i}`} className={!color ? "text-accent" : undefined} style={style}>
          {part}
        </span>,
      );
      continue;
    }
    result.push(<span key={`${start}-${i}`}>{part}</span>);
  }

  return result;
}

export function BrandLogo({
  brandName,
  highlightText,
  highlightColor,
  className,
  dataContentField,
}: BrandLogoProps) {
  const name = brandName || "";
  const customHighlight = (highlightText ?? "").trim();
  const color = sanitizeHexColor(highlightColor);
  const highlightIndexes = collectHighlightIndexes(name, customHighlight);

  if (highlightIndexes.size > 0) {
    return (
      <span data-content-field={dataContentField} className={className}>
        {renderHighlightedByIndexes(name, highlightIndexes, color)}
      </span>
    );
  }

  if (customHighlight) {
    return (
      <span data-content-field={dataContentField} className={className}>
        {name}
      </span>
    );
  }

  return (
    <span data-content-field={dataContentField} className={className}>
      <span className="text-accent">{name.slice(0, 3)}</span>
      {name.slice(3)}
    </span>
  );
}
