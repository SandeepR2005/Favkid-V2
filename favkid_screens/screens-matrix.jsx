/* FavKid — Matrix (slot-machine random selection) */
const { MATRIX: MX } = window.FK;

function MatrixScreen({ onLogout, toast }) {
  const [active, setActive] = useState(-1);
  const [winner, setWinner] = useState(-1);
  const [spinning, setSpinning] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [iter, setIter] = useState(MX.iteration);
  const timer = useRef(null);

  const grid = MX.grid;
  const favIdx = grid.map((c, i) => (c.kind === "fav" ? i : -1)).filter((i) => i >= 0);

  useEffect(() => () => clearTimeout(timer.current), []);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(-1);
    setReveal(null);
    const target = favIdx[Math.floor(Math.random() * favIdx.length)];
    const steps = 9 * 3 + ((target - 0 + 9) % 9);
    const path = [];
    for (let k = 0; k <= steps; k++) path.push(k % 9);
    let k = 0;
    const tick = () => {
      setActive(path[k]);
      if (k === path.length - 1) {
        setWinner(target);
        timer.current = setTimeout(() => {
          setSpinning(false);
          setReveal(grid[target]);
        }, 480);
        return;
      }
      const prog = k / (path.length - 1);
      const delay = 48 + Math.pow(prog, 2.7) * 360;
      k++;
      timer.current = setTimeout(tick, delay);
    };
    tick();
  }

  function confirm() {
    setReveal(null);
    setIter((n) => n + 1);
    setWinner(-1);
    setActive(-1);
    toast(`Iteration ${iter + 1} started`);
  }

  return (
    <>
    <div className="viewport">
      <div className="page">
        <TopBar brand="FAVKID" onLogout={onLogout} right={
          <div className="row" style={{ gap: 8 }}>
            <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Icon name="dice" size={13} /> Matrix</span>
            <button className="btn-danger-sm" onClick={onLogout}>Logout</button>
          </div>
        } />

        <p className="eyebrow">Locked selection</p>
        <h1 className="page-title">The Matrix</h1>
        <p className="page-sub">Spin to randomly pick a section. The favorite person behind it assigns your next subtask.</p>

        {/* current achievement */}
        <div className="card" style={{ marginTop: 16, background: "var(--ink)", border: "1px solid var(--border-soft)" }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase" }}>Current achievement</div>
          <div className="row between" style={{ marginTop: 8 }}>
            <div>
              <div className="display" style={{ fontSize: 26, color: "var(--on-ink)" }}>{MX.achievement}</div>
              <div style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 2 }}>{MX.achievementSub}</div>
            </div>
            <Icon name="cal" size={20} stroke={1.8} color="var(--text-mute)" />
          </div>
        </div>

        <div className="stat-row" style={{ marginTop: 12 }}>
          <div className="stat hl"><div className="num">{iter}</div><div className="lbl">Iteration</div></div>
          <div className="stat"><div className="num">{MX.connected}</div><div className="lbl">Connected</div></div>
          <div className="stat"><div className="num">{MX.remaining}</div><div className="lbl">Remaining</div></div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="row between" style={{ marginBottom: 11 }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>Cycle progress</span>
            <span className="mono" style={{ fontWeight: 700, color: "var(--accent)" }}>{MX.cycle}%</span>
          </div>
          <Bar value={MX.cycle} />
        </div>

        <button className="btn btn-primary" style={{ marginTop: 14, padding: "17px", letterSpacing: "0.02em" }} onClick={spin} disabled={spinning}>
          {spinning ? <><Icon name="dice" size={19} /> Spinning…</> : <><Icon name="dice" size={19} /> Spin the matrix</>}
        </button>

        {/* grid */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row between" style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>Closed grid</span>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--text-mute)" }}>9 sections</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {grid.map((c, i) => {
              const isActive = active === i;
              const isWinner = winner === i;
              const isFav = c.kind === "fav";
              return (
                <div key={i} style={{
                  aspectRatio: "1",
                  borderRadius: 16,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  background: isWinner ? "var(--accent)" : isFav ? "var(--ink)" : "var(--surface-2)",
                  border: "2px solid " + (isActive ? "var(--accent)" : "transparent"),
                  boxShadow: isWinner ? "0 0 0 4px var(--accent-soft), 0 14px 30px -10px var(--accent)" : isActive ? "0 0 22px -4px var(--accent)" : "none",
                  transform: isActive || isWinner ? "scale(1.04)" : "scale(1)",
                  transition: "transform .12s ease, box-shadow .12s ease, background .2s ease",
                }}>
                  {isFav ? (
                    <>
                      <span className="display" style={{ fontSize: 26, color: isWinner ? "var(--accent-ink)" : "var(--on-ink)" }}>{c.initial}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: isWinner ? "var(--accent-ink)" : "var(--text-dim)" }}>{c.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="display" style={{ fontSize: 24, color: isActive ? "var(--accent)" : "var(--text-mute)" }}>{c.n}</span>
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-mute)", letterSpacing: "0.06em" }}>CLOSED</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* history */}
        <div className="sec-title">Selection history</div>
        <div className="stack" style={{ gap: 10 }}>
          {MX.history.map((h, i) => (
            <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: 15 }}>
              <div className="avatar round" style={{ background: "var(--surface-3)", color: "var(--text-dim)", fontSize: 15 }}>{h.sec}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</div>
                <div style={{ color: "var(--text-mute)", fontSize: 12 }}>Section {h.sec} · {h.when}</div>
              </div>
              <Icon name="chevR" size={16} color="var(--text-mute)" />
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* reveal sheet */}
      <div className={"sheet-scrim" + (reveal ? " show" : "")} onClick={() => setReveal(null)} />
      <div className={"sheet" + (reveal ? " show" : "")} style={{ textAlign: "center" }}>
        <div className="sheet-grip" />
        {reveal && (
          <div className="fade-up">
            <p className="eyebrow">Selection locked</p>
            <div style={{
              width: 88, height: 88, borderRadius: 26, margin: "16px auto 14px",
              background: `oklch(0.7 0.13 ${reveal.hue} / 0.18)`, color: `oklch(0.84 0.14 ${reveal.hue})`,
              display: "grid", placeItems: "center",
            }}>
              <span className="display" style={{ fontSize: 42 }}>{reveal.initial}</span>
            </div>
            <h2 className="display" style={{ fontSize: 30 }}>{reveal.name}</h2>
            <p className="page-sub" style={{ margin: "8px auto 0", maxWidth: 280 }}>
              <strong style={{ color: "var(--text)" }}>{reveal.name}</strong> will assign your next subtask for <strong style={{ color: "var(--text)" }}>{MX.achievement}</strong>.
            </p>
            <div className="card" style={{ marginTop: 18, textAlign: "left", background: "var(--surface-2)", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", flex: "none" }}>
                <Icon name="bolt" size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>Awaiting assignment</div>
                <div style={{ color: "var(--text-mute)", fontSize: 12.5 }}>You'll get a notification when it's ready.</div>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={confirm}>
              Confirm &amp; start iteration <Icon name="arrowR" size={17} stroke={2.2} />
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => { setReveal(null); spin(); }}>Spin again</button>
          </div>
        )}
      </div>
    </>
  );
}

window.MatrixScreen = MatrixScreen;
