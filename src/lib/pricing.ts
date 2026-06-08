import type { PricingPlan } from "@prisma/client";
import { parseJsonArray } from "./parse-json";

export type PricingPlanView = {
  id: number;
  name: string;
  eyebrow: string;
  summary: string;
  audienceLabel: string;
  outcomeText: string;
  price: string;
  features: string[];
  featured: boolean;
  badgeLabel: string;
  sortOrder: number;
};

export function mapPricingPlan(plan: PricingPlan): PricingPlanView {
  return {
    id: plan.id,
    name: plan.name,
    eyebrow: plan.eyebrow,
    summary: plan.summary,
    audienceLabel: plan.audienceLabel,
    outcomeText: plan.outcomeText,
    price: plan.price,
    features: parseJsonArray<string>(plan.features, []).filter(Boolean),
    featured: plan.featured,
    badgeLabel: plan.badgeLabel,
    sortOrder: plan.sortOrder,
  };
}

export function getPlanBadgeLabel(plan: Pick<PricingPlanView, "featured" | "badgeLabel">) {
  if (!plan.featured) return null;
  const label = plan.badgeLabel.trim();
  return label || "Популярный выбор";
}
