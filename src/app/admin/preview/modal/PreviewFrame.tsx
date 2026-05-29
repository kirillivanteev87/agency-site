"use client";

export function AdminModalPreviewFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-black/85 p-3">
      <div className="relative mt-2 flex max-h-[min(92vh,920px)] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-6">
          <p className="text-sm text-[var(--text-muted)]">{title}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 md:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
