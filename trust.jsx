/* global React, Icon, TrustBadge */

// ===== TRUST INSPECTOR DRAWER =====
const TrustInspector = ({ metricId, onClose, onOpenLineage }) => {
  const t = window.DataPraatData.trustInspector[metricId] || window.DataPraatData.trustInspector.uitgaven_ytd;
  const tier = t.score >= 90 ? "good" : t.score >= 70 ? "warn" : "bad";
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}/>
      <div className="drawer">
        <div className="drawer-h">
          <div style={{flex: 1}}>
            <div style={{fontSize: 11.5, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4}}>Trust Inspector</div>
            <div style={{fontSize: 20, fontWeight: 600, letterSpacing: "-0.015em"}}>{t.metricName}</div>
            <div style={{fontFamily: "var(--f-mono)", fontSize: 20, marginTop: 4, color: "var(--ink)"}}>{t.value}</div>
          </div>
          <div style={{textAlign: "center", marginRight: 14}}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: `conic-gradient(var(--${tier === "good" ? "success" : tier === "warn" ? "warning" : "destructive"}) ${t.score * 3.6}deg, var(--line-soft) 0)`,
              display: "grid", placeItems: "center",
              position: "relative",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "var(--surface)",
                display: "grid", placeItems: "center",
                fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 600,
                color: `var(--${tier === "good" ? "success-strong" : tier === "warn" ? "warning-strong" : "destructive-strong"})`,
              }}>{t.score}</div>
            </div>
          </div>
          <div className="drawer-x" onClick={onClose}><Icon name="close"/></div>
        </div>

        <div className="drawer-body">
          <div style={{
            padding: 12, background: "var(--success-tint)", color: "var(--success-strong)",
            borderRadius: 8, fontSize: 12.5, marginBottom: 20,
          }}>
            <b style={{fontWeight: 600}}>{t.tier}</b> · {t.statusText}
          </div>

          <Section title="Definitie">
            <p style={{fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)", margin: "0 0 10px"}}>{t.definitie}</p>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 11.5, padding: 10,
              background: "var(--bg-soft)", borderRadius: 6, color: "var(--ink-soft)",
              whiteSpace: "pre-wrap",
            }}>{t.formule}</div>
          </Section>

          <Section title="Bron">
            <KV rows={[
              ["Records totaal", t.bron.records],
              ["Records opgenomen", t.bron.opgenomen],
              ["Uitgesloten", `${t.bron.uitgesloten} ↗`],
              ["Periode", t.bron.periode],
              ["Aanbieders", t.bron.aanbieders],
            ]}/>
          </Section>

          <Section title="Lineage (samenvatting)">
            <MiniLineage/>
            <button onClick={onOpenLineage} style={{
              marginTop: 10, fontSize: 12, color: "var(--primary-ink)", fontWeight: 500,
            }}>Meer uitleg →</button>
          </Section>

          <Section title="Validatie">
            {t.validatie.map((v, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 12.5, borderTop: i > 0 ? "1px solid var(--line-soft)" : "none"}}>
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: v.ok ? "var(--success-tint)" : "var(--warning-tint)",
                  color: v.ok ? "var(--success)" : "var(--warning)",
                  display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0,
                }}>{v.ok ? "✓" : "!"}</span>
                <span style={{flex: 1, color: "var(--ink-soft)"}}>{v.label}</span>
                <span className="mono" style={{fontSize: 11, color: "var(--ink-mute)"}}>{v.count}</span>
              </div>
            ))}
          </Section>

          <Section title="Versheid">
            <KV rows={[
              ["Laatst ververst", t.versheid.ververst],
              ["Bron-systeem", t.versheid.bron],
              ["Eigenaar definitie", t.versheid.eigenaar],
            ]}/>
          </Section>
        </div>
      </div>
    </>
  );
};

const Section = ({ title, children }) => (
  <div style={{marginBottom: 22}}>
    <div style={{fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 10}}>{title}</div>
    {children}
  </div>
);
const KV = ({ rows }) => (
  <div>
    {rows.map(([k, v], i) => (
      <div key={k} style={{display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: i > 0 ? "1px solid var(--line-soft)" : "none", fontSize: 12.5}}>
        <span style={{color: "var(--ink-mute)"}}>{k}</span>
        <span className="mono" style={{color: "var(--ink)"}}>{v}</span>
      </div>
    ))}
  </div>
);

const MiniLineage = () => {
  const nodes = [
    { label: "Bron", sub: "17 aanbieders" },
    { label: "Ingestie", sub: "2.953 rec." },
    { label: "Validatie", sub: "14 regels" },
    { label: "Aggregatie", sub: "PxQ_som" },
    { label: "KPI", sub: "€7,2M" },
  ];
  return (
    <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4}}>
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{
            textAlign: "center", padding: "8px 4px",
            background: i === 4 ? "var(--primary-tint)" : "var(--bg-soft)",
            borderRadius: 6,
            position: "relative",
          }}>
            <div style={{fontSize: 10, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600}}>{n.label}</div>
            <div style={{fontSize: 11, fontFamily: "var(--f-mono)", marginTop: 2, color: "var(--ink)"}}>{n.sub}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ===== LINEAGE FULL VIEW =====
const LineagePage = ({ onBack }) => {
  const cols = [
    { title: "Bronnen", nodes: [
      { label: "Lentis", sub: "487 declaraties · iJW 3.0", status: "Actueel", good: true },
      { label: "Pluryn", sub: "312 declaraties", status: "Actueel", good: true },
      { label: "Pactum", sub: "189 declaraties · (juli ontbreekt)", status: "Incompleet", good: false },
      { label: "+14 anderen", sub: "1.965 declaraties", status: "Actueel", good: true },
    ]},
    { title: "Ingestie", nodes: [
      { label: "FactWerkelijk_raw", sub: "2.953 records · 17 aanbieders", status: "Geladen 06:00", good: true },
    ]},
    { title: "Validatie", nodes: [
      { label: "14 regels", sub: "−106 records · 3 issues open", status: "96% pass", good: true },
    ]},
    { title: "Transformatie", nodes: [
      { label: "PxQ_som ÷ Q_som", sub: "groupBy gemeente · filter YTD", status: "v2.1", good: true },
    ]},
    { title: "Output", nodes: [
      { label: "Uitgaven YTD 2024", sub: "€7.198.420 · 96% trust", status: "Live", good: true, highlight: true },
    ]},
  ];
  return (
    <div>
      <div style={{fontSize: 12, color: "var(--ink-mute)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, cursor: "pointer"}} onClick={onBack}>
        <Icon name="back" size={14}/> Overzicht / Uitgaven YTD / <b style={{color: "var(--ink)"}}>Lineage</b>
      </div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Lineage voor Uitgaven YTD 2024</h1>
          <div className="page-sub">€7.198.420 · auditeerbaar spoor van aanbieder tot KPI</div>
        </div>
        <div className="page-actions">
          <button style={{padding: "8px 14px", background: "var(--ink)", color: "var(--bg)", borderRadius: 6, fontSize: 12.5, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6}}>
            <Icon name="export" size={14}/> Export PDF
          </button>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20}}>
        {cols.map((col, ci) => (
          <div key={ci}>
            <div style={{fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 8, textAlign: "center"}}>{col.title}</div>
            <div style={{display: "flex", flexDirection: "column", gap: 8, position: "relative"}}>
              {col.nodes.map((n, ni) => (
                <div key={ni} style={{
                  padding: "12px 14px",
                  background: n.highlight ? "var(--primary-tint)" : "var(--surface)",
                  border: `1px solid ${n.highlight ? "var(--primary-soft)" : "var(--line)"}`,
                  borderRadius: 8,
                  position: "relative",
                  boxShadow: n.highlight ? "0 4px 12px rgba(184,100,46,0.12)" : "var(--shadow-sm)",
                }}>
                  <div style={{fontSize: 13, fontWeight: 500, marginBottom: 4}}>{n.label}</div>
                  <div style={{fontSize: 11, color: "var(--ink-mute)", lineHeight: 1.4, marginBottom: 6}}>{n.sub}</div>
                  <span className={`badge ${n.good ? "good" : "warn"}`}>{n.status}</span>
                  {ci < 4 && (
                    <div style={{
                      position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                      width: 14, height: 14,
                      display: "grid", placeItems: "center",
                      color: "var(--ink-mute)",
                    }}>
                      <svg width="14" height="10" viewBox="0 0 14 10"><path d="M1 5 H12 M9 2 L12 5 L9 8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="insight">
        <div className="insight-label">Audit-spoor</div>
        Elke node is klikbaar voor onderliggende records, transformatie-code, en wijzigingsgeschiedenis. Volledige lineage exporteerbaar als PDF voor accountantscontrole of toezichthouder-rapportage.
      </div>
    </div>
  );
};

// ===== GLOSSARY =====
const GlossaryPage = () => {
  const g = window.DataPraatData.glossary45A12;
  return (
    <div>
      <div style={{display: "grid", gridTemplateColumns: "240px 1fr", gap: 20}}>
        <aside style={{position: "sticky", top: 80, alignSelf: "start"}}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", background: "var(--surface)",
            border: "1px solid var(--line)", borderRadius: 8,
            marginBottom: 14,
          }}>
            <Icon name="search" size={14}/>
            <span style={{fontSize: 12.5, color: "var(--ink-mute)"}}>Zoek productcat, term…</span>
          </div>
          <GlossaryGroup title="Productcategorieën" items={[
            ["45A12", "Ambulant specialistisch", true],
            ["44C01", "Pleegzorg"],
            ["51A01", "Jeugdbescherming"],
            ["43A22", "Verblijf zwaar"],
            ["41A11", "Jeugd-GGZ basis"],
          ]}/>
          <GlossaryGroup title="Verwijzers" items={[
            ["", "Wijkteam"], ["", "Huisarts"], ["", "Medisch specialist"], ["", "Gecert. instelling"]
          ]}/>
          <GlossaryGroup title="KPI's" items={[
            ["", "Uitgaven YTD"], ["", "Trajecten actief"], ["", "Gem. prijs / cliënt"]
          ]}/>
        </aside>
        <div>
          <div style={{fontSize: 11.5, color: "var(--ink-mute)", marginBottom: 6}}>Glossary · Productcategorieën · iJW 3.0</div>
          <h1 className="page-title" style={{marginBottom: 6}}>{g.naam}</h1>
          <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 20}}>
            <span className="badge" style={{fontFamily: "var(--f-mono)", fontSize: 11}}>Code {g.code}</span>
            <span style={{fontSize: 12, color: "var(--ink-mute)"}}>{g.tagline}</span>
          </div>

          <p style={{fontSize: 14, lineHeight: 1.7, color: "var(--ink-soft)", marginBottom: 24, fontWeight: 300}}>{g.omschrijving}</p>

          <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 10}}>Kerncijfers · Riemsterdal YTD 2024</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28}}>
            {g.kerncijfers.map((k, i) => (
              <div key={i} className="card" style={{padding: 14}}>
                <div style={{fontSize: 11, color: "var(--ink-mute)", marginBottom: 4}}>{k.label}</div>
                <div style={{fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em"}}>{k.value}</div>
                <div style={{fontSize: 11, color: "var(--ink-mute)", marginTop: 3}}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 10}}>Definitie-bronnen</div>
          <div style={{display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28}}>
            {g.bronnen.map((b, i) => (
              <div key={i} style={{padding: "8px 14px", background: "var(--bg-soft)", borderRadius: 6, fontSize: 12}}>
                <div style={{fontWeight: 600, fontSize: 11, color: "var(--primary-ink)"}}>{b.type}</div>
                <div style={{color: "var(--ink-mute)"}}>{b.desc}</div>
              </div>
            ))}
          </div>

          <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 10}}>Validatieregels op deze categorie</div>
          <div className="card" style={{marginBottom: 28, padding: "6px 16px"}}>
            {g.regels.map((r, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i > 0 ? "1px solid var(--line-soft)" : "none"}}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: r.ok ? "var(--success-tint)" : "var(--warning-tint)",
                  color: r.ok ? "var(--success)" : "var(--warning)",
                  display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700,
                }}>{r.ok ? "✓" : "!"}</span>
                <span style={{flex: 1, fontSize: 12.5}}>{r.label}</span>
                <span className="mono" style={{fontSize: 11.5, color: "var(--ink-mute)"}}>{r.count}</span>
              </div>
            ))}
          </div>

          <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 10}}>Verwante categorieën</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10}}>
            {g.verwant.map((v, i) => (
              <div key={i} className="card" style={{padding: 14, cursor: "pointer"}}>
                <div style={{fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--primary-ink)", marginBottom: 3}}>{v.code}</div>
                <div style={{fontSize: 13, fontWeight: 500, marginBottom: 4}}>{v.naam}</div>
                <div style={{fontSize: 11.5, color: "var(--ink-mute)", lineHeight: 1.5}}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GlossaryGroup = ({ title, items }) => (
  <div style={{marginBottom: 18}}>
    <div style={{fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 6, padding: "0 8px"}}>{title}</div>
    {items.map(([code, label, active], i) => (
      <div key={i} style={{
        padding: "6px 8px",
        borderRadius: 4,
        background: active ? "var(--primary-tint)" : "transparent",
        color: active ? "var(--primary-ink)" : "var(--ink-soft)",
        fontWeight: active ? 500 : 400,
        fontSize: 12.5,
        cursor: "pointer",
        display: "flex", gap: 8,
      }}>
        {code && <span className="mono" style={{fontSize: 11, color: active ? "var(--primary-ink)" : "var(--ink-mute)"}}>{code}</span>}
        <span>{label}</span>
      </div>
    ))}
  </div>
);

window.TrustInspector = TrustInspector;
window.LineagePage = LineagePage;
window.GlossaryPage = GlossaryPage;
