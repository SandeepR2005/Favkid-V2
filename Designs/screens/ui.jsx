/* ui.jsx — Favkid shared primitives (icons, status bar, tab bar, avatar) */

const I = {
  home:'M3 10.6 12 3l9 7.6M5.5 9.2V20a1 1 0 0 0 1 1H9.5v-5.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21H17.5a1 1 0 0 0 1-1V9.2',
  target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  focus:'M12 3v3M12 18v3M3 12h3M18 12h3M12 9.2A2.8 2.8 0 1 0 12 14.8 2.8 2.8 0 0 0 12 9.2ZM18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6',
  trophy:'M7 4h10v3a5 5 0 0 1-10 0V4ZM7 5H4.5v1.5A2.5 2.5 0 0 0 7 9M17 5h2.5v1.5A2.5 2.5 0 0 1 17 9M9.5 12.5 9 16h6l-.5-3.5M8 20h8M10 16v4M14 16v4',
  link:'M9.5 14.5l5-5M8 11 6.5 12.5a3.2 3.2 0 0 0 4.5 4.5L12.5 15.5M16 13l1.5-1.5a3.2 3.2 0 0 0-4.5-4.5L11.5 8.5',
  plus:'M12 5v14M5 12h14',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.4-2.1a8 8 0 0 0 0-1.8l1.8-1.4-1.8-3.1-2.1.9a7.8 7.8 0 0 0-1.6-.9L16.2 3h-3.6l-.3 2.3a7.8 7.8 0 0 0-1.6.9l-2.1-.9L6.8 8.4 8.6 9.8a8 8 0 0 0 0 1.8l-1.8 1.4 1.8 3.1 2.1-.9a7.8 7.8 0 0 0 1.6.9l.3 2.3h3.6l.3-2.3a7.8 7.8 0 0 0 1.6-.9l2.1.9 1.8-3.1-1.8-1.4Z',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2',
  check:'M5 12.5 10 17.5 19 7',
  checkCirc:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 12l2.3 2.3L15.5 9.5',
  chevR:'M9 5l7 7-7 7',
  chevD:'M5 9l7 7 7-7',
  chevL:'M15 5l-7 7 7 7',
  copy:'M9 9V5.5A1.5 1.5 0 0 1 10.5 4h8A1.5 1.5 0 0 1 20 5.5v8a1.5 1.5 0 0 1-1.5 1.5H15M14 9.5v9A1.5 1.5 0 0 1 12.5 20h-8A1.5 1.5 0 0 1 3 18.5v-9A1.5 1.5 0 0 1 4.5 8h8A1.5 1.5 0 0 1 14 9.5Z',
  share:'M16 8a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 16 8ZM8 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM16 21.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM10.3 10.8l3.4-2M10.3 13.2l3.4 2',
  lock:'M7 11V8a5 5 0 0 1 10 0v3M6.5 11h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1ZM12 14.5v3',
  bell:'M18 9a6 6 0 0 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9ZM10 21a2.2 2.2 0 0 0 4 0',
  calendar:'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM8 3.5v4M16 3.5v4M4 11h16',
  flag:'M6 21V4M6 5h11l-2 3.5L17 12H6',
  users:'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.8M16.5 3.7a4 4 0 0 1 0 7.6',
  shield:'M12 3l7 2.5v5.5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V5.5L12 3ZM9 12l2 2 4-4',
  rotate:'M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4',
  image:'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM8.5 11a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM5 17l4.5-4.5L13 16l3-3 4 4',
  fileText:'M14 3v5h5M7 3h8l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9.5 13h5M9.5 16.5h5',
  textT:'M5 6.5V5h14v1.5M12 5v14M9 19h6',
  sparkle:'M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3ZM18.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z',
  arrowR:'M5 12h14M13 6l6 6-6 6',
  arrowUp:'M12 19V5M6 11l6-6 6 6',
  camera:'M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  qr:'M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h2v2h-2v-2ZM18 14h2v2h-2v-2ZM14 18h2v2h-2v-2ZM18 18h2v2h-2v-2Z',
  dots:'M5 12h.01M12 12h.01M19 12h.01',
  hourglass:'M7 3h10M7 21h10M7 3c0 4 3 5.5 5 7 2-1.5 5-3 5-7M7 21c0-4 3-5.5 5-7 2 1.5 5 3 5 7',
  x:'M6 6l12 12M18 6 6 18',
  trending:'M3 16l5-5 3.5 3.5L20 7M15 7h5v5',
  zap:'M13 3 5 13h6l-1 8 8-10h-6l1-8Z',
};

function Icon({name, size=22, sw=1.8, fill=false, style}){
  const d = I[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill?'currentColor':'none'}
      stroke={fill?'none':'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      {d.split('M').filter(Boolean).map((seg,i)=><path key={i} d={'M'+seg} />)}
    </svg>
  );
}

/* ── status bar ───────────────────────────────────────────── */
function StatusBar({time='9:41', dark=false}){
  const c = dark ? '#fff' : 'var(--ink)';
  return (
    <div className="fk-status" style={{color:c}}>
      <span>{time}</span>
      <span className="fk-status-r">
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill={c}><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M1.5 4.2a10 10 0 0 1 14 0M4 6.8a6.4 6.4 0 0 1 9 0M6.6 9.3a2.8 2.8 0 0 1 3.8 0"/><circle cx="8.5" cy="11" r=".6" fill={c} stroke="none"/></svg>
        {/* battery */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke={c} strokeOpacity="0.4"/><rect x="2.5" y="2.5" width="15" height="8" rx="2" fill={c}/><path d="M24.5 4.5v4a2 2 0 0 0 0-4Z" fill={c} fillOpacity="0.5"/></svg>
      </span>
    </div>
  );
}

/* ── tab bar ──────────────────────────────────────────────── */
function TabBar({active='home', role='user'}){
  const center = role==='fav'
    ? {key:'assign', icon:'fileText', label:'Assign'}
    : {key:'focus',  icon:'focus',    label:'Focus'};
  const tabs = [
    {key:'home',   icon:'home',   label:'Home'},
    {key:'track',  icon:'target', label:'Track'},
    center,
    {key:'rank',   icon:'trophy', label:'Rank'},
    {key:'connect',icon:'link',   label:'Connect'},
  ];
  return (
    <div className="fk-tabs">
      {tabs.map(t=>(
        <div key={t.key} className={'fk-tab'+(active===t.key?' is-on':'')}>
          <Icon name={t.icon} size={23} sw={active===t.key?2:1.8}/>
          <span>{t.label}</span>
        </div>
      ))}
      <div className="fk-home-ind"></div>
    </div>
  );
}

/* ── avatar ───────────────────────────────────────────────── */
function Avatar({label, tone='a', size=44, circle=false, radius}){
  const r = radius!=null ? radius : (circle?size/2:13);
  return (
    <div className={'fk-av fk-av-'+tone} style={{width:size, height:size, borderRadius:r, fontSize:size*0.4}}>
      {label}
    </div>
  );
}

/* brand lockup */
function Brand({sub}){
  return (
    <div className="fk-appbar">
      <div className="fk-brand">
        <img className="fk-brand-mark" src="assets/favkid-mark.png" alt="Favkid"/>
        <div className="fk-col" style={{lineHeight:1.1}}>
          <span className="fk-brand-name">Favkid</span>
          {sub && <span style={{fontSize:11,fontWeight:600,color:'var(--ink-3)',letterSpacing:'0.04em'}}>{sub}</span>}
        </div>
      </div>
      <div className="fk-avatar-btn"><Icon name="settings" size={19}/></div>
    </div>
  );
}

Object.assign(window, { Icon, StatusBar, TabBar, Avatar, Brand });
