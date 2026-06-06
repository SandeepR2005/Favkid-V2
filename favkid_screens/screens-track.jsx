/* FavKid — Track list + Achievement detail */
const { ACHIEVEMENTS: TR_ACH } = window.FK;

const CAT_HUE = { Skill: 128, Career: 256, Study: 78, Fitness: 22, Personal: 300 };
const PRIO_COLOR = { High: "var(--danger)", Medium: "var(--info)", Low: "var(--text-mute)" };

function StatusPill({ status }) {
  const active = status === "Active";
  return (
    <span className={"pill " + (active ? "pill-active" : "pill-done")}>
      <span className="dot" />{status}
    </span>
  );
}

/* ---------- Achievement card ---------- */
function AchCard({ a, onOpen }) {
  const hue = CAT_HUE[a.category] ?? 128;
  const approved = a.subtasks.filter((s) => s.status === "Approved").length;
  return (
    <button className="card" onClick={() => onOpen(a.id)} style={{ width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 12, display: "block" }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div className="row" style={{ gap: 12 }}>
          <div className="avatar" style={{ background: `oklch(0.7 0.13 ${hue} / 0.18)`, color: `oklch(0.82 0.14 ${hue})` }}>
            {a.title[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>{a.title}</div>
            <div style={{ color: "var(--text-mute)", fontSize: 12.5, marginTop: 2, fontWeight: 600 }}>{a.owner} · {a.category}</div>
          </div>
        </div>
        <StatusPill status={a.status} />
      </div>

      <p style={{ color: "var(--text-dim)", fontSize: 13.5, margin: "12px 0 12px" }}>{a.desc}</p>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="pill" style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}>
          <span className="dot" style={{ background: PRIO_COLOR[a.priority] }} />{a.priority}
        </span>
        <span className="pill" style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}>
          <Icon name="cal" size={13} />{a.deadline}
        </span>
      </div>

      <div className="row between" style={{ marginTop: 14, marginBottom: 7 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-mute)" }}>{approved}/{a.subtasks.length} subtasks</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: a.progress === 100 ? "var(--text)" : "var(--accent)" }}>{a.progress}%</span>
      </div>
      <Bar value={a.progress} done={a.progress === 100} />
    </button>
  );
}

/* ---------- Track screen ---------- */
function TrackScreen({ onOpen, onLogout }) {
  const [filter, setFilter] = useState("All");
  const total = TR_ACH.length;
  const active = TR_ACH.filter((a) => a.status === "Active").length;
  const done = TR_ACH.filter((a) => a.status === "Completed").length;
  const list = TR_ACH.filter((a) => filter === "All" ? true : a.status === filter);

  return (
    <div className="viewport">
      <div className="page">
        <TopBar brand="FAVKID" onLogout={onLogout} />
        <p className="eyebrow">Your progress</p>
        <h1 className="page-title">Achievements</h1>
        <p className="page-sub">Goals you created and achievements shared by connected users.</p>

        <div className="stat-row" style={{ marginTop: 18 }}>
          <div className="stat hl"><div className="num">{total}</div><div className="lbl">Total</div></div>
          <div className="stat"><div className="num">{active}</div><div className="lbl">Active</div></div>
          <div className="stat"><div className="num">{done}</div><div className="lbl">Completed</div></div>
        </div>

        <div className="row" style={{ gap: 8, marginTop: 18, marginBottom: 16, background: "var(--surface-2)", padding: 5, borderRadius: 14, border: "1px solid var(--border-soft)" }}>
          {["All", "Active", "Completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, border: 0, cursor: "pointer", padding: "10px 0", borderRadius: 10,
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5,
              background: filter === f ? "var(--accent)" : "transparent",
              color: filter === f ? "var(--accent-ink)" : "var(--text-dim)",
              transition: "all .2s ease",
            }}>{f}</button>
          ))}
        </div>

        {list.map((a) => <AchCard key={a.id} a={a} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

/* ---------- Proof sheet ---------- */
function ProofSheet({ open, onClose, achievement, subtask, onSubmit }) {
  const proofIcon = { Image: "image", Link: "link", Text: "text", File: "file" }[achievement?.proof] || "image";
  return (
    <>
      <div className={"sheet-scrim" + (open ? " show" : "")} onClick={onClose} />
      <div className={"sheet" + (open ? " show" : "")}>
        <div className="sheet-grip" />
        <p className="eyebrow">Submit proof</p>
        <h2 className="display" style={{ fontSize: 26, marginTop: 6 }}>{subtask?.title}</h2>
        <p className="page-sub" style={{ marginTop: 8 }}>Your favorite person reviews this before points are awarded.</p>

        <div style={{ marginTop: 18, border: "1.5px dashed var(--border)", borderRadius: 18, padding: "30px 18px", textAlign: "center", background: "var(--surface-2)" }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--accent-soft)", display: "grid", placeItems: "center", margin: "0 auto 12px", color: "var(--accent)" }}>
            <Icon name={proofIcon} size={26} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Add {achievement?.proof?.toLowerCase()} proof</div>
          <div style={{ color: "var(--text-mute)", fontSize: 12.5, marginTop: 4 }}>Tap to upload or drag a file here</div>
        </div>

        <div className="field">
          <label>Note for reviewer (optional)</label>
          <textarea className="textarea" placeholder="Anything they should know about your submission…" />
        </div>

        <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={onSubmit}>
          Submit for review <Icon name="check" size={18} stroke={2.4} />
        </button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>Cancel</button>
      </div>
    </>
  );
}

/* ---------- Detail screen ---------- */
function DetailScreen({ a, back, onLogout, toast }) {
  const [sheet, setSheet] = useState(null);
  const approved = a.subtasks.filter((s) => s.status === "Approved").length;
  const hue = CAT_HUE[a.category] ?? 128;

  const SUB_STATE = {
    Approved: { icon: "check", c: "var(--positive)", bg: "var(--positive-soft)", label: "Approved" },
    Pending: { icon: "clock", c: "var(--warn)", bg: "var(--warn-soft)", label: "In review" },
    Locked: { icon: "lock", c: "var(--text-mute)", bg: "var(--surface-3)", label: "Locked" },
  };

  return (
    <>
    <div className="viewport">
      <div className="page">
        <div className="row between" style={{ marginTop: 4, marginBottom: 16 }}>
          <button className="chip" onClick={back} style={{ paddingLeft: 11 }}>
            <Icon name="chevL" size={16} stroke={2.2} /> Achievements
          </button>
          <div className="row" style={{ gap: 8 }}>
            <button className="chip" style={{ color: "var(--danger)", borderColor: "var(--danger-soft)", padding: 9 }}><Icon name="trash" size={16} /></button>
            <button className="btn-danger-sm" onClick={onLogout}>Logout</button>
          </div>
        </div>

        <div className="card">
          <StatusPill status={a.status} />
          <h1 className="display" style={{ fontSize: 38, margin: "12px 0 14px" }}>{a.title}</h1>
          <div className="row" style={{ gap: 12 }}>
            <div className="avatar ink">S</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>You</div>
              <div className="row" style={{ gap: 5, color: "var(--text-mute)", fontSize: 12.5 }}>
                <Icon name="eye" size={13} /> Visible to accepted favorite people
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            {[
              ["Category", a.category], ["Priority", a.priority],
              ["Deadline", a.deadline], ["Subtasks", `${approved} of ${a.subtasks.length}`],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--surface-2)", borderRadius: 14, padding: "13px 14px" }}>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "var(--text-mute)", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 5 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, background: "var(--ink)", borderRadius: 18, padding: 18, display: "flex", alignItems: "center", gap: 18 }}>
            <Ring value={a.progress} size={84} stroke={9} color={a.progress === 100 ? "var(--positive)" : "var(--accent)"}>
              <span className="display" style={{ fontSize: 20, color: "var(--on-ink)" }}>{a.progress}%</span>
            </Ring>
            <div>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "var(--text-mute)", textTransform: "uppercase" }}>Overall progress</div>
              <div className="display" style={{ fontSize: 22, color: "var(--on-ink)", marginTop: 4 }}>
                {a.progress === 100 ? "Goal complete" : "In motion"}
              </div>
              <div style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 3 }}>{approved} of {a.subtasks.length} subtasks approved</div>
            </div>
          </div>
        </div>

        <div className="sec-title">Subtasks</div>
        <div className="stack" style={{ gap: 10 }}>
          {a.subtasks.map((s, i) => {
            const st = SUB_STATE[s.status] || SUB_STATE.Locked;
            const canSubmit = s.status === "Pending";
            return (
              <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: 15 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: st.bg, color: st.c, display: "grid", placeItems: "center", flex: "none" }}>
                  <Icon name={st.icon} size={19} stroke={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{s.title}</div>
                  <div style={{ color: "var(--text-mute)", fontSize: 12, marginTop: 2 }}>{st.label} · {s.date}</div>
                </div>
                {canSubmit && (
                  <button className="btn btn-primary btn-sm" onClick={() => setSheet(s)} style={{ flex: "none" }}>Proof</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>

      <ProofSheet open={!!sheet} subtask={sheet} achievement={a} onClose={() => setSheet(null)}
        onSubmit={() => { setSheet(null); toast("Proof submitted for review"); }} />
    </>
  );
}

window.TrackScreen = TrackScreen;
window.DetailScreen = DetailScreen;
