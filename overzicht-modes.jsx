/* global React */
// Overzicht "toon-als" modes — 7 varianten van dezelfde data.
// Modus 1 = cijfers (huidige view). Modes 2–7 = woord-varianten.

const OM_MODES = [
  { id: "cijfers",      label: "Cijfers",       sub: "Huidige view · grafieken + getallen",       groep: "Standaard" },
  { id: "verhaal",      label: "Verhaal",       sub: "Kort briefings-verhaal in volzinnen",       groep: "Tekst" },
  { id: "schaal",       label: "Woord-schaal",  sub: "Tegels met 'iets meer / zoals verwacht'",   groep: "Tekst" },
  { id: "verkeerslicht",label: "Verkeerslicht", sub: "Status per KPI: op koers / let op / actie", groep: "Tekst" },
  { id: "vergelijkend", label: "Vergelijkend",  sub: "Alles tov begroting, vorig jaar of peers",  groep: "Tekst" },
  { id: "metafoor",     label: "Dagelijks",     sub: "In herkenbare termen: per inwoner, auto's", groep: "Tekst" },
  { id: "bullets",      label: "Kernpunten",    sub: "5 bevindingen als MT-briefing",             groep: "Tekst" },
  { id: "dagboek",      label: "Jaardagboek",   sub: "Maand-voor-maand notities als kalender",    groep: "Verhalend" },
  { id: "weer",         label: "Weerbericht",   sub: "De stand van het kwartaal als weer",        groep: "Verhalend" },
  { id: "brief",        label: "Memo",          sub: "Korte brief aan de wethouder",              groep: "Verhalend" },
  { id: "dialoog",      label: "Vraag & antwoord", sub: "De 6 vragen die je zou stellen",         groep: "Verhalend" },
  { id: "poster",       label: "Poster",        sub: "Eén grote uitspraak — de kern in type",     groep: "Verhalend" },
];

// ==== Subtiele modus-switcher ====
const ModeSwitcher = ({ mode, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);
  const cur = OM_MODES.find(m => m.id === mode) || OM_MODES[0];
  return (
    <div ref={ref} className="om-switcher">
      <button className="om-trigger" onClick={() => setOpen(!open)} title="Kies hoe het overzicht getoond wordt">
        <span className="om-trigger-icon" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5 H13 M3 8 H10 M3 11 H13"/>
          </svg>
        </span>
        <span className="om-trigger-label">
          <span className="om-trigger-prefix">Toon als</span>
          <b>{cur.label}</b>
        </span>
        <span className="om-trigger-chev" aria-hidden>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6 L8 9 L11 6"/></svg>
        </span>
      </button>
      {open && (
        <div className="om-menu">
          <div className="om-menu-h">Kies een weergave</div>
          <div className="om-menu-sub">Dezelfde data — andere verpakking. Voor teams die liever in woorden denken.</div>
          <div className="om-menu-list">
            {["Standaard", "Tekst", "Verhalend"].map(g => (
              <React.Fragment key={g}>
                <div className="om-menu-group">{g}</div>
                {OM_MODES.filter(m => m.groep === g).map((m, i) => {
                  const idx = OM_MODES.findIndex(x => x.id === m.id);
                  return (
                    <div
                      key={m.id}
                      className={`om-opt ${m.id === mode ? "active" : ""}`}
                      onClick={() => { onChange(m.id); setOpen(false); }}
                    >
                      <div className="om-opt-num">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="om-opt-body">
                        <div className="om-opt-label">{m.label}</div>
                        <div className="om-opt-sub">{m.sub}</div>
                      </div>
                      {m.id === mode && (
                        <div className="om-opt-check" aria-hidden>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8 L7 12 L13 4"/></svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==== Gedeelde: "Toon cijfers erachter" voetje ====
const ShowNumbersFoot = ({ onClick }) => (
  <div className="om-foot">
    <button className="om-foot-btn" onClick={onClick}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="2.5" width="5" height="5" rx="1"/><rect x="8.5" y="2.5" width="5" height="5" rx="1"/><rect x="2.5" y="8.5" width="5" height="5" rx="1"/><rect x="8.5" y="8.5" width="5" height="5" rx="1"/></svg>
      Toon de cijfers erachter
    </button>
  </div>
);

// ==== 2 · VERHAAL ====
const VerhaalMode = ({ onAsk, onBackToCijfers }) => (
  <div className="om-narr-wrap">
    <div className="om-narr">
      <p>Aan het einde van het derde kwartaal zit Riemsterdal op <span className="hl-warn">iets meer uitgaven dan begroot</span> — alleen een klein beetje, maar wel consequent elke maand sinds maart.</p>
      <p>Er zijn <span className="hl-good">iets minder trajecten</span> dan vorig jaar, maar elk traject kost gemiddeld <span className="hl-warn">wat meer</span>. Het zijn dus niet méér kinderen die hulp krijgen, maar <b>duurdere hulp</b> per kind. Dat komt vooral door ambulant specialistische zorg, de grootste post van het moment.
        <button className="om-ask-inline" onClick={() => onAsk("Waarom stijgt de prijs per traject zo hard bij ambulant specialistisch?")}><span className="orb"/>Waarom?</button>
      </p>
      <p>Augustus viel op: een <span className="hl-bad">onverwachte piek</span> die buiten wat het model had voorspeld viel. September was juist rustig.
        <button className="om-ask-inline" onClick={() => onAsk("Wat gebeurde er in augustus waardoor de uitgaven zo hoog waren?")}><span className="orb"/>Wat gebeurde er?</button>
      </p>
      <p>Met nog een kwartaal te gaan is driekwart van het jaarbudget al gebruikt. Als het tempo zo blijft, <span className="hl-warn">dreigt een bescheiden overschrijding</span> aan het einde van het jaar.
        <button className="om-ask-inline" onClick={() => onAsk("Hoe groot wordt de verwachte jaar-overschrijding?")}><span className="orb"/>Hoe groot?</button>
      </p>
      <div className="om-narr-source">Samengevat uit 2.847 declaraties · peildatum 30 sep 2024</div>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

// ==== 3 · WOORD-SCHAAL ====
const SchaalCard = ({ label, word, kind, desc, meter, legend }) => (
  <div className="om-scale-card">
    <div className="om-scale-label">{label}</div>
    <div className={`om-scale-word w-${kind}`}>{word}</div>
    <div className="om-scale-desc">{desc}</div>
    <div className={`om-scale-meter w-${kind}`}>
      {[0,1,2,3,4].map(i => <div key={i} className={`dot ${i === meter ? "on" : ""}`}/>)}
    </div>
    <div className="om-scale-legend"><span>{legend[0]}</span><span>{legend[1]}</span><span>{legend[2]}</span></div>
  </div>
);
const SchaalMode = ({ onBackToCijfers }) => (
  <div>
    <div className="om-scale-grid">
      <SchaalCard label="Uitgaven dit jaar" word="Iets meer dan begroot" kind="warn"
        desc="Al meerdere maanden op rij — langzame overschrijding, geen schok."
        meter={3} legend={["veel minder","zoals verwacht","veel meer"]}/>
      <SchaalCard label="Budget-verbruik" word="Ongeveer op schema" kind="neutral"
        desc="Driekwart van het jaar voorbij, driekwart van het budget op."
        meter={2} legend={["nog ruim","op tempo","opgebruikt"]}/>
      <SchaalCard label="Kinderen in zorg" word="Iets minder dan vorig jaar" kind="good"
        desc="Kleine daling — geen trendbreuk, wel opmerkelijk."
        meter={1} legend={["veel minder","gelijk","veel meer"]}/>
      <SchaalCard label="Prijs per traject" word="Merkbaar hoger dan vorig jaar" kind="warn"
        desc="Elk traject wordt duurder — de grootste verklaring voor de budget-druk."
        meter={3} legend={["veel lager","gelijk","veel hoger"]}/>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

// ==== 4 · VERKEERSLICHT ====
const LightCard = ({ status, head, sub, kind, icon }) => (
  <div className="om-light-card">
    <div className={`om-light-dot ${kind}`}>{icon}</div>
    <div>
      <div className={`om-light-status ${kind}`}>{status}</div>
      <div className="om-light-head">{head}</div>
      <div className="om-light-sub">{sub}</div>
    </div>
  </div>
);
const VerkeerslichtMode = ({ onBackToCijfers }) => (
  <div>
    <div className="om-light-grid">
      <LightCard status="Let op" kind="watch" icon="!"
        head="Uitgaven lopen licht voor"
        sub="We geven structureel net wat meer uit dan begroot, al sinds het voorjaar."/>
      <LightCard status="Op koers" kind="ok" icon="✓"
        head="Budget-verbruik is in balans"
        sub="Driekwart jaar voorbij, driekwart budget op — precies wat je zou verwachten."/>
      <LightCard status="Op koers" kind="ok" icon="✓"
        head="Iets minder kinderen in zorg"
        sub="Lichte daling ten opzichte van vorig jaar. Geen zorgelijke beweging."/>
      <LightCard status="Aandacht" kind="act" icon="!"
        head="Prijs per traject stijgt door"
        sub="De belangrijkste reden dat het budget onder druk staat. Vooral bij ambulant specialistisch."/>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

// ==== 5 · VERGELIJKEND ====
const VergelijkendMode = ({ onBackToCijfers }) => (
  <div className="om-comp-card">
    <div className="om-comp-wrap">
      <div className="om-comp-row">
        <div className="om-comp-label">Uitgaven</div>
        <div className="om-comp-sentence"><em>Een klein beetje meer</em> dan begroot — <span className="warn">boven tempo</span>, maar binnen de bandbreedte.</div>
      </div>
      <div className="om-comp-row">
        <div className="om-comp-label">Budget-gebruik</div>
        <div className="om-comp-sentence"><em>Precies op tempo</em> voor deze tijd van het jaar.</div>
      </div>
      <div className="om-comp-row">
        <div className="om-comp-label">Kinderen in zorg</div>
        <div className="om-comp-sentence"><em>Iets minder</em> dan vorig jaar, <em>vergelijkbaar</em> met buurgemeente Peer B.</div>
      </div>
      <div className="om-comp-row">
        <div className="om-comp-label">Prijs per traject</div>
        <div className="om-comp-sentence"><em>Merkbaar hoger</em> dan vorig jaar, en ook <span className="warn">boven het gemiddelde van vergelijkbare gemeenten</span>.</div>
      </div>
      <div className="om-comp-row">
        <div className="om-comp-label">Grootste post</div>
        <div className="om-comp-sentence">Ambulant specialistisch — <em>bijna een derde</em> van alle uitgaven, meer dan alle kleinere categorieën samen.</div>
      </div>
      <div className="om-comp-row">
        <div className="om-comp-label">Augustus</div>
        <div className="om-comp-sentence"><span className="warn">Een stuk hoger</span> dan normaal en dan verwacht — enige maand dit jaar buiten de verwachting.</div>
      </div>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

// ==== 6 · METAFOOR ====
const MetafoorMode = ({ onBackToCijfers }) => {
  const peopleRef = React.useRef(null);
  React.useEffect(() => {
    const el = peopleRef.current;
    if (!el || el.children.length) return;
    for (let i = 0; i < 100; i++) {
      const p = document.createElement("div");
      p.className = "om-person" + (i < 2 ? " on" : "");
      el.appendChild(p);
    }
  }, []);
  return (
    <div>
      <div className="om-meta-grid">
        <div className="om-meta-card">
          <div className="om-meta-label">Kinderen in zorg</div>
          <div className="om-meta-big">Op elke groep van <b>100 inwoners</b> van Riemsterdal krijgen er <b>ongeveer anderhalf</b> jeugdzorg.</div>
          <div className="om-meta-vis" ref={peopleRef}/>
        </div>
        <div className="om-meta-card">
          <div className="om-meta-label">Uitgaven dit jaar</div>
          <div className="om-meta-big">Voor elke inwoner van Riemsterdal geeft de gemeente dit jaar <b>zo'n 250 euro</b> uit aan jeugdzorg — meer dan aan bibliotheek, groen én afvalophaal samen.</div>
        </div>
        <div className="om-meta-card" style={{gridColumn: "span 2"}}>
          <div className="om-meta-label">Prijs per traject</div>
          <div className="om-meta-big">Een gemiddeld jeugdzorg-traject kost Riemsterdal <b>even veel als een middenklasse-auto</b>. Een duurder traject — via een medisch specialist — is eerder een <b>flinke SUV</b>.</div>
        </div>
      </div>
      <ShowNumbersFoot onClick={onBackToCijfers}/>
    </div>
  );
};

// ==== 7 · BULLETS ====
const BulletsMode = ({ onBackToCijfers }) => (
  <div>
    <div className="om-bullet-card">
      <div className="om-bullet-head">Wat je moet weten over Q3 · Riemsterdal</div>
      <div className="om-bullet-title">Stabiel kwartaal, één uitschieter in augustus.</div>
      <ul className="om-bullet-list">
        <li className="om-bullet-item">
          <div className="om-bullet-marker watch"></div>
          <div><b>Uitgaven lopen licht voor op begroting</b> — geen schok, wel een trend sinds het voorjaar.</div>
        </li>
        <li className="om-bullet-item">
          <div className="om-bullet-marker act"></div>
          <div><b>De prijs per traject stijgt door</b>, vooral in ambulant specialistische zorg. Dit is de grootste drijver van de overschrijding.</div>
        </li>
        <li className="om-bullet-item">
          <div className="om-bullet-marker ok"></div>
          <div><b>Aantal kinderen in zorg is licht gedaald</b> — geen zorgen, mogelijk effect van preventieteams.</div>
        </li>
        <li className="om-bullet-item">
          <div className="om-bullet-marker watch"></div>
          <div><b>Augustus was een uitschieter</b>: uitgaven boven de verwachting. Aanbeveling: uitvragen bij Lentis wat er speelde.</div>
        </li>
        <li className="om-bullet-item">
          <div className="om-bullet-marker info"></div>
          <div><b>Eindejaarsraming</b>: bescheiden overschrijding waarschijnlijk. Nog niet dramatisch, wel op te letten.</div>
        </li>
      </ul>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

// ==== 8 · JAARDAGBOEK ====
const DagboekMode = ({ onBackToCijfers }) => {
  const maanden = [
    { m: "jan", kind: "ok",    titel: "Rustige start", tekst: "Net onder begroting begonnen." },
    { m: "feb", kind: "ok",    titel: "In balans", tekst: "Stabiele maand, geen opvallendheden." },
    { m: "mrt", kind: "watch", titel: "Eerste overschrijding", tekst: "Uitgaven kruipen boven de lijn." },
    { m: "apr", kind: "watch", titel: "Lichte druk", tekst: "Budget-druk zet door, vooral bij ambulant." },
    { m: "mei", kind: "ok",    titel: "Adempauze", tekst: "Terug binnen verwachte bandbreedte." },
    { m: "jun", kind: "watch", titel: "Weer boven", tekst: "Derde maand op rij boven begroot." },
    { m: "jul", kind: "watch", titel: "Zomer-piek begint", tekst: "Ambulant specialistisch neemt toe." },
    { m: "aug", kind: "act",   titel: "Uitschieter", tekst: "Ongebruikelijk hoge uitgaven — buiten verwachting." },
    { m: "sep", kind: "ok",    titel: "Correctie", tekst: "Rustige maand, onder prognose. Balans keert terug." },
    { m: "okt", kind: "soon",  titel: "Nog te gaan", tekst: "Prognose: volgt het zomer-patroon." },
    { m: "nov", kind: "soon",  titel: "Nog te gaan", tekst: "Eindejaars-beeld wordt helder." },
    { m: "dec", kind: "soon",  titel: "Nog te gaan", tekst: "Waarschijnlijk lichte overschrijding jaarbudget." },
  ];
  return (
    <div>
      <div className="om-dagboek-grid">
        {maanden.map(e => (
          <div key={e.m} className={`om-dagboek-entry k-${e.kind}`}>
            <div className="om-dagboek-m">{e.m}</div>
            <div className="om-dagboek-titel">{e.titel}</div>
            <div className="om-dagboek-tekst">{e.tekst}</div>
          </div>
        ))}
      </div>
      <ShowNumbersFoot onClick={onBackToCijfers}/>
    </div>
  );
};

// ==== 9 · WEERBERICHT ====
const WeerMode = ({ onBackToCijfers }) => (
  <div className="om-weer-wrap">
    <div className="om-weer-hero">
      <div className="om-weer-icon">
        <svg width="88" height="88" viewBox="0 0 100 100" fill="none">
          <circle cx="36" cy="40" r="14" fill="#F4ECD4"/>
          <path d="M20 68 Q26 56 38 58 Q44 48 58 52 Q74 50 78 64 Q82 74 72 76 H26 Q16 76 20 68 Z" fill="#E5E3DD" stroke="#A8702A" strokeWidth="1.2"/>
        </svg>
      </div>
      <div>
        <div className="om-weer-label">De stand van zaken · Q3</div>
        <div className="om-weer-head">Half bewolkt, droog</div>
        <div className="om-weer-sub">Geen noodweer, wel aanhoudende lichte druk. Eén onweersbui in augustus.</div>
      </div>
    </div>
    <div className="om-weer-grid">
      <div className="om-weer-mini">
        <div className="om-weer-mini-label">Uitgaven</div>
        <div className="om-weer-mini-icon">⛅</div>
        <div className="om-weer-mini-word">Bewolkt</div>
        <div className="om-weer-mini-desc">Wat boven begroot, al maanden.</div>
      </div>
      <div className="om-weer-mini">
        <div className="om-weer-mini-label">Budget</div>
        <div className="om-weer-mini-icon">☀︎</div>
        <div className="om-weer-mini-word">Zonnig</div>
        <div className="om-weer-mini-desc">Op tempo, zoals verwacht.</div>
      </div>
      <div className="om-weer-mini">
        <div className="om-weer-mini-label">Aantal trajecten</div>
        <div className="om-weer-mini-icon">☀︎</div>
        <div className="om-weer-mini-word">Zonnig</div>
        <div className="om-weer-mini-desc">Iets minder dan vorig jaar.</div>
      </div>
      <div className="om-weer-mini">
        <div className="om-weer-mini-label">Prijs per traject</div>
        <div className="om-weer-mini-icon">🌧</div>
        <div className="om-weer-mini-word">Motregen</div>
        <div className="om-weer-mini-desc">Blijft stijgen, drijft de druk.</div>
      </div>
    </div>
    <div className="om-weer-vooruit">
      <div className="om-weer-vooruit-label">Vooruitzicht Q4</div>
      <div className="om-weer-vooruit-tekst">
        <span className="day">Okt</span><span className="ico">⛅</span>
        <span className="day">Nov</span><span className="ico">⛅</span>
        <span className="day">Dec</span><span className="ico">🌧</span>
        <span className="vooruit-tekst">Kans op lichte overschrijding aan jaareinde.</span>
      </div>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

// ==== 10 · MEMO ====
const BriefMode = ({ onBackToCijfers }) => (
  <div className="om-brief-wrap">
    <div className="om-brief">
      <div className="om-brief-kop">
        <div className="om-brief-meta">
          <div><b>Aan</b> · Wethouder Jeugd</div>
          <div><b>Van</b> · Team Data & Inkoop</div>
          <div><b>Datum</b> · 30 september 2024</div>
          <div><b>Betreft</b> · Stand van de jeugdzorg, Q3</div>
        </div>
      </div>
      <div className="om-brief-body">
        <p>Beste wethouder,</p>
        <p>Bij deze een korte stand van zaken over het derde kwartaal. Het beeld is <b>stabiel maar aandachtsvaardig</b>: we zitten licht boven de begroting — niet dramatisch, maar wel consistent sinds maart.</p>
        <p>De hoofdoorzaak is <b>niet</b> dat meer kinderen hulp krijgen — dat aantal is juist licht gedaald. De prijs per traject stijgt echter door, vooral bij ambulant specialistische zorg. Dat is onze grootste post en tegelijkertijd de grootste drijver van de overschrijding.</p>
        <p>Augustus was een <b>uitschieter</b>. De uitgaven lagen duidelijk buiten wat het model verwachtte. We hebben Lentis gevraagd om een toelichting en verwachten hun antwoord binnen twee weken.</p>
        <p>Met nog één kwartaal te gaan is 75% van het jaarbudget verbruikt. Bij ongewijzigd beleid landen we op een bescheiden overschrijding. We werken aan een scenario-analyse en koppelen medio november terug.</p>
        <p className="om-brief-sign">Met vriendelijke groet,<br/><b>Team Data & Inkoop</b></p>
      </div>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

// ==== 11 · DIALOOG ====
const DialoogMode = ({ onAsk, onBackToCijfers }) => {
  const qa = [
    { q: "Hoe staan we er eigenlijk voor?",
      a: "Redelijk stabiel. Een klein beetje boven begroot, maar geen grote verrassingen — behalve augustus." },
    { q: "Dus we geven te veel uit?",
      a: "Een beetje, ja. De overschrijding is niet groot, maar wel hardnekkig. Al sinds het voorjaar elke maand een tik boven de lijn." },
    { q: "Komt dat doordat er meer kinderen in zorg zijn?",
      a: "Nee, juist niet. Er zijn zelfs iets minder trajecten dan vorig jaar. Het komt doordat elk traject gemiddeld duurder wordt." },
    { q: "Waar zit dat 'duurder worden' dan?",
      a: "Vooral bij ambulant specialistische zorg — onze grootste categorie. Daar stijgen de prijzen per cliënt het hardst." },
    { q: "En augustus, wat was er met augustus?",
      a: "Een duidelijke piek, buiten wat we hadden voorspeld. We vragen bij de aanbieder uit wat er speelde." },
    { q: "Hoe gaan we het jaar afsluiten?",
      a: "Als het tempo zo blijft: een bescheiden overschrijding. Nog niet dramatisch, wel op te letten." },
  ];
  return (
    <div>
      <div className="om-dialoog-wrap">
        {qa.map((item, i) => (
          <div key={i} className="om-dialoog-item">
            <div className="om-dialoog-q">
              <div className="om-dialoog-avatar-q">U</div>
              <div className="om-dialoog-bubble q">{item.q}</div>
            </div>
            <div className="om-dialoog-a">
              <div className="om-dialoog-avatar-a"><span className="orb"/></div>
              <div className="om-dialoog-bubble a">{item.a}</div>
            </div>
          </div>
        ))}
        <button className="om-dialoog-meer" onClick={() => onAsk && onAsk("Ik wil hierover doorpraten.")}>
          <span className="orb"/>Stel een eigen vraag
        </button>
      </div>
      <ShowNumbersFoot onClick={onBackToCijfers}/>
    </div>
  );
};

// ==== 13 · POSTER ====
const PosterMode = ({ onBackToCijfers }) => (
  <div>
    <div className="om-poster">
      <div className="om-poster-k">De kern van Q3</div>
      <div className="om-poster-body">
        <span>Niet</span> <span className="em">méér</span> <span>kinderen</span><br/>
        in zorg — maar <span className="em">duurdere</span><br/>
        hulp <span className="soft">per kind.</span>
      </div>
      <div className="om-poster-foot">
        <div className="om-poster-dek">
          Eén augustus-piek, verder een rustig beeld.<br/>
          Eindejaars-prognose: lichte overschrijding.
        </div>
        <div className="om-poster-sig">
          Riemsterdal · Q3 2024 · DataPraat
        </div>
      </div>
    </div>
    <ShowNumbersFoot onClick={onBackToCijfers}/>
  </div>
);

window.DagboekMode = DagboekMode;
window.WeerMode = WeerMode;
window.BriefMode = BriefMode;
window.DialoogMode = DialoogMode;
window.PosterMode = PosterMode;

window.OM_MODES = OM_MODES;
window.ModeSwitcher = ModeSwitcher;
window.VerhaalMode = VerhaalMode;
window.SchaalMode = SchaalMode;
window.VerkeerslichtMode = VerkeerslichtMode;
window.VergelijkendMode = VergelijkendMode;
window.MetafoorMode = MetafoorMode;
window.BulletsMode = BulletsMode;
