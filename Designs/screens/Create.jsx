/* Create.jsx */
function FormGroup({title, hint, children}){
  return (
    <div className="fk-card fk-card-lg fk-card-pad" style={{marginTop:14}}>
      <div style={{fontSize:16,fontWeight:700,letterSpacing:'-0.02em'}}>{title}</div>
      {hint && <div style={{fontSize:12.5,color:'var(--ink-3)',marginTop:3,lineHeight:1.4}}>{hint}</div>}
      <div style={{marginTop:16}}>{children}</div>
    </div>
  );
}
function Field({label, children}){
  return (
    <div style={{marginBottom:14}}>
      <label className="fk-field-label">{label}</label>
      {children}
    </div>
  );
}
function DateTile({label, value, icon}){
  return (
    <div style={{flex:1, border:'1px solid var(--line-2)', borderRadius:13, padding:'10px 13px', background:'var(--surface)'}}>
      <span className="fk-label" style={{fontSize:9.5}}>{label}</span>
      <div className="fk-row fk-gap-8" style={{alignItems:'center',marginTop:6}}>
        <Icon name={icon} size={15} style={{color:'var(--accent)'}}/>
        <span style={{fontSize:14,fontWeight:600}}>{value}</span>
      </div>
    </div>
  );
}
function ScreenCreate(){
  const cats=[['Study',true],['Fitness',false],['Career',false],['Personal',false],['Skill',false]];
  const proofs=[['textT','Text',false],['image','Image',true],['fileText','File',false],['link','Link',false]];
  return (
    <div className="fk">
      <StatusBar/>
      <div className="fk-appbar">
        <div className="fk-avatar-btn" style={{borderRadius:11}}><Icon name="chevL" size={20}/></div>
        <span className="fk-eyebrow">New achievement</span>
        <div style={{width:34}}></div>
      </div>

      <div className="fk-body fk-scroll">
        <h1 className="fk-h1" style={{marginTop:8}}>Create a goal</h1>
        <p className="fk-sub">Set the outcome, a final deadline, and break it into clear, verifiable subtasks.</p>

        <FormGroup title="Details">
          <Field label="Title">
            <div className="fk-input is-ph">e.g. Complete DSA revision</div>
          </Field>
          <Field label="Description">
            <div className="fk-input fk-textarea is-ph">What does success look like?</div>
          </Field>
          <Field label="Category">
            <div className="fk-row fk-gap-8" style={{flexWrap:'wrap'}}>
              {cats.map(([c,on])=><span key={c} className={'fk-chip'+(on?' is-on':'')}>{on&&<Icon name="check" size={13} sw={2.6}/>}{c}</span>)}
            </div>
          </Field>
          <div style={{marginBottom:0}}>
            <label className="fk-field-label">Priority</label>
            <div className="fk-seg">
              <button>Low</button>
              <button className="is-on">Medium</button>
              <button>High</button>
            </div>
          </div>
        </FormGroup>

        <FormGroup title="Final deadline" hint="The hard deadline for the whole achievement.">
          <div className="fk-row fk-gap-10" style={{marginBottom:10}}>
            <DateTile label="Deadline date" value="30 May 2026" icon="calendar"/>
            <DateTile label="Time" value="4:30 pm" icon="clock"/>
          </div>
          <div className="fk-row fk-gap-10">
            <DateTile label="Remind me" value="29 May 2026" icon="bell"/>
            <DateTile label="Time" value="9:00 am" icon="clock"/>
          </div>
        </FormGroup>

        <FormGroup title="Verification" hint="How your favorite person confirms a task is truly done.">
          <Field label="Proof required">
            <div className="fk-seg">
              {proofs.map(([ic,l,on])=><button key={l} className={on?'is-on':''}><Icon name={ic} size={16}/>{l}</button>)}
            </div>
          </Field>
          <Field label="Success criteria">
            <div className="fk-input fk-textarea is-ph">e.g. Submit a screenshot of all solved problems</div>
          </Field>
          <div style={{marginBottom:0}}>
            <label className="fk-field-label">Notes for reviewer <span style={{color:'var(--ink-4)',fontWeight:500}}>(optional)</span></label>
            <div className="fk-input is-ph">Any extra context</div>
          </div>
        </FormGroup>

        <FormGroup title="Subtasks" hint="Each subtask has its own deadline and proof.">
          <div style={{border:'1px solid var(--line-2)', borderRadius:15, padding:15, background:'var(--surface-2)'}}>
            <div className="fk-row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div className="fk-row fk-gap-8" style={{alignItems:'center'}}>
                <span style={{width:24,height:24,borderRadius:7,background:'var(--accent-soft)',color:'var(--accent-ink)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>1</span>
                <span style={{fontSize:14,fontWeight:700}}>Subtask</span>
              </div>
              <span style={{fontSize:12.5,fontWeight:600,color:'var(--rose)'}}>Remove</span>
            </div>
            <div className="fk-input is-ph" style={{marginBottom:10}}>e.g. Complete arrays problems</div>
            <div className="fk-row fk-gap-10" style={{marginBottom:10}}>
              <DateTile label="Date" value="24 May" icon="calendar"/>
              <DateTile label="Time" value="6:00 pm" icon="clock"/>
              <DateTile label="Est. min" value="60" icon="hourglass"/>
            </div>
          </div>
          <button className="fk-btn fk-btn-soft fk-btn-sm" style={{width:'100%',marginTop:12}}><Icon name="plus" size={17} sw={2.2}/>Add subtask</button>
        </FormGroup>

        <button className="fk-btn fk-btn-primary" style={{marginTop:18}}>
          <Icon name="sparkle" size={18} fill/>Create achievement
        </button>
        <p style={{textAlign:'center',fontSize:12,color:'var(--ink-3)',margin:'12px 0 18px',lineHeight:1.4}}>You can edit subtasks and deadlines any time before they’re assigned.</p>
      </div>
      <TabBar active="track" role="user"/>
    </div>
  );
}
window.ScreenCreate = ScreenCreate;
