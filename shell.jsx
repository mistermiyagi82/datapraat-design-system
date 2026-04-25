/* global React, Icon, TrustBadge */
const { useState: useStateSB, useRef: useRefSB, useEffect: useEffectSB } = React;

const Sidebar = ({ currentPage, onNav, onNewChat, onOpenChat, chatBadge = 3 }) => {
  const data = window.DataPraatData;
  const [collapsed, setCollapsed] = useStateSB(() => {
    try { return JSON.parse(localStorage.getItem("dp_sb_collapsed") || "{}"); }
    catch { return {}; }
  });
  const [gemeenteOpen, setGemeenteOpen] = useStateSB(false);
  const [gemeente, setGemeente] = useStateSB(data.gemeente.naam);
  const gemeenteRef = useRefSB(null);

  useEffectSB(() => {
    if (!gemeenteOpen) return;
    const h = (e) => {
      if (gemeenteRef.current && !gemeenteRef.current.contains(e.target)) setGemeenteOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [gemeenteOpen]);

  const toggle = (key) => {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("dp_sb_collapsed", JSON.stringify(next));
      return next;
    });
  };

  // Andere Zeeuwse gemeenten — demo-lijst
  const gemeenten = [
    { naam: gemeente, actief: true },
    { naam: "Middelburg", trajecten: 612 },
    { naam: "Vlissingen", trajecten: 534 },
    { naam: "Goes", trajecten: 489 },
    { naam: "Terneuzen", trajecten: 467 },
    { naam: "Schouwen-Duiveland", trajecten: 298 },
    { naam: "Hulst", trajecten: 241 },
    { naam: "Borsele", trajecten: 187 },
    { naam: "Sluis", trajecten: 156 },
    { naam: "Kapelle", trajecten: 124 },
    { naam: "Noord-Beveland", trajecten: 89 },
    { naam: "Reimerswaal", trajecten: 145 },
    { naam: "Tholen", trajecten: 172 },
  ];

  const items = [
    { section: "Inzicht", key: "inzicht", entries: [
      { id: "overzicht", label: "Overzicht", icon: "overzicht" },
      { id: "prognose", label: "Prognose", icon: "prognose" },
      { id: "scenario", label: "Scenario's", icon: "sparkle" },
      { id: "benchmark", label: "Benchmark", icon: "benchmark" },
      { id: "verwijzers", label: "Verwijzers", icon: "verwijzers" },
    ]},
    { section: "Check", key: "trust", entries: [
      { id: "klopt-dit", label: "Klopt dit?", icon: "validatie", badge: chatBadge },
    ]},
    { section: "Geavanceerd", key: "adv", entries: [
      { id: "validatie", label: "Datavalidatie", icon: "regels" },
      { id: "lineage", label: "Lineage", icon: "lineage" },
      { id: "glossary", label: "Glossary", icon: "glossary" },
    ]},
  ];

  return (
    <aside className="sb">
      <div
        className="sb-brand"
        onClick={() => onNav("overzicht")}
        role="button"
        style={{cursor: "pointer"}}
        title="Terug naar overzicht"
      >
        <div className="sb-logo">D</div>
        <div className="sb-name">DataPraat</div>
      </div>
      <div className="sb-gemeente-wrap" ref={gemeenteRef}>
        <div className="sb-gemeente" onClick={() => setGemeenteOpen(o => !o)}>
          <div>
            <div className="sb-gemeente-label">Gemeente</div>
            <div className="sb-gemeente-name">{gemeente}</div>
          </div>
          <Icon name="chevron" />
        </div>
        {gemeenteOpen && (
          <div className="sb-gemeente-menu">
            <div className="sb-gemeente-menu-label">13 Zeeuwse gemeenten</div>
            {gemeenten.map(g => (
              <div
                key={g.naam}
                className={`sb-gemeente-opt ${g.naam === gemeente ? "active" : ""}`}
                onClick={() => { setGemeente(g.naam); setGemeenteOpen(false); }}
              >
                <span className="sb-gemeente-opt-name">{g.naam}</span>
                {g.actief
                  ? <span className="sb-gemeente-opt-tag">Actief</span>
                  : <span className="sb-gemeente-opt-meta">{g.trajecten} trajecten</span>
                }
              </div>
            ))}
            <div className="sb-gemeente-menu-foot">
              <Icon name="plus" size={12}/> Gemeente toevoegen
            </div>
          </div>
        )}
      </div>
      <button className="sb-newchat" onClick={onNewChat}>
        <Icon name="plus" size={14} />
        Nieuwe chat
      </button>

      {items.map(group => {
        const isCollapsed = collapsed[group.key];
        return (
          <div className="sb-section" key={group.section}>
            <div
              className={`sb-section-title sb-section-title-toggle ${isCollapsed ? "collapsed" : ""}`}
              onClick={() => toggle(group.key)}
              role="button"
            >
              <span className="sb-section-chevron"><Icon name="chevron" size={12} /></span>
              {group.section}
            </div>
            {!isCollapsed && group.entries.map(e => (
              <div
                key={e.id}
                className={`sb-item ${currentPage === e.id ? "active" : ""}`}
                onClick={() => onNav(e.id)}
              >
                <Icon name={e.icon} />
                {e.label}
                {e.badge ? <span className="sb-badge">{e.badge}</span> : null}
              </div>
            ))}
          </div>
        );
      })}

      <div className={`sb-section sb-chats ${collapsed.chats ? "chats-collapsed" : ""}`}>
        <div
          className={`sb-section-title sb-section-title-toggle ${collapsed.chats ? "collapsed" : ""}`}
          onClick={() => toggle("chats")}
          role="button"
        >
          <span className="sb-section-chevron"><Icon name="chevron" size={12} /></span>
          Chats
        </div>
        {!collapsed.chats && (
          <>
            {data.chatHistory.slice(0, 7).map(c => (
              <div key={c.id} className="sb-chat-item" onClick={() => onOpenChat(c)}>
                <span className="sb-chat-title">{c.title}</span>
                <span className="sb-chat-time">{c.time}</span>
              </div>
            ))}
            <div className="sb-more">Toon meer →</div>
          </>
        )}
      </div>
    </aside>
  );
};

const MainHeader = ({ onQuickAsk, onToggleTweaks }) => (
  <div className="main-header">
    <div className="quick-ask" onClick={onQuickAsk}>
      <span className="orb" />
      <span>Stel een vraag over <b style={{color: "var(--ink)", fontWeight: 500}}>Riemsterdal · YTD 2024</b></span>
      <span className="kbd">⌘ K</span>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: 10}}>
      <button className="icon-btn" onClick={onToggleTweaks} title="Tweaks">
        <Icon name="sparkle" />
      </button>
      <div className="user-chip">
        <span className="user-avatar">MK</span>
        <span>M. Kroes</span>
      </div>
    </div>
  </div>
);

const Launcher = ({ onClick }) => (
  <div className="launcher" onClick={onClick}>
    <div className="launcher-orb" />
    <div>
      <div className="launcher-main">Praat met je data</div>
      <div className="launcher-sub">3 recente chats</div>
    </div>
  </div>
);

window.Sidebar = Sidebar;
window.MainHeader = MainHeader;
window.Launcher = Launcher;
