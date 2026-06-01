/* Assign.jsx — favorite-person side: review proof + assign next task */
function TaskPick({title, meta, on}){
  return (
    <div className="fk-row fk-gap-12" style={{padding:'13px 14px', borderRadius:14, border:'1px solid '+(on?'var(--accent)':'var(--line-2)'), background:on?'var(--accent-soft)':'var(--surface)', boxShadow:on?'0 0 0 3px var(--accent-soft)':'none', alignItems:'center'}}>
      <div style={{width:21,height:21,borderRadius:'50%',flex:'0 0 auto',border:'2px solid '+(on?'var(--accent)':'var(--line-strong)'),background:on?'var(--accent)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {on && <Icon name="check" size={12} sw={3} style={{color:'#fff'}}/>}
      </div>
      <div className="fk-col" style={{flex:1,minWidth:0}}>
        <span style={{fontSize:14.5,fontWeight:600,letterSpacing:'-0.01em'}}>{title}</span>
        <span style={{fontSize:12,color:'var(--ink-3)',marginTop:1}}>{meta}</span>
      </div>
    </div>
  );
}
function ScreenAssign(){
  return (
    <div className="fk">
      <StatusBar/>
      <div className="fk-appbar">
        <div className="fk-brand">
          <img className="fk-brand-mark" src="assets/favkid-mark.png" alt="Favkid"/>
          <div className="fk-col" style={{lineHeight:1.1}}>
            <span className="fk-brand-name">Favkid</span>
            <span style={{fontSize:11,fontWeight:600,color:'var(--accent)',letterSpacing:'0.04em'}}>FAVORITE PERSON</span>
          </div>
        </div>
        <div className="fk-avatar-btn"><Icon name="settings" size={19}/></div>
      </div>

      <div className="fk-body fk-scroll">
        <h1 className="fk-h1">Your turn</h1>
        <p className="fk-sub">You’re Sandeep’s accountability partner this cycle. Review their proof, then choose the next task.</p>

        {/* selected user */}
        <div className="fk-card fk-card-pad" style={{marginTop:18, padding:'15px 16px'}}>
          <div className="fk-row" style={{justifyContent:'space-between',alignItems:'center'}}>
            <div className="fk-row fk-gap-12">
              <Avatar label="S" tone="b" size={44} circle/>
              <div className="fk-col">
                <span style={{fontSize:16,fontWeight:700,letterSpacing:'-0.02em'}}>Sandeep</span>
                <span style={{fontSize:12.5,color:'var(--ink-3)'}}>Cycle 4 · DSA Revision Sprint</span>
              </div>
            </div>
            <span className="fk-status-chip fk-st-active">Active</span>
          </div>
        </div>

        {/* pending review */}
        <div style={{marginTop:22}}>
          <div className="fk-label-row">
            <span className="fk-label">Pending your review</span>
            <span className="fk-status-chip fk-st-pending" style={{height:22}}>1</span>
          </div>
          <div className="fk-card fk-card-lg" style={{marginTop:11, overflow:'hidden', boxShadow:'var(--shadow-md)'}}>
            <div className="fk-card-pad" style={{paddingBottom:14}}>
              <div className="fk-label-row">
                <span className="fk-label" style={{fontSize:10}}>Submitted task</span>
                <span className="fk-row fk-gap-6" style={{alignItems:'center',fontSize:11.5,color:'var(--ink-3)',fontWeight:600,whiteSpace:'nowrap'}}><Icon name="clock" size={13}/>2h ago</span>
              </div>
              <div style={{fontSize:16.5,fontWeight:700,letterSpacing:'-0.02em',marginTop:5}}>Linked lists &amp; recursion</div>
              {/* proof thumbnail placeholder */}
              <div style={{marginTop:13, height:148, borderRadius:14, border:'1px solid var(--line-2)', overflow:'hidden', position:'relative',
                background:'repeating-linear-gradient(135deg, #EFEEE9 0 11px, #F6F5F1 11px 22px)'}}>
                <div className="fk-col" style={{position:'absolute',inset:0,alignItems:'center',justifyContent:'center',gap:8}}>
                  <Icon name="image" size={26} style={{color:'var(--ink-4)'}}/>
                  <span className="fk-mono" style={{fontSize:11,color:'var(--ink-3)'}}>proof_screenshot.png</span>
                </div>
                <span className="fk-mono" style={{position:'absolute',top:10,left:12,fontSize:10,color:'var(--ink-3)',background:'var(--surface)',padding:'2px 7px',borderRadius:6,boxShadow:'var(--shadow-sm)'}}>IMAGE PROOF</span>
              </div>
            </div>
            <div style={{padding:'0 18px 18px'}}>
              <div className="fk-row fk-gap-10">
                <button className="fk-btn fk-btn-primary fk-btn-sm" style={{flex:1.3}}><Icon name="check" size={17} sw={2.4}/>Approve</button>
                <button className="fk-btn fk-btn-ghost fk-btn-sm" style={{flex:1}}>Request changes</button>
              </div>
            </div>
          </div>
        </div>

        {/* choose next task */}
        <div style={{marginTop:24, marginBottom:18}}>
          <div className="fk-label-row">
            <span className="fk-label">Choose the next task</span>
            <span style={{fontSize:11.5,color:'var(--ink-3)',fontWeight:600}}>3 available</span>
          </div>
          <p style={{fontSize:12.5,color:'var(--ink-2)',margin:'8px 0 0',lineHeight:1.45}}>Pick one open subtask for Sandeep to focus on next.</p>
          <div className="fk-stack" style={{marginTop:13}}>
            <TaskPick title="Trees & graph traversal" meta="25 min · due May 28" on={true}/>
            <TaskPick title="Dynamic programming intro" meta="60 min · due Jun 1" on={false}/>
            <TaskPick title="Sorting & complexity recap" meta="30 min · due Jun 3" on={false}/>
          </div>
          <button className="fk-btn fk-btn-primary" style={{marginTop:16}}><Icon name="arrowR" size={18}/>Assign to Sandeep</button>
        </div>
      </div>
      <TabBar active="assign" role="fav"/>
    </div>
  );
}
window.ScreenAssign = ScreenAssign;
