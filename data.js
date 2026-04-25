// DataPraat — mock data voor Riemsterdal (fictieve gemeente)
// Alle getallen zijn realistisch voor een gemeente van ~28.400 inwoners

window.DataPraatData = {
  gemeente: {
    code: "RMS",
    naam: "Riemsterdal",
    inwoners: 28400,
    regio: "Achterhoek",
    peildatum: "30 september 2024",
    laatsteUpdate: "2 uur geleden",
    jaarbudget: 9_500_000,
  },

  overzichtKPIs: [
    { id: "uitgaven_ytd", label: "Uitgaven YTD", value: "€7,2M", raw: 7_198_420, delta: "↑ 5,9% boven begroot", deltaKind: "warn", trust: 96 },
    { id: "begroot_ytd", label: "Begroot YTD", value: "€6,8M", raw: 6_800_000, delta: "75% van jaarbudget", deltaKind: "neutral", trust: 100 },
    { id: "trajecten", label: "Aantal trajecten", value: "453", raw: 453, delta: "↓ 2,1% vs Q3 ′23", deltaKind: "good", trust: 87 },
    { id: "gem_prijs", label: "Gem. prijs / cliënt", value: "€15.842", raw: 15842, delta: "↑ €1.240 YoY", deltaKind: "warn", trust: 94 },
  ],

  maandUitgaven: [
    { maand: "jan", actual: 760, begroot: 790 },
    { maand: "feb", actual: 720, begroot: 760 },
    { maand: "mrt", actual: 800, begroot: 770 },
    { maand: "apr", actual: 820, begroot: 780 },
    { maand: "mei", actual: 790, begroot: 780 },
    { maand: "jun", actual: 840, begroot: 790 },
    { maand: "jul", actual: 860, begroot: 790 },
    { maand: "aug", actual: 910, begroot: 780 },
    { maand: "sep", actual: 698, begroot: 770 },
    { maand: "okt", actual: null, begroot: 780 },
    { maand: "nov", actual: null, begroot: 790 },
    { maand: "dec", actual: null, begroot: 800 },
  ],

  topCategorieen: [
    { code: "45A12", naam: "Ambulant specialistisch", waarde: 2_300_000, aandeel: 32 },
    { code: "43A22", naam: "Verblijf zwaar", waarde: 1_580_000, aandeel: 22 },
    { code: "44C01", naam: "Pleegzorg", waarde: 1_080_000, aandeel: 15 },
    { code: "51A01", naam: "Jeugdbescherming", waarde: 860_000, aandeel: 12 },
    { code: "41A11", naam: "Jeugd-GGZ basis", waarde: 720_000, aandeel: 10 },
    { code: "45A14", naam: "Ambulant systemisch", waarde: 658_420, aandeel: 9 },
  ],

  forecastSeries: [
    // 2022 actuals
    { periode: "2022-01", actual: 680, forecast: null, ciLow: null, ciHigh: null },
    { periode: "2022-04", actual: 720, forecast: null, ciLow: null, ciHigh: null },
    { periode: "2022-07", actual: 740, forecast: null, ciLow: null, ciHigh: null },
    { periode: "2022-10", actual: 770, forecast: null, ciLow: null, ciHigh: null },
    // 2023 actuals
    { periode: "2023-01", actual: 740, forecast: null, ciLow: null, ciHigh: null },
    { periode: "2023-04", actual: 780, forecast: null, ciLow: null, ciHigh: null },
    { periode: "2023-07", actual: 810, forecast: null, ciLow: null, ciHigh: null },
    { periode: "2023-10", actual: 830, forecast: null, ciLow: null, ciHigh: null },
    // 2024: actuals + forecast tot dec
    { periode: "2024-01", actual: 760, forecast: 770, ciLow: 720, ciHigh: 820 },
    { periode: "2024-02", actual: 720, forecast: 760, ciLow: 710, ciHigh: 810 },
    { periode: "2024-03", actual: 800, forecast: 780, ciLow: 730, ciHigh: 830 },
    { periode: "2024-04", actual: 820, forecast: 790, ciLow: 740, ciHigh: 840 },
    { periode: "2024-05", actual: 790, forecast: 800, ciLow: 750, ciHigh: 850 },
    { periode: "2024-06", actual: 840, forecast: 810, ciLow: 760, ciHigh: 860 },
    { periode: "2024-07", actual: 860, forecast: 820, ciLow: 770, ciHigh: 870 },
    { periode: "2024-08", actual: 910, forecast: 830, ciLow: 780, ciHigh: 880 }, // breach
    { periode: "2024-09", actual: 698, forecast: 840, ciLow: 790, ciHigh: 890 },
    { periode: "2024-10", actual: null, forecast: 850, ciLow: 800, ciHigh: 900 },
    { periode: "2024-11", actual: null, forecast: 860, ciLow: 810, ciHigh: 910 },
    { periode: "2024-12", actual: null, forecast: 870, ciLow: 820, ciHigh: 920 },
  ],

  forecastBreaches: [
    { periode: "Aug 2024", cat: "45A12 — Ambulant specialistisch", forecast: "€412K", actual: "€487K", afwijking: "+18,2%", status: "Boven CI" },
    { periode: "Mei 2024", cat: "43A22 — Verblijf zwaar", forecast: "€189K", actual: "€156K", afwijking: "−17,5%", status: "Onder CI" },
  ],

  validatieIssues: [
    {
      id: "v1",
      severity: "critical",
      title: "Decimaal-scheidingsfout in declaratie #DCL-2024-08-1247",
      detail: "Aanbieder rapporteerde €2.450,00 waar context €24,50 suggereert · 100× afwijking van mediaan voor productcat 45A12",
      meta: { Aanbieder: "Stichting Lentis", Confidence: "96%", Impact: "€2.425" },
      actions: ["Negeren", "Corrigeer"],
    },
    {
      id: "v2",
      severity: "critical",
      title: "Outlier in productcategorie 45A12 (3,2× mediaan)",
      detail: "Cliënt #C-7821 declaratie €48.200 · mediaan voor categorie €15.080 · z-score 3,1",
      meta: { Aanbieder: "Pluryn", Confidence: "88%", Periode: "aug 2024" },
      actions: ["Negeren", "Onderzoek"],
    },
    {
      id: "v3",
      severity: "critical",
      title: "Ontbrekende declaraties — juli 2024",
      detail: "Geen declaraties ontvangen voor productcat 44C01 (pleegzorg) in juli · normaal 12–18/maand · prognose-impact €76K onder-rapportage",
      meta: { Verwacht: "14", Confidence: "92%", Bron: "Pactum" },
      actions: ["Negeren", "Contact aanbieder"],
    },
    {
      id: "v4",
      severity: "warning",
      title: "Dubbele declaratie mogelijk — cliënt #C-4412",
      detail: "Twee declaraties zelfde week, zelfde productcat (43A22), verschillende aanbieders · €1.840 + €1.920",
      meta: { Confidence: "71%", Aanbieders: "Lentis, Trajectum" },
      actions: ["Negeren", "Vergelijk"],
    },
    {
      id: "v5",
      severity: "warning",
      title: "Prijs-spreiding — productcat 41A11 aanbieder Trajectum",
      detail: "3 declaraties buiten 1σ van aanbieder-mediaan · gem. €1.840 vs mediaan €1.210",
      meta: { Confidence: "68%", Records: "3", Periode: "sep 2024" },
      actions: ["Negeren", "Onderzoek"],
    },
    {
      id: "v6",
      severity: "warning",
      title: "Looptijd-grens nadert — 4 trajecten",
      detail: "Trajecten > 16 maanden zonder herindicatie · wettelijke grens 18 maanden",
      meta: { Confidence: "100%", Records: "4", Categorie: "45A12" },
      actions: ["Negeren", "Signaleer team"],
    },
    {
      id: "v7",
      severity: "resolved",
      title: "Productcat 41A11 (jeugd-GGZ basis) — pricing within norm",
      detail: "Alle declaraties binnen 1 std van regio-mediaan · 184 records gecontroleerd",
      meta: { Periode: "Q3 2024", Spread: "€890–€1.420" },
      actions: ["Details"],
    },
  ],

  benchmarkPeers: [
    { naam: "Riemsterdal (u)", inwoners: 28400, clienten: 453, kostenPerClient: 15842, delta: "—", positie: "Boven mediaan", self: true },
    { naam: "Peer A", inwoners: 31200, clienten: 498, kostenPerClient: 18220, delta: "+15,0%", positie: "Hoger" },
    { naam: "Peer B", inwoners: 26800, clienten: 412, kostenPerClient: 16140, delta: "+1,9%", positie: "Vergelijkbaar" },
    { naam: "Peer C", inwoners: 29100, clienten: 467, kostenPerClient: 14890, delta: "−6,0%", positie: "Lager" },
    { naam: "Peer D", inwoners: 27500, clienten: 389, kostenPerClient: 12420, delta: "−21,6%", positie: "Veel lager" },
    { naam: "Peer E", inwoners: 30100, clienten: 482, kostenPerClient: 17110, delta: "+8,0%", positie: "Hoger" },
    { naam: "Peer F", inwoners: 25400, clienten: 368, kostenPerClient: 13210, delta: "−16,6%", positie: "Lager" },
  ],

  benchmarkSpread: [
    // voor spread-chart: percentielen peers + zelf-positie
    { label: "P10", waarde: 11_800 },
    { label: "P25", waarde: 13_400 },
    { label: "P50", waarde: 14_890 },
    { label: "P75", waarde: 17_200 },
    { label: "P90", waarde: 19_100 },
  ],
  benchmarkEigen: 15_842,

  benchmarkVolume: [
    // Volume per 1.000 jongeren
    { gemeente: "Peer D", volume: 14.2 },
    { gemeente: "Peer F", volume: 14.8 },
    { gemeente: "Peer C", volume: 15.9 },
    { gemeente: "Peer B", volume: 16.1 },
    { gemeente: "u", volume: 15.9, self: true },
    { gemeente: "Peer E", volume: 16.8 },
    { gemeente: "Peer A", volume: 17.2 },
  ],

  verwijzers: [
    { naam: "Wijkteam", aandeel: 52, trajecten: 236, totaal: "€2,8M", gemiddeld: 11860, looptijd: "5,4 mnd" },
    { naam: "Huisarts", aandeel: 21, trajecten: 95, totaal: "€1,5M", gemiddeld: 15790, looptijd: "5,8 mnd" },
    { naam: "Gecert. instelling", aandeel: 15, trajecten: 68, totaal: "€1,1M", gemiddeld: 16180, looptijd: "6,1 mnd" },
    { naam: "Medisch specialist", aandeel: 12, trajecten: 54, totaal: "€1,8M", gemiddeld: 33330, looptijd: "8,2 mnd" },
    { naam: "Rechter / OM", aandeel: 7, trajecten: 30, totaal: "€643K", gemiddeld: 21450, looptijd: "7,1 mnd" },
  ],

  chatHistory: [
    { id: "c1", title: "Ambulant kostengroei Q3", time: "2u" },
    { id: "c2", title: "Pleegzorg vs peer-gemeenten", time: "gisteren" },
    { id: "c3", title: "Forecast Q4 2024 totaal", time: "2 dagen" },
    { id: "c4", title: "Verwijzer-analyse jeugd-GGZ", time: "3 dagen" },
    { id: "c5", title: "Decimaal-fout Lentis dossiers", time: "1 wk" },
    { id: "c6", title: "MT-briefing oktober", time: "1 wk" },
    { id: "c7", title: "Validatie-issues Pactum", time: "2 wk" },
  ],

  suggestedQuestions: [
    { cat: "Overzicht", q: "Welke productcategorieën groeien het hardst in Q3?" },
    { cat: "Trend", q: "Hoe verhoudt augustus zich tot de rest van het jaar?" },
    { cat: "Benchmark", q: "Hoe scoren we op pleegzorg tov peer-gemeenten?" },
    { cat: "Prognose", q: "Wat verwacht het model voor Q4 2024?" },
    { cat: "Verwijzers", q: "Welke verwijzer levert de duurste trajecten?" },
    { cat: "Anomalieën", q: "Zijn er kritieke validatie-issues deze week?" },
  ],

  // Glossary entry voor 45A12
  glossary45A12: {
    code: "45A12",
    naam: "Ambulant specialistisch",
    tagline: "iJW 3.0 · CA01 · Bekostigingscategorie",
    omschrijving:
      "Ambulante specialistische jeugdhulp omvat gespecialiseerde behandeling die op locatie van de cliënt of bij de aanbieder wordt geleverd, zonder verblijf. Het richt zich op jeugdigen met complexere problematiek dan de basis-GGZ kan opvangen.",
    kerncijfers: [
      { label: "Cliënten", value: "142", sub: "31% van totaal" },
      { label: "Uitgaven", value: "€2,30M", sub: "32% van totaal" },
      { label: "Gem. prijs / cliënt", value: "€16.480", sub: "peer-mediaan: €14.200" },
      { label: "Gem. looptijd", value: "6,4 mnd", sub: "norm CBS: 5,8 mnd" },
      { label: "Top verwijzer", value: "Wijkteam", sub: "52% van instroom" },
      { label: "Aantal aanbieders", value: "8", sub: "Lentis = grootste" },
    ],
    bronnen: [
      { type: "iJW 3.0", desc: "Standaard productcodelijst" },
      { type: "VWS", desc: "Jeugdwet bekostigingsregels" },
      { type: "CBS 85099NED", desc: "Jeugdhulp StatLine" },
      { type: "DataPraat", desc: "Domeinmodel v2.1" },
    ],
    regels: [
      { ok: true, label: "Prijs-spreiding controle (z-score < 3 vs aanbieder-mediaan)", count: "142/142" },
      { ok: true, label: "Looptijd-controle (max 18 maanden zonder herindicatie)", count: "140/142" },
      { ok: false, label: "Volume-trend alert (groei > 15% per kwartaal)", count: "geactiveerd" },
    ],
    verwant: [
      { code: "41A11", naam: "Jeugd-GGZ basis", desc: "Lichtere problematiek · zonder specialistische component" },
      { code: "43A22", naam: "Verblijf zwaar", desc: "Bij doorverwijzing als ambulant niet volstaat" },
      { code: "45A14", naam: "Ambulant systemisch", desc: "Gericht op gezinssysteem ipv individuele jeugdige" },
    ],
  },

  // Trust Inspector content voor Uitgaven YTD
  trustInspector: {
    uitgaven_ytd: {
      label: "Uitgaven YTD",
      metricName: "Uitgaven YTD 2024",
      value: "€7.198.420",
      score: 96,
      tier: "Hoge betrouwbaarheid",
      statusText: "2.847 van 2.953 declaraties opgenomen · 14 validaties geslaagd · 0 kritieke issues",
      definitie:
        "Som van alle gerealiseerde declaraties (PxQ) voor jeugdzorg in Riemsterdal, voor de periode 1 januari t/m 30 september 2024.",
      formule: "SUM(P_werkelijk × Q_werkelijk) WHERE periode IN ['2024-01', ..., '2024-09']",
      bron: {
        tabel: "TabelFactWerkelijk",
        records: "2.953",
        opgenomen: "2.847",
        uitgesloten: "106",
        periode: "2024-01-01 — 2024-09-30",
        aanbieders: "17",
      },
      validatie: [
        { ok: true, label: "Periode-validatie (declaraties binnen YTD bereik)", count: "2.953/2.953" },
        { ok: true, label: "Productcategorie-mapping (geldige iJW-codes)", count: "2.928/2.953" },
        { ok: true, label: "Decimaal-validatie (geen dot/comma fouten)", count: "2.952/2.953" },
        { ok: false, label: "Outlier-detectie (z-score < 3)", count: "2.870/2.953" },
      ],
      versheid: {
        ververst: "vandaag 06:00",
        bron: "iJW 3.0 berichten",
        eigenaar: "DataPraat · v2.1",
      },
    },
  },
};
