"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { DynamicIcon } from "./icons";
import { HeroHighlightBlock } from "./HeroHighlightBlock";
import { HeroMosaicCornerGlow } from "./HeroMosaicCornerGlow";
import type { HeroFeature } from "@prisma/client";
import type { SiteContent } from "./types";
import { useSkipEntranceMotion } from "@/lib/skip-entrance-motion";

const MOSAIC_SIDE_TITLE_ORDER = ["UI/UX", "Разработка", "Брендинг", "SEO"] as const;

const TRUST_ITEMS = [
  "Бесплатный разбор задачи",
  "Смета за 20 минут",
  "Фиксированная цена в договоре",
  "Ответ менеджера за 2 часа",
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const trustItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.55 + index * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function sideFeaturesForMosaicGrid(all: HeroFeature[], mainId: number | undefined): HeroFeature[] {
  const side = all.filter((f) => f.id !== mainId);
  const rank = (title: string) => {
    const i = (MOSAIC_SIDE_TITLE_ORDER as readonly string[]).indexOf(title);
    return i === -1 ? 100 + title.charCodeAt(0) : i;
  };
  return [...side]
    .sort((a, b) => {
      const d = rank(a.title) - rank(b.title);
      if (d !== 0) return d;
      return a.sortOrder - b.sortOrder;
    })
    .slice(0, 4);
}

type MotionCardProps = {
  index: number;
  className?: string;
  children: ReactNode;
  hoverScale?: number;
};

function MotionCard({
  index,
  className = "",
  children,
  hoverScale = 1.02,
  skipEntrance,
}: MotionCardProps & { skipEntrance: boolean }) {
  return (
    <motion.div
      className={`relative min-h-0 overflow-hidden rounded-[var(--radius)] ${className}`.trim()}
      custom={index}
      initial={skipEntrance ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -6% 0px" }}
      variants={cardVariants}
      whileHover={hoverScale > 1 ? { scale: hoverScale } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      <motion.div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">{children}</motion.div>
    </motion.div>
  );
}

export function Dashboard({ heroFeatures }: Pick<SiteContent, "heroFeatures">) {
  const skipEntrance = useSkipEntranceMotion();
  const main = heroFeatures.find((f) => f.variant === "image") || heroFeatures[4];
  const sideFeatures = sideFeaturesForMosaicGrid(heroFeatures, main?.id);

  return (
    <div>
      <motion.div className="hero-mosaic grid gap-4">
        <MotionCard
          index={0}
          className="hero-mosaic-main h-full min-h-0 w-full"
          hoverScale={1}
          skipEntrance={skipEntrance}
        >
          <HeroHighlightBlock imageUrl={main?.imageUrl} />
        </MotionCard>

        {sideFeatures.map((feature, index) => (
          <MotionCard
            key={feature.id}
            index={index + 1}
            className="hero-mosaic-cell h-full min-h-0 w-full"
            hoverScale={1}
            skipEntrance={skipEntrance}
          >
            <motion.div className="card-surface relative flex h-full min-h-0 flex-col justify-between overflow-hidden p-5">
              <HeroMosaicCornerGlow variant="cell" />
              <div className="hero-mosaic-cell-shade pointer-events-none absolute inset-0 z-[1]" aria-hidden />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <DynamicIcon name={feature.icon} className="shrink-0 text-accent" />
                <div className="mt-4">
                  <h3 className="font-semibold">{feature.title}</h3>
                  {feature.subtitle && (
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{feature.subtitle}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </MotionCard>
        ))}
      </motion.div>

      <motion.ul
        className="card-surface card-surface--flat mt-8 flex flex-wrap gap-x-6 gap-y-3 px-4 py-4 sm:gap-x-8 sm:px-6 sm:py-5"
        aria-label="Преимущества работы со студией"
        initial={skipEntrance ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {TRUST_ITEMS.map((item, index) => (
          <motion.li
            key={item}
            custom={index}
            variants={trustItemVariants}
            className="flex min-w-0 max-w-full cursor-default items-center gap-2 text-sm text-[var(--text-muted)]"
          >
            <CheckCircle2 size={16} className="shrink-0 text-accent" aria-hidden />
            <span>{item}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
