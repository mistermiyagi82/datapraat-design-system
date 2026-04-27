# Brand Guide — DataPraat

> **Instructie voor de AI**
> Dit is een merk-specificatie. Lees alle secties vóórdat je iets ontwerpt, codeert of schrijft.
> Gebruik uitsluitend de hier gespecificeerde waardes — geen eigen kleuren, fonts of stijlkeuzes.
> Als een sectie leeg is of "[VUL IN]" bevat: vraag eerst om verduidelijking; ga niet zelf invullen.
> Ontwerpkeuzes die hier níet zijn vastgelegd (bv. micro-interacties): leg ze kort uit voordat je ze toepast.

> **Status:** versie 1.1 — palette is verschoven van neutraal-koud naar **warm/zacht** op basis van design-iteratie. Component patronen, typografie en voice & tone zijn ongewijzigd t.o.v. v1.0. Hex-waardes hieronder zijn de canonical waardes; de productie-codebase (oklch tokens) moet hierop worden bijgewerkt — zie [Changelog](#changelog) onderin.

---

## 1. Brand fundamentals

- **Bedrijfsnaam:** DataPraat
- **Tagline:** Praat met je jeugdzorgdata
- **Wat doet het bedrijf in één zin:** DataPraat maakt brondata van klanten (CSV, XML, Excel) betrouwbaar, traceerbaar en auditeerbaar — zodat dashboards en AI-antwoorden ergens op staan.
- **Doelgroep:** Data-consultants en accountants in Nederland die werken met gemeentelijke data — in het bijzonder Jeugdzorg (Jeugdwet), sociale domein en financiële rapportages. Eerste focus: de 13 Zeeuwse gemeenten.
- **Drie merk-adjectieven:** betrouwbaar, traceerbaar, rustig
- **Drie merk-anti-adjectieven** (wat het NIET is): hype, speels, opdringerig

---

## 2. Color system

> **v1.1 update:** palette verschoven van neutraal-koud (pure wit, neon-status) naar **warm-papier met gedempte status-kleuren**. Reden: rustigere uitstraling, lagere contrast-spanning, beter passend bij "betrouwbaar/rustig" merk-adjectieven.

### Primary palette

| Token                    | HEX       | Gebruik                                          |
| ------------------------ | --------- | ------------------------------------------------ |
| `--primary`              | `#4338CA` | hoofd-accent, CTA's, actieve states, focus rings |
| `--primary-foreground`   | `#FAF7EF` | tekst op primary achtergrond                     |
| `--primary-soft`         | `#6366F1` | secondaire accent (logo-mark, hover variants)    |
| `--primary-tint`         | `#EEF2FF` | subtiele accent-fills, badges                    |
| `--secondary-foreground` | `#3A3640` | tekst op secondary fills                         |

### Neutrals — warm

| Token                | HEX       | Gebruik                                        |
| -------------------- | --------- | ---------------------------------------------- |
| `--background`       | `#FAF7EF` | hoofd-achtergrond (warm papier, geen pure wit) |
| `--card`             | `#FAF7EF` | cards, message bubbles (zelfde toon als bg)    |
| `--surface`          | `#FAF7EF` | modals, popovers, drawers                      |
| `--muted`            | `#F0EBDD` | subtiele fills, embeds, hover-achtergronden    |
| `--accent-soft`      | `#E8E2D2` | sidebar, browser bar, bg-derived headers       |
| `--foreground`       | `#2A2724` | primaire tekst (warm donker, geen pure black)  |
| `--muted-foreground` | `#5E5A53` | secundaire tekst                               |
| `--mute-soft`        | `#8F8A80` | metadata, labels, captions                     |
| `--border`           | `#E2DDD0` | borders, dividers (warm-grey)                  |
| `--border-strong`    | `#D4D0C6` | sterkere borders, input focus                  |
| `--ring`             | `#B3B3B3` | focus ring                                     |

### Status — gedempt en warm

| Token                | HEX       | Gebruik                                                    |
| -------------------- | --------- | ---------------------------------------------------------- |
| `--success`          | `#5E8A6D` | succesvolle validatie, positieve trends, hoge trust scores |
| `--success-tint`     | `#E5EDDF` | success-badges achtergrond                                 |
| `--success-strong`   | `#3D5C4A` | success-tekst op tint                                      |
| `--warning`          | `#A8702A` | waarschuwingen, lage zekerheid, attention needed           |
| `--warning-tint`     | `#F4ECD4` | warning-badges achtergrond                                 |
| `--warning-strong`   | `#8A5A26` | warning-tekst op tint                                      |
| `--destructive`      | `#A85050` | fouten, kritieke validatie-issues                          |
| `--destructive-tint` | `#F2DDDA` | destructive-badges achtergrond                             |

> **Verwijderd t.o.v. v1.0:** felle neon-kleuren `#10B981`, `#DC2626`, `#D97706`. Reden: te hoog contrast tegen warm-papier achtergrond, voelt klinisch.

### Chart / data visualisatie

| Token            | HEX                   | Semantiek                                                       |
| ---------------- | --------------------- | --------------------------------------------------------------- |
| `--chart-cost`   | `#3b82f6`             | PxQ / totale kosten (primair)                                   |
| `--chart-volume` | `#5E8A6D`             | Q / aantal cliënten (gedempt groen, mee verschoven met success) |
| `--chart-price`  | `#ea580c`             | P / prijs per cliënt                                            |
| `--chart-1`      | `#1d4ed8` → `#3151B0` | donkerste blauw (gedempt)                                       |
| `--chart-2`      | `#3b82f6`             | middel blauw                                                    |
| `--chart-3`      | `#60a5fa`             | licht blauw                                                     |
| `--chart-4`      | `#93c5fd`             | lichter blauw                                                   |
| `--chart-5`      | `#bfdbfe`             | lichtste blauw                                                  |

**Heatmap / ranking gradient (7 stops, gedempt rood → cyaan):**
`#A85050`, `#C26B30`, `#D17F35`, `#C19340`, `#5E8A6D`, `#3D8678`, `#2D7B8B`

### Badge-kleuren per tool-type

| Tool                | Achtergrond | Tekst     | Label           |
| ------------------- | ----------- | --------- | --------------- |
| `vvd_actuals_*`     | `#E5EDDF`   | `#3D5C4A` | Realisatie      |
| `vvd_forecast_*`    | `#EEF2FF`   | `#3151B0` | Prognose        |
| `cbs_kerncijfers_*` | `#F2E0E5`   | `#7A3A4F` | CBS Kerncijfers |
| `cbs_vvd_vergelijk` | `#F4ECD4`   | `#8A5A26` | CBS vs VDD      |

### Achtergrond-toon

- **Light/warm:** vleugje papier-warmte. Niet pure wit, niet expliciet warm-geel — een rustige cream-toon. Dark mode: nog niet uitgewerkt voor deze warmere palette.

---

## 3. Typography

### Body / UI / Headings

- **Font family:** `Inter` (één font voor alles), met fallback `ui-sans-serif, system-ui, sans-serif`
- **Bron:** Google Fonts via `next/font/google`
- **CSS variabele:** `--font-sans`
- **Gewichten in gebruik:** 300 (light, voor assistant-tekst), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Karakter:** neutraal, hoge leesbaarheid op kleine formaten. Hiërarchie via grootte/gewicht, niet via typeface.

### Mono / data

- **Font family:** system mono stack — `ui-monospace, SFMono-Regular, Menlo, monospace`
- **Gebruikt voor:** perf-metadata, token counts, timestamps, code-references, inline data-codes (bv. productcategorieën zoals `45A12`)

### Schaal

1rem = 16px. Conventies:

| Niveau                | Pixel | Gewicht | Gebruik                                     |
| --------------------- | ----- | ------- | ------------------------------------------- |
| Hero (landing)        | 48px  | 700     | landing page hero                           |
| H1 / page title       | 24px  | 600     | page titles, met `letter-spacing: -0.015em` |
| H2 / section          | 18px  | 500     | section headers, card titles                |
| H3 / subsection       | 14px  | 600     | subsection headers                          |
| Body                  | 14px  | 400     | standaardtekst                              |
| Body / chat-assistant | 14px  | 300     | assistant messages, `line-height: 1.75`     |
| Metadata              | 12px  | 400     | timestamps, perf, badges                    |
| Mono metadata         | 10px  | 400     | tokencount, cost, model-naam                |

**Number display** (KPI-waardes, large stats): Inter 28px / weight 600 / `letter-spacing: -0.02em`. Geen aparte display-font.

---

## 4. Logo & marks

- **Logo bestanden:** **[nog niet aanwezig]** — `public/` bevat momenteel geen logo-assets.
- **Voorlopige conventie:** merknaam "DataPraat" in Inter weight 600, sentence case. In product-UI optioneel een kleine "D"-mark in een primary-blue (`#4338CA`) afgerond vierkant (28×28px, radius 6px, witte tekst).
- **Minimum afmeting:** [VUL IN bij logo-ontwerp]
- **Clear space:** [VUL IN]
- **Plaatsing:** linksboven in header (sidebar of top-bar)
- **Wat NOOIT:** geen draaiing, geen vervorming, geen plaatsing op fotografische achtergrond

> **Actiepunt:** logo ontwerpen vóór publieke release.

---

## 5. Spacing & layout tokens

### Spacing schaal

Tailwind default. Conventies:

| Token       | Waarde    | Typisch gebruik                       |
| ----------- | --------- | ------------------------------------- |
| `1` / `2`   | 4 / 8px   | binnen badges, icon gaps              |
| `3` / `4`   | 12 / 16px | form padding, gap tussen UI-elementen |
| `6`         | 24px      | card padding, section spacing         |
| `8`         | 32px      | tussen hoofdsecties                   |
| `12` / `16` | 48 / 64px | page-level breathing room             |

### Border radius

`--radius: 0.625rem` (10px) base, met afgeleiden:

| Token          | Waarde | Gebruik                            |
| -------------- | ------ | ---------------------------------- |
| `rounded-sm`   | 6px    | badges, kleine knoppen             |
| `rounded-md`   | 8px    | buttons, inputs                    |
| `rounded-lg`   | 10px   | cards standaard                    |
| `rounded-xl`   | 12px   | chat bubbles, insight cards        |
| `rounded-2xl`  | 16px   | user message cards, modals         |
| `rounded-full` | 9999px | pills, badges, chart-mode togglers |

### Shadows

- **Stijl:** subtiel, neutraal. Geen dramatische diepte.
- **Default:** `shadow-xs` = `0 1px 2px rgba(0,0,0,0.05)` op cards, inputs, message bubbles
- **Verhoogd:** `shadow-sm` / `shadow-md` op dropdowns
- **Modals:** `shadow-lg` / `shadow-xl`

### Grid / max-width

| Context                        | Max-width           |
| ------------------------------ | ------------------- |
| Chat content-container         | 672px (`max-w-2xl`) |
| Landing page                   | 672px               |
| Modals (klein)                 | 448px               |
| Modals (groot / context)       | 1024px              |
| Dashboard / multi-column views | 1320px              |

- **Default horizontale page-padding:** `px-4 sm:px-6` (16px mobile → 24px vanaf `sm`)
- **Sidebar:** product-eindstaat is **popover-menu linksboven**, geen permanente sidebar. _In mockups voor pitch-decks wordt wel een permanente sidebar getoond voor leesbaarheid van navigatie-context — dit is een mock-conventie, niet de productie-UI._

---

## 6. Component patterns

### Buttons

- **Primary:** `bg-primary text-primary-foreground hover:bg-primary/80`, radius 8px (`rounded-md`), height 36px (`h-9`), padding `px-2.5`, `text-sm font-medium`, `active:translate-y-px` microfeedback
- **Secondary:** `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Outline:** `border-border bg-background shadow-xs hover:bg-muted`
- **Ghost:** `hover:bg-muted hover:text-foreground` — transparant default
- **Destructive:** `bg-destructive/10 text-destructive hover:bg-destructive/20` (soft destructive)
- **Link:** `text-primary underline-offset-4 hover:underline`

Sizes: `xs` (24px), `sm` (32px), default (36px), `lg` (40px).

### Cards

- Achtergrond: `bg-card` (`#FAF7EF` — zelfde als bg)
- Border/ring: `1px solid var(--border)` of `ring-1 ring-foreground/10`
- Radius: `rounded-xl` (12px)
- Padding: `py-6 px-6` default, `py-4 px-4` small
- Shadow: `shadow-xs`
- **Onderscheid van bg:** primair via border, niet via achtergrondkleur

### Chat message bubbles

- **Assistant:** **geen bubble** — tekst direct op achtergrond, `text-sm leading-7 font-light` (font-weight 300, line-height 1.75)
- **User:** `bg-card rounded-2xl px-4 py-3 shadow-xs ring-1 ring-border`, rechts uitgelijnd, max 70–85% breedte. Achtergrond is dezelfde warm-papier toon als rest van UI — onderscheidt zich door border + shadow, niet door kleur-inversie

### Inputs / textarea

- Height: `h-9` (input) / `min-h-16` (textarea)
- Border: `1px solid var(--border)`
- Achtergrond: `bg-transparent`
- Padding: `px-2.5 py-1`
- Radius: `rounded-md` (8px)
- Shadow: `shadow-xs`
- Focus: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`
- Font: `text-base` op mobile (16px, voorkomt iOS zoom), `text-sm` vanaf `md`

### Tables

- Geen generiek `<Table>` component — tables worden dynamisch gerenderd
- Rijen: `hover:bg-muted/50 transition-colors`
- Headers: `text-left pb-1 border-b border-border pr-4`, `font-medium`, `text-xs` (mono of sans, mono voor data-codes)
- Cellen: `py-1 pr-4 border-b border-border`, `text-xs`–`text-sm`

### Charts

- **Library:** Recharts of Chart.js
- **Default series-kleur:** `--chart-cost` (`#3b82f6`)
- **Semantische data-kleuren:** zie sectie 2 — kosten=blauw, volume=gedempt-groen, prijs=oranje
- **Gridlines:** `rgba(212,205,189,0.4)` — subtiel warm-grijs
- **Font in chart:** Inter, `text-xs` (12px) voor assen, `text-sm` (14px) voor tooltip
- **Wrapper:** elke chart in een `InsightCard` met badge-label en optionele subtitle (gemeente, productcategorie, jaar)
- **Mode-switcher:** line / bar / pie / treemap / hbar / table / area / composed

### Trust badges (specifiek voor DataPraat)

Inline naast KPI-labels, klikbaar voor Trust Inspector drawer:

- **Score 90–100%:** `bg-success-tint text-success-strong` (warm sage)
- **Score 70–89%:** `bg-warning-tint text-warning-strong` (warm amber)
- **Score < 70%:** `bg-destructive-tint text-destructive` (terra)
- Format: `● 96%` of `● Datakwaliteit 96%` (met dot-indicator), font-mono 9–10px, padding 2–4px / 6–8px, border-radius 10px

---

## 7. Iconography & imagery

- **Icon stijl:** outline, 1.2–1.5px stroke, `currentColor` fills zodat iconen de tekstkleur volgen
- **Icon library:** **geen externe library** — iconen zijn inline SVG's, vaak 16×16 of 14×14
- **Emoji in UI:** **vermijden in zakelijke product-copy.** Uitzondering: functionele toggles waar SVG nog niet beschikbaar is (✏️ voor prompt edit, 🧠 voor memory) — kandidaat voor SVG-vervanging
- **Foto-stijl:** geen foto's in productie-UI
- **Illustratie-stijl:** geen illustraties
- **Decoratieve elementen:** geen patronen of gradients; alleen subtiele top/bottom fade-overlays op scroll-containers

---

## 8. Voice & tone

### Aanspreekvorm

- **Pronoun (NL):** `je` (informeel)
- **Pronoun (EN):** `you`
- **Formaliteit:** semi-formeel — direct en duidelijk, professioneel zonder afstand
- **Taal:** Nederlands als default. AI-antwoorden schakelen naar Engels wanneer de gebruiker in het Engels begint.

### Schrijfstijl

- **Zinslengte:** varieert — kort voor snelle antwoorden, langer voor analyse met context
- **Vakjargon:** context-afhankelijk. Domein-termen (gemeente, productcategorie, trajecten, Prognoselabel) worden gebruikt wanneer relevant, met korte uitleg waar de gebruiker dat mogelijk niet kent.
- **Toon:** feitelijk, data-gedreven. Geen marketing-superlatieven. Onzekerheid wordt expliciet benoemd.

### Voorbeeld-zinnen

- ✅ Goed: "Totale kosten in 2024: €13,5 mln — 1,6× het Zeeuwse gemiddelde voor gemeenten van deze grootte."
- ✅ Goed: "Prognose november 2023 voorspelde €12,1 mln; realisatie komt €1,4 mln hoger uit. Oorzaak: 8% stijging in het aantal unieke cliënten bij Jeugdhulp met Verblijf."
- ❌ Vermijden: "Dit is een spannende trend in jouw data! 🚀"
- ❌ Vermijden: "U moet nu actie ondernemen."

### Numerieke conventies

- **Decimaal-scheider:** komma — `€13,5 mln`
- **Duizendtallen:** punt — `€13.500`, `2.500 cliënten` (Nederlandse locale via `toLocaleString("nl-NL")`)
- **Valuta:** euro-teken vóór het bedrag, geen spatie — `€13.500`, `€1.234,56`. Compacte vorm voor grote bedragen: `€13,5 mln`, `€500K`.
- **Datum:** Nederlandse notatie — `30 september 2024`. Maand-afkortingen in charts: `jan '23`, `dec '24`.
- **Percentages:** `1,6×` of `23%` — nooit `1.6x`.

---

## 9. Do's & don'ts

### Wel doen

- Gebruik alleen de tokens uit deze guide — nooit hardcoded HEX in nieuwe componenten
- Wees expliciet over dataherkomst en onzekerheid in product-copy — dit is het bestaansrecht van DataPraat
- Hou UI rustig: warm-papier achtergronden, gedempte status-kleuren, veel whitespace, subtiele borders, geen zware shadows
- Nederlandse number-formatting overal, ook in tooltips en exports
- Charts altijd in een `InsightCard` met een duidelijk label (Realisatie / Prognose / CBS)

### Niet doen

- Geen pure wit (`#FFFFFF`) — gebruik `--background` (`#FAF7EF`)
- Geen felle neon-status-kleuren (`#10B981`, `#DC2626`, `#D97706`) — gebruik gedempte varianten
- Geen paarse of neon-gradients — blijf binnen het blauw-as van `chart-1` t/m `chart-5`
- Geen emoji's in zakelijke product-copy
- Geen system-fonts of Roboto — altijd Inter
- Geen marketing-superlatieven of hypetaal ("revolutionair", "krachtig", "spannend")
- Geen prescriptieve toon richting de gebruiker ("u moet...")
- Geen hardcoded kleuren in nieuwe chart-componenten — eerst het tokenpalet uitbreiden

---

## 10. Reference & inspiration

- **Referentie-merken:** Linear (restraint, type-first), Stripe (density, data-dichtheid), Vercel (neutraal canvas, subtiele accents) — maar dan met warm-papier in plaats van pure wit
- **Anti-referenties:** generieke "chat met je CSV" SaaS-tools (te speels, te veel kleuraccenten), klinische dashboards à la Datadog/Grafana (te koud, te veel neon)
- **Voorbeeld-screens:** zie `docs/baseline-screenshots/` en `docs/chart-catalog.html`

---

## Versie-info

- **Versie:** 1.1
- **Laatst bijgewerkt:** 2026-04-22
- **Eigenaar:** Daan (headfwd)

### Changelog

**v1.1 — Warm/zacht palette (2026-04-22)**

Verschoven van neutraal-koud naar warm-papier:

| Token                | v1.0      | v1.1      |
| -------------------- | --------- | --------- |
| `--background`       | `#FFFFFF` | `#FAF7EF` |
| `--muted`            | `#F7F7F7` | `#F0EBDD` |
| `--accent-soft`      | `#F3F4F6` | `#E8E2D2` |
| `--border`           | `#E8E8E8` | `#E2DDD0` |
| `--border-strong`    | `#D1D5DB` | `#D4D0C6` |
| `--foreground`       | `#252525` | `#2A2724` |
| `--muted-foreground` | `#5A5A5A` | `#5E5A53` |
| `--success`          | `#10B981` | `#5E8A6D` |
| `--success-tint`     | `#D1FAE5` | `#E5EDDF` |
| `--warning`          | `#D97706` | `#A8702A` |
| `--warning-tint`     | `#FEF3C7` | `#F4ECD4` |
| `--destructive`      | `#DC2626` | `#A85050` |
| `--destructive-tint` | `#FEE2E2` | `#F2DDDA` |

**Niet veranderd:**

- Primary indigo `#4338CA` (brand-DNA)
- Chart-cost blauw `#3b82f6` (data viz scherp houden)
- Inter typografie + alle component patronen
- Voice & tone, numerieke conventies

**Reden:** lager contrast, rustigere uitstraling, beter passend bij merk-adjectieven (betrouwbaar, rustig). v1.0 voelde te klinisch tegen warm-papier achtergrond.

### Open punten

1. Logo ontwerpen + `public/` toevoegen
2. Productie-codebase oklch tokens bijwerken naar v1.1 hex-waardes
3. Hardcoded chartkleuren tokeniseren als `--chart-cost`, `--chart-volume`, `--chart-price`
4. Emoji-toggles vervangen door SVG-iconen voor visuele consistentie
5. Dark mode opnieuw uitwerken op basis van warm-papier palette
6. Heatmap gradient (7-stops) consolideren als `--heatmap-1` t/m `--heatmap-7`
