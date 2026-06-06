/* FavKid — shared components. Exported to window. */
const { useState, useEffect, useRef } = React;

/* ---------- Status bar ---------- */
function StatusBar() {
  return (
    <div className="statusbar">
      <span>21:56</span>
      <div className="sb-right">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="4.5" y="4.5" width="3" height="7.5" rx="1"/><rect x="9" y="2" width="3" height="10" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.4"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 5.5C5.5 2.5 11.5 2.5 15 5.5"/><path d="M4.5 8C6.8 6 10.2 6 12.5 8"/><circle cx="8.5" cy="10.6" r="0.9" fill="currentColor" stroke="none"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.6" y="0.6" width="22" height="11.8" rx="3.2" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/><rect x="2.4" y="2.4" width="16" height="8.2" rx="1.8" fill="currentColor"/><rect x="24" y="4" width="1.8" height="5" rx="0.9" fill="currentColor" opacity="0.5"/></svg>
      </div>
    </div>
  );
}

/* ---------- Top bar with logout ---------- */
function TopBar({ brand, onLogout, right }) {
  return (
    <div className="row between" style={{ marginTop: 4, marginBottom: 14 }}>
      <div className="row" style={{ gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: "var(--accent)",
          display: "grid", placeItems: "center", color: "var(--accent-ink)",
        }}>
          <Icon name="spark" size={20} stroke={2.2} />
        </div>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-dim)" }}>{brand}</span>
      </div>
      {right || (onLogout && <button className="btn-danger-sm" onClick={onLogout}>Logout</button>)}
    </div>
  );
}

/* ---------- Bottom nav ---------- */
const NAV = [
  { id: "home", icon: "home", label: "Home" },
  { id: "track", icon: "target", label: "Track" },
  { id: "matrix", icon: "dice", label: "Matrix" },
  { id: "rank", icon: "trophy", label: "Rank" },
  { id: "connect", icon: "handshake", label: "Connect" },
];
function BottomNav({ current, go }) {
  return (
    <nav className="nav">
      {NAV.slice(0, 3).map((n) => (
        <button key={n.id} className={"nav-btn" + (current === n.id ? " active" : "")} onClick={() => go(n.id)}>
          <Icon name={n.icon} /><span>{n.label}</span>
        </button>
      ))}
      <button className={"nav-btn nav-add" + (current === "add" ? " active" : "")} onClick={() => go("add")}>
        <div className="nav-add-circle"><Icon name="plus" size={24} stroke={2.4} /></div>
        <span>Add</span>
      </button>
      {NAV.slice(3).map((n) => (
        <button key={n.id} className={"nav-btn" + (current === n.id ? " active" : "")} onClick={() => go(n.id)}>
          <Icon name={n.icon} /><span>{n.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---------- Progress bar ---------- */
function Bar({ value, done }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 120); return () => clearTimeout(t); }, [value]);
  return <div className={"bar" + (done ? " done" : "")}><i style={{ width: w + "%" }} /></div>;
}

/* ---------- Progress ring ---------- */
function Ring({ value, size = 92, stroke = 9, color = "var(--positive)", track = "rgba(255,255,255,0.12)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 160); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c - (v/100)*c}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

/* ---------- Momentum gauge (semi-circle, credit-score style) ---------- */
function MomentumGauge({ value, min = 300, max = 850 }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setP(pct), 200);
    return () => clearTimeout(t);
  }, [value, pct]);
  const W = 240, H = 130, cx = W/2, cy = 118, r = 96, sw = 14;
  const arc = Math.PI * r;
  const label = value >= 740 ? "Excellent" : value >= 670 ? "Strong" : value >= 580 ? "Building" : "Getting started";
  return (
    <div style={{ position: "relative", width: "100%", display: "grid", placeItems: "center" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 260 }}>
        <defs>
          <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="oklch(0.74 0.12 256)" />
            <stop offset="0.55" stopColor="var(--accent)" />
            <stop offset="1" stopColor="oklch(0.85 0.16 150)" />
          </linearGradient>
        </defs>
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="var(--surface-3)" strokeWidth={sw} strokeLinecap="round" />
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="url(#gauge)" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={arc} strokeDashoffset={arc - p*arc}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", top: 34, textAlign: "center" }}>
        <div className="display" style={{ fontSize: 52, lineHeight: 1, color: "var(--on-ink)" }}>{value}</div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--accent)", marginTop: 4, textTransform: "uppercase" }}>{label}</div>
      </div>
    </div>
  );
}

/* ---------- Sparkline ---------- */
function Sparkline({ data, w = 300, h = 64, color = "var(--accent)" }) {
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => [(i/(data.length-1))*w, h - ((d-min)/span)*(h-10) - 5]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3.4" fill={color} />
    </svg>
  );
}

/* ---------- Toast ---------- */
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = (m) => { setMsg(m); };
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2200); return () => clearTimeout(t); }, [msg]);
  const node = <div className={"toast" + (msg ? " show" : "")}>{msg && <Icon name="check" size={16} />}{msg}</div>;
  return [node, show];
}

Object.assign(window, { StatusBar, TopBar, BottomNav, Bar, Ring, MomentumGauge, Sparkline, useToast });
