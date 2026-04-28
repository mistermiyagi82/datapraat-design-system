import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon, type IconName } from "./Icon";

const NAMES: IconName[] = [
  "overzicht",
  "prognose",
  "validatie",
  "benchmark",
  "verwijzers",
  "lineage",
  "glossary",
  "regels",
  "plus",
  "chevron",
  "close",
  "send",
  "search",
  "info",
  "arrow",
  "back",
  "sparkle",
  "pin",
  "bolt",
  "more",
  "chat",
  "export",
  "copy",
  "check",
];

describe("Icon", () => {
  it("renders every IconName as an svg with viewBox 0 0 16 16 and stroke=currentColor", () => {
    for (const name of NAMES) {
      const { container, unmount } = render(<Icon name={name} />);
      const svg = container.querySelector("svg");
      expect(svg, `expected svg for ${name}`).not.toBeNull();
      expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
      expect(svg).toHaveAttribute("stroke", "currentColor");
      unmount();
    }
  });

  it("defaults to size 16 (width/height = 16)", () => {
    const { container } = render(<Icon name="overzicht" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("respects an explicit size prop", () => {
    const { container } = render(<Icon name="overzicht" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });
});
