/* global React, Icon, TrustBadge */

// ========================================================================
// SCENARIO BUILDER — "Wat als…?" tool
// Start met de basisprognose en draai aan knoppen om te zien wat er
// gebeurt. Bedoeld voor beleidsmakers: geen formules, wel gevolgen.
// ========================================================================

const SCENARIO_DEFAULTS = {
  volumeDelta: 0,           // % verandering aantal trajecten Q4
  prijsDelta: 0,            // % verandering gemiddelde prijs/traject
  instroomDelta: 0,         // nieuwe kinderen per maand extra/minder (absoluut)
  ambulantAandeel: 0,       // % punt verschuiving naar ambulant specialistisch
  startMaand: "okt",        // wanneer het effect ingaat
};

// Presets — herkenbare beleidsscenario's
const SCENARIO_PRESETS = [
  {
    id: "inkoop",
    label: "Strengere inkoopafspraken",
    desc: "Nieuwe tariefafspraken vanaf okt 2024 — 5% lager tarief per traject.",
    values: { volumeDelta: 0, prijsDelta: -5, instroomDelta: 0, ambulantAandeel: 0, startMaand: "okt" },
  },
  {
    id: "wijkteam",
    label: "Wijkteams pakken meer zelf op",
    desc: "20% van de lichte casussen blijft binnen het wijkteam ipv doorverwezen.",
    values: { volumeDelta: -8, prijsDelta: -2, instroomDelta: 0, ambulantAandeel: -3, startMaand: "okt" },
  },
  {
    id: "wachtlijst",
    label: "Wachtlijst wordt weggewerkt",
    desc: "Achterstand wegwerken in Q4 — extra instroom van 8 kinderen per maand.",
    values: { volumeDelta: 0, prijsDelta: 0, instroomDelta: 8, ambulantAandeel: 0, startMaand: "okt" },
  },
  {
    id: "groei",
    label: "Autonome groei zet door",
    desc: "Trend van 2023–2024 houdt aan: trajecten +3%, prijs +2%.",
    values: { volumeDelta: 3, prijsDelta: 2, instroomDelta: 0, ambulantAandeel: 0, startMaand: "okt" },
  },
  {
    id: "zwaar",
    label: "Verschuiving naar zwaardere zorg",
    desc: "Meer ambulant specialistisch in de mix (+5 procentpunt).",
    values: { volumeDelta: 0, prijsDelta: 3, instroomDelta: 0, ambulantAandeel: 5, startMaand: "okt" },
  },
];

// ------- Bereken scenario-forecast uit base + knoppen -----------------
const computeScenario = (base, knobs) => {
  // base = array met { periode, actual, forecast, ciLow, ciHigh }
  // return gelijke structuur met extra `scenario` veld
  const maandIndex = { jan: 0, feb: 1, mrt: 2, apr: 3, mei: 4, jun: 5, jul: 6, aug: 7, sep: 8, okt: 9, nov: 10, dec: 11 };
  const startIdx = maandIndex[knobs.startMaand] ?? 9;
  return base.map((d) => {
    const m = parseInt(d.periode.split("-")[1], 10) - 1;
    const afterStart = m >= startIdx;
    if (!afterStart || d.forecast == null) {
      return { ...d, scenario: d.forecast };
    }
    // Effect berekening
    const priceFactor = 1 + (knobs.prijsDelta / 100);
    const volumeFactor = 1 + (knobs.volumeDelta / 100);
    // Instroom: elke extra kind/mnd ~= €4.5K extra/mnd gemiddeld
    const instroomEuros = knobs.instroomDelta * 4.5;
    // Ambulant aandeel shift: elke +1pp ~= +0.6% totaal (want 45A12 is relatief duur)
    const mixFactor = 1 + (knobs.ambulantAandeel * 0.006);
    const scen = (d.forecast * priceFactor * volumeFactor * mixFactor) + instroomEuros;
    return { ...d, scenario: Math.round(scen) };
  });
};

const ScenarioChart = ({ data, width = 740, height = 300 }) => {
  const pad = { l: 50, r: 14, t: 18, b: 32 };
  const all = data.flatMap(d => [d.actual, d.forecast, d.scenario, d.ciLow, d.ciHigh]).filter(v => v != null);
  const max = Math.max(...all) * 1.05;
  const min = Math.min(...all) * 0.92;
  const xStep = (width - pad.l - pad.r) / (data.length - 1);
  const xOf = (i) => pad.l + i * xStep;
  const yOf = (v) => height - pad.b - ((v - min) / (max - min)) * (height - pad.t - pad.b);

  const actualPts = data.map((d, i) => d.actual != null ? `${xOf(i)},${yOf(d.actual)}` : null).filter(Boolean).join(" ");
  const forecastPts = data.map((d, i) => d.forecast != null ? `${xOf(i)},${yOf(d.forecast)}` : null).filter(Boolean).join(" ");
  const scenarioPts = data.map((d, i) => d.scenario != null ? `${xOf(i)},${yOf(d.scenario)}` : null).filter(Boolean).join(" ");

  const bandTop = data.map((d, i) => d.ciHigh != null ? `${xOf(i)},${yOf(d.ciHigh)}` : null).filter(Boolean).join(" ");
  const bandBot = data.slice().reverse().map((d, iRev) => {
    const i = data.length - 1 - iRev;
    return d.ciLow != null ? `${xOf(i)},${yOf(d.ciLow)}` : null;
  }).filter(Boolean).join(" ");

  // Detecteer splitsings-index (laatste actual)
  const lastActualIdx = data.reduce((acc, d, i) => d.actual != null ? i : acc, -1);
  const splitX = lastActualIdx >= 0 ? xOf(lastActualIdx) : pad.l;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <g key={i}>
          <line
            x1={pad.l} x2={width - pad.r}
            y1={yOf(min + (max - min) * f)} y2={yOf(min + (max - min) * f)}
            stroke="var(--line)" strokeDasharray={i === 0 ? "0" : "2 3"}
          />
          <text x={pad.l - 6} y={yOf(min + (max - min) * f) + 3} fontSize="9.5" fill="var(--ink-mute)" textAnchor="end" fontFamily="var(--f-mono)">
            €{Math.round(min + (max - min) * f)}K
          </text>
        </g>
      ))}

      {/* Toekomst-shading */}
      <rect
        x={splitX} y={pad.t}
        width={width - pad.r - splitX}
        height={height - pad.t - pad.b}
        fill="var(--bg-soft)" opacity="0.5"
      />
      <line x1={splitX} x2={splitX} y1={pad.t} y2={height - pad.b} stroke="var(--line-strong)" strokeDasharray="3 2"/>
      <text x={splitX + 4} y={pad.t + 10} fontSize="9" fill="var(--ink-mute)" fontFamily="var(--f-mono)">Vanaf hier = toekomst</text>

      {/* CI band */}
      {bandTop && bandBot && <polygon points={`${bandTop} ${bandBot}`} fill="var(--primary)" opacity="0.1"/>}

      {/* Base forecast (dashed primary) */}
      <polyline points={forecastPts} fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.55"/>

      {/* Scenario-lijn (solid warning color) */}
      {scenarioPts && (
        <polyline points={scenarioPts} fill="none" stroke="var(--warning)" strokeWidth="2.4"/>
      )}

      {/* Actuals */}
      <polyline points={actualPts} fill="none" stroke="var(--chart-cost)" strokeWidth="1.8"/>
      {data.map((d, i) => d.actual != null && (
        <circle key={`a${i}`} cx={xOf(i)} cy={yOf(d.actual)} r="2" fill="var(--chart-cost)"/>
      ))}

      {/* Scenario-eindpunt highlighten */}
      {data.map((d, i) =>
        d.scenario != null && i === data.length - 1 && (
          <g key={`end${i}`}>
            <circle cx={xOf(i)} cy={yOf(d.scenario)} r="4" fill="var(--warning)"/>
            <circle cx={xOf(i)} cy={yOf(d.scenario)} r="6" fill="none" stroke="var(--warning)" strokeWidth="1" opacity="0.4"/>
          </g>
        )
      )}

      {/* X-labels */}
      {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map((d) => {
        const idx = data.indexOf(d);
        return <text key={idx} x={xOf(idx)} y={height - 12} fontSize="9.5" fill="var(--ink-mute)" textAnchor="middle" fontFamily="var(--f-mono)">{d.periode.slice(2)}</text>;
      })}

      {/* Legend */}
      <g transform={`translate(${pad.l}, 6)`}>
        <line x1="0" y1="6" x2="14" y2="6" stroke="var(--chart-cost)" strokeWidth="1.8"/>
        <text x="18" y="9" fontSize="10" fill="var(--ink-soft)">Gerealiseerd</text>
        <line x1="100" y1="6" x2="114" y2="6" stroke="var(--primary)" strokeWidth="1.8" strokeDasharray="3 2" opacity="0.55"/>
        <text x="118" y="9" fontSize="10" fill="var(--ink-soft)">Basisprognose</text>
        <line x1="200" y1="6" x2="214" y2="6" stroke="var(--warning)" strokeWidth="2.4"/>
        <text x="218" y="9" fontSize="10" fill="var(--ink-soft)" fontWeight="500">Scenario</text>
      </g>
    </svg>
  );
};

// ------- Slider component -----------------
const ScenarioSlider = ({ label, sub, value, onChange, min, max, step, unit, icon }) => {
  const pct = ((value - min) / (max - min)) * 100;
  const isZero = value === 0;
  const isPositive = value > 0;
  return (
    <div className="sc-slider">
      <div className="sc-slider-h">
        <div>
          <div className="sc-slider-label">{label}</div>
          <div className="sc-slider-sub">{sub}</div>
        </div>
        <div className={`sc-slider-val ${isZero ? "zero" : isPositive ? "pos" : "neg"}`}>
          {value > 0 && "+"}{value}{unit}
        </div>
      </div>
      <div className="sc-slider-track">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--line-soft) 0%, var(--line-soft) 50%, ${isPositive ? "var(--warning)" : isZero ? "var(--line-soft)" : "var(--success)"} 50%, ${isPositive ? "var(--warning)" : isZero ? "var(--line-soft)" : "var(--success)"} ${pct}%, var(--line-soft) ${pct}%)`
          }}
        />
      </div>
      <div className="sc-slider-legend">
        <span>{min}{unit}</span>
        <span className="zero-tick">0</span>
        <span>+{max}{unit}</span>
      </div>
    </div>
  );
};

// ------- MAIN SCENARIO PAGE -------------------------------------------
const ScenarioPage = ({ onAsk }) => {
  const d = window.DataPraatData;
  const [knobs, setKnobs] = React.useState(SCENARIO_DEFAULTS);
  const [activePreset, setActivePreset] = React.useState(null);
  const [savedScenarios, setSavedScenarios] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("dp_scenarios") || "[]"); } catch { return []; }
  });
  const [saveName, setSaveName] = React.useState("");
  const [showSave, setShowSave] = React.useState(false);

  const set = (k, v) => { setKnobs(prev => ({ ...prev, [k]: v })); setActivePreset(null); };
  const applyPreset = (p) => { setKnobs({ ...knobs, ...p.values }); setActivePreset(p.id); };
  const reset = () => { setKnobs(SCENARIO_DEFAULTS); setActivePreset(null); };

  const scenarioData = React.useMemo(() => computeScenario(d.forecastSeries, knobs), [d.forecastSeries, knobs]);

  // Samenvatting: som base vs scenario over Q4
  const summary = React.useMemo(() => {
    // Alleen 2024 meenemen voor YTD
    const y2024 = scenarioData.filter(p => p.periode.startsWith("2024"));
    const q4 = y2024.filter(p => ["2024-10", "2024-11", "2024-12"].includes(p.periode));
    const baseQ4 = q4.reduce((s, p) => s + (p.forecast || 0), 0);
    const scenQ4 = q4.reduce((s, p) => s + (p.scenario || 0), 0);
    const ytdActual = y2024.filter(p => p.actual != null).reduce((s, p) => s + p.actual, 0);
    const baseEind = ytdActual + baseQ4;
    const scenEind = ytdActual + scenQ4;
    const verschil = scenEind - baseEind;
    const verschilPct = baseEind > 0 ? (verschil / baseEind) * 100 : 0;
    const budget = 9500; // €9,5M in K
    const budgetUse = (scenEind / budget) * 100;
    return {
      baseQ4: baseQ4,
      scenQ4: scenQ4,
      baseEind: baseEind,
      scenEind: scenEind,
      verschil: verschil,
      verschilPct: verschilPct,
      budget: budget,
      budgetUse: budgetUse,
      overschrijding: scenEind - budget,
    };
  }, [scenarioData]);

  const fmt = (k) => `€${(k / 1000).toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  const isDirty = JSON.stringify(knobs) !== JSON.stringify(SCENARIO_DEFAULTS);

  const saveScenario = () => {
    if (!saveName.trim()) return;
    const next = [...savedScenarios, { id: Date.now(), name: saveName, knobs: { ...knobs }, eind: summary.scenEind, verschil: summary.verschil }];
    setSavedScenarios(next);
    localStorage.setItem("dp_scenarios", JSON.stringify(next));
    setSaveName("");
    setShowSave(false);
  };
  const loadScenario = (s) => { setKnobs(s.knobs); setActivePreset(null); };
  const deleteScenario = (id) => {
    const next = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(next);
    localStorage.setItem("dp_scenarios", JSON.stringify(next));
  };

  return (
    <div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Wat-als scenario's</h1>
          <div className="page-sub">
            Vertrek vanuit de basisprognose. Draai aan de knoppen en zie direct wat er verandert.
          </div>
        </div>
        <div className="page-actions">
          <button
            className="sc-reset"
            onClick={reset}
            disabled={!isDirty}
            style={{opacity: isDirty ? 1 : 0.4}}
          >
            <Icon name="close" size={12}/> Terug naar basis
          </button>
        </div>
      </div>

      {/* Chart + Summary */}
      <div className="sc-top">
        <div className="card sc-chart-card">
          <div className="card-h">
            <div className="card-h-left">
              <div>
                <div className="card-title">Uitgaven · basisprognose versus jouw scenario</div>
                <div className="card-sub">
                  {isDirty
                    ? <span><b style={{color: "var(--warning-strong)"}}>Scenario actief</b> · effect vanaf {knobs.startMaand} 2024</span>
                    : "Geen aanpassingen — dit is de basisprognose uit het model"}
                </div>
              </div>
            </div>
          </div>
          <div style={{padding: "8px 16px 18px"}}>
            <ScenarioChart data={scenarioData}/>
          </div>
        </div>
        <ScenarioSummary summary={summary} fmt={fmt} isDirty={isDirty} onAsk={onAsk}/>
      </div>

      {/* Presets */}
      <div style={{marginTop: 22, marginBottom: 10}}>
        <h3 className="sc-section-title">Kant-en-klare scenario's</h3>
        <div className="sc-section-sub">Klik op een situatie om direct alle knoppen goed te zetten.</div>
      </div>
      <div className="sc-presets">
        {SCENARIO_PRESETS.map(p => (
          <div
            key={p.id}
            className={`sc-preset ${activePreset === p.id ? "active" : ""}`}
            onClick={() => applyPreset(p)}
          >
            <div className="sc-preset-label">{p.label}</div>
            <div className="sc-preset-desc">{p.desc}</div>
            {activePreset === p.id && <div className="sc-preset-check"><Icon name="check" size={12}/> Actief</div>}
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div style={{marginTop: 28, marginBottom: 10}}>
        <h3 className="sc-section-title">Of draai zelf aan de knoppen</h3>
        <div className="sc-section-sub">Verander een variabele en kijk wat er bovenin in de grafiek gebeurt.</div>
      </div>

      <div className="sc-sliders-grid">
        <ScenarioSlider
          label="Aantal trajecten"
          sub="Meer of minder kinderen die zorg krijgen"
          value={knobs.volumeDelta}
          onChange={(v) => set("volumeDelta", v)}
          min={-20} max={20} step={1} unit="%"
        />
        <ScenarioSlider
          label="Prijs per traject"
          sub="Effect van inkoopafspraken of tarief-indexatie"
          value={knobs.prijsDelta}
          onChange={(v) => set("prijsDelta", v)}
          min={-15} max={15} step={1} unit="%"
        />
        <ScenarioSlider
          label="Instroom nieuwe kinderen per maand"
          sub="Wachtlijst wegwerken of juist meer achterstand"
          value={knobs.instroomDelta}
          onChange={(v) => set("instroomDelta", v)}
          min={-10} max={15} step={1} unit=""
        />
        <ScenarioSlider
          label="Aandeel ambulant specialistisch"
          sub="Verschuiving in de product-mix (procentpunten)"
          value={knobs.ambulantAandeel}
          onChange={(v) => set("ambulantAandeel", v)}
          min={-10} max={10} step={1} unit="pp"
        />
      </div>

      <div className="sc-startmaand-row">
        <span className="sc-startmaand-label">Effect gaat in per</span>
        <div className="pills">
          {["okt", "nov", "dec"].map(m => (
            <div
              key={m}
              className={`pill ${knobs.startMaand === m ? "active" : ""}`}
              onClick={() => set("startMaand", m)}
            >
              {m === "okt" ? "oktober" : m === "nov" ? "november" : "december"} 2024
            </div>
          ))}
        </div>
      </div>

      {/* Saved scenarios */}
      <div className="sc-saved">
        <div className="sc-saved-h">
          <div>
            <h3 className="sc-section-title" style={{marginBottom: 2}}>Bewaarde scenario's</h3>
            <div className="sc-section-sub">Sla interessante scenario's op om ze later te vergelijken of te delen.</div>
          </div>
          <button className="sc-save-btn" onClick={() => setShowSave(true)} disabled={!isDirty}>
            <Icon name="plus" size={12}/> Huidig scenario opslaan
          </button>
        </div>

        {showSave && (
          <div className="sc-save-form">
            <input
              type="text"
              placeholder="Naam voor dit scenario (bv. 'Strenge inkoop 2025')"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveScenario()}
              autoFocus
            />
            <button onClick={saveScenario} disabled={!saveName.trim()}>Opslaan</button>
            <button className="ghost" onClick={() => { setShowSave(false); setSaveName(""); }}>Annuleren</button>
          </div>
        )}

        {savedScenarios.length > 0 ? (
          <div className="sc-saved-list">
            {savedScenarios.map(s => (
              <div key={s.id} className="sc-saved-item">
                <div className="sc-saved-name">{s.name}</div>
                <div className="sc-saved-meta">
                  Eindejaar: <span className="mono">{fmt(s.eind)}</span> ·
                  {" "}<span className={s.verschil > 0 ? "neg" : "pos"}>{s.verschil > 0 ? "+" : ""}{fmt(s.verschil).replace("€", "€")}</span> vs basis
                </div>
                <div className="sc-saved-actions">
                  <button onClick={() => loadScenario(s)}>Laad</button>
                  <button className="ghost" onClick={() => deleteScenario(s.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sc-saved-empty">Nog geen opgeslagen scenario's. Pas iets aan en druk op "opslaan".</div>
        )}
      </div>
    </div>
  );
};

// ------- Samenvatting / impact-kaart -----------------
const ScenarioSummary = ({ summary, fmt, isDirty, onAsk }) => {
  const richting = summary.verschil > 0 ? "hoger" : summary.verschil < 0 ? "lager" : "gelijk";
  const kleur = summary.verschil > 0 ? "var(--warning-strong)" : summary.verschil < 0 ? "var(--success-strong)" : "var(--ink-mute)";
  const budgetKleur = summary.overschrijding > 0 ? "var(--destructive-strong)" : "var(--success-strong)";

  return (
    <div className="sc-summary">
      <div className="sc-summary-h">
        <div className="sc-summary-label">Effect op eindejaar</div>
        {!isDirty && <span className="sc-summary-tag">basis</span>}
      </div>
      <div className="sc-summary-big" style={{color: kleur}}>
        {summary.verschil > 0 ? "+" : ""}{fmt(summary.verschil)}
      </div>
      <div className="sc-summary-sub">
        {isDirty
          ? <>Dit scenario eindigt <b>{richting}</b> dan de basisprognose ({summary.verschilPct > 0 ? "+" : ""}{summary.verschilPct.toFixed(1)}%)</>
          : "Geen aanpassingen — basisprognose"
        }
      </div>

      <div className="sc-summary-divider"/>

      <div className="sc-summary-row">
        <span>Eindejaar totaal</span>
        <span className="mono" style={{fontWeight: 600}}>{fmt(summary.scenEind)}</span>
      </div>
      <div className="sc-summary-row">
        <span>Jaarbudget</span>
        <span className="mono">{fmt(summary.budget)}</span>
      </div>
      <div className="sc-summary-row" style={{color: budgetKleur, fontWeight: 500}}>
        <span>{summary.overschrijding > 0 ? "Overschrijding" : "Ruimte"}</span>
        <span className="mono">{summary.overschrijding > 0 ? "+" : ""}{fmt(Math.abs(summary.overschrijding))}</span>
      </div>

      <div className="sc-summary-budget-wrap">
        <div className="sc-summary-budget-bar">
          <div
            className="sc-summary-budget-fill"
            style={{
              width: `${Math.min(100, summary.budgetUse)}%`,
              background: summary.budgetUse > 100 ? "var(--destructive)" : summary.budgetUse > 95 ? "var(--warning)" : "var(--success)",
            }}
          />
          {summary.budgetUse > 100 && (
            <div
              className="sc-summary-budget-overflow"
              style={{ width: `${Math.min(30, summary.budgetUse - 100)}%` }}
            />
          )}
        </div>
        <div className="sc-summary-budget-label">
          <span>{summary.budgetUse.toFixed(1)}% van jaarbudget</span>
        </div>
      </div>

      <button
        className="sc-summary-ask"
        onClick={() => onAsk && onAsk("Leg uit wat dit scenario betekent voor Riemsterdal en welke stappen we kunnen overwegen.")}
      >
        <span className="orb"/>Leg dit scenario uit
      </button>
    </div>
  );
};

window.ScenarioPage = ScenarioPage;
