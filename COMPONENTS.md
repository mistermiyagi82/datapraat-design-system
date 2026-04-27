# DataPraat — Component Register

> **Lees dit file bij elke UI-beslissing.** Gebruik bestaande componenten. Als je een nieuwe nodig hebt: eerst toevoegen aan dit register + Storybook story, dan pas gebruiken in een page.
>
> Alle componenten in `components/domain/` leunen op shadcn primitives in `components/ui/`. Features/pages importeren alleen uit `domain/`, nooit uit `ui/` direct.

---

## AskButton

"Vraag hierover"-knop met orb + label. Staat overal waar een gebruiker een vraag kan stellen aan Claude over specifieke data.

- **Wrapt**: shadcn `Button` (variant ghost + custom styling via CVA)
- **Props**: `size: "sm" | "md" | "lg"` (default `"md"`), `label?: string` (default `"Vraag hierover"`), `onClick: () => void`, `context?: string` (auto-loaded in drawer)
- **Gebruikt op**: `KpiCard` foot · `ChartCard` header · suggesties in `AskDrawer`
- **Visueel**: pill (rounded-full), indigo-tint achtergrond, kleine gradient-orb links
- **Story**: alle 3 sizes naast elkaar, default + hover + disabled states

## KpiCard

KPI-tegel met label, trust-badge, grote waarde, delta, en AskButton onderin.

- **Wrapt**: shadcn `Card`
- **Props**: `kpi: { id, label, value, delta, deltaKind: "good"|"warn"|"bad"|"neutral", trust: number }`, `onInspect: (id) => void`, `onAsk: (q: string) => void`
- **Gebruikt op**: Overzicht KPI-grid (4 tegels)
- **Visueel**: vaste min-height 148px voor uitlijning, voet met AskButton gescheiden via border-top
- **Story**: alle 4 deltaKinds, trust-scores 60/75/92

## ChartCard

Card die een chart omarmt: titel, subtitle, trust-badge links, AskButton + overflow-menu rechts.

- **Wrapt**: shadcn `Card` + `DropdownMenu` (overflow)
- **Props**: `title: string`, `subtitle?: string`, `trust?: number`, `onAsk?: (topic: string) => void`, `askTopic?: string`, `children: ReactNode` (de chart), `actions?: ReactNode` (extra chrome)
- **Gebruikt op**: alle dashboards met één grafiek per card
- **Story**: met BarChart, met DoughnutChart, zonder AskButton, met `actions`

## PageHeader

Pagina-titel + subtitle + rechterzijde actions (jaar-dropdown, filter-pills).

- **Props**: `title: string`, `sub?: string`, `actions?: ReactNode`
- **Gebruikt op**: elke dashboard-pagina
- **Story**: compact, met + zonder actions

## FilterPills

Rij van pill-toggles (bv. YTD / Q3 / Maand).

- **Wrapt**: shadcn `ToggleGroup` (single select)
- **Props**: `options: { value, label }[]`, `value: string`, `onChange: (v) => void`
- **Gebruikt op**: PageHeader actions
- **Story**: 2, 3, 5 opties

## TrustBadge

Percentage-badge met status-dot (groen/amber/terra op basis van score).

- **Wrapt**: shadcn `Badge` (variant secondary) + inline dot
- **Props**: `score: number`, `onClick?: () => void`, `size?: "sm" | "md"`
- **Tier-logic**: `score >= 90 → good`, `>= 70 → warn`, `< 70 → bad` (zie `lib/trust.ts`)
- **Gebruikt op**: KpiCard, ChartCard header, TrustInspector drawer
- **Story**: 95% good, 78% warn, 55% bad

## TrustInspector

Drawer met metric-herkomst, definition, freshness, peer-comparison, flags.

- **Wrapt**: shadcn `Sheet` (side="right", width 560)
- **Props**: `metricId: string | null`, `onClose: () => void`, `onOpenLineage: () => void`
- **Gebruikt op**: globaal — geactiveerd vanaf elke TrustBadge-klik
- **Story**: open state met mock metric, gesloten

## AskDrawer

Drawer met vraag-suggesties voor een chart/metric, opent full chat bij klik.

- **Wrapt**: shadcn `Sheet` (side="right", width 440)
- **Props**: `topic: string | null`, `onClose: () => void`, `onOpenFull: (question: string, context: string) => void`
- **Gebruikt op**: globaal — opent vanuit elke AskButton
- **Story**: open met 5 suggesties, leeg state

## Sidebar

Linker navigatie met brand-logo (klikbaar → overzicht), GemeentePicker, Nieuwe Chat, collapsible secties, chat-history.

- **Wrapt**: shadcn `ScrollArea` + `Button` + `Collapsible`
- **Props**: `currentPath: string` (uit `usePathname`)
- **Gebruikt op**: app-layout frame (niet op auth/login)
- **Sub-componenten**: `SidebarSection` (collapsible), `SidebarItem`, `SidebarChatHistory`
- **State**: collapsed-state per sectie in localStorage (`dp_sb_collapsed`)
- **Story**: alle secties open, Inzicht-collapsed, Chats-collapsed

## GemeentePicker

Dropdown met 13 Zeeuwse gemeenten + "Actief"-tag op de huidige.

- **Wrapt**: shadcn `DropdownMenu` (of `Select` als we gebruik willen forceren)
- **Props**: `value: string`, `onChange: (gemeente: string) => void`, `gemeenten: { naam: string; trajecten?: number; actief?: boolean }[]`
- **Gebruikt op**: Sidebar (boven Nieuwe Chat)
- **Story**: 13 gemeenten, 3 gemeenten, Riemsterdal actief

## MainHeader

Sticky top-bar met quick-ask (Cmd+K launcher), tweaks-icon, user-chip.

- **Wrapt**: shadcn `Button` + `DropdownMenu` (user)
- **Props**: `context?: { gemeente: string; periode: string }`, `onOpenCommand: () => void`
- **Gebruikt op**: app-layout frame
- **Story**: default, met context, zonder context

## Launcher

Floating bottom-right "Praat met je data"-knop, opent command palette / chat.

- **Wrapt**: shadcn `Button` custom-gestyled, floating
- **Props**: `recentChats?: number`, `onClick: () => void`
- **Gebruikt op**: overal behalve chat-page
- **Visueel**: launcher-orb + tekst, hover = lift
- **Story**: met + zonder recent count

## CommandPalette (Cmd+K)

Global command palette voor zoeken, navigeren, direct vragen stellen.

- **Wrapt**: shadcn `CommandDialog`
- **Props**: `open: boolean`, `onOpenChange: (o) => void`
- **Groups**: Recent chats · Navigatie · Stel een vraag · Acties (export, dark mode)
- **Story**: open met search, leeg, met search-matches

## Charts (allemaal in `domain/charts/`)

Elk chart-component wrapt Recharts met ChartContainer, kleuren uit tokens.

### BarChart

- `data: { maand: string; gerealiseerd: number; begroot: number }[]`
- Gebruikt op: Overzicht (Maandelijkse uitgaven)

### DoughnutChart

- `data: { naam: string; waarde: number }[]`
- Gebruikt op: Overzicht (Top productcategorieën), Verwijzers

### ForecastChart

- `data: { maand: string; actual?: number; forecast?: number; ciLow?: number; ciHigh?: number }[]`
- Gebruikt op: Prognose — met confidence interval band

### SpreadChart

- `data: { gemeente: string; prijs: number; isSelf?: boolean }[]`
- Gebruikt op: Benchmark — peer-vergelijking

### VolumeChart

- `data: { periode: string; volume: number }[]`
- Gebruikt op: Benchmark, Verwijzers

### PathwayChart

- Sankey/flow diagram voor verwijzer → aanbieder paths
- Gebruikt op: Verwijzers

## Format helpers (`lib/format.ts`)

- `fmtEUR(n)` → "€ 7.234.000"
- `fmtCompact(n)` → "€7,2M" / "€234K"
- `fmtNum(n)` → "7.234"
- `fmtPct(n, decimals?)` → "12,4%"

Gebruik **altijd** deze helpers, nooit losse `toLocaleString` in componenten.

## Wat NIET te doen

- ❌ `className="bg-[#4338CA]"` — gebruik `bg-primary`
- ❌ Hex-kleuren in component-code — altijd via Tailwind token
- ❌ Nieuwe "Vraag"-knop-variant zonder AskButton uit te breiden
- ❌ Direct Recharts importeren in een feature — wrappen in `domain/charts/`
- ❌ Direct shadcn `Button` importeren in een feature — of `Button` re-exporten uit `domain/`, of een domain-component maken
- ❌ Inline SVG icons — gebruik `lucide-react`
- ❌ `useState` voor cross-page UI state — gebruik Zustand
