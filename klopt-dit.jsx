/* global React, Icon */

// ===== KLOPT DIT? — unified trust page in plain Dutch =====
// Replaces: Validatie, Lineage, Regels, Glossary-as-nav

const KloptDitPage = ({ onAsk }) => {
  const d = window.DataPraatData;
  const t = d.trustInspector.uitgaven_ytd;

  // Which KPI is being checked — for now just the YTD one, but UI suggests
  // the user can pick others (bovenbalk). Keep it simple: single-KPI view.
  const [kpi, setKpi] = React.useState("uitgaven");

  const kpis = [
    { id: "uitgaven", label: "Uitgaven YTD 2024", value: "€7.198.420", status: "goed" },
    { id: "trajecten", label: "Trajecten actief", value: "1.247", status: "goed" },
    { id: "prijs", label: "Gem. prijs per cliënt", value: "€5.772", status: "let-op" },
  ];
  const huidig = kpis.find(k => k.id === kpi) || kpis[0];

  const statusMeta = {
    "goed": {
      kleur: "var(--success)",
      kleurStrong: "var(--success-strong)",
      kleurZacht: "var(--success-tint)",
      kop: "Dit getal klopt.",
      uitleg: "Alle belangrijke controles zijn geslaagd. Je kunt hiermee werken.",
    },
    "let-op": {
      kleur: "var(--warning)",
      kleurStrong: "var(--warning-strong)",
      kleurZacht: "var(--warning-tint)",
      kop: "Dit getal klopt — let wel even op.",
      uitleg: "Eén kleine kanttekening (zie hieronder). Geen grote rode vlag, maar goed om te weten.",
    },
  };
  const status = statusMeta[huidig.status];

  // Plain-Dutch herkomst — de lineage maar zonder jargon.
  const herkomst = [
    {
      titel: "17 zorgaanbieders",
      uitleg: "Lentis, Pluryn, Pactum en 14 anderen sturen ons declaraties voor geleverde zorg.",
      detail: "Eén aanbieder (Pactum) miste de juli-levering. We hebben augustus gebruikt als schatting.",
      detailType: "let-op",
    },
    {
      titel: "2.953 declaraties binnengekomen",
      uitleg: "Elke declaratie = één stukje zorg, met prijs en aantal. Samen vormen ze de ruwe input.",
      detail: "Binnengekomen via het iJW 3.0-berichtenverkeer, dagelijks ververst om 06:00.",
      detailType: "info",
    },
    {
      titel: "2.847 declaraties gebruikt",
      uitleg: "Na controle hielden we er 2.847 over. De rest viel af om goede redenen.",
      detail: "106 afgevallen: 25 met een ongeldige productcode, 1 met een decimaalfout, 80 als uitschieter (onwaarschijnlijk hoge prijs).",
      detailType: "uitleg",
    },
    {
      titel: "Per maand opgeteld",
      uitleg: "We tellen prijs × aantal per declaratie op, gegroepeerd per maand en per gemeente.",
      detail: "Januari t/m september 2024 · alleen Riemsterdal.",
      detailType: "info",
    },
    {
      titel: "= € 7.198.420",
      uitleg: "Dit is het bedrag dat je op het dashboard ziet.",
      detail: null,
      detailType: "resultaat",
    },
  ];

  // Controls in plain Dutch — the validation rules, but rewritten.
  const controles = [
    {
      ok: true,
      vraag: "Vallen alle declaraties in 2024?",
      antwoord: "Ja — geen enkele declaratie valt buiten het jaar.",
      aantal: "2.953 van 2.953",
    },
    {
      ok: true,
      vraag: "Zijn de productcodes geldig?",
      antwoord: "Bijna allemaal. 25 declaraties hadden een code die we niet kennen; die zijn apart gezet.",
      aantal: "2.928 van 2.953",
    },
    {
      ok: true,
      vraag: "Zijn er rare bedragen door kommafouten?",
      antwoord: "Eén declaratie had waarschijnlijk €1.250 ipv €12,50. Die is eruit gehaald.",
      aantal: "2.952 van 2.953",
    },
    {
      ok: false,
      vraag: "Zitten er uitschieters bij?",
      antwoord: "83 declaraties vielen op — véél hoger dan gebruikelijk. Ze zijn niet gebruikt in dit getal, maar wél zichtbaar als 'Afwijkers' hieronder.",
      aantal: "2.870 van 2.953",
    },
  ];

  const vragen = [
    "Wat zitten er voor aanbieders achter dit getal?",
    "Laat me de 83 afwijkers zien",
    "Hoe vergelijkt dit met vorig jaar dezelfde periode?",
  ];

  return (
    <div>
      <div className="page-h">
        <div>
          <h1 className="page-title">Klopt dit?</h1>
          <div className="page-sub">Check waar een getal vandaan komt en of je erop kunt vertrouwen.</div>
        </div>
      </div>

      {/* KPI picker — which number do you want to check? */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap",
      }}>
        <div style={{
          fontSize: 12, color: "var(--ink-mute)",
          padding: "10px 0 10px 2px", marginRight: 4,
        }}>Ik wil weten of dit klopt:</div>
        {kpis.map(k => (
          <button
            key={k.id}
            onClick={() => setKpi(k.id)}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              background: kpi === k.id ? "var(--ink)" : "var(--surface)",
              color: kpi === k.id ? "var(--bg)" : "var(--ink-soft)",
              border: `1px solid ${kpi === k.id ? "var(--ink)" : "var(--line)"}`,
              fontSize: 12.5,
              display: "inline-flex", alignItems: "center", gap: 8,
              fontWeight: 500,
            }}
          >
            <span>{k.label}</span>
            <span className="mono" style={{
              fontSize: 11,
              color: kpi === k.id ? "rgba(255,255,255,0.7)" : "var(--ink-mute)",
            }}>{k.value}</span>
          </button>
        ))}
      </div>

      {/* Grote verdict kaart */}
      <div style={{
        padding: "28px 32px",
        background: status.kleurZacht,
        border: `1px solid ${status.kleur}`,
        borderRadius: 12,
        marginBottom: 28,
        display: "flex", alignItems: "center", gap: 28,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: status.kleur,
          display: "grid", placeItems: "center",
          flexShrink: 0,
          boxShadow: `0 4px 14px ${status.kleur}40`,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            {huidig.status === "goed"
              ? <path d="M5 12.5 L10 17.5 L19 7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              : <><path d="M12 7 V13" stroke="white" strokeWidth="2.4" strokeLinecap="round"/><circle cx="12" cy="17" r="1.4" fill="white"/></>
            }
          </svg>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: status.kleurStrong, fontWeight: 600, marginBottom: 6}}>
            {huidig.label} · {huidig.value}
          </div>
          <div style={{fontSize: 26, fontWeight: 600, letterSpacing: "-0.015em", color: "var(--ink)", marginBottom: 6, fontFamily: "var(--f-serif)"}}>
            {status.kop}
          </div>
          <div style={{fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55, maxWidth: 620}}>
            {status.uitleg}
          </div>
        </div>
        <div style={{
          textAlign: "right",
          fontSize: 11.5, color: "var(--ink-mute)",
          lineHeight: 1.7,
          flexShrink: 0,
        }}>
          <div>Laatst ververst</div>
          <div style={{color: "var(--ink-soft)", fontWeight: 500}}>vandaag · 06:00</div>
        </div>
      </div>

      {/* Waar komt het vandaan? */}
      <div style={{marginBottom: 32}}>
        <h2 style={{
          fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em",
          marginBottom: 6, fontFamily: "var(--f-serif)",
        }}>Waar komt dit getal vandaan?</h2>
        <p style={{fontSize: 13, color: "var(--ink-mute)", marginBottom: 18, maxWidth: 640, lineHeight: 1.6}}>
          Van de zorgaanbieder tot op je scherm — elke stap op een rij. Klik op een stap voor details.
        </p>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "8px 0",
        }}>
          {herkomst.map((h, i) => (
            <HerkomstStap key={i} stap={h} index={i} isLast={i === herkomst.length - 1}/>
          ))}
        </div>
      </div>

      {/* Wat hebben we gecheckt? */}
      <div style={{marginBottom: 32}}>
        <h2 style={{
          fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em",
          marginBottom: 6, fontFamily: "var(--f-serif)",
        }}>Wat hebben we gecheckt?</h2>
        <p style={{fontSize: 13, color: "var(--ink-mute)", marginBottom: 18, maxWidth: 640, lineHeight: 1.6}}>
          Voordat we dit getal tonen, lopen we een paar vaste controles af. Dit zijn de belangrijkste.
        </p>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {controles.map((c, i) => (
            <div key={i} style={{
              padding: "18px 22px",
              borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18,
              alignItems: "start",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: c.ok ? "var(--success-tint)" : "var(--warning-tint)",
                color: c.ok ? "var(--success-strong)" : "var(--warning-strong)",
                display: "grid", placeItems: "center",
                fontSize: 14, fontWeight: 700,
                marginTop: 1,
              }}>
                {c.ok ? "✓" : "!"}
              </div>
              <div>
                <div style={{fontSize: 14, fontWeight: 500, marginBottom: 4, color: "var(--ink)"}}>
                  {c.vraag}
                </div>
                <div style={{fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.55}}>
                  {c.antwoord}
                </div>
              </div>
              <div className="mono" style={{
                fontSize: 11.5, color: "var(--ink-mute)",
                whiteSpace: "nowrap", paddingTop: 3,
              }}>
                {c.aantal}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meer weten / chat-invite */}
      <div style={{
        padding: "22px 26px",
        background: "var(--primary-tint)",
        border: "1px solid var(--primary-soft)",
        borderRadius: 12,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #e09770, var(--primary))",
          flexShrink: 0,
        }}/>
        <div style={{flex: 1}}>
          <div style={{fontSize: 14, fontWeight: 600, marginBottom: 4, color: "var(--ink)"}}>
            Meer weten? Vraag het gewoon.
          </div>
          <div style={{fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10, lineHeight: 1.5}}>
            Twijfel je over iets specifieks? Stel een vraag in je eigen woorden.
          </div>
          <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
            {vragen.map((v, i) => (
              <button key={i} onClick={() => onAsk && onAsk(v, {metricName: huidig.label, metricValue: huidig.value})} style={{
                padding: "7px 12px",
                background: "var(--surface)",
                border: "1px solid var(--primary-soft)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--primary-ink)",
                fontWeight: 500,
              }}>{v}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HerkomstStap = ({ stap, index, isLast }) => {
  const [open, setOpen] = React.useState(false);
  const isResultaat = stap.detailType === "resultaat";
  return (
    <div style={{
      padding: "16px 22px",
      borderTop: index > 0 ? "1px solid var(--line-soft)" : "none",
      position: "relative",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr auto",
        gap: 16,
        alignItems: "start",
        cursor: stap.detail ? "pointer" : "default",
      }} onClick={() => stap.detail && setOpen(!open)}>
        {/* Step indicator + connector line */}
        <div style={{position: "relative", paddingTop: 2}}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: isResultaat ? "var(--primary)" : "var(--surface)",
            border: `2px solid ${isResultaat ? "var(--primary)" : "var(--line)"}`,
            display: "grid", placeItems: "center",
            color: isResultaat ? "white" : "var(--ink-mute)",
            fontSize: 11, fontWeight: 600,
            fontFamily: "var(--f-mono)",
          }}>{isResultaat ? "✓" : index + 1}</div>
          {!isLast && <div style={{
            position: "absolute",
            top: 28, left: 11, width: 2, height: "calc(100% + 16px)",
            background: "var(--line-soft)",
          }}/>}
        </div>
        <div>
          <div style={{
            fontSize: isResultaat ? 18 : 14,
            fontWeight: isResultaat ? 600 : 500,
            color: isResultaat ? "var(--primary-ink)" : "var(--ink)",
            marginBottom: 3,
            fontFamily: isResultaat ? "var(--f-serif)" : "var(--f-sans)",
            letterSpacing: isResultaat ? "-0.01em" : 0,
          }}>{stap.titel}</div>
          <div style={{fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.55}}>
            {stap.uitleg}
          </div>
          {open && stap.detail && (
            <div style={{
              marginTop: 10,
              padding: "10px 14px",
              background: stap.detailType === "let-op" ? "var(--warning-tint)" : "var(--bg-soft)",
              borderLeft: `2px solid ${stap.detailType === "let-op" ? "var(--warning)" : "var(--line)"}`,
              borderRadius: "0 6px 6px 0",
              fontSize: 12.5,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
            }}>{stap.detail}</div>
          )}
        </div>
        {stap.detail && (
          <div style={{
            fontSize: 11, color: "var(--ink-mute)",
            display: "flex", alignItems: "center", gap: 4,
            paddingTop: 4,
          }}>
            {open ? "verbergen" : "details"}
            <Icon name="chevron" size={10}/>
          </div>
        )}
      </div>
    </div>
  );
};

window.KloptDitPage = KloptDitPage;
