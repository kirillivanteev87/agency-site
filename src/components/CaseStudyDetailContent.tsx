"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { DetailMediaGallery } from "./DetailMediaGallery";
import { DEFAULT_BUTTON_LABELS } from "@/lib/button-labels";
import { buildDetailPhotos } from "@/lib/project-gallery";
import type { ButtonLabels } from "@/lib/site-data";
import type { CaseStudy } from "@prisma/client";

function externalHref(link: string | null) {
  if (!link || link === "#" || link.startsWith("#")) return null;
  return link;
}

export type CaseStudyView = CaseStudy & { metrics: string[] };

export function CaseStudyDetailContent({
  data,
  mode,
  buttonLabels = DEFAULT_BUTTON_LABELS,
}: {
  data: CaseStudyView;
  mode: "modal" | "page";
  buttonLabels?: ButtonLabels;
}) {
  const btn = buttonLabels;
  const body = (data.body ?? "").trim();
  const photos = useMemo(
    () => buildDetailPhotos(data.imageUrl ?? "", data.gallery ?? "[]"),
    [data.imageUrl, data.gallery],
  );
  const external = externalHref(data.link);

  return (
    <div className="space-y-6">
      {mode === "page" && (
        <Link
          href="/#cases"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} />
          Назад к кейсам
        </Link>
      )}

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-10">
        <DetailMediaGallery photos={photos} alt={data.title} resetKey={data.id} />

        <div className="flex min-h-[min(50vh,480px)] flex-col gap-5 lg:min-h-[min(60vh,560px)]">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">{data.tag}</p>
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">{data.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{data.description}</p>
          </div>

          {data.metrics.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {data.metrics.map((metric) => (
                <li
                  key={metric}
                  className="rounded-full border border-[var(--accent)]/30 bg-[rgba(225,29,72,0.08)] px-3 py-1 text-sm font-medium text-accent"
                >
                  {metric}
                </li>
              ))}
            </ul>
          )}

          {body ? (
            <div className="flex-1 whitespace-pre-wrap leading-relaxed text-[var(--text-muted)]">{body}</div>
          ) : (
            <p className="flex-1 text-sm text-[var(--text-muted)]">
              Подробное описание можно добавить в админке в поле{" "}
              <strong className="text-[var(--text)]">Подробное описание (модалка / страница)</strong>.
            </p>
          )}

          <div className="mt-auto flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap">
            <a href="/#contact" className="btn-primary inline-flex justify-center" data-button-field="caseDetailPrimary">
              {btn.caseDetailPrimary}
            </a>
            {external && (
              <a
                href={external}
                className="btn-outline inline-flex justify-center"
                target="_blank"
                rel="noreferrer"
                data-button-field="caseDetailSecondary"
              >
                {btn.caseDetailSecondary}
                <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
