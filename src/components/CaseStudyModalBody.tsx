"use client";

import { useEffect, useState } from "react";
import type { ButtonLabels } from "@/lib/site-data";
import { CaseStudyDetailContent, type CaseStudyView } from "./CaseStudyDetailContent";

export function CaseStudyModalBody({
  caseStudyId,
  buttonLabels,
}: {
  caseStudyId: number;
  buttonLabels?: ButtonLabels;
}) {
  const [data, setData] = useState<CaseStudyView | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);
    fetch(`/api/public/case-studies/${caseStudyId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<CaseStudyView>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [caseStudyId]);

  if (error) {
    return <p className="text-sm text-red-400">Не удалось загрузить кейс.</p>;
  }
  if (!data) {
    return <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>;
  }

  return <CaseStudyDetailContent data={data} mode="modal" buttonLabels={buttonLabels} />;
}
