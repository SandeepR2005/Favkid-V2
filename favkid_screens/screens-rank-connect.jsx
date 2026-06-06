/* FavKid — Rank, Connect, Insights sheet */
const { ACHIEVEMENTS: RC_ACH, FAVPEOPLE: RC_FAV, USER: RC_USER, INSIGHTS: RC_INS } = window.FK;

/* ============================ RANK ============================ */
function RankScreen({ onLogout }) {
  const ranked = RC_ACH.filter((a) => a.status !== "Draft");
  const [sel, setSel] = useState(ranked[0].id);
  const a = ranked.find((x) => x.id === sel);
  const board = [...RC_FAV].sort((x, y) => y.points - x.points);

  return (
    <div className="viewport">
      <div className="page">
        <TopBar brand="FAVORITE PERSON POINTS" onLogout={onLogout} />
        <h1 className="page-title">Ranking</h1>
        <p className="page-sub">Calculated separately for each achievement. A new achievement starts the ranking fresh; old history stays stored.</p>

        <div className="sec-title" style={{ fontSize: 20 }}>Point rules</div>
        <div className="stack" style={{ gap: 10 }}>
          <div className="card" style={{ borderLeft: "3px solid var(--info)" }}>
            <div className="row" style={{ gap: 8, color: "var(--info)", marginBottom: 7 }}>
              <Icon name="eye" size={17} /><span className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", fontWeight: 700 }}>VERIFICATION</span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.45 }}>Points are awarded only after the favorite person views the proof and approves the submitted task.</p>
          </div>
          <div className="card" style={{ borderLeft: "3px solid var(--warn)" }}>
            <div className="row" style={{ gap: 8, color: "var(--warn)", marginBottom: 7 }}>
              <Icon name="clock" size={17} /><span className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", fontWeight: 700 }}>TIME SENSITIVITY</span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.45 }}>Earlier completion earns more points. Late completion gives reduced points based on your selected formula.</p>
          </div>
        </div>

        <div className="sec-title" style={{ fontSize: 20 }}>Select achievement</div>
        <div className="row" style={{ gap: 11, overflowX: "auto", paddingBottom: 4, margin: "0 -20px", padding: "2px 20px 6px" }}>
          {ranked.map((x) => {
            const on = x.id === sel;
            return (
              <button key={x.id} onClick={() => setSel(x.id)} style={{
                minWidth: 168, textAlign: "left", cursor: "pointer", flex: "none",
                background: "var(--surface)", borderRadius: 18, padding: 16,
                border: "2px solid " + (on ? "var(--accent)" : "var(--border-soft)"),
                transition: "border-color .2s ease",
              }}>
                <div className="row between">
                  <span className="display" style={{ fontSize: 18 }}>{x.title}</span>
                  {on && <Icon name="check" size={16} stroke={2.4} color="var(--accent)" />}
                </div>
                <div className="bar" style={{ margin: "12px 0 8px" }}><i style={{ width: x.progress + "%", background: x.status === "Completed" ? "var(--text)" : "var(--accent)" }} /></div>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.06em", color: "var(--text-mute)", textTransform: "uppercase" }}>{x.status} · {x.progress}%</div>
              </button>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: 14, background: "var(--ink)", border: "1px solid var(--border-soft)" }}>
          <p className="eyebrow">Current ranking for</p>
          <div className="display" style={{ fontSize: 30, color: "var(--on-ink)", margin: "8px 0 16px" }}>{a.title}</div>
          <div className="row between">
            {[["Status", a.status], ["Progress", a.progress + "%"], ["Deadline", a.deadline.split(",")[0]]].map(([k, v]) => (
              <div key={k}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--text-mute)", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--on-ink)", marginTop: 5 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="row between" style={{ alignItems: "flex-end", margin: "26px 0 12px" }}>
          <span className="display" style={{ fontSize: 24 }}>Leaderboard</span>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{board.length} PARTICIPANTS</span>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          {board.map((p, i) => (
            <div key={p.name} className="card" style={{
              display: "flex", alignItems: "center", gap: 13, padding: 15,
              background: i === 0 ? "var(--accent-soft)" : "var(--surface)",
              border: "1px solid " + (i === 0 ? "transparent" : "var(--border-soft)"),
            }}>
              <span className="display" style={{ fontSize: 22, width: 22, color: i === 0 ? "var(--accent)" : "var(--text-mute)" }}>{i + 1}</span>
              <div className="avatar round" style={{ background: `oklch(0.7 0.13 ${p.hue} / 0.2)`, color: `oklch(0.84 0.14 ${p.hue})` }}>{p.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                <div style={{ color: "var(--text-mute)", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
                <div style={{ color: "var(--info)", fontSize: 11, fontWeight: 700, marginTop: 3 }}>{p.tasks} approved task{p.tasks > 1 ? "s" : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="display" style={{ fontSize: 26, color: i === 0 ? "var(--accent)" : "var(--text)" }}>{p.points}</div>
                <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "var(--text-mute)" }}>POINTS</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ CONNECT ============================ */
function ConnectScreen({ onLogout, toast }) {
  const [code, setCode] = useState("");
  return (
    <div className="viewport">
      <div className="page">
        <TopBar brand="FAVKID NETWORK" onLogout={onLogout} />
        <h1 className="page-title">Connect</h1>
        <p className="page-sub">Connect users with favorite people using a unique FavKid code.</p>

        <div className="card" style={{ marginTop: 16, background: "var(--accent-soft)", border: "1px solid transparent" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase" }}>Logged in as</div>
          <div className="display" style={{ fontSize: 28, margin: "5px 0 3px" }}>{RC_USER.name}</div>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em" }}>USER</span>
          <div className="row between" style={{ marginTop: 14, background: "var(--ink)", borderRadius: 14, padding: "12px 14px" }}>
            <div>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "var(--text-mute)" }}>YOUR CODE</div>
              <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--on-ink)", marginTop: 3 }}>{RC_USER.code}</div>
            </div>
            <button className="btn-sm" onClick={() => toast("Code copied")} style={{ background: "var(--accent)", color: "var(--accent-ink)", border: 0, borderRadius: 11, fontWeight: 700, fontFamily: "var(--font-body)", cursor: "pointer", padding: "9px 14px" }}>Copy</button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 9, marginBottom: 4 }}>
            <Icon name="handshake" size={19} stroke={2} /><span style={{ fontWeight: 800, fontSize: 15.5, fontFamily: "var(--font-display)" }}>Connect using FavKid code</span>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <input className="input mono" placeholder="Example: FK-8A91BC22" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ letterSpacing: "0.06em" }} />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { setCode(""); toast("Connection request sent"); }}>
            Find favorite person <Icon name="arrowR" size={17} stroke={2.2} />
          </button>
        </div>

        <div className="sec-title" style={{ fontSize: 20 }}>Incoming requests</div>
        <div className="card" style={{ textAlign: "center", padding: "26px 18px", borderStyle: "dashed" }}>
          <Icon name="bell" size={22} color="var(--text-mute)" />
          <p style={{ color: "var(--text-mute)", fontSize: 13.5, margin: "8px 0 0" }}>No pending incoming requests.</p>
        </div>

        <div className="sec-title" style={{ fontSize: 20 }}>Your requests</div>
        <div className="stack" style={{ gap: 10 }}>
          {RC_FAV.map((p) => (
            <div key={p.name} className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: 15 }}>
              <div className="avatar round" style={{ background: `oklch(0.7 0.13 ${p.hue} / 0.2)`, color: `oklch(0.84 0.14 ${p.hue})` }}>{p.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                <div style={{ color: "var(--text-mute)", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
              </div>
              <span className="pill pill-active"><span className="dot" />{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ INSIGHTS SHEET ============================ */
function InsightsSheet({ open, onClose }) {
  const ins = RC_INS;
  return (
    <>
      <div className={"sheet-scrim" + (open ? " show" : "")} onClick={onClose} />
      <div className={"sheet" + (open ? " show" : "")}>
        <div className="sheet-grip" />
        <p className="eyebrow">Analytics</p>
        <h2 className="display" style={{ fontSize: 28, marginTop: 6 }}>Your insights</h2>

        <div className="card" style={{ marginTop: 16, background: "var(--ink)", border: "1px solid var(--border-soft)" }}>
          <div className="row between">
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "var(--text-mute)", textTransform: "uppercase" }}>Momentum · 14 days</span>
            <span className="pill" style={{ background: "var(--positive-soft)", color: "var(--positive)" }}><Icon name="arrowUp" size={12} stroke={2.4} /> +{RC_USER.momentumDelta}</span>
          </div>
          <div style={{ marginTop: 12 }}><Sparkline data={ins.momentumTrend} /></div>
        </div>

        <div className="row" style={{ gap: 10, marginTop: 12 }}>
          {[["Approval rate", ins.approvalRate + "%", "check"], ["On-time", ins.onTime + "%", "clock"], ["Per week", ins.avgPerWeek, "trend"]].map(([k, v, ic]) => (
            <div key={k} className="card" style={{ flex: 1, padding: 14 }}>
              <Icon name={ic} size={17} color="var(--accent)" />
              <div className="display" style={{ fontSize: 24, marginTop: 8 }}>{v}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2, fontWeight: 600 }}>{k}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>By category</span>
          <div className="stack" style={{ gap: 12, marginTop: 14 }}>
            {ins.categories.map((c) => (
              <div key={c.name}>
                <div className="row between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-mute)" }}>{c.pct}%</span>
                </div>
                <div className="bar"><i style={{ width: c.pct + "%", background: `oklch(0.82 0.14 ${c.hue})` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={onClose}>Close</button>
      </div>
    </>
  );
}

Object.assign(window, { RankScreen, ConnectScreen, InsightsSheet });
