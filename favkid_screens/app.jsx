/* FavKid — app shell, navigation, theme, tweaks */
const { ACHIEVEMENTS: APP_ACH } = window.FK;

const ACCENT_SETS = {
  "oklch(0.88 0.19 128)": { press: "oklch(0.81 0.18 128)", ink: "oklch(0.26 0.07 140)" }, // lime
  "oklch(0.82 0.15 182)": { press: "oklch(0.75 0.14 182)", ink: "oklch(0.24 0.05 200)" }, // aqua
  "oklch(0.66 0.2 285)":  { press: "oklch(0.59 0.19 285)", ink: "oklch(0.98 0 0)" },       // violet
  "oklch(0.78 0.17 50)":  { press: "oklch(0.71 0.16 50)",  ink: "oklch(0.26 0.07 60)" },   // amber
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "oklch(0.88 0.19 128)",
  "displayFont": "Bricolage Grotesque"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState("home");
  const [detailId, setDetailId] = useState(null);
  const [insights, setInsights] = useState(false);
  const [toastNode, toast] = useToast();

  useEffect(() => {
    const r = document.documentElement;
    const set = ACCENT_SETS[t.accent] || ACCENT_SETS["oklch(0.88 0.19 128)"];
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--accent-press", set.press);
    r.style.setProperty("--accent-soft", t.accent.replace(")", " / 0.15)"));
    r.style.setProperty("--accent-ink", set.ink);
    r.style.setProperty("--font-display", `"${t.displayFont}", "Plus Jakarta Sans", sans-serif`);
  }, [t.accent, t.displayFont]);

  const toggleTheme = () => setTweak("theme", t.theme === "dark" ? "light" : "dark");
  const go = (s) => { setDetailId(null); setScreen(s); };
  const openDetail = (id) => setDetailId(id);
  const detail = APP_ACH.find((a) => a.id === detailId);
  const logout = () => { setLoggedIn(false); setScreen("home"); setDetailId(null); };

  function body() {
    if (detail) return <DetailScreen a={detail} back={() => setDetailId(null)} onLogout={logout} toast={toast} />;
    switch (screen) {
      case "home": return <HomeScreen go={go} onLogout={logout} openInsights={() => setInsights(true)} />;
      case "track": return <TrackScreen onOpen={openDetail} onLogout={logout} />;
      case "add": return <AddScreen onCreate={() => { go("track"); toast("Achievement created"); }} onLogout={logout} />;
      case "matrix": return <MatrixScreen onLogout={logout} toast={toast} />;
      case "rank": return <RankScreen onLogout={logout} />;
      case "connect": return <ConnectScreen onLogout={logout} toast={toast} />;
      default: return null;
    }
  }

  return (
    <div className="stage">
      <div className="device">
        <div className="island" />
        <div className="screen" data-theme={t.theme}>
          <StatusBar />
          {loggedIn ? (
            <>
              {body()}
              <BottomNav current={detail ? "track" : screen} go={go} />
              <InsightsSheet open={insights} onClose={() => setInsights(false)} />
              {toastNode}
            </>
          ) : (
            <LoginScreen onLogin={() => { setLoggedIn(true); setScreen("home"); }} theme={t.theme} toggleTheme={toggleTheme} />
          )}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={t.theme} options={["dark", "light"]} onChange={(v) => setTweak("theme", v)} />
        <TweakColor label="Accent" value={t.accent}
          options={Object.keys(ACCENT_SETS)}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Typography" />
        <TweakSelect label="Display font" value={t.displayFont}
          options={["Bricolage Grotesque", "Space Grotesk", "Instrument Serif"]}
          onChange={(v) => setTweak("displayFont", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
