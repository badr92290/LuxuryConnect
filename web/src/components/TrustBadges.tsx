import React from "react";
import { IconShield, IconCrown, IconSparkle } from "./icons";

export function TrustBadges({
  isInsured,
  isCertified,
  yearsExperience,
  size = "default",
}: {
  isInsured?: boolean;
  isCertified?: boolean;
  yearsExperience?: number | null;
  size?: "default" | "small";
}) {
  const badges: { label: string; icon: React.ComponentType<{ className?: string }> }[] = [];
  if (isInsured) badges.push({ label: "Assuré", icon: IconShield });
  if (isCertified) badges.push({ label: "Certifié", icon: IconCrown });
  if (yearsExperience) badges.push({ label: `${yearsExperience} ans d'expérience`, icon: IconSparkle });

  if (badges.length === 0) return null;

  const compact = size === "small";

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(({ label, icon: Icon }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 font-semibold text-gold-200 ${
            compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
          }`}
        >
          <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {label}
        </span>
      ))}
    </div>
  );
}
