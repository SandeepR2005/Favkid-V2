/* Ranking.jsx */
function AchSelect({title, status, pct, on}){
  return (
    <div style={{flex:'0 0 auto', width:208, padding:'14px 16px', borderRadius:16,
      border:'1px solid '+(on?'var(--accent)':'var(--line-2)'), background:on?'var(--surface)':'var(--surface-2)',
      boxShadow:on?'0 0 0 3px var(--accent-soft)':'none'}}>
      <div className="fk-row" style={{justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:15,fontWeight:700,letterSpacing:'-0.02em',whiteSpace:'nowrap'}}>{title}</span>
        <Icon name={on?'clock':'checkCirc'} size={16} style={{color:on?'var(--accent)':'var(--ink-3)'}}/>
      </div>
      <div className="fk-prog" style={{margin:'12px 0 9px'}}><i style={{width:pct+'%',background:on?'var(--accent)':'var(--ink-4)'}}></i></div>
      <span style={{fontSize:11.5,fontWeight:600,color:'var(--ink-3)'}}>{status} · {pct}%</span>
    </div>
  );
}
function RuleCard({icon, label, body}){
  return (
    <div className="fk-card fk-card-pad" style={{padding:'15px 16px'}}>
      <div className="fk-row fk-gap-10" style={{alignItems:'center'}}>
        <div style={{width:32,height:32,borderRadius:10,background:'var(--accent-soft)',color:'var(--accent-ink)',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto'}}><Icon name={icon} size={17}/></div>
        <span className="fk-label" style={{color:'var(--ink)'}}>{label}</span>
      </div>
      <p style={{fontSize:13,color:'var(--ink-2)',margin:'11px 0 0',lineHeight:1.5}}>{body}</p>
    </div>
  );
}
function LbRow({rank, name, email, tasks, pts, tone, top}){
  return (
    <div className="fk-row fk-gap-12" style={{padding:'14px 16px', alignItems:'center', background:top?'var(--accent-soft)':'transparent'}}>
      <div style={{width:24,textAlign:'center',flex:'0 0 auto'}}>
        {top
          ? <Icon name="trophy" size={20} fill style={{color:'var(--accent)'}}/>
          : <span style={{fontSize:16,fontWeight:800,color:'var(--ink-3)'}}>{rank}</span>}
      </div>
      <Avatar label={name[0]} tone={tone} size={40} circle/>
      <div className="fk-col" style={{flex:1,minWidth:0}}>
        <span style={{fontSize:15,fontWeight:700,letterSpacing:'-0.01em'}}>{name}</span>
        <span style={{fontSize:11.5,color:'var(--ink-3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{email}</span>
        <span className="fk-row fk-gap-6" style={{alignItems:'center',marginTop:3,fontSize:11,fontWeight:600,color:'var(--accent)'}}><Icon name="check" size={12} sw={2.6}/>{tasks} approved</span>
      </div>
      <div className="fk-col" style={{alignItems:'flex-end',flex:'0 0 auto'}}>
        <span className="fk-tnum" style={{fontSize:22,fontWeight:800,letterSpacing:'-0.03em'}}>{pts}</span>
        <span className="fk-label" style={{fontSize:9}}>points</span>
      </div>
    </div>
  );
}
function ScreenRanking(){
  return (
    <div className="fk">
      <StatusBar/>
      <Brand sub="RANKING"/>
      <div className="fk-body fk-scroll">
        <h1 className="fk-h1">Ranking</h1>
        <p className="fk-sub">Scored fresh for each achievement. Past contribution history is always kept safe.</p>

        {/* achievement selector */}
        <div style={{marginTop:18}}>
          <span className="fk-label">Select achievement</span>
          <div className="fk-row fk-gap-10" style={{marginTop:11, overflowX:'hidden'}}>
            <AchSelect title="DSA Sprint" status="Active" pct={67} on={true}/>
            <AchSelect title="Run a 10K" status="Done" pct={100} on={false}/>
          </div>
        </div>

        {/* hero ranking card */}
        <div style={{marginTop:16, borderRadius:'var(--r-xl)', overflow:'hidden', background:'linear-gradient(160deg,#13261F,#0C1A15)', color:'#fff', padding:'20px', boxShadow:'var(--shadow-lg)'}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',color:'#7FD6B4'}}>CURRENT RANKING</span>
          <h2 style={{fontSize:23,fontWeight:800,letterSpacing:'-0.03em',margin:'5px 0 0'}}>DSA Revision Sprint</h2>
          <div className="fk-row" style={{marginTop:18, gap:0}}>
            {[['Your rank','#2'],['Points','20'],['Deadline','27 Jun']].map((c,i)=>(
              <div key={i} style={{flex:1, paddingLeft:i?16:0, borderLeft:i?'1px solid rgba(255,255,255,.12)':'none'}}>
                <div style={{fontSize:10.5,fontWeight:700,letterSpacing:'0.08em',color:'rgba(255,255,255,.55)'}}>{c[0].toUpperCase()}</div>
                <div className="fk-tnum" style={{fontSize:20,fontWeight:800,letterSpacing:'-0.02em',marginTop:5}}>{c[1]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* point rules */}
        <div style={{marginTop:22}}>
          <span className="fk-label">How points work</span>
          <div className="fk-row fk-gap-10" style={{marginTop:11, alignItems:'stretch'}}>
            <div style={{flex:1}}><RuleCard icon="shield" label="Verified" body="Awarded only after your favorite person reviews the proof and approves."/></div>
            <div style={{flex:1}}><RuleCard icon="trending" label="Timing" body="Finish early, earn more. Late submissions earn reduced points."/></div>
          </div>
        </div>

        {/* leaderboard */}
        <div style={{marginTop:24, marginBottom:18}}>
          <div className="fk-label-row">
            <span className="fk-label">Leaderboard</span>
            <span style={{fontSize:11.5,color:'var(--ink-3)',fontWeight:600}}>2 participants</span>
          </div>
          <div className="fk-card" style={{marginTop:11, overflow:'hidden'}}>
            <LbRow rank={1} name="Maya R." email="maya.r@gmail.com" tasks={1} pts={20} tone="b" top/>
            <hr className="fk-div"/>
            <LbRow rank={2} name="Sandy" email="sandyraina33@gmail.com" tasks={1} pts={18} tone="a"/>
          </div>
        </div>
      </div>
      <TabBar active="rank" role="user"/>
    </div>
  );
}
window.ScreenRanking = ScreenRanking;
