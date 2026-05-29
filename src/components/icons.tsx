import {
  ChartColumn,
  Code2,
  Headphones,
  Layout,
  Palette,
  Search,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  palette: Palette,
  code: Code2,
  sparkles: Sparkles,
  search: Search,
  headphones: Headphones,
  chart: ChartColumn,
  layout: Layout,
  server: Server,
  smartphone: Smartphone,
  shield: Shield,
};

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || Sparkles;
  return <Icon className={className} size={28} strokeWidth={1.5} />;
}
