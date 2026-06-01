/* Focus.jsx — the reimagined "Matrix": a clean accountability relay */
function RelayNode({label, name, tone, state}){
  // state: done | active | next
  const ring = state==='active' ? '0 0 0 3px var(--accent), 0 0 0 6px var(--accent-soft)'
            : state==='done'   ? '0 0 0 2px var(--accent-soft-2)'
            : '0 0 0 2px var(--line-2)';
  return (
    <div className="fk-col" style={{alignItems:'center',gap:8,flex:1,position:'relative',zIndex:1}}>
      <div style={{position:'relative'}}>
        <div className="fk-av" style={{width:46,height:46,borderRadius:'50%',boxShadow:ring,
          background:state==='next'?'var(--surface-sunk)':(tone==='a'?'var(--accent-soft)':'#EEE9F6'),
          color:state==='next'?'var(--ink-3)':(tone==='a'?'var(--accent-ink)':'#5B4B86'),
          fontSize:17,fontWeight:700,opacity:state==='next'?.75:1}}>{label}</div>
        {state==='done' && <div style={{position:'absolute',right:-3,bottom:-3,width:19,height:19,borderRadius:'50%',background:'var(--accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 2.5px var(--surface)'}}><Icon name="check" size={11} sw={3}/></div>}
      </div>
      <span style={{fontSize:11.5,fontWeight:state==='active'?700:600,color:state==='next'?'var(--ink-3)':'var(--ink)'}}>{name}</span>
      <span className="fk-status-chip" style={{height:18,fontSize:9,padding:'0 8px',
        background:state==='active'?'var(--accent-soft)':state==='done'?'var(--done-soft)':'var(--surface-sunk)',
        color:state==='active'?'var(--accent-ink)':state==='done'?'var(--done)':'var(--ink-3)'}}>
        {state==='active'?'Active':state==='done'?'Done':'Up next'}
      </span>
    </div>
  );
}
function ScreenFocus(){
  return (
    <div className="fk">
      <StatusBar/>
      <Brand sub="FOCUS"/>
      <div className="fk-body fk-scroll">
        <h1 className="fk-h1">Focus</h1>
        <p className="fk-sub">One task at a time. Your favorite people take turns choosing what you tackle next — and verify it.</p>

        {/* cycle strip */}
        <div className="fk-card fk-card-pad" style={{marginTop:18, padding:'15px 17px'}}>
          <div className="fk-row" style={{justifyContent:'space-between',alignItems:'baseline'}}>
            <span style={{fontSize:14,fontWeight:700}}>Cycle 4</span>
            <span style={{fontSize:12.5,color:'var(--ink-2)'}}><b style={{color:'var(--ink)'}}>2</b> partners · <b style={{color:'var(--ink)'}}>50%</b> through</span>
          </div>
          <div className="fk-prog" style={{marginTop:11}}><i style={{width:'50%'}}></i></div>
        </div>

        {/* active focus hero */}
        <div className="fk-card fk-card-lg" style={{marginTop:14, overflow:'hidden', boxShadow:'var(--shadow-md)'}}>
          <div style={{background:'var(--accent)', color:'#fff', padding:'15px 18px'}}>
            <div className="fk-row" style={{justifyContent:'space-between',alignItems:'center'}}>
              <span className="fk-row fk-gap-8" style={{alignItems:'center',fontSize:11.5,fontWeight:700,letterSpacing:'0.04em'}}>
                <Icon name="zap" size={15} fill style={{opacity:.95}}/>YOUR ACTIVE FOCUS
              </span>
              <span className="fk-row fk-gap-6" style={{alignItems:'center',fontSize:11.5,fontWeight:600,background:'rgba(255,255,255,.16)',padding:'4px 10px',borderRadius:999}}>
                <Icon name="lock" size={12}/>Locked
              </span>
            </div>
          </div>
          <div className="fk-card-pad">
            <div className="fk-row fk-gap-10" style={{alignItems:'center'}}>
              <Avatar label="S" tone="a" size={30} circle/>
              <span style={{fontSize:12.5,color:'var(--ink-2)'}}>Chosen for you by <b style={{color:'var(--ink)'}}>Sandy</b></span>
            </div>
            <h2 style={{fontSize:20,fontWeight:800,letterSpacing:'-0.03em',margin:'13px 0 0',lineHeight:1.2}}>Trees & graph traversal</h2>
            <span style={{fontSize:13,color:'var(--ink-3)'}}>from DSA Revision Sprint</span>

            <div className="fk-row fk-gap-10" style={{marginTop:15}}>
              <div style={{flex:1, background:'var(--surface-sunk)', borderRadius:13, padding:'11px 13px'}}>
                <span className="fk-label" style={{fontSize:9.5}}>Time left</span>
                <div className="fk-row fk-gap-6" style={{alignItems:'center',marginTop:5}}>
                  <Icon name="hourglass" size={15} style={{color:'var(--amber)'}}/>
                  <span style={{fontSize:15,fontWeight:700,letterSpacing:'-0.02em',whiteSpace:'nowrap'}}>2d 4h</span>
                </div>
              </div>
              <div style={{flex:1, background:'var(--surface-sunk)', borderRadius:13, padding:'11px 13px'}}>
                <span className="fk-label" style={{fontSize:9.5}}>Estimate</span>
                <div className="fk-row fk-gap-6" style={{alignItems:'center',marginTop:5}}>
                  <Icon name="clock" size={15} style={{color:'var(--ink-3)'}}/>
                  <span style={{fontSize:15,fontWeight:700,letterSpacing:'-0.02em',whiteSpace:'nowrap'}}>25 min</span>
                </div>
              </div>
              <div style={{flex:1, background:'var(--surface-sunk)', borderRadius:13, padding:'11px 13px'}}>
                <span className="fk-label" style={{fontSize:9.5}}>Proof</span>
                <div className="fk-row fk-gap-6" style={{alignItems:'center',marginTop:5}}>
                  <Icon name="image" size={15} style={{color:'var(--ink-3)'}}/>
                  <span style={{fontSize:15,fontWeight:700,letterSpacing:'-0.02em'}}>Image</span>
                </div>
              </div>
            </div>

            <button className="fk-btn fk-btn-primary" style={{marginTop:15}}><Icon name="camera" size={18}/>Submit proof</button>
            <p style={{fontSize:11.5,color:'var(--ink-3)',textAlign:'center',margin:'10px 0 0',lineHeight:1.4}}>Stays locked until Sandy reviews — then the relay passes on.</p>
          </div>
        </div>

        {/* the relay */}
        <div style={{marginTop:22}}>
          <div className="fk-label-row">
            <span className="fk-label">The relay</span>
            <span style={{fontSize:11.5,color:'var(--ink-3)',fontWeight:600}}>whose turn it is</span>
          </div>
          <div className="fk-card fk-card-pad" style={{marginTop:11, padding:'20px 14px 16px'}}>
            <div className="fk-row" style={{position:'relative'}}>
              <div style={{position:'absolute',left:'12%',right:'12%',top:23,height:2,background:'var(--line-2)',zIndex:0}}></div>
              <RelayNode label="S" name="Sandy" tone="a" state="done"/>
              <RelayNode label="Y" name="You" tone="b" state="active"/>
              <RelayNode label="M" name="Maya" tone="b" state="next"/>
              <RelayNode label="D" name="Dev" tone="b" state="next"/>
            </div>
          </div>
        </div>

        {/* recent activity */}
        <div style={{marginTop:22, marginBottom:18}}>
          <span className="fk-label">Recent in this cycle</span>
          <div className="fk-card" style={{marginTop:11, overflow:'hidden'}}>
            {[['Sandy','assigned “Trees & graph traversal”','29 May · 10:12 pm','a'],
              ['You','approved “Linked lists & recursion”','27 May · 4:03 pm','b'],
              ['Maya','assigned “Arrays & two-pointer drills”','24 May · 9:30 am','b']].map((r,i)=>(
              <div key={i}>
                {i>0 && <hr className="fk-div" style={{marginLeft:60}}/>}
                <div className="fk-row fk-gap-12" style={{padding:'13px 16px',alignItems:'center'}}>
                  <Avatar label={r[0][0]} tone={r[3]} size={32} circle/>
                  <div className="fk-col" style={{flex:1,minWidth:0}}>
                    <span style={{fontSize:13.5,lineHeight:1.3}}><b>{r[0]}</b> <span style={{color:'var(--ink-2)'}}>{r[1]}</span></span>
                    <span style={{fontSize:11.5,color:'var(--ink-3)',marginTop:2}}>{r[2]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TabBar active="focus" role="user"/>
    </div>
  );
}
window.ScreenFocus = ScreenFocus;
