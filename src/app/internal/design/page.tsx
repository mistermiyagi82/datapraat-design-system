// src/app/internal/design/page.tsx — Living-reference page for the DataPraat design system.
// Server component. The interactive shadcn primitives (Dialog/DropdownMenu/Tabs/Tooltip/Sonner)
// live in a single `client-preview.tsx` island; everything else is server-rendered.
import { AskButton, Icon, type IconName, TrustBadge } from "@/components/design";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fmtCompact, fmtEUR, fmtNum, fmtPercent } from "@/lib/format";
import { ClientPreview } from "./client-preview";

// Hand-typed swatch metadata — duplicates :root for inspection.
// Source of truth: src/app/globals.css. The next-phase change-detector compares this array vs globals.css.
const TOKENS = [
  {
    group: "Neutrals",
    entries: [
      { name: "--bg", hex: "#FCFBF8" },
      { name: "--bg-soft", hex: "#F3F2EE" },
      { name: "--surface", hex: "#FFFFFF" },
      { name: "--surface-raised", hex: "#FFFFFF" },
    ],
  },
  {
    group: "Ink",
    entries: [
      { name: "--ink", hex: "#2A2724" },
      { name: "--ink-soft", hex: "#5E5A53" },
      { name: "--ink-mute", hex: "#8F8A80" },
      { name: "--ink-faint", hex: "#B3ADA3" },
    ],
  },
  {
    group: "Lines",
    entries: [
      { name: "--line", hex: "#E5E3DD" },
      { name: "--line-soft", hex: "#EEECE7" },
      { name: "--line-strong", hex: "#D4D1CB" },
    ],
  },
  {
    group: "Brand",
    entries: [
      { name: "--primary", hex: "#4338CA" },
      { name: "--primary-soft", hex: "#6366F1" },
      { name: "--primary-tint", hex: "#EEF2FF" },
      { name: "--primary-ink", hex: "#3151B0" },
      { name: "--primary-foreground", hex: "#FAF7EF" },
    ],
  },
  {
    group: "Charts (PxQ)",
    entries: [
      { name: "--chart-cost", hex: "#3b82f6" },
      { name: "--chart-volume", hex: "#5E8A6D" },
      { name: "--chart-price", hex: "#ea580c" },
      { name: "--chart-1", hex: "#3151B0" },
      { name: "--chart-2", hex: "#3b82f6" },
      { name: "--chart-3", hex: "#60a5fa" },
      { name: "--chart-4", hex: "#93c5fd" },
      { name: "--chart-5", hex: "#bfdbfe" },
    ],
  },
  {
    group: "Status",
    entries: [
      { name: "--success", hex: "#5E8A6D" },
      { name: "--success-tint", hex: "#E5EDDF" },
      { name: "--success-strong", hex: "#3D5C4A" },
      { name: "--warning", hex: "#A8702A" },
      { name: "--warning-tint", hex: "#F4ECD4" },
      { name: "--warning-strong", hex: "#8A5A26" },
      { name: "--destructive", hex: "#A85050" },
      { name: "--destructive-tint", hex: "#F2DDDA" },
      { name: "--destructive-strong", hex: "#7A2A2A" },
    ],
  },
  {
    group: "Gold",
    entries: [
      { name: "--gold", hex: "#A8702A" },
      { name: "--gold-tint", hex: "#F4ECD4" },
    ],
  },
] as const;

// All 24 IconName values per Plan 03 D-07.
const ICON_NAMES: IconName[] = [
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

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">DataPraat — Design System</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--ink-mute)" }}>
        Internal reference — link from team docs only. Verkenning van tokens, typografie, en
        primitives.
      </p>
      <Separator className="my-8" />

      {/* Section 1: Tokens & Colors */}
      <section id="tokens" className="space-y-6">
        <h2 className="text-lg font-semibold">Tokens & Colors</h2>
        {TOKENS.map((group) => (
          <div key={group.group}>
            <h3
              className="mb-3 text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--ink-mute)" }}
            >
              {group.group}
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {group.entries.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center gap-3 rounded-md border p-3"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div
                    className="h-10 w-10 rounded border"
                    style={{ backgroundColor: t.hex, borderColor: "var(--line-strong)" }}
                  />
                  <div className="font-mono text-xs">
                    <div>{t.name}</div>
                    <div style={{ color: "var(--ink-mute)" }}>{t.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Separator className="my-12" />

      {/* Section 2: Typography */}
      <section id="typography" className="space-y-4">
        <h2 className="text-lg font-semibold">Typography</h2>
        <div className="space-y-3">
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "24px",
              fontWeight: 600,
              letterSpacing: "-0.015em",
            }}
          >
            Page title — Inter 24/600/-0.015em
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "28px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            € 7.200.000 — KPI value 28/600 tabular-nums
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: 600 }}>
            Card title — Inter 14/600
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.5 }}>
            Body text — Inter 14/1.5 — Praat met je gemeentedata in eenvoudig Nederlands.
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Section label — Inter 11/500 uppercase 0.08em
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              color: "var(--ink-mute)",
            }}
          >
            Caption / meta — 12 / ink-mute
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              fontWeight: 500,
              fontVariationSettings: '"opsz" 32',
            }}
          >
            Fraunces display — opsz 32 / 500 (verhaal mode reference)
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            JetBrains Mono — 13px tabular-nums for numeric inspectors
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Section 3: Custom primitives */}
      <section id="custom" className="space-y-6">
        <h2 className="text-lg font-semibold">Custom primitives</h2>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Icon — 24 names
          </h3>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {ICON_NAMES.map((n) => (
              <div
                key={n}
                className="flex flex-col items-center gap-2 rounded-md border p-3"
                style={{ borderColor: "var(--line)" }}
              >
                <Icon name={n} size={20} />
                <span className="font-mono text-[11px]" style={{ color: "var(--ink-mute)" }}>
                  {n}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            TrustBadge — tier 95 / 80 / 60
          </h3>
          <div className="flex items-center gap-3">
            <TrustBadge score={95} />
            <TrustBadge score={80} />
            <TrustBadge score={60} />
          </div>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            AskButton — sm / md / lg
          </h3>
          <div className="flex items-center gap-3">
            <AskButton size="sm" />
            <AskButton size="md" />
            <AskButton size="lg" />
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Section 4: shadcn primitives */}
      <section id="shadcn" className="space-y-6">
        <h2 className="text-lg font-semibold">shadcn primitives (base-vega)</h2>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Button — variants
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>default</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="outline">outline</Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="destructive">destructive</Button>
            <Button variant="link">link</Button>
          </div>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Button — sizes
          </h3>
          <div className="flex items-center gap-3">
            <Button size="sm">sm</Button>
            <Button>md (default)</Button>
            <Button size="lg">lg</Button>
            <Button size="icon" aria-label="zoeken">
              <Icon name="search" />
            </Button>
          </div>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Card
          </h3>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Voorbeeldkaart</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                Card consumes --card / --card-foreground from globals.css aliases.
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Input
          </h3>
          <Input className="max-w-md" placeholder="Stel je vraag…" />
        </div>

        <ClientPreview />
      </section>

      <Separator className="my-12" />

      {/* Section 5: Trust mark legend */}
      <section id="trust" className="space-y-4">
        <h2 className="text-lg font-semibold">Trust mark legend</h2>
        <div className="space-y-2 text-sm">
          <p>
            Trust marks geven aan hoe betrouwbaar een datapunt of bron is. De score is een
            percentage 0–100.
          </p>
          <ul className="list-inside list-disc space-y-1" style={{ color: "var(--ink-soft)" }}>
            <li>
              <strong>≥ 90 — good</strong>: bron is geverifieerd, recent, en consistent met andere
              bronnen.
            </li>
            <li>
              <strong>≥ 70 — warn</strong>: bron is bruikbaar maar één signaal ontbreekt of is
              verouderd.
            </li>
            <li>
              <strong>&lt; 70 — bad</strong>: bron heeft serieuze validatieproblemen; resultaten met
              voorzichtigheid lezen.
            </li>
          </ul>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Section 6: Format helpers */}
      <section id="format" className="space-y-4">
        <h2 className="text-lg font-semibold">Format helpers (nl-NL)</h2>
        <table className="w-full max-w-2xl border-collapse text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--line)" }}>
              <th className="py-2 text-left font-mono text-xs">Call</th>
              <th className="py-2 text-left font-mono text-xs">Output</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            <tr className="border-b" style={{ borderColor: "var(--line-soft)" }}>
              <td className="py-2">fmtEUR(7_200_000)</td>
              <td className="py-2 tabular-nums">{fmtEUR(7_200_000)}</td>
            </tr>
            <tr className="border-b" style={{ borderColor: "var(--line-soft)" }}>
              <td className="py-2">fmtNum(28_400)</td>
              <td className="py-2 tabular-nums">{fmtNum(28_400)}</td>
            </tr>
            <tr className="border-b" style={{ borderColor: "var(--line-soft)" }}>
              <td className="py-2">fmtPercent(0.85)</td>
              <td className="py-2 tabular-nums">{fmtPercent(0.85)}</td>
            </tr>
            <tr>
              <td className="py-2">fmtCompact(7_200_000)</td>
              <td className="py-2 tabular-nums">{fmtCompact(7_200_000)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
