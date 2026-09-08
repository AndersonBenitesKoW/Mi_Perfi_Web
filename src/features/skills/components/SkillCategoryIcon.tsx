import { Cloud, Database, Layers, Network, Server, Wrench } from "lucide-react";
import type { SkillCategoryIcon as SkillCategoryIconName } from "@/content/types";

const CATEGORY_ICONS = {
  frontend: Layers,
  backend: Server,
  database: Database,
  devops: Cloud,
  networking: Network,
  tooling: Wrench,
} as const satisfies Record<SkillCategoryIconName, unknown>;

interface SkillCategoryIconProps {
  icon: SkillCategoryIconName;
  className?: string;
}

export function SkillCategoryIcon({ icon, className }: SkillCategoryIconProps) {
  const Icon = CATEGORY_ICONS[icon];

  return <Icon className={className} aria-hidden />;
}
