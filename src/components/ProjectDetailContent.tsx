"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { DetailMediaGallery } from "./DetailMediaGallery";
import { DEFAULT_BUTTON_LABELS } from "@/lib/button-labels";
import { buildDetailPhotos } from "@/lib/project-gallery";
import type { ButtonLabels } from "@/lib/site-data";
import type { Project } from "@prisma/client";

function externalHref(link: string | null) {
  if (!link || link === "#" || link.startsWith("#")) return null;
  return link;
}

export function ProjectDetailContent({
  project,
  mode,
  buttonLabels = DEFAULT_BUTTON_LABELS,
}: {
  project: Project;
  mode: "modal" | "page";
  buttonLabels?: ButtonLabels;
}) {
  const btn = buttonLabels;
  const body = (project.body ?? "").trim();
  const photos = useMemo(
    () => buildDetailPhotos(project.imageUrl ?? "", project.gallery ?? "[]"),
    [project.imageUrl, project.gallery],
  );
  const external = externalHref(project.link);

  return (
    <div className="space-y-6">
      {mode === "page" && (
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} />
          Назад к портфолио
        </Link>
      )}

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-10">
        <DetailMediaGallery photos={photos} alt={project.title} resetKey={project.id} />

        <div className="flex min-h-[min(50vh,480px)] flex-col gap-5 lg:min-h-[min(60vh,560px)]">
          <div>
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">{project.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{project.description}</p>
          </div>

          {body ? (
            <div className="flex-1 whitespace-pre-wrap leading-relaxed text-[var(--text-muted)]">{body}</div>
          ) : (
            <p className="flex-1 text-sm text-[var(--text-muted)]">
              Подробное описание можно добавить в админке в поле{" "}
              <strong className="text-[var(--text)]">Подробное описание (модалка / страница)</strong>.
            </p>
          )}

          <div className="mt-auto flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap">
            <a href="/#contact" className="btn-primary inline-flex justify-center" data-button-field="projectDetailPrimary">
              {btn.projectDetailPrimary}
            </a>
            {external && (
              <a
                href={external}
                className="btn-outline inline-flex justify-center"
                target="_blank"
                rel="noreferrer"
                data-button-field="projectDetailSecondary"
              >
                {btn.projectDetailSecondary}
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
