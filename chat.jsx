/* global React, Icon, TrustBadge, BarChart */

const ChatView = ({ context, onBack }) => {
  const d = window.DataPraatData;
  const [messages, setMessages] = React.useState(() => {
    if (window.__chatSeed) return window.__chatSeed;
    try {
      const seed = localStorage.getItem("dp_chat_seed");
      if (seed) return JSON.parse(seed);
    } catch {}
    return [];
  });
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  // Normalise context: can be a string or an object from Klopt-Dit / AskDrawer
  const contextLabel = React.useMemo(() => {
    if (!context) return null;
    if (typeof context === "string") return context;
    if (context.metricName) {
      return context.metricValue
        ? `${context.metricName} (${context.metricValue})`
        : context.metricName;
    }
    return null;
  }, [context]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const systemPrompt = `Je bent DataPraat, een AI-assistent voor jeugdzorg-data van Nederlandse gemeenten.
Je praat nuchter, feitelijk, zakelijk Nederlands (je/jij). Geen marketing-taal, geen overdrijving, geen emoji.
Je bent expert in jeugdzorg (iJW 3.0 productcategorieën, verwijzers, CBS-data).

Context: Gemeente ${d.gemeente.naam} · ${d.gemeente.inwoners.toLocaleString("nl-NL")} inwoners · YTD 2024.

Huidige cijfers (Q3 2024 peildatum):
- Uitgaven YTD: €7,2M (5,9% boven begroot)
- Begroot YTD: €6,8M (75% van €9,5M jaarbudget)
- Aantal trajecten: 453 (−2,1% vs Q3 2023)
- Gem. prijs/cliënt: €15.842 (+€1.240 YoY)

Top productcategorieën YTD:
- 45A12 Ambulant specialistisch: €2,30M (32%)
- 43A22 Verblijf zwaar: €1,58M (22%)
- 44C01 Pleegzorg: €1,08M (15%)
- 51A01 Jeugdbescherming: €860K (12%)
- 41A11 Jeugd-GGZ basis: €720K (10%)

Verwijzer-verdeling (YTD): Wijkteam 52%, Huisarts 21%, Gecert. instelling 15%, Medisch specialist 12%. Medisch-specialist-trajecten zijn 2,8× duurder door langere looptijd.

Augustus 2024 uitgaven €910K (+€130K boven begroot) door 45A12-piek; volume +18,2%, prijs +1,2%.

Benchmark: 73e percentiel van 12 peers · €15.842/cliënt vs peer-mediaan €14.890.

Validatie: 3 kritieke issues open (decimaal-fout Lentis €2.450→€24,50; outlier Pluryn; ontbrekende pleegzorg-juli).

Getallen in NL-format (komma decimaal, punt duizendtallen). Antwoorden kort en concreet. Gebruik **bold** voor kerngetallen. Waar onzeker, zeg dat expliciet met een confidence-percentage.${contextLabel ? `\n\nHuidige context: gebruiker kijkt naar "${contextLabel}".` : ""}`;

  // Auto-send pending question (set by openChatFromQuestion in DataPraat.html)
  React.useEffect(() => {
    const q = window.__dpPendingQ;
    if (q) {
      window.__dpPendingQ = null;
      send(q);
    }
    // eslint-disable-next-line
  }, []);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const reply = await window.claude.complete({
        messages: [
          { role: "user", content: `${systemPrompt}\n\n---\n\n${newMsgs.map(m => `${m.role === "user" ? "Gebruiker" : "DataPraat"}: ${m.content}`).join("\n\n")}\n\nDataPraat:` },
        ],
      });
      setMessages([...newMsgs, { role: "assistant", content: reply, duration: (0.8 + Math.random() * 1.2).toFixed(1) }]);
    } catch (e) {
      setMessages([...newMsgs, { role: "assistant", content: "Er ging iets mis met de verbinding. Probeer het opnieuw.", duration: "—", error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const suggested = d.suggestedQuestions;

  return (
    <div className="chat-wrap">
      {contextLabel && (
        <div style={{fontSize: 12, color: "var(--ink-mute)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, cursor: "pointer"}} onClick={onBack}>
          <Icon name="back" size={14}/> Terug naar overzicht · <b style={{color: "var(--ink)"}}>{contextLabel}</b>
        </div>
      )}

      {messages.length === 0 && (
        <>
          <h1 className="chat-hero">Hallo Merel, waar wil je over praten?</h1>
          <div className="chat-hero-sub">Stel een vraag over je jeugdzorg-data. DataPraat kent je declaraties, verwijzers, prognoses en peers.</div>
          <div className="chat-ctx-strip">
            <span>📍 Gemeente: <b>{d.gemeente.naam}</b></span>
            <span>📅 Periode: <b>YTD 2024</b></span>
            <span>📊 <b>2.847</b> declaraties beschikbaar · <b>17</b> aanbieders</span>
          </div>
          <div className="sugg-grid">
            {suggested.map((s, i) => (
              <div key={i} className="sugg-card" onClick={() => send(s.q)}>
                <div className="sugg-cat">{s.cat}</div>
                <div className="sugg-q">{s.q}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div ref={scrollRef} style={{display: "flex", flexDirection: "column"}}>
        {messages.map((m, i) => m.role === "user" ? (
          <div key={i} className="msg-user">{m.content}</div>
        ) : (
          <div key={i} className="msg-ai">
            <div className="msg-ai-h">
              <span className="orb"/>
              <b style={{color: "var(--ink)", fontWeight: 500}}>DataPraat</b>
              <span>· {m.duration}s · 2.847 declaraties</span>
            </div>
            <div className="msg-ai-body" dangerouslySetInnerHTML={{__html: renderMD(m.content)}}/>
            <div className="msg-ai-actions">
              <button className="msg-action"><Icon name="pin" size={12}/> Pin naar dashboard</button>
              <button className="msg-action"><Icon name="copy" size={12}/> Kopieer</button>
              <button className="msg-action">👍</button>
              <button className="msg-action">👎</button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg-ai">
            <div className="msg-ai-h">
              <span className="orb" style={{animation: "pulse 1.4s ease-in-out infinite"}}/>
              <b style={{color: "var(--ink)", fontWeight: 500}}>DataPraat</b>
              <span style={{color: "var(--ink-mute)"}}>denkt na…</span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-wrap">
        <textarea
          className="chat-input"
          placeholder="Stel een vraag over je data…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
          }}
          rows={1}
        />
        <div className="chat-input-bar">
          <div className="chat-chips">
            <span className="chat-chip">📍 Riemsterdal</span>
            <span className="chat-chip">📅 YTD 2024</span>
            {contextLabel && <span className="chat-chip">📊 {contextLabel}</span>}
          </div>
          <button className="chat-send" disabled={!input.trim() || loading} onClick={() => send(input)}>
            <Icon name="send" size={14}/>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
    </div>
  );
};

// minimal markdown: **bold**, line breaks
function renderMD(s) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

// ===== PER-CHART ASK DRAWER =====
const AskDrawer = ({ topic, onClose, onOpenFull }) => {
  const suggestions = {
    "maandelijkse uitgaven": [
      "Waarom is augustus zoveel hoger dan begroot?",
      "Welke productcategorieën verklaren de overschrijding?",
      "Hoe verhoudt deze afwijking zich tot peer-gemeenten?",
      "Wat verwacht het model voor Q4?",
      "Toon de onderliggende declaraties van augustus",
    ],
    "top categorieën": [
      "Welke categorie groeit het snelst?",
      "Hoe heeft 45A12 zich ontwikkeld sinds januari?",
      "Wat is de peer-vergelijking voor 45A12?",
      "Welke aanbieders leveren 45A12?",
      "Waar zit de meeste prijs-spreiding?",
    ],
    "verwijzer-kostenverdeling": [
      "Waarom zijn medisch-specialist trajecten zo veel duurder?",
      "Hoe heeft het volume per verwijzer zich ontwikkeld?",
      "Welke aanbieders krijgen de meeste wijkteam-verwijzingen?",
      "Wat is de gemiddelde wachttijd per verwijzer?",
    ],
  };
  const list = suggestions[topic] || ["Geef een samenvatting", "Wat valt hier op?", "Vergelijk met vorig jaar"];
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}/>
      <div className="drawer" style={{width: 440}}>
        <div className="drawer-h">
          <div style={{flex: 1}}>
            <div style={{fontSize: 11.5, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4}}>Vraag over visualisatie</div>
            <div style={{fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em"}}>{topic}</div>
          </div>
          <div className="drawer-x" onClick={onClose}><Icon name="close"/></div>
        </div>
        <div className="drawer-body">
          <div style={{
            padding: 14, background: "var(--bg-soft)", borderRadius: 8, marginBottom: 20,
            fontSize: 12.5, color: "var(--ink-soft)",
          }}>
            <b style={{color: "var(--ink)"}}>Context · automatisch geladen</b><br/>
            {topic === "maandelijkse uitgaven" ? "Gerealiseerd vs begroot · jan – sep 2024" :
             topic === "top categorieën" ? "YTD aandeel · top 6 productcategorieën" :
             "YTD 2024 · gem. kosten per traject"}
          </div>
          <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)", fontWeight: 600, marginBottom: 10}}>Suggesties op basis van deze data</div>
          <div style={{display: "flex", flexDirection: "column", gap: 8}}>
            {list.map((q, i) => (
              <div key={i} onClick={() => onOpenFull(q, topic)} style={{
                padding: "10px 14px",
                background: "var(--bg-soft)",
                borderRadius: 8,
                fontSize: 13, cursor: "pointer",
                transition: "background 0.12s",
                display: "flex", alignItems: "center", gap: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--primary-tint)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--bg-soft)"}
              >
                <span style={{color: "var(--primary-ink)"}}>→</span>
                {q}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

window.ChatView = ChatView;
window.AskDrawer = AskDrawer;
