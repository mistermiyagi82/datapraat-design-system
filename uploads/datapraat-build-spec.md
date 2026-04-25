# DataPraat — Build Specification v1.0

> **Instructie voor de AI die deze applicatie bouwt**
>
> Dit document is de functionele specificatie voor DataPraat. Lees het volledig voordat je begint te coderen. Gebruik de meegeleverde design-files als visuele bron-van-waarheid — deze specificatie legt de *gedragslogica* en *business rules* vast waar de designs niet expliciet in zijn.
>
> **Meegeleverde companion-files:**
> - `datapraat-brand-guide-v1.1.md` — alle design tokens (kleuren, fonts, spacing, componenten)
> - `datapraat-menu-screens.html` — 5 hoofdpagina's (overzicht, prognose, validatie, benchmark, verwijzers)
> - `datapraat-trust-mockups.html` — trust layer (badges, inspector drawer, lineage graph, glossary)
> - `datapraat-chat-mockups.html` — conversational interface (5 schermen)
> - `datapraat-flow-mockups.html` — bridge tussen dashboard en chat (4 schermen)
> - `datapraat-pitch-deck-v2.html` — referentie voor product-positionering
>
> Bij conflict tussen designs en deze spec: **deze spec wint** voor gedrag en business rules; **designs winnen** voor visuele vormgeving.
>
> Build-volgorde: §11 → §12 → §17 → §13 → §14 → §15 → §16 → §18. Trust-layer-componenten (§6-§10) zijn cross-cutting en worden gebouwd naarmate ze nodig zijn.

---

## Deel I — Product

## 1. Missie & positionering

**Missie:** Brondata van Nederlandse gemeenten — in het bijzonder jeugdzorg-declaraties — betrouwbaar, traceerbaar en auditeerbaar maken, zodat dashboards en AI-antwoorden ergens op staan.

**Positionering:** DataPraat is geen generieke BI-tool. Het is een *domein-specifieke trust layer* voor jeugdzorg-data met een chat-interface erbovenop. De echte IP zit in de combinatie van:
1. Domeinkennis (iJW-productcategorieën, verwijzers, normen)
2. Validatie-regels die jeugdzorg-patronen kennen
3. Data-lineage met audit-spoor
4. Conversational interface die deze context benut

**Niet-doelen:**
- Geen vervanger voor PowerBI of Tableau voor generiek gebruik
- Geen landelijke aggregatie-tool (elke deployment is één gemeente)
- Geen case-management systeem voor individuele cliënten

## 2. Doelgroep & users

**Eerste markt:** 13 Zeeuwse gemeenten (via VDD-partnership). Uitbreiding naar landelijk mogelijk.

**Primaire users binnen een gemeente:**

| Rol | Job-to-be-done | Pagina's die ze gebruiken |
|-----|----------------|--------------------------|
| **Wethouder / raadslid** | "Waar staan we, klopt het verhaal" | Overzicht, Chat |
| **Beleidsadviseur sociaal domein** | "Wat drijft kosten, hoe vergelijken we ons" | Alle + Chat, Benchmark |
| **Financieel controller** | "Forecast, audit-spoor, afwijkingen" | Prognose, Validatie, Lineage |
| **Data-analist / -consultant** | "Diepe analyse, data-kwaliteit, definities" | Alles + Trust layer intensief |

**Secundaire users:** accountant / toezichthouder (alleen-lezen, audit-context).

---

## Deel II — Fundering

## 3. Tech stack (vastgelegd)

- **Framework:** Next.js 15+ (App Router)
- **Taal:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 met CSS custom properties uit brand guide v1.1
- **Components:** shadcn/ui als basis (reeds in codebase)
- **Charts:** Recharts voor alle data-visualisaties
- **Font:** Inter via `next/font/google`
- **Data-fetching:** MCP (Model Context Protocol) server calls voor VVD-data, DataPraat FF, CBS
- **LLM:** Claude (Anthropic) voor chat-interface
- **State:** React Server Components waar mogelijk, Client Components alleen voor interactiviteit

**Bestaande codebase-referenties** (uit brand guide):
- `src/app/globals.css` — design tokens
- `src/app/layout.tsx` — root layout, font setup
- `src/components/chat/ChatView.tsx`, `MessageBubble.tsx` — chat foundation
- `src/components/charts/VVDChart.tsx` — chart component (te uitbreiden)
- `src/components/ui/` — shadcn primitives
- `tailwind.config.ts` — radius, etc.

Nieuwe features bouwen bovenop deze structuur. Niet herstructureren tenzij expliciet gevraagd.

## 4. Deployment-architectuur

DataPraat is **deployed-not-SaaS**. Elke instantie draait in de Azure-tenant van één gemeente.

**Consequenties:**
- Data verlaat de gemeente-omgeving nooit (behalve expliciet aangewezen externe calls zoals CBS)
- Geen multi-tenant concerns
- Compliance-oppervlak is klein (data blijft binnen AVG-/BIO-verantwoordelijkheid van de gemeente)
- Updates worden via VDD's deployment-pipeline per gemeente uitgerold

**Netwerk:**
- **Outbound toegestaan:** CBS OData API (`opendata.cbs.nl`), Anthropic API (voor chat LLM), eventuele NPM/CDN bij build-tijd
- **Geen outbound naar:** externe analytics, telemetry, third-party tracking

## 5. Data model

Het core schema komt uit VDD's Azure SQL datamodel (VVD = "Voorziening Verantwoording Data"). Niet opnieuw ontwerpen — gebruiken wat er is.

### 5.1 Fact tables

**`FactWerkelijk`** — gerealiseerde declaraties
- `DeclaratieId` (PK)
- `GemeenteCode`, `PeriodeJaar`, `PeriodeMaand`
- `ProductCategorieCode` (iJW-code, bv `45A12`)
- `AanbiederCode`, `VerwijzerCode`
- `Q` (volume/aantal), `P_werkelijk` (prijs), `PxQ` (som)
- `ClientId` (pseudoniem)

**`FactVoorspelling`** — forecast-records
- Zelfde structuur als `FactWerkelijk` plus:
- `Prognoselabel` (bv `"Prognose per 202311 – 202412"` — let op **en-dash**, niet hyphen)
- `CI_onder`, `CI_boven` (95% betrouwbaarheidsinterval)

### 5.2 Dimension tables

- **`DimGemeente`** — `GemeenteCode`, `GemeenteNaam`, `InwonersAantal`, `RegioId`
- **`DimProductCategorie`** — `Code`, `Naam`, `OfficieleOmschrijving`, `iJWVersie`
- **`DimVerwijzer`** — `Code`, `Naam` (wijkteam/huisarts/medisch-specialist/gecertificeerde-instelling/rechter-OM)
- **`DimAanbieder`** — `Code`, `Naam`

### 5.3 Externe data

- **CBS OData**: tables 83454NED (budget), 85099NED (cliënt-volume), 85098NED (gemeente-vergelijking), 83765NED (jongeren-populatie). Aparte ingestie-pipeline, gecached per gemeente.

### 5.4 Kritieke berekeningsregels

> **Deze regels zijn non-negotiable. Afwijking veroorzaakt foutieve rapportages.**

1. **Effectieve prijs per cliënt** = `SUM(PxQ) / SUM(Q)` — NOOIT `AVG(P_werkelijk)` (dat is ongewogen en misleidend bij aggregatie)
2. **YTD-totalen:** filter op `PeriodeJaar = huidig AND PeriodeMaand <= laatste_gesloten_maand` — 2023-data is partieel (t/m september)
3. **YoY-vergelijkingen:** gebruik 2019→2022 als stabiele endpoints; 2023 alleen tonen als "partial YTD"
4. **Gemeente-pseudoniemen** blokkeren directe CBS-joins — een interne mapping-tabel is nodig (pseudo→echte GemeenteCode)
5. **MCP-rijlimiet:** VVD-Viewer MCP geeft stilletjes max 200 rijen terug per query. **Altijd** server-side aggregatie gebruiken (`vvd_actuals_summary`) in plaats van raw row-pulls voor multi-gemeente of multi-jaar analyses

### 5.5 MCP integraties (beschikbaar)

| MCP server | Functie (voorkeur) | Gebruik |
|------------|--------------------|---------|
| VVD-Viewer Daan | `vvd_actuals_summary` | Aggregated actuals per dimensie |
| VVD-Viewer Daan | `vvd_forecast_summary` | Aggregated forecasts |
| VVD-Viewer Daan | `vvd_compare_forecast_actuals` | Prognose vs realisatie diff |
| VVD-Viewer Daan | `vvd_list_dimensions` | Filterwaardes (gemeenten, categorieën, periodes) |
| DataPraat Part 1 Nate | validation & metadata | Validatie-engine, column annotations |
| DataPraat FF | Fireflies meeting integration | (out of scope voor MVP) |
| CBS via REST | OData endpoints | Benchmark-data |

---

## Deel III — De Trust Layer (DataPraat's IP)

## 6. Wat is de trust layer

De trust layer is alles wat *bovenop* de ruwe data leeft om elke waarde te kunnen vertrouwen, begrijpen en herleiden. Vier lagen:

1. **Definities** — wat is "totaal uitgaven"? Wat is productcat 45A12?
2. **Validatie** — welke regels zijn toegepast? Welke records uitgesloten?
3. **Lineage** — welke ruwe declaraties leidden tot deze waarde?
4. **Domeinkennis** — wat betekent dit in jeugdzorg-context, wat is de norm?

Deze lagen zijn *cross-cutting*: ze raken elk pagina. Op elke KPI en chart wordt trust-info getoond. Klikken op een waarde opent een Trust Inspector drawer (zie §7.3).

## 7. Trust score & Inspector drawer

**Design:** `datapraat-trust-mockups.html` — screens 01 (badges) en 02 (drawer).

### 7.1 Trust score per metric

Een score (0-100%) per KPI, gebaseerd op:
- **Compleetheid** — % records niet uitgesloten door validatie
- **Versheid** — boost als data recent ververst is, penalty bij >7 dagen oud
- **Validatie-status** — penalty per open kritiek issue op onderliggende records
- **Bron-dekking** — % verwachte aanbieders dat heeft geleverd

Per tier een kleur (warm palette):
- **90-100%** — `success-tint` bg, `success-strong` tekst (groen, gedempt)
- **70-89%** — `warning-tint` bg, `warning-strong` tekst (amber)
- **< 70%** — `destructive-tint` bg, `destructive` tekst (terra)

Weergegeven als badge naast de label van de metric: `● Datakwaliteit 96%`.

### 7.2 Gemeente-brede trust score

Aggregaat van alle metric-scores, zichtbaar in de pagina-header. Werkt als "datakwaliteit-thermometer" voor de hele operatie.

### 7.3 Trust Inspector drawer

Klik op een KPI of chart → rechter drawer (480-520px) opent, hoofd-UI blijft zichtbaar (gedimd is een UI-keuze voor pitches, in het echte product blijft hoofd-UI volledig zichtbaar).

**Drawer-secties:**
1. **Header:** label, metric-naam, waarde, trust-score (grote cirkel met kleur)
2. **Definitie:** menselijke tekst + SQL-formule in monospace
3. **Bron:** tabel-naam, totaal records, opgenomen, uitgesloten (klikbaar), periode, aanbieders-count
4. **Mini-lineage:** 5 nodes horizontaal (Bron → Ingestie → Validatie → Aggregatie → KPI)
5. **Validatie:** lijst van regels met pass/fail icoon en count
6. **Versheid:** laatst ververst, bron-systeem, eigenaar van de definitie

**Acties onderin:** "Toon uitgesloten records", "Volledige lineage", "Vraag DataPraat" (opent chat met deze metric als context).

### 7.4 Acceptance

- Elke KPI heeft een trust-badge
- Badge is klikbaar en opent drawer
- Drawer laadt binnen 500ms (data is server-gecached)
- Alle velden in drawer zijn gevuld met echte data, geen placeholders

## 8. Data lineage (volledige view)

**Design:** `datapraat-trust-mockups.html` — screen 03.

**Route:** `/[gemeente]/lineage/[metric-id]`

Visuele graph van links naar rechts, 5 kolommen:

| Kolom | Inhoud |
|-------|--------|
| Bronnen | Per-aanbieder record-counts + status ("Actueel", "Incompleet") |
| Ingestie | Staging-table met totaal records + laad-timestamp |
| Validatie | Regels-count, pass-rate, open issues |
| Transformatie | SQL-aggregatie, versie, groupBy/filter details |
| Output | De KPI zelf met waarde + trust score |

**Connections:** SVG paths met arrow markers, subtly geanimeerd bij hover (pulse op node → arrow naar next).

**Interacties:**
- Klik op node → detail-panel rechts (uitgesloten records, transformatie-code, wijzigingshistorie)
- Export PDF knop in toolbar — rendert hele lineage + metadata voor accountant/auditor
- URL-linkable: link naar specifieke metric opent direct de juiste lineage

**Business rule:** lineage-data moet live opgebouwd worden uit validatie-engine + dbt/SQL metadata, niet hardcoded.

## 9. Domein-glossarium

**Design:** `datapraat-trust-mockups.html` — screen 04.

**Route:** `/[gemeente]/glossary/[category]/[code]`

Wiki-achtige kennisbank voor jeugdzorg-termen, gekoppeld aan de gemeente-data.

**Entry-types:**
- Productcategorieën (iJW-codes, primaire focus)
- Verwijzers
- KPI-definities
- Validatie-regels

**Per entry (voorbeeld: productcategorie):**
- Naam + code
- Officiële omschrijving (bron: iJW 3.0 of VWS)
- Beschrijving in gewone taal
- "Wel/niet inbegrepen" tekst
- Kerncijfers voor deze gemeente (cliënten, uitgaven, gem. prijs, gem. looptijd, top verwijzer)
- Validatie-regels die op deze categorie worden toegepast
- Verwante categorieën (met cross-links)
- Bron-referenties met badges (iJW, VWS, CBS, NJi, DataPraat)

**Navigatie:** linker-kolom met zoekveld + categorie-lijst, rechter-kolom met detail.

**Data-bron:** content komt deels uit statische seed-data (officiële codes/definities), deels uit live queries voor "jouw cijfers" sectie.

## 10. Validatie-engine

**Design:** `datapraat-menu-screens.html` — screen 03 (Validatie).

Validatie-regels zijn jeugdzorg-specifiek. Geen generieke "outlier detection" — regels die domein-patronen kennen.

### 10.1 Regel-types (MVP)

| Regel | Detectie | Voorbeeld |
|-------|----------|-----------|
| **Decimaal-scheider** | Waarde is 100× of 1000× afwijkend van categorie-mediaan, consistent met punt/komma-verwisseling | `€2.450,00` vs context-mediaan `€24,50` → suggereert factor 100 fout |
| **Outlier (domain-aware)** | Z-score > 3 t.o.v. productcategorie-mediaan van diezelfde aanbieder | Pluryn-declaratie €48.200 voor 45A12 waar mediaan €15.080 is |
| **Ontbrekende periode** | Aanbieder heeft normaal ≥N records/maand voor cat X; deze maand < N/3 | Pactum heeft normaal 12-18 pleegzorg declaraties/mnd; juli = 0 |
| **Dubbele declaratie** | Zelfde cliëntId, zelfde week, zelfde productcat, verschillende aanbieders | Cliënt #C-4412 → Lentis én Trajectum zelfde week |
| **Prijs-spreiding** | Declaratie > 1 standaard deviatie van aanbieder-mediaan voor deze cat | — |
| **Looptijd-controle** | Traject > 18 maanden zonder herindicatie | — |
| **Codering-mismatch** | Declaratie-code bestaat niet in iJW 3.0 codelijst | — |

### 10.2 Issue-object

Elke gedetecteerde afwijking wordt een issue met:
- `severity`: `critical` / `warning` / `info`
- `confidence`: 0-100% (hoe zeker is DataPraat dat dit écht een probleem is)
- `impact`: geschat effect in € of record-count
- `suggestedActions`: lijst (bv `["Corrigeer", "Negeer", "Contact aanbieder"]`)
- `context`: aanbieder, cliënt, periode, productcategorie

### 10.3 UI-gedrag

- Filter-pills bovenaan: "Alle", "Kritiek", "Waarschuwing", "Opgelost"
- Elke regel-item heeft border-left in severity-kleur (bad/warn/good)
- Actions zijn 2 knoppen (primair + secundair)
- Bij "Negeer" → move naar "Opgelost" met reden
- Bij "Corrigeer" → opens inline edit-flow (MVP: alleen annotatie, niet werkelijke data-wijziging)
- Nav-item "Validatie" in sidebar toont badge met open-kritieke-issues-count

---

## Deel IV — Pagina's & features

## 11. App shell & navigation

**Design:** sidebar patroon uit `datapraat-menu-screens.html` (identiek op alle hoofd-pagina's).

**Route-structuur:**
```
/[gemeente]/overzicht          → Overzicht dashboard
/[gemeente]/prognose           → Prognose
/[gemeente]/validatie          → Validatie
/[gemeente]/benchmark          → Benchmark  
/[gemeente]/verwijzers         → Verwijzers
/[gemeente]/lineage/[metric]   → Lineage voor specifieke metric
/[gemeente]/glossary           → Glossary landing
/[gemeente]/glossary/[cat]/[code] → Glossary entry
/[gemeente]/chat               → Chat landing (nieuw gesprek)
/[gemeente]/chat/[id]          → Specifieke conversatie
```

**Sidebar (260px breed):**

Vaste sectie (top):
- Logo
- Gemeente-selector (dropdown)
- "Nieuwe chat" knop (primary)

Scroll-sectie:
- **Inzicht** (5 items): Overzicht, Prognose, Validatie [badge], Benchmark, Verwijzers
- **Trust** (3 items): Lineage, Glossary, Validatie regels
- **Chats** (variabele lijst): recent + "Toon meer →"

**Iconen per menu-item** (inline SVG, 16×16, stroke 1.5, `currentColor`):
- Overzicht: dashboard-grid (4 tegels)
- Prognose: trending-up lijn
- Validatie: shield-check
- Benchmark: bar-chart (3 balken verschillende hoogte)
- Verwijzers: git-branch (3 nodes met lijnen)
- Lineage: branch-network
- Glossary: open boek
- Validatie regels: clipboard-check

**Responsive:** op < 1024px breedte wordt sidebar een popover-menu (linksboven togglebaar). Desktop-first; mobile is MVP-scope *niet*.

## 12. Overzicht dashboard

**Route:** `/[gemeente]/overzicht`  
**Design:** `datapraat-menu-screens.html` — screen 01  
**Purpose:** Eerste indruk voor MT/wethouder. KPI's + trends in één blik.

### 12.1 UI-structuur

**Header:**
- Titel: "Jeugdzorg in een oogopslag"
- Subtitle: "Stand per [laatste_peildatum] · laatste update [relatieve tijd]"
- Filter-pills rechts: jaar-selector, YTD/Q1-4/maand

**KPI-grid (4 tiles):**
| KPI | Berekening | Delta |
|-----|------------|-------|
| Uitgaven YTD | `SUM(PxQ)` jaar-to-date | % vs begroot YTD |
| Begroot YTD | Budget ÷ 12 × maanden | % van jaarbudget |
| Aantal trajecten | Distinct `ClientId` actief in periode | % vs vorig jaar zelfde periode |
| Gem. prijs / cliënt | `SUM(PxQ) / SUM(Q)` (regel §5.4.1!) | € delta YoY |

Elke KPI heeft trust-badge (zie §7).

**Charts (2-koloms, 2/3 + 1/3):**
- Links: "Maandelijkse uitgaven 2024" — stacked bar (begroot semi-transparent, gerealiseerd solid)
- Rechts: "Top productcategorieën" — doughnut chart met legend

### 12.2 Data-calls

- `vvd_actuals_summary(gemeente, periode, groupBy: 'maand')` → monthly data
- `vvd_actuals_summary(gemeente, periode, groupBy: 'productcategorie', limit: 6)` → top categorieën
- Budget-data uit CBS 83454NED of lokale budget-tabel

### 12.3 Acceptance

- Page laadt binnen 1s (server-rendered met cached data)
- Alle KPI's tonen actuele cijfers + trust-badge
- Filter-wijziging re-fetched data
- Klikken op KPI opent Trust Inspector drawer
- Klikken op chart-element opent drilldown (productcategorie, maand)

## 13. Prognose

**Route:** `/[gemeente]/prognose`  
**Design:** `datapraat-menu-screens.html` — screen 02  
**Purpose:** Toekomstvoorspelling met expliciete onzekerheid. Kritiek: *geen puntvoorspelling zonder bandbreedte*.

### 13.1 UI-structuur

**Header:**
- Titel: "Prognose vs Realisatie"
- Subtitle: "Prognoselabel: [active_prognoselabel] · 95% betrouwbaarheidsinterval"
- Filter: "Alle categorieën" / "Per zorgvorm" (dropdown)

**Main-layout (2/3 + 1/3):**

**Links (grote chart):** "Totale uitgaven · [start] – [eind]"
- Line chart met 4 series:
  - Gerealiseerd (solid, ink kleur)
  - Prognose (dashed, primary kleur)
  - CI boven (transparent fill)
  - CI onder (transparent fill, fills naar CI boven)

**Rechts (3 side-metrics verticaal):**
- YTD Burn — percentage jaarbudget verbruikt, met progress bar
- Forecast Accuracy — MAPE over laatste 12 maanden
- CI Coverage — % maanden waarin werkelijkheid binnen 95% CI viel

**Onder (table):** "Forecast breaches"
Lijst van maanden waar werkelijkheid buiten CI viel. Kolommen: periode, productcat, forecast, actual, afwijking %, status badge (boven/onder CI).

### 13.2 Data-calls

- `vvd_compare_forecast_actuals(gemeente, prognoselabel)` → de full comparison reeks
- `vvd_forecast_summary(gemeente, periode='Q4 current_year')` → actieve forecast window
- MAPE en CI coverage server-side berekend

### 13.3 Kritieke regels

- **Gebruik altijd en-dash in prognoselabel:** `"Prognose per 202311 – 202412"` (niet `"202311-202412"`)
- **Forecast-accuracy berekening:** `MAPE = MEAN(|actual - forecast| / actual) * 100`
- **CI coverage:** `COUNT(actual BETWEEN CI_onder AND CI_boven) / COUNT(*) * 100`

### 13.4 Acceptance

- Chart laadt met CI-band zichtbaar als gradient-fill tussen upper/lower
- Legende toont alleen "Gerealiseerd" en "Prognose" (CI-series verbergen)
- Breach-tabel toont alleen breaches, leeg staat = "Geen breaches in deze periode"
- Trust-badge op de forecast zelf toont MAPE-tier (success/warn/bad)

## 14. Validatie

**Route:** `/[gemeente]/validatie`  
**Design:** `datapraat-menu-screens.html` — screen 03  
**Logica:** zie §10 (engine-detail)

### 14.1 UI-structuur

**Header:**
- Titel: "Datavalidatie"
- Subtitle met live count: "3 kritieke afwijkingen · 7 waarschuwingen · 142 controles uitgevoerd op 2.847 declaraties"

**Filter-pills:** Alle / Kritiek / Waarschuwing / Opgelost

**Validatie-lijst (stacked cards):**
Elk item: severity-icon, title, detail, meta (aanbieder, confidence, impact), 2 actie-buttons rechts.

### 14.2 Acceptance

- Filters werken instant (client-side filtering op voorgeladen lijst)
- Actie "Corrigeer" opent inline annotatie-formulier (MVP: alleen comment, geen data-edit)
- Actie "Contact aanbieder" opens email-draft in nieuw venster met pre-populated content
- Sidebar-badge toont count van kritieke open issues

## 15. Benchmark

**Route:** `/[gemeente]/benchmark`  
**Design:** `datapraat-menu-screens.html` — screen 04  
**Purpose:** Vergelijking met peer-gemeenten via CBS-data.

### 15.1 UI-structuur

**Header:**
- Titel: "Vergelijking met peer-gemeenten"
- Subtitle: "Gebaseerd op CBS Jeugdzorg open data ([tabel]) · [N] vergelijkbare gemeenten"
- Filter: regio / per-inwonertal

**Hero-block:** prominent stat met percentiel-positie
- Links: context-zin ("Riemsterdal zit op €X per cliënt — boven peer-gem. €Y, binnen spreiding")
- Rechts: groot percentiel-getal ("73e percentiel · 12 peers")

**Charts-rij:** kosten-per-cliënt bar chart + volume-per-1000-jongeren bar chart

**Peer-tabel:** geanonimiseerde peers met kolommen: gemeente (of "u"), inwoners, cliënten, kosten/cliënt, delta vs u, positie-badge

### 15.2 Data-calls

- CBS 85099NED (cliënt-volume) en 85098NED (gemeente-vergelijking) via OData
- Mapping-tabel gemeente-pseudoniem → CBS-GemeenteCode (regel §5.4.4)

### 15.3 Acceptance

- Peer-gemeenten zijn altijd geanonimiseerd (Peer A, B, C...); alleen de gebruikers-gemeente heeft echte naam
- Selectie "Achterhoek-regio" vs "Per inwonertal" verandert peer-groep
- Percentiel-berekening is exact: `RANK / COUNT * 100`

## 16. Verwijzers

**Route:** `/[gemeente]/verwijzers`  
**Design:** `datapraat-menu-screens.html` — screen 05  
**Purpose:** Welke verwijzingspaden leiden tot welke kosten.

### 16.1 UI-structuur

**Header:**
- Titel: "Verwijzer-analyse"
- Subtitle: "Geschatte kosten per verwijzingspad · CBS-trajecten × VVD-prijs · YTD [jaar]"
- Filter: Kosten / Volume / Looptijd

**KPI-grid (4 tiles):** per hoofd-verwijzer (Wijkteam, Huisarts, Medisch spec., Gecertificeerde inst.) — % van trajecten + count + total €

**Pathway-chart (custom bar visualisatie):**
Per rij:
- Verwijzer-naam (links)
- Gradient-bar met gem. kosten getoond (breedte = relatief tot duurste)
- Stats rechts (total €, count)

**Insight-callout (onderin):** automatisch gegenereerde observatie, bv *"Trajecten via medisch specialist zijn 2,8× duurder dan via wijkteam — primair door langere gemiddelde looptijd (8,2 vs 5,4 maanden), niet door hogere uurprijs."*

### 16.2 Data-calls

- `vvd_actuals_summary(gemeente, groupBy: 'verwijzer')` → primaire data
- CBS trajecten-data voor looptijd-info

### 16.3 Business rules

- Pathway-breedte: `width = (gemiddelde_kosten / max_gemiddelde_kosten) * 100%`
- Insight-callout wordt server-side gegenereerd (rule-based, niet LLM) o.b.v. top-pattern in data

## 17. Chat (DataPraat Chat)

**Routes:** `/[gemeente]/chat` (nieuw), `/[gemeente]/chat/[id]` (bestaand)  
**Design:** `datapraat-chat-mockups.html` — 5 schermen, plus `datapraat-flow-mockups.html` voor integratie  
**Purpose:** Conversational interface voor iedereen (wethouder tot data-analist).

### 17.1 Layout

**Welkomstscherm** (geen chat id):
- Grote begroeting ("Hallo [naam], waar wil je over praten?")
- Context-strip onder begroeting: gemeente, periode, aantal declaraties beschikbaar
- Grid van 6 voorgestelde vragen, gegroepeerd (Overzicht, Trend, Benchmark, Prognose, Verwijzers, Anomalieën)
- Input onderaan met filter-chips

**Actieve chat:**
- Header: chat-titel, subtitle met chat-meta, actie-knoppen (Deel, Voeg toe aan rapport)
- Chat-stream (flexbox column, scrollable)
- Input-wrap onderaan (sticky)

### 17.2 Message-types

**User message:**
- Right-aligned, `bg-card` met `ring-1 ring-border`, radius 16px (rounded-2xl)
- Max-width 70-85%

**Assistant message:**
- Left-aligned, **geen bubble** — tekst direct op achtergrond (per brand guide)
- `text-sm leading-7 font-light` (font-weight 300, line-height 1.75)
- Header met AI-tag: `● DataPraat · 1,4s · 2.847 declaraties`
- Rich content ondersteund: **bold**, tabellen, embedded charts, citations, confidence-blokken

**Rich content in assistant-message:**
- **Embedded chart:** in `.embed` box met titel, chart (Recharts), source-metadata
- **Embedded table:** full table met monospace cellen
- **Citations-chip-row** onderaan bepaalde antwoorden: chip per source (tabel, periode, validatie-status, methode)
- **Confidence-blok:** bij onzekere antwoorden — primary-tint border, "Betrouwbaarheid · X%" label + uitleg

**Actions onderaan assistant-message** (rij van action-chips):
- Algemeen: 👍👎
- Chart-specifiek: "Pas grafiektype aan", "Wijzig periode", "Export PNG"
- Data-specifiek: "Kopieer tabel", "Export naar Excel", "+ Voeg toe aan dashboard"
- Context-specifiek (drilldown): "Toon onderliggende declaraties", "Vergelijk met peer-gemeenten", "Forecast Q4 obv deze trend", "Genereer MT-briefing"

### 17.3 Context behoud

Elke chat heeft een `context` object:
```typescript
{
  gemeente: string;
  periode: { from: Date; to: Date };
  filters: Filter[]; // active filter chips
  sourceScreen?: string; // bv "overzicht.monthly-chart" als chat vanuit dashboard werd gestart
  previousQueries: QueryResult[]; // voor drilldown coherentie
}
```

Context-chips tonen zichtbaar aan user. Bij "Waarom?"-vervolgvraag weet LLM welk onderwerp dit betreft.

### 17.4 LLM-integratie

- Model: Claude (Anthropic API)
- System prompt bevat: gemeente-data-samenvatting, actieve filters, beschikbare MCP tools, brand guide tone of voice
- Tool use: LLM roept MCP functies (`vvd_actuals_summary`, `cbs_vvd_vergelijk`, etc.) aan voor data-calls
- Response-rendering: parse LLM-output naar structured message met embedded components (chart/table/confidence)
- Streaming: tokens worden streamed naar UI met typing-indicator

### 17.5 Suggested questions

- Per context generated (bij chart geopend: suggesties rond die chart; bij leeg: 6 generieke openers)
- Klik = automatisch invullen + verzenden

### 17.6 Acceptance

- "Nieuwe chat"-knop in sidebar opent welkomstscherm
- Vragen worden beantwoord in < 3s voor eenvoudige aggregaties
- Embedded charts renderen binnen het chat-bericht (niet als link)
- Bij onzekerheid (>10% MAPE) expliciet confidence-blok tonen
- User kan terug-scrollen door eerdere berichten in een chat
- Chat-lijst in sidebar toont laatste 10 chats, met "Toon meer"

## 18. Flow-integraties (dashboard ↔ chat)

**Design:** `datapraat-flow-mockups.html` — alle 4 schermen.

De bridge tussen overzicht-pagina's en chat. Drie patronen:

### 18.1 Chat-launcher (persistent)

Floating button rechtsonder, altijd zichtbaar op alle pagina's:
- Ronde pill met DataPraat-orb
- Tekst: "Praat met je data"
- Subtitle: "[N] recente chats"
- Klik → opent chat met huidige pagina als context

### 18.2 Per-chart "Vraag hierover"

Op elke chart-card: kleine ask-button in header (gold-tint-achtergrond, primary-tekst): "💬 Vraag hierover" of "Vraag"

Klik → drawer opent rechts (met animatie), bevat:
- Chart als thumbnail-context-card
- 5 suggested questions specifiek voor die data
- Input onder met auto-loaded context-chips

### 18.3 Quick-ask bar (top of page)

Op elke hoofd-pagina, onder header: een subtle input bar met placeholder "Stel een vraag over [gemeente] · [periode]" en shortcut-hint ⌘+K

### 18.4 Breadcrumb-terug vanuit chat

Bovenin chat-scherm: "← Terug naar overzicht · Overzicht / [chart-naam] / Chat · '[onderwerp]'"

Klikken brengt user terug naar het vertrekpunt met state behouden.

### 18.5 "Pin naar overzicht" / "Open in dashboard"

Bij elk chat-antwoord met embedded chart: CTA-box onder antwoord: "Wil je dit antwoord bewaren?" met knoppen "📌 Pin naar overzicht" en "Open in dashboard →".

Pinning voegt de chart toe aan een "Gepinned" sectie op overzichtspagina.

### 18.6 Split-view (power-user mode)

Toggle op een chart → split-layout: chart linker helft, chat rechter helft. Vragen over de chart updaten de chart live.

Route: `/[gemeente]/overzicht?focus=[chart-id]&chat=open`

---

## Deel V — Algemene eisen

## 19. Nederlandse locale

Alle UI-tekst, getallen, datums in het Nederlands.

**Getalformat** (via `toLocaleString("nl-NL")`):
- Decimaal: komma → `€13,5 mln`
- Duizendtallen: punt → `€13.500` / `2.500 cliënten`
- Valuta: `€` direct voor bedrag, geen spatie
- Compacte vorm: `€13,5 mln`, `€500K`
- Percentages: `5,9%` (met komma)
- Factoren: `2,8×` (niet `2.8x`)

**Datum:**
- Volledig: `30 september 2024`
- In charts: `jan '23`, `dec '24`
- Relatief: `2 uur geleden`, `gisteren`, `2 dagen geleden`

## 20. Performance

- Initial page load < 1.5s (server-rendered, cached data)
- Chart-interactie < 100ms
- Filter-changes < 500ms
- LLM-responses: streaming, first-token < 1s
- MCP data-calls gecached op server-side, TTL = 1 uur voor actuals, 1 dag voor forecasts

## 21. Security & compliance

- **Data verlaat nooit de gemeente-tenant** (behalve expliciet aangewezen externe calls: CBS OData, Anthropic API)
- **Authenticatie:** via Azure AD / SSO van de gemeente
- **Autorisatie:** MVP = alle authenticated users zien alles binnen hun gemeente. Roles later.
- **Audit-log:** alle data-wijzigingen (annotaties, issue-resolutions) loggen naar aparte audit-tabel
- **AVG:** cliënt-ID's zijn pseudoniemen, geen persoonlijke data in UI
- **BIO/NEN-7510:** VDD's Azure-infrastructuur voldoet (gemeente neemt compliance-verantwoordelijkheid)
- **AI Act:** chat-feature is "limited risk" systeem — expliciete disclosure dat user met AI interacteert, logs bewaard, output-filtering voor hallucinations

## 22. Accessibility

- WCAG 2.1 AA als baseline
- Alle interacties keyboard-bereikbaar (tab-volgorde logisch, focus-rings zichtbaar)
- Kleur is nooit de enige drager van betekenis (status-badges hebben ook tekst en icoon)
- Chart-data beschikbaar als data-tabel alternatief (bij klik op "Toon als tabel")

---

## Deel VI — Scope

## 23. In scope (MVP v1.0)

- Alle 5 hoofd-pagina's (§12-§16)
- Chat-feature (§17) met Claude-integratie
- Trust layer componenten: Trust badges, Inspector drawer, Lineage view, Glossary (§7-§9)
- Validatie-engine met MVP rule-set (§10.1 regels 1-5)
- Flow-integraties: launcher, per-chart ask, quick-ask, breadcrumb (§18.1-§18.4)
- Nederlandse locale
- Desktop-first (≥ 1024px viewport)

## 24. Out of scope voor MVP (roadmap)

| Feature | Wanneer | Waarom niet MVP |
|---------|---------|-----------------|
| Scenario builder ("wat-als") | Q2 2026 | Extra complexity, niet core-need voor eerste users |
| Real-time streaming data | Q2 2026 | Vereist andere data-architectuur |
| Externe-data hub (DUO, UWV, NJi, IGJ) | Q3 2026 | Elke bron is apart integratie-project |
| Pin naar overzicht / split-view (§18.5-§18.6) | Post-MVP | User-research eerst |
| Mobile / responsive | Post-MVP | Primaire users werken desktop |
| Role-based access | Post-MVP | Alle gemeente-users hebben zelfde rechten initial |
| Multi-gemeente overzicht | Geen | Bewust: DataPraat is per-gemeente |

---

## Appendix A: Jeugdzorg domain primer

Als de ontwikkelaar geen jeugdzorg-context heeft, hier de minimum kennis:

**Wat is jeugdzorg?** Sinds 2015 (Jeugdwet) verantwoordelijkheid van gemeenten. Omvat alle zorg en ondersteuning voor kinderen/jongeren ≤ 18 jaar met psychische, sociale of ontwikkelingsproblemen.

**Hoofdcategorieën (iJW 3.0):**
- **Ambulant basis (41A11):** lichte GGZ, op locatie
- **Ambulant specialistisch (45A12):** zware GGZ zonder verblijf
- **Verblijf (43A22):** jeugdige woont bij zorgaanbieder
- **Pleegzorg (44C01):** jeugdige in pleeggezin
- **Jeugdbescherming (51A01):** gedwongen kader (voogd, OTS)

**Verwijzers (wie verwijst naar jeugdzorg):**
- **Wijkteam:** sociaal-wijkteam van gemeente (goedkoopst pad)
- **Huisarts:** kan direct verwijzen
- **Medisch specialist:** jeugdpsychiater/kinderarts (duurst pad, langste looptijd)
- **Gecertificeerde instelling:** zoals een jeugdbeschermer
- **Rechter / OM:** bij dwangmaatregelen

**Data-flow:**
Aanbieder levert zorg → declaratie via iJW-bericht naar gemeente → gemeente betaalt → declaratie komt in FactWerkelijk-tabel bij DataPraat.

**Kostenbepalers:**
- Volume (hoeveel cliënten/trajecten)
- Prijs per traject (contract-afspraken met aanbieder)
- Looptijd (hoe lang een cliënt in zorg blijft)
- Intensiteit (hoe vaak per week)

**Typische pijnpunten:**
- Data komt laat binnen (2-3 maanden vertraging)
- Verschillende aanbieders leveren in verschillende kwaliteit
- Een cliënt kan bij meerdere aanbieders tegelijk zijn
- Tarief-afspraken wijzigen per jaar per aanbieder
- "Dubbele declaraties" komen regelmatig voor (administratieve fout)

## Appendix B: Design file mapping

| Design file | Bevat | Primair voor sectie |
|-------------|-------|---------------------|
| `datapraat-menu-screens.html` | 5 hoofdpagina's (overzicht, prognose, validatie, benchmark, verwijzers) met gedeelde sidebar | §11, §12-§16 |
| `datapraat-trust-mockups.html` | Trust badges, Inspector drawer, Lineage graph, Glossary | §7-§9 |
| `datapraat-chat-mockups.html` | Chat interface: welkom, tabel-antwoord, chart-antwoord, drilldown, forecast | §17 |
| `datapraat-flow-mockups.html` | Bridge-patronen tussen dashboard en chat | §18 |
| `datapraat-pitch-deck-v2.html` | Productpositionering + verhaal (niet implementatie) | §1-§2 context |
| `datapraat-brand-guide-v1.1.md` | Alle visuele tokens, component-patterns, voice & tone | overal |

## Appendix C: Glossary ontwikkelaars-termen

- **iJW:** Informatiestandaard Jeugdwet (NEN-standaard voor data-uitwisseling)
- **VVD:** Voorziening Verantwoording Data (VDD's datamodel-product)
- **VDD:** partner-organisatie die Azure-infra levert aan gemeenten
- **Prognoselabel:** unieke identifier van een specifieke forecast-versie (bv `"Prognose per 202311 – 202412"` — betekent: forecast gemaakt in november 2023, reikt tot december 2024)
- **Productcategorie:** iJW-code voor type zorgdienst (bv `45A12`)
- **DeclaratieId:** unieke identifier van één gefactureerde zorgperiode van één cliënt bij één aanbieder
- **FactWerkelijk / FactVoorspelling:** SQL-tables voor resp. realisatie en forecast
- **P_werkelijk:** werkelijke prijs voor één unit zorg (bij deze aanbieder, deze periode)
- **Q:** volume — aantal units zorg geleverd
- **PxQ:** prijs × volume = totale kosten voor die regel
- **MCP:** Model Context Protocol — standaard voor tool-calls naar backend services

---

## Versie-info

- **Versie:** 1.0
- **Datum:** 22 april 2026
- **Eigenaar:** Daan (headfwd) / DataPraat
- **Status:** concept voor AI-implementation, review vereist voor edge-cases

---

## Bouwvolgorde — samenvatting

1. **Fundering:** app shell, routing, sidebar, brand-token integratie (§11)
2. **Overzicht dashboard:** basis KPI/chart layout (§12)
3. **Chat MVP:** zonder embedded charts, alleen tekst-antwoorden met Claude + basic MCP (§17)
4. **Trust badges + Inspector drawer:** cross-cutting toegevoegd aan §12 (§7)
5. **Prognose:** forecast chart met CI (§13)
6. **Validatie:** engine + UI (§14, §10)
7. **Benchmark:** CBS integratie (§15)
8. **Verwijzers:** pathway-chart (§16)
9. **Lineage + Glossary:** volledige trust-layer views (§8, §9)
10. **Chat uitbreiden:** embedded charts, drilldown, suggestions (§17 rest)
11. **Flow-integraties:** launcher, ask-buttons, breadcrumbs (§18)
12. **Polish:** accessibility, performance tuning, Nederlandse locale audit (§19, §20, §22)
