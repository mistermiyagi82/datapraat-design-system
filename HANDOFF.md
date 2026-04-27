# DataPraat — Handoff naar productie

> **Prompt voor Claude Code** (plak dit bovenaan je eerste sessie)
>
> Bouw een Next.js 15 app volgens dit document. Gebruik shadcn/ui als basis, Tailwind voor styling, Recharts voor grafieken. Neem de visuele taal en informatie-architectuur van het bijgeleverde DataPraat-prototype over (HTML-versie), maar bouw álle componenten opnieuw volgens de folderstructuur en regels in dit document. Volg de stappen strikt in volgorde — setup en tokens éérst, pas dan componenten, pas dan schermen.
>
> **Hard rule**: lees `COMPONENTS.md` voor elke UI-beslissing. Als een component niet bestaat, voeg je hem eerst toe aan `COMPONENTS.md` + Storybook, dan pas gebruik je hem in een page. Pages mogen niets uit `components/ui/` direct importeren — alleen uit `components/domain/`.

---

## 1. Stack

| Laag       | Keuze                                        | Waarom                                  |
| ---------- | -------------------------------------------- | --------------------------------------- |
| Framework  | Next.js 15 (App Router) + TypeScript         | SSR, RSC, route groups                  |
| Styling    | Tailwind CSS 3.4                             | shadcn-standaard                        |
| Components | shadcn/ui                                    | Je bezit de code, geen vendor-lock      |
| Charts     | Recharts + shadcn `<ChartContainer>`         | Tokens-aware, React-native              |
| State      | Zustand (UI) + TanStack Query (server state) | Minimaal, geen Redux-overhead           |
| Validatie  | Zod                                          | Type-safe forms + API responses         |
| Icons      | `lucide-react`                               | shadcn-standaard                        |
| Variants   | `class-variance-authority` (CVA)             | shadcn-standaard                        |
| Table      | TanStack Table                               | Voor validatie-issues + benchmark-rijen |
| Animatie   | `framer-motion`                              | Trust-drawer + chart-transitions        |
| Tests      | Playwright (e2e) + Vitest (unit)             | —                                       |
| Storybook  | `storybook@latest`                           | Visueel contract voor components        |

## 2. Init-stappen (doe deze in volgorde)

```bash
# 1. Next.js project
npx create-next-app@latest datapraat --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
cd datapraat

# 2. shadcn/ui
npx shadcn@latest init
# Kies: Default style, Slate base color (we overschrijven met eigen tokens), CSS variables: Yes

# 3. Primitives (alle die we nodig hebben)
npx shadcn@latest add button card sheet dialog dropdown-menu command tabs toast input select badge separator scroll-area tooltip popover label skeleton alert avatar

# 4. Extra deps
npm install recharts zustand @tanstack/react-query @tanstack/react-table zod framer-motion lucide-react
npm install -D @storybook/nextjs chromatic

# 5. Storybook
npx storybook@latest init
```

## 3. Design Tokens (Brand Guide v1.1)

**Vervang `src/app/globals.css` met:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* neutrals — lichter, koeler */
    --background: 48 30% 98%; /* #FCFBF8 — main area, bijna wit */
    --foreground: 30 7% 15%; /* #2A2724 — warm donker */
    --card: 0 0% 100%; /* #FFFFFF */
    --card-foreground: 30 7% 15%;
    --popover: 0 0% 100%;
    --popover-foreground: 30 7% 15%;

    /* sidebar/muted surface */
    --muted: 45 9% 94%; /* #F3F2EE — warm grijs sidebar */
    --muted-foreground: 30 4% 38%; /* #5E5A53 */

    /* primary — indigo (brand DNA) */
    --primary: 244 58% 51%; /* #4338CA */
    --primary-foreground: 48 30% 98%;
    --primary-soft: 239 84% 67%; /* #6366F1 */
    --primary-tint: 238 100% 97%; /* #EEF2FF */

    /* accent — wordt gebruikt voor secondary */
    --accent: 238 100% 97%;
    --accent-foreground: 244 58% 51%;

    /* destructive — gedempt terra */
    --destructive: 0 36% 48%; /* #A85050 */
    --destructive-foreground: 48 30% 98%;

    /* borders + input */
    --border: 40 15% 88%; /* #E5E3DD */
    --input: 40 15% 88%;
    --ring: 244 58% 51%; /* focus = primary */

    /* chart tokens (PxQ semantiek uit brand guide) */
    --chart-1: 217 91% 60%; /* #3b82f6 — cost/dominant blauw */
    --chart-2: 146 18% 46%; /* #5E8A6D — volume/gedempt groen */
    --chart-3: 24 92% 48%; /* #ea580c — price */
    --chart-4: 217 60% 44%; /* #3151B0 — donkerblauw */
    --chart-5: 213 93% 83%; /* #93c5fd — lichtblauw */

    /* status */
    --success: 146 18% 46%; /* #5E8A6D */
    --success-foreground: 48 30% 98%;
    --warning: 30 61% 41%; /* #A8702A — warm amber */
    --warning-foreground: 48 30% 98%;

    --radius: 0.5rem; /* 8px */
  }

  .dark {
    /* Later. DataPraat is light-first. */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

**Vervang `tailwind.config.ts` met:**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem" },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
          tint: "hsl(var(--primary-tint))",
        },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: { sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"] },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

**Font setup** — `src/app/layout.tsx`:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// body className: `${inter.variable} font-sans`
```

Eén font voor alles (brand guide v1.1 regel). Geen serif.

## 4. Folder structuur

```
src/
  app/
    layout.tsx
    page.tsx                     → redirect naar /overzicht
    (app)/                       → auth-protected route group
      layout.tsx                 → Sidebar + MainHeader frame
      overzicht/page.tsx
      prognose/page.tsx
      validatie/page.tsx
      benchmark/page.tsx
      verwijzers/page.tsx
      lineage/page.tsx
      glossary/page.tsx
      chat/page.tsx
  components/
    ui/                          → shadcn primitives (generated)
    domain/                      → DataPraat-specifiek; features mogen alleen hieruit importeren
      ask-button.tsx
      kpi-card.tsx
      chart-card.tsx
      page-header.tsx
      trust-badge.tsx
      trust-inspector.tsx
      ask-drawer.tsx
      filter-pills.tsx
      gemeente-picker.tsx
      sidebar.tsx
      launcher.tsx
      charts/
        bar-chart.tsx
        doughnut-chart.tsx
        forecast-chart.tsx
        spread-chart.tsx
        volume-chart.tsx
        pathway-chart.tsx
  features/
    overzicht/
      overzicht-page.tsx         → importeert alleen domain/
      kpi-data.ts
    prognose/ ...
    validatie/ ...
    benchmark/ ...
    verwijzers/ ...
    chat/
      chat-view.tsx
      use-claude.ts
  lib/
    utils.ts                     → cn() helper (shadcn)
    format.ts                    → fmtEUR, fmtNum, fmtCompact (NL locale)
    trust.ts                     → trust score → tier logic
  stores/
    use-app-store.ts             → Zustand: currentGemeente, activeAskTopic
  types/
    domain.ts                    → Kpi, ForecastPoint, BenchmarkRow, TrustInfo, ChatMessage
```

## 5. Anti-drift regels (critical)

**`.eslintrc.json` additions:**

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/components/ui/*"],
            "message": "Features en pages mogen niet direct shadcn primitives importeren. Maak een component in components/domain/ aan en import die."
          }
        ]
      }
    ]
  },
  "overrides": [
    {
      "files": ["src/components/domain/**"],
      "rules": { "no-restricted-imports": "off" }
    }
  ]
}
```

**Commit hook** (`.husky/pre-commit`):

```bash
npx lint-staged
# en: check dat elke component in components/domain/ een .stories.tsx naast zich heeft
node scripts/check-stories.mjs
```

**CI (GitHub Actions)**:

- ESLint
- `tsc --noEmit`
- Playwright smoke tests
- Chromatic (optional) — visuele regressie op Storybook

## 6. Charts — Recharts + shadcn

```tsx
// components/domain/charts/bar-chart.tsx
"use client";
import { Bar, BarChart as RBarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  uitgaven: { label: "Gerealiseerd", color: "hsl(var(--chart-1))" },
  begroot: { label: "Begroot", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function BarChart({ data }: { data: MaandUitgave[] }) {
  return (
    <ChartContainer config={config} className="h-[260px]">
      <RBarChart data={data}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="maand" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="gerealiseerd" fill="var(--color-uitgaven)" radius={4} />
        <Bar dataKey="begroot" fill="var(--color-begroot)" radius={4} opacity={0.4} />
      </RBarChart>
    </ChartContainer>
  );
}
```

Regel: alle grafiek-kleuren via `hsl(var(--chart-N))`, nooit hex in component-code.

## 7. State & routing patroon

- **Zustand** alleen voor UI-state die meerdere schermen nodig hebben (huidige gemeente, geopende inspector, ask-topic).
- **TanStack Query** voor elke data-fetch. Elke dashboard-pagina heeft een `useOverzichtData()` hook etc.
- **Route-driven navigation**: `currentPage` komt uit `usePathname()`, niet uit state. Wijziging: klik op sidebar → `router.push()`.
- **Drawer/Modal**: shadcn `<Sheet>` voor Trust Inspector en Ask Drawer. Open/dicht via Zustand of route-param (`?inspect=kpi-uitgaven`).

## 8. Welke schermen bouwen

Volg deze volgorde voor eerste oplevering:

1. **Setup + tokens + layout-frame** (Sidebar + MainHeader + lege content)
2. **Overzicht** — volledig werkend (KPIs, BarChart, DoughnutChart, Ask-knoppen)
3. **Trust Inspector drawer** — werkt cross-cutting
4. **Ask Drawer** + per-chart ask flow
5. **Chat** — met `claude.complete()` of Anthropic SDK
6. **Prognose** (ForecastChart + CI)
7. **Validatie** (TanStack Table issue-list)
8. **Benchmark** (SpreadChart + peer-rijen)
9. **Verwijzers** (PathwayChart)
10. **Lineage + Glossary**
11. **Cmd+K launcher** (shadcn `<Command>`)
12. **Polish** — Nederlandse locale, keyboard nav, loading states, empty states

## 9. Claude-integratie

Server route `src/app/api/claude/route.ts` — streamt via Anthropic SDK. Client hook `useClaude()` in `features/chat/use-claude.ts`. Nooit je API-key in client-code.

## 10. Deploy

- **Dev**: Vercel (gratis tier werkt)
- **Prod**: Vercel of Azure (ivm gemeente-inkoop)
- **Secrets**: Anthropic API key in Vercel env, geen hardcoding
- **Analytics**: `@vercel/analytics` voor baseline + Plausible voor privacy

---

## Referentie

Zie `COMPONENTS.md` voor de volledige component-API.
Zie het bijgeleverde DataPraat.html-prototype voor visuele taal en interactie-patronen.
