"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DynamicIcon } from "./icons";
import { SiteImage } from "./SiteImage";
import { parseJsonArray } from "@/lib/parse-json";
import type { MarketplaceApp } from "@prisma/client";

type Props = {
  app: MarketplaceApp;
  index: number;
  subscribeLabel: string;
};

export function MarketplaceProductCard({ app, index, subscribeLabel }: Props) {
  const features = parseJsonArray<string>(app.features, []).slice(0, 4);
  const contactHref = `/#contact?product=${encodeURIComponent(app.title)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="card-surface card-interactive group relative flex h-full flex-col overflow-hidden"
    >
      {app.featured ? (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-semibold text-white">
          Рекомендуем
        </span>
      ) : null}

      <motion.div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--input-bg)]">
        {app.imageUrl ? (
          <SiteImage
            src={app.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1c1218] to-[#241018]"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
        {app.badge ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {app.badge}
          </span>
        ) : null}
      </motion.div>

      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[calc(var(--radius)-4px)] border border-[var(--border)] bg-[var(--bg)]">
            <DynamicIcon name={app.icon} className="h-5 w-5 text-accent" />
          </span>
          <motion.div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold leading-snug">{app.title}</h3>
            <p className="mt-1 text-sm font-semibold text-accent">{app.priceLabel}</p>
          </motion.div>
        </div>

        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{app.description}</p>

        {features.length > 0 ? (
          <ul className="space-y-2 border-t border-[var(--border)]/80 pt-4">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2 text-sm text-[var(--text-muted)]">
                <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href={contactHref}
          className="btn-primary mt-auto w-full justify-center text-sm"
          data-button-field="marketplaceSubscribe"
        >
          {subscribeLabel}
        </Link>
      </div>
    </motion.article>
  );
}
