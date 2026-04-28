"use client";

import type { JSX, MouseEvent } from "react";

// Verbatim port of shared.jsx:AskButton (lines 51-59).
// Default Dutch label "Vraag hierover" is the product voice (D-09) — never English.
// Rule-3 fix vs prototype: explicit type="button" prevents accidental form submission
// when nested in <form>. The prototype omitted `type` and inherited submit-by-default.

export interface AskButtonProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AskButton({
  onClick,
  label = "Vraag hierover",
  size = "md",
  className = "",
}: AskButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={`ask-btn ask-btn-${size} ${className}`.trim()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <span className="orb" aria-hidden="true" />
      <span className="ask-btn-label">{label}</span>
    </button>
  );
}
