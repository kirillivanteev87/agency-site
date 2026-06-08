/** Разбивает текст по переводам строк (из textarea в админке). */
export function splitTextLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").split("\n");
}

/** Для live-превью в iframe: textContent не сохраняет <br>. */
export function applyLineBreaksToElement(el: HTMLElement, text: string) {
  el.replaceChildren();
  const lines = splitTextLines(text);
  lines.forEach((line, index) => {
    if (index > 0) el.appendChild(document.createElement("br"));
    el.appendChild(document.createTextNode(line));
  });
}
