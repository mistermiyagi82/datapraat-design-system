import type { JSX, SVGProps } from "react";

export type IconName =
  | "overzicht"
  | "prognose"
  | "validatie"
  | "benchmark"
  | "verwijzers"
  | "lineage"
  | "glossary"
  | "regels"
  | "plus"
  | "chevron"
  | "close"
  | "send"
  | "search"
  | "info"
  | "arrow"
  | "back"
  | "sparkle"
  | "pin"
  | "bolt"
  | "more"
  | "chat"
  | "export"
  | "copy"
  | "check";

// Verbatim port of shared.jsx:Icon (lines 6-31). 24 hand-rolled 16x16 stroke icons.
// Do NOT optimise the SVG markup — visual fidelity with the prototype is the contract (D-07).
const paths: Record<IconName, JSX.Element> = {
  overzicht: (
    <g>
      <rect x="2.5" y="2.5" width="5" height="5" rx="1" />
      <rect x="8.5" y="2.5" width="5" height="5" rx="1" />
      <rect x="2.5" y="8.5" width="5" height="5" rx="1" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="1" />
    </g>
  ),
  prognose: (
    <g>
      <path d="M2 13 L6 9 L9 11 L14 4" />
      <path d="M11 4 L14 4 L14 7" />
    </g>
  ),
  validatie: (
    <g>
      <path d="M8 2 L13 4 V8 C13 10.5 11 12.5 8 14 C5 12.5 3 10.5 3 8 V4 Z" />
      <path d="M6 8 L7.5 9.5 L10 7" />
    </g>
  ),
  benchmark: (
    <g>
      <rect x="2.5" y="9" width="3" height="5" rx="0.5" />
      <rect x="6.5" y="5" width="3" height="9" rx="0.5" />
      <rect x="10.5" y="7" width="3" height="7" rx="0.5" />
    </g>
  ),
  verwijzers: (
    <g>
      <circle cx="3.5" cy="3.5" r="1.5" />
      <circle cx="3.5" cy="12.5" r="1.5" />
      <circle cx="12.5" cy="8" r="1.5" />
      <path d="M5 3.5 H9 C10 3.5 11 4.5 11 8" />
      <path d="M5 12.5 H9 C10 12.5 11 11.5 11 8" />
    </g>
  ),
  lineage: (
    <g>
      <circle cx="3" cy="3" r="1.2" />
      <circle cx="3" cy="13" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="13" cy="8" r="1.2" />
      <path d="M4 3.5 L7 7" />
      <path d="M4 12.5 L7 9" />
      <path d="M9 8 H12" />
    </g>
  ),
  glossary: (
    <g>
      <path d="M3 3 H7 C7.5 3 8 3.5 8 4 V13 C8 12.5 7.5 12 7 12 H3 Z" />
      <path d="M13 3 H9 C8.5 3 8 3.5 8 4 V13 C8 12.5 8.5 12 9 12 H13 Z" />
    </g>
  ),
  regels: (
    <g>
      <rect x="3" y="2.5" width="10" height="11" rx="1" />
      <path d="M5.5 6 L7 7.5 L10.5 4.5" />
      <path d="M5.5 10.5 H10.5" />
    </g>
  ),
  plus: (
    <g>
      <path d="M8 3 V13 M3 8 H13" />
    </g>
  ),
  chevron: (
    <g>
      <path d="M5 6 L8 9 L11 6" />
    </g>
  ),
  close: (
    <g>
      <path d="M4 4 L12 12 M12 4 L4 12" />
    </g>
  ),
  send: (
    <g>
      <path d="M3 8 L13 3 L10 13 L8 9 Z" />
    </g>
  ),
  search: (
    <g>
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10 L13 13" />
    </g>
  ),
  info: (
    <g>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7 V11 M8 5 V5.5" />
    </g>
  ),
  arrow: (
    <g>
      <path d="M3 8 H13 M10 5 L13 8 L10 11" />
    </g>
  ),
  back: (
    <g>
      <path d="M13 8 H3 M6 5 L3 8 L6 11" />
    </g>
  ),
  sparkle: (
    <g>
      <path d="M8 2 L9 6 L13 7 L9 8 L8 12 L7 8 L3 7 L7 6 Z" />
    </g>
  ),
  pin: (
    <g>
      <path d="M8 2 V6 L10 8 H6 L8 6 M8 8 V14" />
    </g>
  ),
  bolt: (
    <g>
      <path d="M9 2 L4 9 H7 L6 14 L11 7 H8 Z" />
    </g>
  ),
  more: (
    <g>
      <circle cx="4" cy="8" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="12" cy="8" r="1" />
    </g>
  ),
  chat: (
    <g>
      <path d="M2.5 4 C2.5 3 3 2.5 4 2.5 H12 C13 2.5 13.5 3 13.5 4 V10 C13.5 11 13 11.5 12 11.5 H7 L4 14 V11.5 C3 11.5 2.5 11 2.5 10 Z" />
    </g>
  ),
  export: (
    <g>
      <path d="M8 2 V10 M5 7 L8 10 L11 7" />
      <path d="M3 12 V13 H13 V12" />
    </g>
  ),
  copy: (
    <g>
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M3 10 V4 C3 3.5 3.5 3 4 3 H10" />
    </g>
  ),
  check: (
    <g>
      <path d="M3 8 L7 12 L13 4" />
    </g>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
