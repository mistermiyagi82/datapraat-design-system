/* global React, Icon, TrustBadge, fmtCompact */

// ---- Mini SVG charts (no external lib) ----

const BarChart = ({ data, width = 520, height = 220 }) => {
  const max = Math.max(...data.flatMap(d => [d.actual || 0, d.begroot || 0]));
  const pad = { l: 36, r: 12, t: 16, b: 28 };
  const bw = (width - pad.l - pad.r) / data.length;
  const yScale = (v) => height - pad.b - (v / max) * (height - pad.t - pad.b);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{display: "block"}}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={yScale(max * f)} y2={yScale(max * f)} stroke="var(--line)" strokeDasharray={i === 0 ? "0" : "2 3"}/>
          <text x={pad.l - 6} y={yScale(max * f) + 3} fontSize="9.5" fill="var(--ink-mute)" textAnchor="end" fontFamily="var(--f-mono)">€{Math.round(max * f)}K</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = pad.l + i * bw + bw / 2;
        const barW = bw * 0.32;
        return (
          <g key={i}>
            {d.begroot != null && (
              <rect x={cx - barW - 1} y={yScale(d.begroot)} width={barW} height={height - pad.b - yScale(d.begroot)} fill="var(--line-strong)" opacity="0.55" rx="1"/>
            )}
            {d.actual != null && (
              <rect x={cx + 1} y={yScale(d.actual)} width={barW} height={height - pad.b - yScale(d.actual)} fill={d.maand === "aug" ? "var(--primary)" : "var(--chart-cost)"} rx="1"/>
            )}
            <text x={cx} y={height - 10} fontSize="10" fill="var(--ink-mute)" textAnchor="middle" fontFamily="var(--f-sans)">{d.maand}</text>
          </g>
        );
      })}
    </svg>
  );
};

const DoughnutChart = ({ data, width = 280, height = 220 }) => {
  const total = data.reduce((s, d) => s + d.waarde, 0);
  const cx = 110, cy = height / 2, r = 72, inner = 50;
  let a0 = -Math.PI / 2;
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--ink-soft)"];
  const arc = (a, b) => {
    const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    const x2 = cx + r * Math.cos(b), y2 = cy + r * Math.sin(b);
    const xi1 = cx + inner * Math.cos(b), yi1 = cy + inner * Math.sin(b);
    const xi2 = cx + inner * Math.cos(a), yi2 = cy + inner * Math.sin(a);
    const large = b - a > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${xi1},${yi1} A${inner},${inner} 0 ${large} 0 ${xi2},${yi2} Z`;
  };
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const a1 = a0 + (d.waarde / total) * 2 * Math.PI;
        const path = arc(a0, a1);
        a0 = a1;
        return <path key={i} d={path} fill={colors[i % colors.length]} />;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10.5" fill="var(--ink-mute)">YTD</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="var(--f-sans)" fontSize="19" fontWeight="600" fill="var(--ink)">€7,2M</text>
      {data.slice(0, 6).map((d, i) => (
        <g key={i} transform={`translate(205, ${22 + i * 28})`}>
          <rect x="0" y="2" width="9" height="9" fill={colors[i % colors.length]} rx="1"/>
          <text x="14" y="7" fontSize="10" fill="var(--ink)" fontFamily="var(--f-mono)">{d.code}</text>
          <text x="14" y="18" fontSize="10" fill="var(--ink-mute)">{d.aandeel}%</text>
        </g>
      ))}
    </svg>
  );
};

const ForecastChart = ({ data, width = 700, height = 280 }) => {
  const pad = { l: 44, r: 12, t: 16, b: 28 };
  const all = data.flatMap(d => [d.actual, d.forecast, d.ciLow, d.ciHigh]).filter(v => v != null);
  const max = Math.max(...all) * 1.05;
  const min = Math.min(...all) * 0.9;
  const xStep = (width - pad.l - pad.r) / (data.length - 1);
  const xOf = (i) => pad.l + i * xStep;
  const yOf = (v) => height - pad.b - ((v - min) / (max - min)) * (height - pad.t - pad.b);

  const actualPts = data.map((d, i) => d.actual != null ? `${xOf(i)},${yOf(d.actual)}` : null).filter(Boolean).join(" ");
  const forecastPts = data.map((d, i) => d.forecast != null ? `${xOf(i)},${yOf(d.forecast)}` : null).filter(Boolean).join(" ");

  // CI band
  const bandTop = data.map((d, i) => d.ciHigh != null ? `${xOf(i)},${yOf(d.ciHigh)}` : null).filter(Boolean).join(" ");
  const bandBot = data.slice().reverse().map((d, iRev) => {
    const i = data.length - 1 - iRev;
    return d.ciLow != null ? `${xOf(i)},${yOf(d.ciLow)}` : null;
  }).filter(Boolean).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={yOf(min + (max - min) * f)} y2={yOf(min + (max - min) * f)} stroke="var(--line)" strokeDasharray={i === 0 ? "0" : "2 3"}/>
          <text x={pad.l - 6} y={yOf(min + (max - min) * f) + 3} fontSize="9.5" fill="var(--ink-mute)" textAnchor="end" fontFamily="var(--f-mono)">€{Math.round(min + (max - min) * f)}K</text>
        </g>
      ))}
      {bandTop && bandBot && (
        <polygon points={`${bandTop} ${bandBot}`} fill="var(--primary)" opacity="0.12" />
      )}
      <polyline points={actualPts} fill="none" stroke="var(--chart-cost)" strokeWidth="1.8" />
      <polyline points={forecastPts} fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeDasharray="4 3" />
      {data.map((d, i) => d.actual != null && (
        <circle key={i} cx={xOf(i)} cy={yOf(d.actual)} r="2" fill="var(--chart-cost)" />
      ))}
      {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map((d, i) => {
        const idx = data.indexOf(d);
        return <text key={idx} x={xOf(idx)} y={height - 10} fontSize="9.5" fill="var(--ink-mute)" textAnchor="middle" fontFamily="var(--f-mono)">{d.periode.slice(2)}</text>;
      })}
      {/* legend */}
      <g transform={`translate(${pad.l}, 6)`}>
        <line x1="0" y1="6" x2="14" y2="6" stroke="var(--chart-cost)" strokeWidth="1.8"/>
        <text x="18" y="9" fontSize="10" fill="var(--ink-soft)">Gerealiseerd</text>
        <line x1="90" y1="6" x2="104" y2="6" stroke="var(--primary)" strokeWidth="1.8" strokeDasharray="3 2"/>
        <text x="108" y="9" fontSize="10" fill="var(--ink-soft)">Prognose</text>
        <rect x="168" y="2" width="14" height="9" fill="var(--primary)" opacity="0.12"/>
        <text x="186" y="9" fontSize="10" fill="var(--ink-soft)">95% CI</text>
      </g>
    </svg>
  );
};

const SpreadChart = ({ percentiles, eigen, width = 460, height = 120 }) => {
  const pad = { l: 20, r: 20, t: 30, b: 30 };
  const min = percentiles[0].waarde * 0.9;
  const max = percentiles[percentiles.length - 1].waarde * 1.05;
  const xOf = (v) => pad.l + ((v - min) / (max - min)) * (width - pad.l - pad.r);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <rect x={xOf(percentiles[0].waarde)} y={height/2 - 8} width={xOf(percentiles[4].waarde) - xOf(percentiles[0].waarde)} height="16" fill="var(--line-soft)" rx="2"/>
      <rect x={xOf(percentiles[1].waarde)} y={height/2 - 10} width={xOf(percentiles[3].waarde) - xOf(percentiles[1].waarde)} height="20" fill="var(--line-strong)" rx="2" opacity="0.7"/>
      <line x1={xOf(percentiles[2].waarde)} x2={xOf(percentiles[2].waarde)} y1={height/2 - 14} y2={height/2 + 14} stroke="var(--ink)" strokeWidth="1.5"/>
      <text x={xOf(percentiles[2].waarde)} y={height/2 + 28} textAnchor="middle" fontSize="9.5" fill="var(--ink-mute)" fontFamily="var(--f-mono)">mediaan €{(percentiles[2].waarde/1000).toFixed(1)}K</text>
      {/* eigen positie */}
      <g transform={`translate(${xOf(eigen)}, ${height/2})`}>
        <circle r="7" fill="var(--primary)"/>
        <circle r="12" fill="var(--primary)" opacity="0.15"/>
        <text y="-18" textAnchor="middle" fontSize="10" fill="var(--primary-ink)" fontWeight="600" fontFamily="var(--f-mono)">u · €{(eigen/1000).toFixed(1)}K</text>
      </g>
      {percentiles.map((p, i) => (
        <text key={i} x={xOf(p.waarde)} y="18" textAnchor="middle" fontSize="9" fill="var(--ink-faint)" fontFamily="var(--f-mono)">{p.label}</text>
      ))}
    </svg>
  );
};

const VolumeChart = ({ data, width = 460, height = 160 }) => {
  const pad = { l: 60, r: 20, t: 8, b: 20 };
  const max = Math.max(...data.map(d => d.volume));
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const y = pad.t + i * ((height - pad.t - pad.b) / data.length);
        const bh = (height - pad.t - pad.b) / data.length - 4;
        const bw = ((d.volume / max) * (width - pad.l - pad.r - 40));
        return (
          <g key={i}>
            <text x={pad.l - 6} y={y + bh/2 + 3} fontSize="10" textAnchor="end" fill={d.self ? "var(--primary-ink)" : "var(--ink-soft)"} fontWeight={d.self ? 600 : 400}>{d.gemeente}</text>
            <rect x={pad.l} y={y} width={bw} height={bh} fill={d.self ? "var(--primary)" : "var(--ink-soft)"} opacity={d.self ? 1 : 0.4} rx="1"/>
            <text x={pad.l + bw + 6} y={y + bh/2 + 3} fontSize="10" fill="var(--ink-mute)" fontFamily="var(--f-mono)">{d.volume.toFixed(1)}</text>
          </g>
        );
      })}
    </svg>
  );
};

const PathwayChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.gemiddeld));
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 10}}>
      {data.map((d, i) => {
        const pct = (d.gemiddeld / max) * 100;
        return (
          <div key={i} style={{display: "grid", gridTemplateColumns: "160px 1fr 120px", alignItems: "center", gap: 14}}>
            <div>
              <div style={{fontSize: 13, fontWeight: 500}}>{d.naam}</div>
              <div style={{fontSize: 11, color: "var(--ink-mute)"}}>{d.trajecten} trajecten · {d.looptijd}</div>
            </div>
            <div style={{position: "relative", height: 32, background: "var(--bg-soft)", borderRadius: 6, overflow: "hidden"}}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${pct}%`,
                background: `linear-gradient(90deg, var(--primary-soft), var(--primary))`,
                borderRadius: 6,
                display: "flex", alignItems: "center", paddingLeft: 10,
                fontSize: 11.5, color: "white", fontWeight: 500, fontFamily: "var(--f-mono)",
              }}>
                €{fmtCompact(d.gemiddeld).replace("€","")} gem.
              </div>
            </div>
            <div style={{textAlign: "right", fontFamily: "var(--f-mono)", fontSize: 12}}>{d.totaal}</div>
          </div>
        );
      })}
    </div>
  );
};

window.BarChart = BarChart;
window.DoughnutChart = DoughnutChart;
window.ForecastChart = ForecastChart;
window.SpreadChart = SpreadChart;
window.VolumeChart = VolumeChart;
window.PathwayChart = PathwayChart;
