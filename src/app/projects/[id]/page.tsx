import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectLandingPage } from "@/components/ProjectLandingPage";
import { getProjectLanding, getSiteContent } from "@/lib/site-data";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectLanding(Number(id));
  if (!project) return { title: "Проект не найден" };
  return {
    title: `${project.title} — REDLINE`,
    description: project.description.slice(0, 160),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const [project, content] = await Promise.all([getProjectLanding(Number(id)), getSiteContent()]);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <ProjectLandingPage data={project} buttonLabels={content.settings.buttonLabels} />
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
