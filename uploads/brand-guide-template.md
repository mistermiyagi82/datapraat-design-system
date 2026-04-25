# Brand Guide — [BEDRIJFSNAAM]

> **Instructie voor de AI**
> Dit is een merk-specificatie. Lees alle secties vóórdat je iets ontwerpt, codeert of schrijft.
> Gebruik uitsluitend de hier gespecificeerde waardes — geen eigen kleuren, fonts of stijlkeuzes.
> Als een sectie leeg is of "[VUL IN]" bevat: vraag eerst om verduidelijking; ga niet zelf invullen.
> Ontwerpkeuzes die hier níet zijn vastgelegd (bv. micro-interacties): leg ze kort uit voordat je ze toepast.

---

## 1. Brand fundamentals

- **Bedrijfsnaam:** [VUL IN]
- **Tagline:** [VUL IN — max 8 woorden]
- **Wat doet het bedrijf in één zin:** [VUL IN]
- **Doelgroep:** [VUL IN — wees specifiek, bv. "financieel beleidsadviseurs bij Nederlandse gemeenten"]
- **Drie merk-adjectieven:** [VUL IN — bv. "betrouwbaar, scherp, rustig"]
- **Drie merk-anti-adjectieven** (wat het NIET is): [VUL IN — bv. "speels, opdringerig, corporate"]

---

## 2. Color system

> Geef alle kleuren als HEX. Markeer welke kleuren primair zijn vs. accent vs. status.

### Primary palette
| Token | HEX | Gebruik |
|-------|-----|---------|
| `--primary` | `#______` | hoofd-accent, CTA's |
| `--secondary` | `#______` | secundair accent |

### Neutrals
| Token | HEX | Gebruik |
|-------|-----|---------|
| `--bg` | `#______` | hoofd-achtergrond |
| `--bg-soft` | `#______` | secundaire achtergrond, cards |
| `--surface` | `#______` | modals, popups |
| `--ink` | `#______` | primaire tekst |
| `--ink-soft` | `#______` | secundaire tekst |
| `--ink-mute` | `#______` | metadata, labels |
| `--line` | `#______` | borders, dividers |

### Status
| Token | HEX | Gebruik |
|-------|-----|---------|
| `--success` | `#______` | positieve feedback |
| `--warning` | `#______` | waarschuwingen |
| `--error` | `#______` | fouten, kritiek |

### Achtergrond-toon
- **Light / dark / warm / cool:** [VUL IN]

---

## 3. Typography

> Specificeer Google Fonts-namen of voeg font-files apart toe.

### Headings
- **Font family:** [VUL IN — bv. "Instrument Serif"]
- **Bron:** [Google Fonts URL of "custom file"]
- **Gewichten:** [VUL IN — bv. 400, 600]
- **Karakter:** [VUL IN — bv. "serif, italic toegestaan voor accent"]

### Body
- **Font family:** [VUL IN]
- **Bron:** [VUL IN]
- **Gewichten:** [VUL IN]

### Mono / data
- **Font family:** [VUL IN]
- **Gebruikt voor:** [VUL IN — bv. "code, getallen, labels, metadata"]

### Schaal
| Niveau | Pixel | Gebruik |
|--------|-------|---------|
| H1 | __px | page title |
| H2 | __px | section title |
| H3 | __px | subsection |
| Body | __px | standaard tekst |
| Small | __px | metadata, labels |

---

## 4. Logo & marks

- **Logo bestanden:** [referentie naar geüploade SVG/PNG]
- **Minimum afmeting:** __px
- **Clear space:** [bv. "minimum 1× hoogte van logo aan alle kanten"]
- **Plaatsing:** [bv. "altijd linksboven, nooit gecentreerd"]
- **Kleuren-varianten:** [bv. "donker op licht, licht op donker, monochroom"]
- **Wat NOOIT:** [bv. "niet draaien, niet vervormen, niet op fotografische achtergrond"]

---

## 5. Spacing & layout tokens

### Spacing schaal
| Token | Waarde |
|-------|--------|
| `--space-xs` | __px |
| `--space-sm` | __px |
| `--space-md` | __px |
| `--space-lg` | __px |
| `--space-xl` | __px |

### Border radius
| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--radius-sm` | __px | buttons, badges |
| `--radius-md` | __px | cards, inputs |
| `--radius-lg` | __px | modals, hero blocks |

### Shadows
- **Stijl:** [VUL IN — bv. "subtiel, warm" of "dramatisch, neutraal"]
- **Voorbeeld:** `box-shadow: __`

### Grid / max-width
- **Container max-width:** __px
- **Sidebar breedte:** __px
- **Default padding:** __px

---

## 6. Component patterns

> Beschrijf hoe veelgebruikte componenten eruit moeten zien.

### Buttons
- **Primary:** achtergrond `--primary`, tekst `--bg`, radius `--radius-sm`, padding __px __px
- **Secondary:** [VUL IN]
- **Tertiary / ghost:** [VUL IN]

### Cards
- Achtergrond: `--bg`
- Border: `1px solid --line`
- Radius: `--radius-md`
- Padding: __px

### Inputs
- [VUL IN]

### Tables
- [VUL IN]

### Charts
- **Primaire kleur:** `--primary`
- **Secundaire data-kleuren:** [VUL IN — bv. lijst van 5 HEX-codes]
- **Grid lines:** `--line` met opacity __
- **Font:** body font, __px

---

## 7. Iconography & imagery

- **Icon stijl:** [VUL IN — bv. "outline, 1.5px stroke" of "filled, geometrisch"]
- **Icon library:** [VUL IN — bv. "Lucide, Heroicons, custom set"]
- **Foto-stijl:** [VUL IN of "geen foto's gebruiken"]
- **Illustratie-stijl:** [VUL IN of "geen illustraties"]
- **Decoratieve elementen:** [VUL IN — bv. "geometrische patronen toegestaan, geen gradients"]

---

## 8. Voice & tone

### Aanspreekvorm
- **Pronoun (NL):** [jij / u]
- **Pronoun (EN):** [you]
- **Formaliteit:** [formeel / semi-formeel / informeel]

### Schrijfstijl
- **Zinslengte:** [kort / gemiddeld / variërend]
- **Vakjargon:** [vermijden / context-afhankelijk / gebruiken]
- **Toon:** [VUL IN — bv. "feitelijk, geen overdrijving, geen marketing-superlatieven"]

### Voorbeeld-zinnen
- ✅ Goed: "[VUL IN — voorbeeldzin in jouw tone of voice]"
- ❌ Vermijden: "[VUL IN — voorbeeld van wat je niet wilt]"

### Numerieke conventies
- **Decimaal-scheider:** [komma / punt]
- **Duizendtallen:** [punt / spatie / komma]
- **Valuta:** [bv. "€1.234,56"]
- **Datum:** [bv. "30 september 2024" of "30/09/2024"]

---

## 9. Do's & don'ts

### Wel doen
- [VUL IN]
- [VUL IN]
- [VUL IN]

### Niet doen
- [VUL IN — bv. "geen paarse gradients"]
- [VUL IN — bv. "geen emoji's in product-UI"]
- [VUL IN — bv. "geen Inter, Roboto of system-fonts"]

---

## 10. Reference & inspiration

- **Referentie-merken:** [VUL IN — bv. "Linear voor restraint, Stripe voor density"]
- **Anti-referenties:** [VUL IN — wat je expliciet níet wilt lijken]
- **Voorbeeld-screens:** [referentie naar geüploade afbeeldingen]

---

## Versie-info

- **Versie:** 1.0
- **Laatst bijgewerkt:** [datum]
- **Eigenaar:** [naam]
