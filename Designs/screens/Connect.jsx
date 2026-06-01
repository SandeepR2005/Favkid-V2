/* Connect.jsx */
function ScreenConnect(){
  return (
    <div className="fk">
      <StatusBar/>
      <Brand sub="NETWORK"/>

      <div className="fk-body fk-scroll">
        <h1 className="fk-h1">Connect</h1>
        <p className="fk-sub">Link up with the people who keep you accountable — share your code or enter theirs.</p>

        {/* identity / code card */}
        <div className="fk-card fk-card-lg" style={{marginTop:18, overflow:'hidden'}}>
          <div className="fk-card-pad" style={{paddingBottom:16}}>
            <div className="fk-label-row">
              <span className="fk-label">Signed in</span>
              <span className="fk-status-chip fk-st-active">Favorite person</span>
            </div>
            <div className="fk-row fk-gap-12" style={{marginTop:14}}>
              <Avatar label="S" tone="a" size={46} circle/>
              <div className="fk-col">
                <span style={{fontSize:19,fontWeight:700,letterSpacing:'-0.02em'}}>Sandy</span>
                <span style={{fontSize:13,color:'var(--ink-2)'}}>sandy@favkid.app</span>
              </div>
            </div>
          </div>

          <div style={{background:'var(--accent-soft)', borderTop:'1px solid var(--accent-soft-2)', padding:'16px 18px'}}>
            <span className="fk-label" style={{color:'var(--accent-ink)',opacity:.75}}>Your Favkid code</span>
            <div className="fk-row" style={{justifyContent:'space-between',alignItems:'center',marginTop:9}}>
              <span className="fk-mono" style={{fontSize:25,fontWeight:700,color:'var(--accent-ink)',letterSpacing:'0.01em'}}>FK-982EF7E5</span>
              <div className="fk-row fk-gap-8">
                <div className="fk-icon-btn" style={{borderColor:'var(--accent-soft-2)'}}><Icon name="copy" size={18}/></div>
                <div className="fk-icon-btn" style={{borderColor:'var(--accent-soft-2)'}}><Icon name="share" size={18}/></div>
              </div>
            </div>
            <p style={{fontSize:12.5,color:'var(--accent-ink)',opacity:.72,margin:'10px 0 0',lineHeight:1.4}}>Share this with anyone who wants to connect with you.</p>
          </div>
        </div>

        {/* connect using code */}
        <div style={{marginTop:22}}>
          <span className="fk-label">Connect using a code</span>
          <div className="fk-row fk-gap-10" style={{marginTop:11}}>
            <div className="fk-input is-ph is-mono" style={{flex:1}}>FK-8A91BC22</div>
            <button className="fk-btn fk-btn-primary" style={{width:'auto',padding:'0 18px',height:48,flex:'0 0 auto'}}>
              <Icon name="arrowR" size={19}/>
            </button>
          </div>
        </div>

        {/* incoming */}
        <div style={{marginTop:24}}>
          <div className="fk-label-row">
            <span className="fk-label">Incoming requests</span>
            <span className="fk-status-chip fk-st-pending" style={{height:22}}>1 new</span>
          </div>
          <div className="fk-card fk-card-pad" style={{marginTop:11, padding:'15px 16px'}}>
            <div className="fk-row fk-gap-12">
              <Avatar label="M" tone="b" size={42} circle/>
              <div className="fk-col" style={{flex:1,minWidth:0}}>
                <span style={{fontSize:15,fontWeight:700}}>Maya R.</span>
                <span style={{fontSize:12.5,color:'var(--ink-3)'}}>wants you as their favorite person</span>
              </div>
            </div>
            <div className="fk-row fk-gap-10" style={{marginTop:13}}>
              <button className="fk-btn fk-btn-primary fk-btn-sm" style={{flex:1}}><Icon name="check" size={17}/>Accept</button>
              <button className="fk-btn fk-btn-ghost fk-btn-sm" style={{flex:1}}>Decline</button>
            </div>
          </div>
        </div>

        {/* sent */}
        <div style={{marginTop:22, marginBottom:18}}>
          <span className="fk-label">Your requests</span>
          <div className="fk-card fk-card-pad" style={{marginTop:11, padding:'22px 18px', display:'flex', alignItems:'center', gap:13}}>
            <div style={{width:38,height:38,borderRadius:11,background:'var(--surface-sunk)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink-3)',flex:'0 0 auto'}}>
              <Icon name="users" size={19}/>
            </div>
            <span style={{fontSize:13.5,color:'var(--ink-2)',lineHeight:1.4}}>No pending requests. Enter a code above to send one.</span>
          </div>
        </div>
      </div>

      <TabBar active="connect" role="user"/>
    </div>
  );
}
window.ScreenConnect = ScreenConnect;
