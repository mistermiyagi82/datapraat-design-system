import type { JSX } from "react";

// Verbatim port of shared.jsx:TrustBadge (lines 40-47).
// Tier formula: score >= 90 → good, >= 70 → warn, otherwise bad (D-08, product semantics — not configurable).

type Tier = "good" | "warn" | "bad";

function tierFor(score: number): Tier {
  if (score >= 90) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

export interface TrustBadgeProps {
  score: number;
  onClick?: () => void;
  size?: "sm"; // only "sm" in v1 per D-08
}

export function TrustBadge({ score, onClick, size = "sm" }: TrustBadgeProps): JSX.Element {
  const tier = tierFor(score);
  return (
    <span
      className={`trust ${tier}`}
      data-size={size}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      role={onClick ? "button" : undefined}
    >
      <span className="trust-dot" /> {score}%
    </span>
  );
}
