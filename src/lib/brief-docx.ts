import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { parseBriefMessage } from "@/lib/brief-submission";

function formatDateRu(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function briefDocxFilename(name: string, createdAt: Date): string {
  const safe =
    name
      .trim()
      .replace(/[^\p{L}\p{N}._-]+/gu, "_")
      .replace(/_+/g, "_")
      .slice(0, 48) || "klient";
  const d = createdAt.toISOString().slice(0, 10);
  return `Brief_${safe}_${d}.docx`;
}

export async function buildBriefDocxBuffer(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
}): Promise<Buffer> {
  const sections = parseBriefMessage(input.message);
  const dateStr = formatDateRu(input.createdAt);

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: "Бриф на разработку сайта / приложения",
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: `Дата заявки: ${dateStr}`, italics: true })],
    }),
    new Paragraph({ children: [] }),
  ];

  if (sections.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: input.message })],
      }),
    );
  } else {
    for (const section of sections) {
      if (!section.lines.length) continue;

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: section.title, bold: true })],
        }),
      );

      for (const line of section.lines) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line })],
            spacing: { after: 120 },
          }),
        );
      }

      children.push(new Paragraph({ children: [] }));
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
