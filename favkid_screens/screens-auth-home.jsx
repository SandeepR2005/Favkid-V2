/* FavKid — Login + Home screens */
const { USER: FK_USER, ACHIEVEMENTS: FK_ACH, INSIGHTS: FK_INS } = window.FK;

/* ============================ LOGIN ============================ */
function LoginScreen({ onLogin, theme, toggleTheme }) {
  const [email, setEmail] = useState("sandeep.k@gmail.com");
  const [pw, setPw] = useState("········");
  return (
    <div className="viewport">
      <div className="page" style={{ display: "flex", flexDirection: "column", minHeight: "100%", paddingTop: 8 }}>
        <div className="row between">
          <div className="row" style={{ gap: 11 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent)", display: "grid", placeItems: "center", color: "var(--accent-ink)" }}>
              <Icon name="spark" size={24} stroke={2.2} />
            </div>
            <span className="display" style={{ fontSize: 22 }}>FavKid</span>
          </div>
          <button className="chip" onClick={toggleTheme} style={{ padding: 9 }}>
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 30 }}>
          <p className="eyebrow" style={{ marginBottom: 14 }}>Accountability, gamified</p>
          <h1 className="display" style={{ fontSize: 46, lineHeight: 0.95 }}>Welcome<br/>back.</h1>
          <p className="page-sub" style={{ marginTop: 14, maxWidth: "100%" }}>
            Track achievements, earn momentum, and stay accountable with the people who matter.
          </p>

          <div className="field" style={{ marginTop: 26 }}>
            <label>Email address</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          </div>

          <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={onLogin}>
            Log in <Icon name="arrowR" size={18} stroke={2.2} />
          </button>
          <button className="btn btn-ghost" style={{ marginTop: 11 }} onClick={onLogin}>
            New to FavKid? Create an account
          </button>
        </div>

        <div className="row" style={{ gap: 16, justifyContent: "center", color: "var(--text-mute)", fontSize: 12 }}>
          <span className="row" style={{ gap: 6 }}><Icon name="lock" size={13} /> Private by default</span>
          <span className="row" style={{ gap: 6 }}><Icon name="check" size={13} /> Proof-verified</span>
        </div>
      </div>
    </div>
  );
}

/* ============================ HOME ============================ */
function HomeScreen({ go, onLogout, openInsights }) {
  const u = FK_USER;
  const next = FK_ACH.find((a) => a.status === "Active")?.subtasks.find((s) => s.status === "Pending");
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const week = FK_INS.weekTasks;
  const maxW = Math.max(...week);

  return (
    <div className="viewport">
      <div className="page">
        <TopBar brand="FAVKID" onLogout={onLogout} />

        <p className="eyebrow dim" style={{ color: "var(--text-mute)" }}>Welcome back,</p>
        <h1 className="page-title">{u.first}</h1>

        {/* Momentum hero */}
        <div className="card" style={{ marginTop: 16, background: "var(--ink)", border: "1px solid var(--border-soft)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% -20%, var(--accent-soft), transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <div className="row between">
              <p className="eyebrow">Momentum Index</p>
              <span className="pill" style={{ background: "var(--positive-soft)", color: "var(--positive)", whiteSpace: "nowrap" }}>
                <Icon name="arrowUp" size={13} stroke={2.4} /> +{u.momentumDelta} this wk
              </span>
            </div>
            <MomentumGauge value={u.momentum} />
            <div className="row" style={{ gap: 10, marginTop: 6 }}>
              <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 14, padding: "12px 14px" }}>
                <div className="row" style={{ gap: 7, color: "var(--warn)" }}>
                  <Icon name="flame" size={18} />
                  <span className="display" style={{ fontSize: 24 }}>{u.streak}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3, fontWeight: 600 }}>day streak</div>
              </div>
              <button onClick={openInsights} style={{ flex: 1, background: "var(--surface-2)", border: 0, borderRadius: 14, padding: "12px 14px", textAlign: "left", cursor: "pointer", color: "var(--text)" }}>
                <div className="row between">
                  <Icon name="trend" size={18} />
                  <Icon name="chevR" size={15} stroke={2.2} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 7, fontWeight: 600 }}>View insights</div>
              </button>
            </div>
          </div>
        </div>

        {/* Weekly activity */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row between" style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>This week</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-mute)" }}>{week.reduce((a,b)=>a+b,0)} tasks</span>
          </div>
          <div className="row between" style={{ alignItems: "flex-end", height: 70 }}>
            {week.map((v, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                <div style={{ width: 14, height: `${(v/maxW)*52+6}px`, borderRadius: 7, background: i === 5 ? "var(--accent)" : "var(--surface-3)", transition: "height .8s cubic-bezier(.2,.8,.2,1)" }} />
                <span className="mono" style={{ fontSize: 10, color: i === 5 ? "var(--accent)" : "var(--text-mute)", fontWeight: 700 }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Up next */}
        {next && (
          <>
            <div className="sec-title" style={{ marginBottom: 10 }}>Up next</div>
            <div className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Ring value={40} size={56} stroke={6} color="var(--accent)">
                <Icon name="bolt" size={20} />
              </Ring>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{next.title}</div>
                <div className="row" style={{ gap: 6, color: "var(--text-mute)", fontSize: 12.5, marginTop: 3 }}>
                  <Icon name="clock" size={13} /> Due {next.date}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => go("track")}>Open</button>
            </div>
          </>
        )}

        {/* Find favorite people */}
        <div className="card" style={{ marginTop: 14, background: "var(--accent-soft)", border: "1px solid transparent" }}>
          <div className="row" style={{ gap: 10 }}>
            <Icon name="handshake" size={20} stroke={2} />
            <span style={{ fontWeight: 800, fontSize: 15.5, fontFamily: "var(--font-display)" }}>Grow your circle</span>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.45, margin: "8px 0 14px" }}>
            Connect with mentors, coaches, or friends who verify your wins and keep you honest.
          </p>
          <button className="btn btn-ink" onClick={() => go("connect")}>
            Find favorite people <Icon name="arrowR" size={17} stroke={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
window.HomeScreen = HomeScreen;
