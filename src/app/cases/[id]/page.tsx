import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyLandingPage } from "@/components/CaseStudyLandingPage";
import { getCaseStudyLanding, getSiteContent } from "@/lib/site-data";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getCaseStudyLanding(Number(id));
  if (!data) return { title: "Кейс не найден" };
  return {
    title: `${data.title} — QNOX`,
    description: data.description.slice(0, 160),
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { id } = await params;
  const [data, content] = await Promise.all([
    getCaseStudyLanding(Number(id)),
    getSiteContent(),
  ]);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <CaseStudyLandingPage data={data} buttonLabels={content.settings.buttonLabels} />
      <footer className="case-page-footer">
        <div className="case-landing__inner flex flex-col gap-4 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>{content.settings.footerCopyright}</p>
          <a href="/#contact" className="font-medium text-accent transition-opacity hover:opacity-80">
            Обсудить проект →
          </a>
        </div>
      </footer>
    </main>
  );
}
