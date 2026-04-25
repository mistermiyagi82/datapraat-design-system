/* global React, Icon, TrustBadge, AskButton, fmtEUR, fmtCompact, BarChart, DoughnutChart, ForecastChart, SpreadChart, VolumeChart, PathwayChart */

// ===== OVERZICHT =====
const OverzichtPage = ({ onInspect, onAskChart }) => {
  const d = window.DataPraatData;
  const [periode, setPeriode] = React.useState("YTD");
  const [mode, setMode] = React.useState(() => localStorage.getItem("dp_overzicht_mode") || "cijfers");
  React.useEffect(() => { localStorage.setItem("dp_overzicht_mode", mode); }, [mode]);

  const kpiQuestionMap = {
    uitgavenYtd: "Waarom zijn de uitgaven YTD zo hoog?",
    begrootYtd: "Hoe staan we ervoor tegenover het budget?",
    aantalTrajecten: "Waar komt de groei in trajecten vandaan?",
    gemPrijs: "Wat drijft de gemiddelde prijs per traject?",
  };

  const backToCijfers = () => setMode("cijfers");

  // Non-cijfers modes — render compleet andere layout
  if (mode !== "cijfers") {
    let Body = null;
    if (mode === "verhaal")       Body = <window.VerhaalMode onAsk={onAskChart} onBackToCijfers={backToCijfers}/>;
    else if (mode === "schaal")   Body = <window.SchaalMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "verkeerslicht") Body = <window.VerkeerslichtMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "vergelijkend")  Body = <window.VergelijkendMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "metafoor") Body = <window.MetafoorMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "bullets")  Body = <window.BulletsMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "dagboek")  Body = <window.DagboekMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "weer")     Body = <window.WeerMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "brief")    Body = <window.BriefMode onBackToCijfers={backToCijfers}/>;
    else if (mode === "dialoog")  Body = <window.DialoogMode onAsk={onAskChart} onBackToCijfers={backToCijfers}/>;
    else if (mode === "poster")   Body = <window.PosterMode onBackToCijfers={backToCijfers}/>;
    return (
      <div>
        <div className="page-h">
          <div>
            <h1 className="page-title">Jeugdzorg in een oogopslag</h1>
            <div className="page-sub">Stand per {d.gemeente.peildatum} · laatste update {d.gemeente.laatsteUpdate}</div>
          </div>
          <div className="page-actions">
            <window.ModeSwitcher mode={mode} onChange={setMode}/>
          </div>
        </div>
        {Body}
      </div>
    );
  }

  return (
    <div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Jeugdzorg in een oogopslag</h1>
          <div className="page-sub">Stand per {d.gemeente.peildatum} · laatste update {d.gemeente.laatsteUpdate}</div>
        </div>
        <div className="page-actions">
          <div className="dropdown">2024 <Icon name="chevron" size={12}/></div>
          <div className="pills">
            {["YTD", "Q3", "Maand"].map(p => (
              <div key={p} className={`pill ${periode === p ? "active" : ""}`} onClick={() => setPeriode(p)}>{p}</div>
            ))}
          </div>
          <window.ModeSwitcher mode={mode} onChange={setMode}/>
        </div>
      </div>

      <div className="kpi-grid">
        {d.overzichtKPIs.map(k => {
          const q = kpiQuestionMap[k.id] || `Vertel me meer over ${k.label}`;
          return (
            <div key={k.id} className="kpi" onClick={() => onInspect(k.id)}>
              <div className="kpi-label-row">
                <span className="kpi-label">{k.label}</span>
                <TrustBadge score={k.trust} onClick={() => onInspect(k.id)} />
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className={`kpi-delta ${k.deltaKind}`}>{k.delta}</div>
              <div className="kpi-foot">
                <AskButton
                  size="sm"
                  label="Vraag hierover"
                  onClick={() => onAskChart(q)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-h">
            <div className="card-h-left">
              <div>
                <div className="card-title">Maandelijkse uitgaven 2024</div>
                <div className="card-sub">gerealiseerd · begroot</div>
              </div>
              <TrustBadge score={96} />
            </div>
            <div className="card-actions">
              <AskButton size="md" label="Vraag hierover" onClick={() => onAskChart("maandelijkse uitgaven")} />
              <div className="icon-btn"><Icon name="more"/></div>
            </div>
          </div>
          <BarChart data={d.maandUitgaven} />
        </div>

        <div className="card">
          <div className="card-h">
            <div className="card-h-left">
              <div>
                <div className="card-title">Top productcategorieën</div>
                <div className="card-sub">YTD aandeel</div>
              </div>
              <TrustBadge score={96} />
            </div>
            <div className="card-actions">
              <AskButton size="md" label="Vraag hierover" onClick={() => onAskChart("top categorieën")} />
            </div>
          </div>
          <DoughnutChart data={d.topCategorieen} />
        </div>
      </div>
    </div>
  );
};

// ===== PROGNOSE =====
const PrognosePage = ({ onInspect }) => {
  const d = window.DataPraatData;
  return (
    <div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Prognose vs Realisatie</h1>
          <div className="page-sub">Prognoselabel: 202311 – 202412 · 95% betrouwbaarheidsinterval</div>
        </div>
        <div className="page-actions">
          <div className="pills">
            <div className="pill active">Alle categorieën</div>
            <div className="pill">Per zorgvorm</div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-h">
            <div className="card-h-left">
              <div>
                <div className="card-title">Totale uitgaven · jan 2022 – dec 2024</div>
                <div className="card-sub">actuals · forecast · 95% CI</div>
              </div>
              <TrustBadge score={89} onClick={() => onInspect("uitgaven_ytd")}/>
            </div>
          </div>
          <ForecastChart data={d.forecastSeries} />
        </div>

        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          <div className="card" style={{padding: "16px 18px"}}>
            <div className="kpi-label-row">
              <span className="kpi-label">YTD Burn</span>
              <TrustBadge score={96}/>
            </div>
            <div className="kpi-value" style={{fontSize: 28}}>75,4%</div>
            <div style={{fontSize: 11.5, color: "var(--ink-mute)", marginTop: 4}}>€7,2M van €9,5M jaarbudget</div>
            <div style={{height: 5, background: "var(--bg-soft)", borderRadius: 3, marginTop: 8, overflow: "hidden"}}>
              <div style={{width: "75.4%", height: "100%", background: "var(--primary)", borderRadius: 3}}/>
            </div>
          </div>
          <div className="card" style={{padding: "16px 18px"}}>
            <div className="kpi-label-row">
              <span className="kpi-label">Forecast Accuracy</span>
              <TrustBadge score={86}/>
            </div>
            <div className="kpi-value" style={{fontSize: 28}}>8,4%</div>
            <div style={{fontSize: 11.5, color: "var(--ink-mute)", marginTop: 4}}>MAPE over laatste 12 maanden</div>
          </div>
          <div className="card" style={{padding: "16px 18px"}}>
            <div className="kpi-label-row">
              <span className="kpi-label">CI Coverage</span>
              <TrustBadge score={93}/>
            </div>
            <div className="kpi-value" style={{fontSize: 28}}>93%</div>
            <div style={{fontSize: 11.5, color: "var(--ink-mute)", marginTop: 4}}>11/12 maanden binnen 95% CI</div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: 14}}>
        <div className="card-h">
          <div className="card-h-left">
            <div>
              <div className="card-title">Forecast breaches</div>
              <div className="card-sub">maanden buiten 95% CI</div>
            </div>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th>Periode</th><th>Productcategorie</th><th>Forecast</th><th>Actual</th><th>Afwijking</th><th>Status</th></tr></thead>
          <tbody>
            {d.forecastBreaches.map((b, i) => (
              <tr key={i}>
                <td>{b.periode}</td>
                <td>{b.cat}</td>
                <td className="tnum mono">{b.forecast}</td>
                <td className="tnum mono">{b.actual}</td>
                <td className="tnum mono" style={{color: b.afwijking.startsWith("+") ? "var(--destructive)" : "var(--warning)"}}>{b.afwijking}</td>
                <td><span className={`badge ${b.status === "Boven CI" ? "bad" : "warn"}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== VALIDATIE =====
const ValidatiePage = () => {
  const d = window.DataPraatData;
  const [filter, setFilter] = React.useState("Alle");
  const filtered = d.validatieIssues.filter(i => {
    if (filter === "Alle") return true;
    if (filter === "Kritiek") return i.severity === "critical";
    if (filter === "Waarschuwing") return i.severity === "warning";
    if (filter === "Opgelost") return i.severity === "resolved";
    return true;
  });
  const icon = (sev) => sev === "critical" ? "!" : sev === "warning" ? "⚠" : "✓";
  const color = (sev) => sev === "critical" ? "var(--destructive)" : sev === "warning" ? "var(--warning)" : "var(--success)";
  const bg = (sev) => sev === "critical" ? "var(--destructive-tint)" : sev === "warning" ? "var(--warning-tint)" : "var(--success-tint)";

  return (
    <div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Datavalidatie</h1>
          <div className="page-sub">3 kritieke afwijkingen · 7 waarschuwingen · 142 controles op 2.847 declaraties</div>
        </div>
      </div>
      <div className="pills" style={{marginBottom: 16}}>
        {[
          ["Alle", d.validatieIssues.length],
          ["Kritiek", d.validatieIssues.filter(i => i.severity === "critical").length],
          ["Waarschuwing", d.validatieIssues.filter(i => i.severity === "warning").length],
          ["Opgelost", d.validatieIssues.filter(i => i.severity === "resolved").length],
        ].map(([name, n]) => (
          <div key={name} className={`pill ${filter === name ? "active" : ""}`} onClick={() => setFilter(name)}>
            {name} ({n})
          </div>
        ))}
      </div>

      <div style={{display: "flex", flexDirection: "column", gap: 10}}>
        {filtered.map(iss => (
          <div key={iss.id} className="card" style={{
            borderLeft: `3px solid ${color(iss.severity)}`,
            padding: "14px 18px",
          }}>
            <div style={{display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 14, alignItems: "start"}}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: bg(iss.severity), color: color(iss.severity),
                display: "grid", placeItems: "center", fontSize: 15, fontWeight: 700,
              }}>{icon(iss.severity)}</div>
              <div>
                <div style={{fontSize: 14, fontWeight: 500, marginBottom: 4}}>{iss.title}</div>
                <div style={{fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.55, marginBottom: 10}}>{iss.detail}</div>
                <div style={{display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5}}>
                  {Object.entries(iss.meta).map(([k, v]) => (
                    <div key={k}><span style={{color: "var(--ink-mute)"}}>{k}:</span> <b style={{fontWeight: 500}}>{v}</b></div>
                  ))}
                </div>
              </div>
              <div style={{display: "flex", gap: 6, flexDirection: "column"}}>
                {iss.actions.map((a, i) => (
                  <button key={a} style={{
                    padding: "5px 12px",
                    fontSize: 11.5,
                    background: i === 0 ? "transparent" : "var(--ink)",
                    color: i === 0 ? "var(--ink-soft)" : "var(--bg)",
                    border: i === 0 ? "1px solid var(--line)" : "none",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                  }}>{a} {i === 1 && iss.severity !== "resolved" ? "→" : ""}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== BENCHMARK =====
const BenchmarkPage = () => {
  const d = window.DataPraatData;
  return (
    <div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Vergelijking met peer-gemeenten</h1>
          <div className="page-sub">CBS Jeugdzorg open data (StatLine 85099NED) · 12 vergelijkbare gemeenten</div>
        </div>
        <div className="page-actions">
          <div className="pills">
            <div className="pill active">Achterhoek-regio</div>
            <div className="pill">Per inwonertal</div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom: 14, padding: "22px 24px"}}>
        <div style={{display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, alignItems: "center"}}>
          <div>
            <div className="kpi-label" style={{marginBottom: 8}}>Positie · kosten per cliënt</div>
            <div style={{fontSize: 18, lineHeight: 1.5, fontWeight: 300}}>
              Riemsterdal zit op <b style={{fontWeight: 600}}>€18.420</b> per cliënt — <span style={{color: "var(--warning)"}}>boven het peer-gemiddelde</span> van <b style={{fontWeight: 600}}>€14.890</b>, maar binnen de spreiding van vergelijkbare gemeenten.
            </div>
          </div>
          <div style={{textAlign: "center"}}>
            <div style={{fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--primary)"}}>73<sup style={{fontSize: 24, fontWeight: 600}}>e</sup></div>
            <div style={{fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", marginTop: 4}}>Percentiel · 12 peers</div>
          </div>
        </div>
      </div>

      <div className="two-col-eq" style={{marginBottom: 14}}>
        <div className="card">
          <div className="card-h">
            <div className="card-h-left">
              <div>
                <div className="card-title">Kosten per cliënt</div>
                <div className="card-sub">u vs peer-spreiding</div>
              </div>
              <TrustBadge score={92}/>
            </div>
          </div>
          <SpreadChart percentiles={d.benchmarkSpread} eigen={d.benchmarkEigen}/>
        </div>
        <div className="card">
          <div className="card-h">
            <div className="card-h-left">
              <div>
                <div className="card-title">Volume per 1.000 jongeren</div>
                <div className="card-sub">CBS 83765NED</div>
              </div>
              <TrustBadge score={90}/>
            </div>
          </div>
          <VolumeChart data={d.benchmarkVolume}/>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-h-left">
            <div>
              <div className="card-title">Peer-vergelijking detail</div>
              <div className="card-sub">geanonimiseerd</div>
            </div>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th>Gemeente</th><th>Inwoners</th><th>Cliënten</th><th>Kosten/cliënt</th><th>Δ vs u</th><th>Positie</th></tr></thead>
          <tbody>
            {d.benchmarkPeers.map((p, i) => (
              <tr key={i} className={p.self ? "self" : ""}>
                <td>{p.naam}</td>
                <td className="tnum mono">{p.inwoners.toLocaleString("nl-NL")}</td>
                <td className="tnum mono">{p.clienten}</td>
                <td className="tnum mono">€{p.kostenPerClient.toLocaleString("nl-NL")}</td>
                <td className="tnum mono">{p.delta}</td>
                <td><span className="badge">{p.positie}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===== VERWIJZERS =====
const VerwijzersPage = ({ onAskChart }) => {
  const d = window.DataPraatData;
  return (
    <div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Verwijzer-analyse</h1>
          <div className="page-sub">Geschatte kosten per verwijzingspad · CBS-trajecten × VVD-prijs · YTD 2024</div>
        </div>
        <div className="page-actions">
          <div className="pills">
            <div className="pill active">Kosten</div>
            <div className="pill">Volume</div>
            <div className="pill">Looptijd</div>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        {d.verwijzers.slice(0, 4).map(v => (
          <div key={v.naam} className="kpi">
            <div className="kpi-label-row">
              <span className="kpi-label">{v.naam}</span>
            </div>
            <div className="kpi-value" style={{fontSize: 28}}>{v.aandeel}%</div>
            <div className="kpi-delta neutral">{v.trajecten} trajecten · {v.totaal}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{marginBottom: 14}}>
        <div className="card-h">
          <div className="card-h-left">
            <div>
              <div className="card-title">Kostenverdeling per verwijzer</div>
              <div className="card-sub">YTD 2024 · gem. kosten per traject</div>
            </div>
            <TrustBadge score={91}/>
          </div>
          <div className="card-actions">
            <AskButton size="md" label="Vraag hierover" onClick={() => onAskChart("verwijzer-kostenverdeling")} />
          </div>
        </div>
        <PathwayChart data={d.verwijzers}/>
      </div>

      <div className="insight">
        <div className="insight-label">Inzicht</div>
        Trajecten via <b>medisch specialist</b> zijn <b>2,8× duurder</b> dan via wijkteam — primair door langere gemiddelde looptijd (8,2 vs 5,4 maanden), niet door hogere uurprijs.
      </div>
    </div>
  );
};

window.OverzichtPage = OverzichtPage;
window.PrognosePage = PrognosePage;
window.ValidatiePage = ValidatiePage;
window.BenchmarkPage = BenchmarkPage;
window.VerwijzersPage = VerwijzersPage;
