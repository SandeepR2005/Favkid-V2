/* Achievements.jsx */
function Metric({n, label, tone}){
  return (
    <div className="fk-card fk-card-pad" style={{flex:1, padding:'14px 16px'}}>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:'-0.03em',color:tone||'var(--ink)'}}>{n}</div>
      <div className="fk-label" style={{marginTop:2,fontSize:10.5}}>{label}</div>
    </div>
  );
}
function SubRow({n, title, mins, date, status}){
  const map={approved:['fk-st-approved','Approved'],pending:['fk-st-pending','Pending']};
  const [cls,txt]=map[status];
  return (
    <div className="fk-row fk-gap-12" style={{alignItems:'center'}}>
      <div style={{width:26,height:26,borderRadius:8,background:status==='approved'?'var(--accent-soft)':'var(--surface-sunk)',color:status==='approved'?'var(--accent-ink)':'var(--ink-3)',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto'}}>
        {status==='approved'?<Icon name="check" size={15} sw={2.4}/>:<span style={{fontSize:12,fontWeight:700}}>{n}</span>}
      </div>
      <div className="fk-col" style={{flex:1,minWidth:0}}>
        <span style={{fontSize:14,fontWeight:600,letterSpacing:'-0.01em'}}>{title}</span>
        <span style={{fontSize:11.5,color:'var(--ink-3)'}}>{mins} min · {date}</span>
      </div>
      <span className={'fk-status-chip '+cls} style={{height:22,fontSize:10}}>{txt}</span>
    </div>
  );
}
function ScreenAchievements(){
  return (
    <div className="fk">
      <StatusBar/>
      <Brand sub="ACHIEVEMENTS"/>
      <div className="fk-body fk-scroll">
        <h1 className="fk-h1">Achievements</h1>
        <p className="fk-sub">Your goals and the ones shared with you by people you trust.</p>

        <div className="fk-row fk-gap-10" style={{marginTop:18}}>
          <Metric n="3" label="Total"/>
          <Metric n="2" label="Done" tone="var(--accent)"/>
          <Metric n="1" label="Active" tone="var(--amber)"/>
        </div>

        <div className="fk-row fk-gap-8" style={{marginTop:16}}>
          <span className="fk-chip is-on">All</span>
          <span className="fk-chip">Mine</span>
          <span className="fk-chip">Shared</span>
        </div>

        {/* featured achievement */}
        <div className="fk-card fk-card-lg" style={{marginTop:16, overflow:'hidden'}}>
          <div className="fk-card-pad" style={{paddingBottom:14}}>
            <div className="fk-row" style={{justifyContent:'space-between',alignItems:'flex-start'}}>
              <div className="fk-row fk-gap-10">
                <Avatar label="S" tone="e" size={38} circle/>
                <div className="fk-col" style={{lineHeight:1.25}}>
                  <span style={{fontSize:13.5,fontWeight:700}}>Sandeep</span>
                  <span style={{fontSize:11,color:'var(--ink-3)',fontWeight:600,letterSpacing:'0.03em'}}>SHARED WITH YOU</span>
                </div>
              </div>
              <span className="fk-status-chip fk-st-shared">Shared</span>
            </div>

            <h2 style={{fontSize:21,fontWeight:800,letterSpacing:'-0.03em',margin:'15px 0 0'}}>DSA Revision Sprint</h2>
            <p style={{fontSize:13.5,color:'var(--ink-2)',margin:'5px 0 0',lineHeight:1.45}}>Rebuild core data-structure fluency before interviews.</p>

            <div className="fk-row fk-gap-10" style={{marginTop:15}}>
              <div style={{flex:1}}>
                <span className="fk-label" style={{fontSize:10}}>Category</span>
                <div className="fk-row fk-gap-6" style={{marginTop:6,alignItems:'center'}}>
                  <span style={{width:8,height:8,borderRadius:3,background:'var(--slate)'}}></span>
                  <span style={{fontSize:14,fontWeight:600}}>Skill</span>
                </div>
              </div>
              <div style={{flex:1}}>
                <span className="fk-label" style={{fontSize:10}}>Priority</span>
                <div style={{fontSize:14,fontWeight:600,marginTop:6}}>Medium</div>
              </div>
              <div style={{flex:1.3}}>
                <span className="fk-label" style={{fontSize:10}}>Deadline</span>
                <div className="fk-row fk-gap-6" style={{marginTop:6,alignItems:'center'}}>
                  <Icon name="calendar" size={14} style={{color:'var(--ink-3)'}}/>
                  <span style={{fontSize:13.5,fontWeight:600}}>27 Jun</span>
                </div>
              </div>
            </div>

            <div style={{marginTop:17}}>
              <div className="fk-row" style={{justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:600,color:'var(--ink-2)'}}>Progress</span>
                <span className="fk-row fk-gap-8" style={{alignItems:'center'}}>
                  <span style={{fontSize:13,fontWeight:700}}>67%</span>
                  <span className="fk-status-chip fk-st-active" style={{height:21,fontSize:10}}>Active</span>
                </span>
              </div>
              <div className="fk-prog fk-prog-lg"><i style={{width:'67%'}}></i></div>
            </div>
          </div>

          {/* subtasks */}
          <div style={{background:'var(--surface-2)', borderTop:'1px solid var(--line)', padding:'16px 18px'}}>
            <div className="fk-label-row" style={{marginBottom:13}}>
              <span className="fk-label">Subtasks · 3</span>
              <span style={{fontSize:11,color:'var(--ink-3)',fontWeight:600}}>2 of 3 done</span>
            </div>
            <div className="fk-stack">
              <SubRow n="1" title="Arrays & two-pointer drills" mins="20" date="Jun 4" status="approved"/>
              <hr className="fk-div"/>
              <SubRow n="2" title="Linked lists & recursion" mins="50" date="Jun 2" status="approved"/>
              <hr className="fk-div"/>
              <SubRow n="3" title="Trees & graph traversal" mins="25" date="May 28" status="pending"/>
            </div>
          </div>
        </div>

        {/* collapsed peek */}
        <div className="fk-card fk-card-pad" style={{marginTop:14, marginBottom:18, padding:'15px 16px'}}>
          <div className="fk-row" style={{justifyContent:'space-between',alignItems:'center'}}>
            <div className="fk-row fk-gap-12">
              <Avatar label="R" tone="b" size={38}/>
              <div className="fk-col">
                <span style={{fontSize:15,fontWeight:700,letterSpacing:'-0.01em'}}>Run a 10K</span>
                <span style={{fontSize:12,color:'var(--ink-3)'}}>Fitness · completed</span>
              </div>
            </div>
            <span className="fk-status-chip fk-st-approved" style={{height:24}}><Icon name="check" size={13} sw={2.6}/>Done</span>
          </div>
        </div>
      </div>
      <TabBar active="home" role="user"/>
    </div>
  );
}
window.ScreenAchievements = ScreenAchievements;
