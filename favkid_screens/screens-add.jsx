/* FavKid — Create Achievement */
const { CATEGORIES: ADD_CATS } = window.FK;

function MiniField({ label, value, icon }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", flex: 1 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--text-mute)", textTransform: "uppercase" }}>{label}</div>
      <div className="row" style={{ gap: 7, marginTop: 5 }}>
        {icon && <Icon name={icon} size={14} stroke={2} />}
        <span style={{ fontWeight: 700, fontSize: 14 }}>{value}</span>
      </div>
    </div>
  );
}

function AddScreen({ onCreate, onLogout }) {
  const [cat, setCat] = useState("Study");
  const [prio, setPrio] = useState("Medium");
  const [proof, setProof] = useState("Image");
  const [subs, setSubs] = useState([{ id: 1 }]);
  const proofs = [["Text", "text"], ["Image", "image"], ["File", "file"], ["Link", "link"]];

  return (
    <div className="viewport">
      <div className="page">
        <TopBar brand="FAVKID" onLogout={onLogout} />
        <p className="eyebrow">Create new</p>
        <h1 className="page-title">Achievement</h1>
        <p className="page-sub">Plan your goal, set a final deadline, and break it into clear subtasks.</p>

        {/* Details */}
        <div className="card" style={{ marginTop: 18 }}>
          <div className="row" style={{ gap: 9, marginBottom: 4 }}>
            <Icon name="target" size={18} stroke={2} /><span style={{ fontWeight: 800, fontSize: 15.5, fontFamily: "var(--font-display)" }}>Achievement details</span>
          </div>
          <div className="field"><label>Achievement title</label>
            <input className="input" placeholder="Example: Complete DSA revision" /></div>
          <div className="field"><label>Description</label>
            <textarea className="textarea" placeholder="Describe what you want to achieve" /></div>
          <div className="field"><label>Category</label>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {ADD_CATS.map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          </div>
          <div className="field"><label>Priority</label>
            <div className="row" style={{ gap: 8 }}>
              {["Low", "Medium", "High"].map((p) => <button key={p} className={"chip" + (prio === p ? " on" : "")} onClick={() => setPrio(p)} style={{ flex: 1, justifyContent: "center" }}>{p}</button>)}
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 9 }}>
            <Icon name="cal" size={18} stroke={2} /><span style={{ fontWeight: 800, fontSize: 15.5, fontFamily: "var(--font-display)" }}>Overall deadline</span>
          </div>
          <p style={{ color: "var(--text-mute)", fontSize: 12.5, margin: "6px 0 14px" }}>The final deadline for the complete achievement.</p>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              <MiniField label="Deadline date" value="18-Jul-2026" icon="cal" />
              <MiniField label="Deadline time" value="10:45 pm" icon="clock" />
            </div>
            <div className="row" style={{ gap: 10 }}>
              <MiniField label="Reminder date" value="15-Jul-2026" icon="bell" />
              <MiniField label="Reminder time" value="9:00 am" icon="clock" />
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 9, marginBottom: 14 }}>
            <Icon name="check" size={18} stroke={2.2} /><span style={{ fontWeight: 800, fontSize: 15.5, fontFamily: "var(--font-display)" }}>Verification</span>
          </div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Proof type required</label>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {proofs.map(([p, ic]) => (
              <button key={p} className={"chip" + (proof === p ? " on" : "")} onClick={() => setProof(p)}>
                <Icon name={ic} size={14} stroke={2} />{p}
              </button>
            ))}
          </div>
          <div className="field"><label>Success criteria</label>
            <textarea className="textarea" placeholder="Example: Submit screenshot of solved problems" /></div>
        </div>

        {/* Subtasks */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row between">
            <div className="row" style={{ gap: 9 }}>
              <Icon name="grid" size={17} stroke={2} /><span style={{ fontWeight: 800, fontSize: 15.5, fontFamily: "var(--font-display)" }}>Subtasks</span>
            </div>
            <button className="chip on" onClick={() => setSubs([...subs, { id: Date.now() }])} style={{ padding: "8px 12px" }}>
              <Icon name="plus" size={14} stroke={2.4} /> Add
            </button>
          </div>
          <p style={{ color: "var(--text-mute)", fontSize: 12.5, margin: "7px 0 14px" }}>Each subtask should have its own deadline.</p>

          <div className="stack" style={{ gap: 12 }}>
            {subs.map((s, i) => (
              <div key={s.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 15 }}>
                <div className="row between" style={{ marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--accent)", fontWeight: 700 }}>SUBTASK {i + 1}</span>
                  {subs.length > 1 && (
                    <button onClick={() => setSubs(subs.filter((x) => x.id !== s.id))} style={{ background: "none", border: 0, color: "var(--danger)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="trash" size={14} /> Remove
                    </button>
                  )}
                </div>
                <input className="input" placeholder="Example: Complete arrays problems" />
                <div className="row" style={{ gap: 10, marginTop: 10 }}>
                  <MiniField label="Date" value="04-Jun-2026" icon="cal" />
                  <MiniField label="Time" value="9:57 pm" icon="clock" />
                </div>
                <div style={{ marginTop: 10 }}>
                  <input className="input" placeholder="Estimated minutes — e.g. 60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 18, padding: "17px" }} onClick={onCreate}>
          <Icon name="spark" size={18} stroke={2} /> Create achievement
        </button>
      </div>
    </div>
  );
}

window.AddScreen = AddScreen;
