"use client";

import { useEffect, useState } from "react";
import type { ButtonLabels } from "@/lib/site-data";
import type { Project } from "@prisma/client";
import { ProjectDetailContent } from "./ProjectDetailContent";

export function ProjectModalBody({
  projectId,
  buttonLabels,
}: {
  projectId: number;
  buttonLabels?: ButtonLabels;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProject(null);
    setError(false);
    fetch(`/api/public/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<Project>;
      })
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) {
    return <p className="text-sm text-red-400">Не удалось загрузить проект.</p>;
  }
  if (!project) {
    return <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>;
  }

  return <ProjectDetailContent project={project} mode="modal" buttonLabels={buttonLabels} />;
}
