import { useState } from "react";

const T = {
  bg:"#070B10",sur:"#0D1420",hi:"#111D2E",
  bd:"#1A2E45",acc:"#00D4AA",accD:"#00D4AA18",accM:"#00D4AA33",
  warn:"#F6AD55",warnD:"#F6AD5518",
  dan:"#FC8181",danD:"#FC818118",
  safe:"#68D391",safeD:"#68D39118",
  vio:"#B794F4",vioD:"#B794F418",
  blu:"#63B3ED",bluD:"#63B3ED18",
  gold:"#F6E05E",goldD:"#F6E05E18",
  tx:"#E2EAF4",tm:"#607080",tf:"#2A3F55",
};

const ADMIN_EMAIL = "admin@medguard.in";
const ADMIN_PASS = "MedGuard@Admin2026";
const APP_URL = "https://medguard-fawn.vercel.app";

// Generate random invite token
const generateToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for(let i=0; i<32; i++) token += chars[Math.floor(Math.random()*chars.length)];
  return token;
};

const INIT_FAMILIES = [
  {id:1,name:"Kumar Family",email:"rajan.kumar@gmail.com",phone:"+91 98765 43210",plan:"pro",status:"active",joined:"Apr 1, 2026",lastActive:"Today",seniors:[{id:1,name:"Rajan Kumar",age:72,medicines:4,adherence:87},{id:2,name:"Kamla Kumar",age:68,medicines:3,adherence:92}],totalMeds:7,revenue:199,inviteToken:null,inviteStatus:"accepted"},
  {id:2,name:"Sharma Family",email:"priya.sharma@gmail.com",phone:"+91 87654 32109",plan:"basic",status:"active",joined:"Apr 15, 2026",lastActive:"Yesterday",seniors:[{id:3,name:"Ram Sharma",age:75,medicines:6,adherence:71}],totalMeds:6,revenue:99,inviteToken:null,inviteStatus:"accepted"},
  {id:3,name:"Patel Family",email:"amit.patel@gmail.com",phone:"+91 76543 21098",plan:"trial",status:"trial",joined:"May 10, 2026",lastActive:"Today",seniors:[{id:4,name:"Bhavna Patel",age:70,medicines:2,adherence:95}],totalMeds:2,revenue:0,inviteToken:"xyz123pending",inviteStatus:"pending"},
];

const INIT_ALERTS = [
  {id:1,type:"low_stock",family:"Kumar Family",senior:"Rajan Kumar",msg:"Vitamin D3 — 3 days left",severity:"danger",time:"2h ago"},
  {id:2,type:"missed",family:"Singh Family",senior:"Harjit Singh",msg:"Missed 3 doses this week",severity:"danger",time:"5h ago"},
  {id:3,type:"trial_ending",family:"Patel Family",senior:"",msg:"Trial ends in 4 days",severity:"warn",time:"1d ago"},
];

// ── PRIMITIVES ─────────────────────────────────────────────────────────────────
function Chip({children,color}){
  return <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:color+"22",color,border:`1px solid ${color}33`}}>{children}</span>;
}
function Card({children,style={}}){
  return <div style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:16,...style}}>{children}</div>;
}
function Inp({label,value,onChange,placeholder,type="text",color}){
  return(
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:11,color:color||T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{label}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${color?color+"44":T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );
}
function Toggle({label,sub,on,onToggle}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.bd}22`}}>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:T.tx}}>{label}</div>
        <div style={{fontSize:11,color:T.tm}}>{sub}</div>
      </div>
      <div onClick={onToggle} style={{width:44,height:24,borderRadius:12,background:on?T.acc:T.hi,border:`1px solid ${on?T.acc:T.bd}`,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
        <div style={{position:"absolute",top:2,left:on?22:2,width:20,height:20,borderRadius:"50%",background:on?T.bg:"#fff",transition:"left .2s"}}/>
      </div>
    </div>
  );
}
function StatCard({label,value,sub,color,icon}){
  return(
    <Card style={{textAlign:"center",padding:16}}>
      <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:24,fontWeight:900,color,lineHeight:1}}>{value}</div>
      <div style={{fontSize:12,color:T.tx,fontWeight:600,marginTop:4}}>{label}</div>
      {sub&&<div style={{fontSize:10,color:T.tm,marginTop:2}}>{sub}</div>}
    </Card>
  );
}

// ── INVITE LINK COMPONENT ──────────────────────────────────────────────────────
function InviteLink({family,onClose}){
  const [copied,setCopied]=useState(false);
  const [whatsappSent,setWhatsappSent]=useState(false);
  const link=`${APP_URL}/invite?token=${family.inviteToken}&email=${encodeURIComponent(family.email)}&name=${encodeURIComponent(family.name)}`;

  const copy=()=>{
    const el=document.createElement("textarea");
    el.value=link;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  const sendWhatsApp=()=>{
    const msg=`Hello! You have been invited to MedGuard — a medicine management system for your family.\n\nClick this link to set up your account:\n${link}\n\nThis link is valid for 7 days. Contact admin@medguard.in for help.`;
    window.open(`https://wa.me/${family.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
    setWhatsappSent(true);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,border:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>📨 Invite Link</div>
            <div style={{fontSize:12,color:T.tm}}>{family.name}</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>

        {/* Invite link box */}
        <div style={{padding:14,borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:16}}>
          <div style={{fontSize:10,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Invite Link</div>
          <div style={{fontSize:11,color:T.acc,wordBreak:"break-all",lineHeight:1.6,marginBottom:10}}>{link}</div>
          <button onClick={copy} style={{width:"100%",padding:"10px 0",borderRadius:10,background:copied?T.safeD:T.accD,border:`1px solid ${copied?T.safe:T.accM}`,color:copied?T.safe:T.acc,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
            {copied?"✅ Copied!":"📋 Copy Link"}
          </button>
        </div>

        {/* Info */}
        <div style={{padding:12,borderRadius:10,background:T.vioD,border:`1px solid ${T.vio}33`,marginBottom:16,fontSize:12,color:T.vio,lineHeight:1.7}}>
          📋 When family opens this link they will see a welcome page and can set their password. After that they login normally. <strong>Link expires in 7 days.</strong>
        </div>

        {/* Send via WhatsApp */}
        <button onClick={sendWhatsApp} style={{width:"100%",padding:"13px 0",borderRadius:12,background:whatsappSent?"#128C7E22":"#128C7E",border:"none",color:whatsappSent?"#25D366":"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
          {whatsappSent?"✅ Sent on WhatsApp":"💬 Send via WhatsApp"}
        </button>

        {/* Manual share options */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <button onClick={()=>{window.open(`sms:${family.phone}?body=You are invited to MedGuard: ${link}`);}} style={{padding:"10px 0",borderRadius:10,background:T.bluD,border:`1px solid ${T.blu}44`,color:T.blu,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            📱 Send SMS
          </button>
          <button onClick={()=>{window.open(`mailto:${family.email}?subject=Your MedGuard Invitation&body=Hello,\n\nYou have been invited to MedGuard.\n\nClick here to setup your account: ${link}\n\nThis link expires in 7 days.\n\nTeam MedGuard`);}} style={{padding:"10px 0",borderRadius:10,background:T.vioD,border:`1px solid ${T.vio}44`,color:T.vio,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            📧 Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CREATE FAMILY MODAL ────────────────────────────────────────────────────────
function CreateFamilyModal({onSave,onClose}){
  const [step,setStep]=useState(1);
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [phone,setPhone]=useState("");
  const [plan,setPlan]=useState("trial");
  const [seniors,setSeniors]=useState([{name:"",age:"",relation:"Father"}]);
  const [error,setError]=useState("");

  const addSenior=()=>setSeniors(p=>[...p,{name:"",age:"",relation:"Father"}]);
  const updateSenior=(i,key,val)=>setSeniors(p=>p.map((s,idx)=>idx===i?{...s,[key]:val}:s));
  const removeSenior=(i)=>setSeniors(p=>p.filter((_,idx)=>idx!==i));

  const next=()=>{
    if(step===1){
      if(!name||!email||!phone){setError("Fill all fields");return;}
      setError("");setStep(2);
    } else {
      if(seniors.some(s=>!s.name)){setError("Enter name for all seniors");return;}
      setError("");setStep(3);
    }
  };

  const save=()=>{
    const token=generateToken();
    const newFamily={
      id:Date.now(),
      name,email,phone,plan,
      status:"pending",
      joined:new Date().toLocaleDateString("en-IN",{month:"short",day:"numeric",year:"numeric"}),
      lastActive:"Never",
      seniors:seniors.filter(s=>s.name).map((s,i)=>({id:Date.now()+i,name:s.name,age:parseInt(s.age)||0,relation:s.relation,medicines:0,adherence:0})),
      totalMeds:0,
      revenue:plan==="pro"?199:plan==="basic"?99:0,
      inviteToken:token,
      inviteStatus:"pending",
    };
    onSave(newFamily);
  };

  const planColor={pro:T.gold,basic:T.acc,trial:T.warn};
  const relations=["Father","Mother","Grandfather","Grandmother","Uncle","Aunt","Other"];

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,maxHeight:"90vh",overflow:"auto",border:`1px solid ${T.bd}`}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:18,fontWeight:800,color:T.tx}}>➕ Create New Family</div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>

        {/* Progress */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {["Family Details","Add Seniors","Choose Plan"].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center"}}>
              <div style={{height:3,borderRadius:2,background:step>i?T.acc:T.bd,marginBottom:4,transition:"background .3s"}}/>
              <div style={{fontSize:9,color:step===i+1?T.acc:T.tm,fontWeight:step===i+1?700:400}}>{s}</div>
            </div>
          ))}
        </div>

        {/* Step 1 — Family details */}
        {step===1&&(
          <>
            <Inp label="Family Name" value={name} onChange={setName} placeholder="e.g. Kumar Family"/>
            <Inp label="Family Email (for login)" value={email} onChange={setEmail} placeholder="rajan@gmail.com" type="email" color={T.acc}/>
            <Inp label="Phone Number (for WhatsApp)" value={phone} onChange={setPhone} placeholder="+91 98765 43210"/>
          </>
        )}

        {/* Step 2 — Seniors */}
        {step===2&&(
          <>
            <div style={{fontSize:12,color:T.tm,marginBottom:14,lineHeight:1.6}}>Add the elderly members this family will be monitoring. You can add more later.</div>
            {seniors.map((s,i)=>(
              <div key={i} style={{padding:14,borderRadius:14,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.acc}}>Senior {i+1}</div>
                  {seniors.length>1&&(
                    <button onClick={()=>removeSenior(i)} style={{background:"none",border:"none",color:T.dan,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
                  )}
                </div>
                <Inp label="Full Name" value={s.name} onChange={v=>updateSenior(i,"name",v)} placeholder="e.g. Rajan Kumar"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <Inp label="Age" value={s.age} onChange={v=>updateSenior(i,"age",v)} placeholder="72" type="number"/>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Relation</div>
                    <select value={s.relation} onChange={e=>updateSenior(i,"relation",e.target.value)} style={{width:"100%",padding:"11px 12px",borderRadius:10,background:T.sur,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",fontFamily:"inherit"}}>
                      {relations.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addSenior} style={{width:"100%",padding:"10px 0",borderRadius:10,background:T.accD,border:`1px dashed ${T.accM}`,color:T.acc,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:4}}>
              ＋ Add Another Senior
            </button>
          </>
        )}

        {/* Step 3 — Plan */}
        {step===3&&(
          <>
            <div style={{fontSize:12,color:T.tm,marginBottom:14}}>Choose a plan for this family. You can change it anytime from the admin panel.</div>
            {[
              {id:"trial",label:"Free Trial",price:"Free",duration:"14 days",features:["All features included","Reminders","AI scanner"],color:T.warn},
              {id:"basic",label:"Basic Plan",price:"₹99/month",duration:"Monthly billing",features:["All features","WhatsApp reminders","1 senior"],color:T.acc},
              {id:"pro",label:"Pro Plan",price:"₹199/month",duration:"Monthly billing",features:["Everything in Basic","Multiple seniors","Priority support","AI reports"],color:T.gold},
            ].map(p=>(
              <div key={p.id} onClick={()=>setPlan(p.id)} style={{padding:16,borderRadius:14,background:plan===p.id?p.color+"18":T.hi,border:`2px solid ${plan===p.id?p.color:T.bd}`,cursor:"pointer",marginBottom:10,transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:T.tx}}>{p.label}</div>
                    <div style={{fontSize:11,color:T.tm}}>{p.duration}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:16,fontWeight:900,color:p.color}}>{p.price}</div>
                    {plan===p.id&&<div style={{fontSize:10,color:p.color,marginTop:2}}>✓ Selected</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {p.features.map((f,i)=>(
                    <span key={i} style={{padding:"2px 8px",borderRadius:20,fontSize:10,background:p.color+"18",color:p.color,border:`1px solid ${p.color}33`}}>✓ {f}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary */}
            <div style={{padding:14,borderRadius:12,background:T.accD,border:`1px solid ${T.accM}`,marginTop:4}}>
              <div style={{fontSize:12,fontWeight:700,color:T.acc,marginBottom:8}}>📋 Summary</div>
              {[
                ["Family",name],
                ["Email",email],
                ["Phone",phone],
                ["Seniors",seniors.filter(s=>s.name).length+" person(s)"],
                ["Plan",plan+" ("+( plan==="pro"?"₹199/mo":plan==="basic"?"₹99/mo":"Free" )+")"],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:`1px solid ${T.bd}22`}}>
                  <span style={{color:T.tm}}>{k}</span>
                  <span style={{color:T.tx,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {error&&(
          <div style={{margin:"10px 0",padding:"10px 14px",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan}}>
            ⚠️ {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{display:"flex",gap:10,marginTop:16}}>
          {step>1&&(
            <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"12px 0",borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              ← Back
            </button>
          )}
          {step<3?(
            <button onClick={next} style={{flex:2,padding:"12px 0",borderRadius:12,background:T.acc,border:"none",color:T.bg,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              Continue →
            </button>
          ):(
            <button onClick={save} style={{flex:2,padding:"12px 0",borderRadius:12,background:T.acc,border:"none",color:T.bg,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              ✅ Create & Generate Invite
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN LOGIN ────────────────────────────────────────────────────────────────
function AdminLogin({onLogin}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPass,setShowPass]=useState(false);

  const handle=()=>{
    if(!email||!pass){setError("Fill all fields");return;}
    setLoading(true);setError("");
    setTimeout(()=>{
      if(email===ADMIN_EMAIL&&pass===ADMIN_PASS){
        onLogin();
      } else {
        setError("Invalid admin credentials");
        setLoading(false);
      }
    },1000);
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:64,height:64,borderRadius:20,background:T.accD,border:`2px solid ${T.accM}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px"}}>🛡️</div>
          <div style={{fontSize:22,fontWeight:900,color:T.tx}}>MedGuard Admin</div>
          <div style={{fontSize:12,color:T.tm,marginTop:4}}>Secure admin access only</div>
        </div>
        <Card style={{padding:24}}>
          <div style={{fontSize:16,fontWeight:800,color:T.tx,marginBottom:20}}>Sign In to Admin Panel</div>
          <Inp label="Admin Email" value={email} onChange={setEmail} placeholder="admin@medguard.in" type="email"/>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Password</div>
            <div style={{position:"relative"}}>
              <input value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="Admin password" type={showPass?"text":"password"}
                style={{width:"100%",padding:"11px 44px 11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
              <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.tm,cursor:"pointer",fontSize:16}}>
                {showPass?"🙈":"👁️"}
              </button>
            </div>
          </div>
          {error&&<div style={{marginBottom:14,padding:"10px 14px",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan}}>⚠️ {error}</div>}
          <button onClick={handle} disabled={loading} style={{width:"100%",padding:"13px 0",borderRadius:12,background:T.acc,border:"none",color:T.bg,fontSize:15,fontWeight:800,cursor:"pointer",opacity:loading?.7:1,fontFamily:"inherit"}}>
            {loading?"Verifying...":"Sign In →"}
          </button>
          <div style={{marginTop:16,padding:"10px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,fontSize:11,color:T.tm}}>
            🔐 MedGuard administrators only.
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── OVERVIEW ───────────────────────────────────────────────────────────────────
function OverviewTab({data}){
  const totalRev=data.families.reduce((s,f)=>s+f.revenue,0);
  const active=data.families.filter(f=>f.status==="active").length;
  const trial=data.families.filter(f=>f.status==="trial").length;
  const pending=data.families.filter(f=>f.status==="pending").length;
  const allSeniors=data.families.flatMap(f=>f.seniors);
  const avgAdh=allSeniors.length>0?Math.round(allSeniors.reduce((s,sr)=>s+(sr.adherence||0),0)/allSeniors.length):0;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <StatCard label="Monthly Revenue" value={`₹${totalRev}`} sub="This month" color={T.gold} icon="💰"/>
        <StatCard label="Active Clients" value={active} sub={`${trial} trial · ${pending} pending`} color={T.acc} icon="👨‍👩‍👧"/>
        <StatCard label="Seniors Monitored" value={allSeniors.length} sub="Across all families" color={T.blu} icon="👴"/>
        <StatCard label="Avg Adherence" value={`${avgAdh}%`} sub="All seniors" color={avgAdh>=80?T.safe:T.warn} icon="💊"/>
      </div>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:14}}>💰 Revenue Breakdown</div>
        {[
          {label:"Pro (₹199/mo)",count:data.families.filter(f=>f.plan==="pro").length,color:T.gold,rev:data.families.filter(f=>f.plan==="pro").length*199},
          {label:"Basic (₹99/mo)",count:data.families.filter(f=>f.plan==="basic").length,color:T.acc,rev:data.families.filter(f=>f.plan==="basic").length*99},
          {label:"Trial (Free)",count:trial,color:T.warn,rev:0},
        ].map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:T.hi,marginBottom:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:p.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:T.tx}}>{p.label}</div>
              <div style={{fontSize:11,color:T.tm}}>{p.count} families</div>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:p.color}}>₹{p.rev}/mo</div>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",borderRadius:10,background:T.accD,border:`1px solid ${T.accM}`}}>
          <span style={{fontSize:13,fontWeight:700,color:T.acc}}>Total</span>
          <span style={{fontSize:16,fontWeight:900,color:T.acc}}>₹{totalRev}/mo · ₹{totalRev*12}/yr</span>
        </div>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>🚨 Alerts</div>
        {data.alerts.map(a=>(
          <div key={a.id} style={{padding:"10px 12px",borderRadius:10,background:a.severity==="danger"?T.danD:T.warnD,border:`1px solid ${a.severity==="danger"?T.dan:T.warn}33`,display:"flex",gap:10,marginBottom:8}}>
            <span>{a.severity==="danger"?"🔴":"🟡"}</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:a.severity==="danger"?T.dan:T.warn}}>{a.family}{a.senior?` · ${a.senior}`:""}</div>
              <div style={{fontSize:11,color:T.tx}}>{a.msg}</div>
              <div style={{fontSize:10,color:T.tm}}>{a.time}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── CLIENTS TAB ────────────────────────────────────────────────────────────────
function ClientsTab({data,onView,onCreateFamily,onInvite}){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const statusColor={active:T.safe,trial:T.warn,inactive:T.dan,pending:T.vio};
  const planColor={pro:T.gold,basic:T.acc,trial:T.warn};
  const inviteColor={accepted:T.safe,pending:T.warn};

  const filtered=data.families.filter(f=>{
    const ms=f.name.toLowerCase().includes(search.toLowerCase())||f.email.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="all"||f.status===filter||f.plan===filter;
    return ms&&mf;
  });

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Create new family button */}
      <button onClick={onCreateFamily} style={{width:"100%",padding:"14px 0",borderRadius:14,background:`linear-gradient(135deg,${T.accD},${T.bluD})`,border:`2px solid ${T.acc}55`,color:T.acc,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        ➕ Create New Family Account
      </button>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search families..."
        style={{width:"100%",padding:"11px 14px",borderRadius:12,background:T.sur,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>

      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["all","active","trial","pending","inactive","pro","basic"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${filter===f?T.acc:T.bd}`,background:filter===f?T.accD:T.sur,color:filter===f?T.acc:T.tm,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
            {f}
          </button>
        ))}
      </div>

      <div style={{fontSize:11,color:T.tm}}>{filtered.length} of {data.families.length} families</div>

      {filtered.map(f=>{
        const avgAdh=f.seniors.length>0?Math.round(f.seniors.reduce((s,sr)=>s+(sr.adherence||0),0)/f.seniors.length):0;
        return(
          <div key={f.id} style={{background:T.sur,border:`1px solid ${f.status==="pending"?T.vio+"44":T.bd}`,borderRadius:16,padding:16}}>
            <div onClick={()=>onView(f)} style={{cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:T.tx}}>{f.name}</div>
                  <div style={{fontSize:11,color:T.tm,marginTop:2}}>{f.email}</div>
                  <div style={{fontSize:11,color:T.tm}}>{f.phone}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                  <Chip color={statusColor[f.status]||T.tm}>{f.status}</Chip>
                  <Chip color={planColor[f.plan]||T.tm}>{f.plan}</Chip>
                  {f.inviteStatus&&<Chip color={inviteColor[f.inviteStatus]||T.tm}>invite: {f.inviteStatus}</Chip>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:10}}>
                {[
                  {l:"Seniors",v:f.seniors.length,c:T.blu},
                  {l:"Medicines",v:f.totalMeds,c:T.vio},
                  {l:"Revenue",v:`₹${f.revenue}`,c:T.gold},
                  {l:"Adherence",v:`${avgAdh}%`,c:avgAdh>=80?T.safe:avgAdh>=60?T.warn:T.dan},
                ].map(s=>(
                  <div key={s.l} style={{textAlign:"center",padding:"6px 4px",borderRadius:8,background:T.hi}}>
                    <div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:9,color:T.tm,marginTop:1}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite actions */}
            {f.inviteToken&&(
              <div style={{borderTop:`1px solid ${T.bd}`,paddingTop:10,display:"flex",gap:8}}>
                <button onClick={()=>onInvite(f)} style={{flex:1,padding:"8px 0",borderRadius:10,background:T.accD,border:`1px solid ${T.accM}`,color:T.acc,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  📨 {f.inviteStatus==="pending"?"Resend Invite":"View Invite"}
                </button>
                {f.inviteStatus==="pending"&&(
                  <div style={{padding:"8px 12px",borderRadius:10,background:T.vioD,border:`1px solid ${T.vio}33`,fontSize:11,color:T.vio,display:"flex",alignItems:"center"}}>
                    ⏳ Waiting for family to accept
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── CLIENT DETAIL ──────────────────────────────────────────────────────────────
function ClientDetail({client,onBack,onUpdate,onInvite}){
  const [plan,setPlan]=useState(client.plan);
  const [status,setStatus]=useState(client.status);
  const [showMsg,setShowMsg]=useState(false);
  const [msg,setMsg]=useState("");
  const [saved,setSaved]=useState(false);
  const planColor={pro:T.gold,basic:T.acc,trial:T.warn};
  const statusColor={active:T.safe,trial:T.warn,inactive:T.dan,pending:T.vio};

  const save=()=>{
    onUpdate({...client,plan,status});
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:T.acc,fontSize:13,fontWeight:700,cursor:"pointer",padding:0,fontFamily:"inherit"}}>
        ← Back to clients
      </button>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:T.tx}}>{client.name}</div>
            <div style={{fontSize:12,color:T.tm,marginTop:2}}>{client.email}</div>
            <div style={{fontSize:12,color:T.tm}}>{client.phone}</div>
            <div style={{fontSize:11,color:T.tf,marginTop:4}}>Joined {client.joined} · Last active {client.lastActive}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <Chip color={statusColor[status]||T.tm}>{status}</Chip>
            <Chip color={planColor[plan]||T.tm}>{plan}</Chip>
          </div>
        </div>

        {/* Invite status */}
        {client.inviteToken&&(
          <div style={{padding:"10px 12px",borderRadius:10,background:client.inviteStatus==="pending"?T.vioD:T.safeD,border:`1px solid ${client.inviteStatus==="pending"?T.vio:T.safe}33`,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:client.inviteStatus==="pending"?T.vio:T.safe,marginBottom:6}}>
              {client.inviteStatus==="pending"?"⏳ Invite Pending":"✅ Invite Accepted"}
            </div>
            {client.inviteStatus==="pending"&&(
              <button onClick={()=>onInvite(client)} style={{width:"100%",padding:"8px 0",borderRadius:8,background:T.vioD,border:`1px solid ${T.vio}44`,color:T.vio,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                📨 Resend Invite Link
              </button>
            )}
          </div>
        )}

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Change Plan</div>
          <div style={{display:"flex",gap:8}}>
            {["trial","basic","pro"].map(p=>(
              <button key={p} onClick={()=>setPlan(p)} style={{flex:1,padding:"8px 0",borderRadius:10,border:`2px solid ${plan===p?planColor[p]:T.bd}`,background:plan===p?planColor[p]+"22":T.hi,color:plan===p?planColor[p]:T.tm,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
                {p}
                <div style={{fontSize:10,fontWeight:400,marginTop:2}}>{p==="trial"?"Free":p==="basic"?"₹99/mo":"₹199/mo"}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Account Status</div>
          <div style={{display:"flex",gap:8}}>
            {["active","trial","inactive"].map(s=>(
              <button key={s} onClick={()=>setStatus(s)} style={{flex:1,padding:"8px 0",borderRadius:10,border:`2px solid ${status===s?statusColor[s]:T.bd}`,background:status===s?statusColor[s]+"22":T.hi,color:status===s?statusColor[s]:T.tm,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} style={{width:"100%",padding:"11px 0",borderRadius:12,background:saved?T.safe:T.acc,border:"none",color:T.bg,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>
          {saved?"✅ Saved!":"Save Changes"}
        </button>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>👴 Seniors ({client.seniors.length})</div>
        {client.seniors.map((s,i)=>(
          <div key={s.id} style={{padding:"12px 0",borderBottom:i<client.seniors.length-1?`1px solid ${T.bd}22`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.tx}}>{s.name}</div>
                <div style={{fontSize:11,color:T.tm}}>Age {s.age} · {s.medicines||0} medicines · {s.relation}</div>
              </div>
              <Chip color={s.adherence>=80?T.safe:s.adherence>=60?T.warn:T.dan}>{s.adherence||0}%</Chip>
            </div>
            <div style={{height:4,background:T.hi,borderRadius:4}}>
              <div style={{height:"100%",width:`${s.adherence||0}%`,background:s.adherence>=80?T.safe:s.adherence>=60?T.warn:T.dan,borderRadius:4}}/>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>📨 Message Family</div>
        {!showMsg?(
          <button onClick={()=>setShowMsg(true)} style={{width:"100%",padding:"10px 0",borderRadius:10,background:T.accD,border:`1px solid ${T.accM}`,color:T.acc,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            ✉️ Compose Message
          </button>
        ):(
          <>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Type your message..." rows={4}
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",resize:"none",marginBottom:10}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowMsg(false)} style={{flex:1,padding:"10px 0",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={()=>{setShowMsg(false);setMsg("");window.open(`https://wa.me/${client.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`);}} style={{flex:2,padding:"10px 0",borderRadius:10,background:"#128C7E",border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                💬 Send WhatsApp
              </button>
            </div>
          </>
        )}
      </Card>

      <Card style={{border:`1px solid ${T.dan}33`}}>
        <div style={{fontSize:13,fontWeight:800,color:T.dan,marginBottom:12}}>⚠️ Danger Zone</div>
        <button onClick={()=>alert("Suspended: "+client.name)} style={{width:"100%",padding:"10px 0",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,color:T.dan,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>
          🚫 Suspend Account
        </button>
        <button onClick={()=>{if(window.confirm("Delete "+client.name+"? Cannot be undone."))alert("Deleted");}} style={{width:"100%",padding:"10px 0",borderRadius:10,background:"transparent",border:`1px solid ${T.dan}44`,color:T.dan,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          🗑️ Delete Account & All Data
        </button>
      </Card>
    </div>
  );
}

// ── ALERTS TAB ─────────────────────────────────────────────────────────────────
function AlertsTab({data}){
  const [resolved,setResolved]=useState([]);
  const active=data.alerts.filter(a=>!resolved.includes(a.id));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,fontWeight:800,color:T.tx}}>{active.length} Active Alerts</div>
        {resolved.length>0&&<Chip color={T.safe}>{resolved.length} resolved</Chip>}
      </div>
      {active.length===0&&(
        <Card style={{textAlign:"center",padding:32}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontSize:15,fontWeight:700,color:T.tx}}>All Clear</div>
          <div style={{fontSize:12,color:T.tm,marginTop:4}}>No active alerts</div>
        </Card>
      )}
      {active.map(a=>(
        <Card key={a.id} style={{borderColor:a.severity==="danger"?T.dan+"44":T.warn+"44"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",gap:10}}>
              <span style={{fontSize:20}}>{a.severity==="danger"?"🔴":"🟡"}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:a.severity==="danger"?T.dan:T.warn}}>{a.family}{a.senior?` · ${a.senior}`:""}</div>
                <div style={{fontSize:12,color:T.tx,marginTop:4}}>{a.msg}</div>
                <div style={{fontSize:10,color:T.tm,marginTop:2}}>{a.time}</div>
              </div>
            </div>
            <Chip color={a.severity==="danger"?T.dan:T.warn}>{a.type.replace(/_/g," ")}</Chip>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setResolved(p=>[...p,a.id])} style={{flex:1,padding:"7px 0",borderRadius:8,background:T.safeD,border:`1px solid ${T.safe}44`,color:T.safe,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✅ Resolved</button>
            <button onClick={()=>alert("Contacting "+a.family)} style={{flex:1,padding:"7px 0",borderRadius:8,background:T.accD,border:`1px solid ${T.accM}`,color:T.acc,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📨 Contact</button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── SETTINGS TAB ───────────────────────────────────────────────────────────────
function SettingsTab({onLogout}){
  const [pricing,setPricing]=useState({basic:99,pro:199,trial:14});
  const [saved,setSaved]=useState(false);
  const [toggles,setToggles]=useState({maintenance:false,registrations:false,whatsapp:true,email:false});
  const toggle=k=>setToggles(p=>({...p,[k]:!p[k]}));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:14}}>👤 Admin Account</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:48,height:48,borderRadius:16,background:T.accD,border:`1px solid ${T.accM}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🛡️</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:T.tx}}>MedGuard Admin</div>
            <div style={{fontSize:12,color:T.tm}}>admin@medguard.in</div>
            <div style={{fontSize:11,color:T.acc,marginTop:2}}>Full Access</div>
          </div>
        </div>
        <button onClick={onLogout} style={{width:"100%",padding:"10px 0",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,color:T.dan,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          🚪 Logout
        </button>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:14}}>💰 Pricing</div>
        {[
          {key:"trial",label:"Trial Period",suffix:"days",color:T.warn},
          {key:"basic",label:"Basic Plan",suffix:"₹/month",color:T.acc},
          {key:"pro",label:"Pro Plan",suffix:"₹/month",color:T.gold},
        ].map(p=>(
          <div key={p.key} style={{marginBottom:14}}>
            <div style={{fontSize:11,color:p.color,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{p.label}</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input value={pricing[p.key]} onChange={e=>setPricing(prev=>({...prev,[p.key]:e.target.value}))} type="number"
                style={{flex:1,padding:"10px 12px",borderRadius:10,background:T.hi,border:`1px solid ${p.color}44`,color:T.tx,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
              <span style={{fontSize:12,color:T.tm,flexShrink:0}}>{p.suffix}</span>
            </div>
          </div>
        ))}
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{width:"100%",padding:"11px 0",borderRadius:12,background:saved?T.safe:T.acc,border:"none",color:T.bg,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>
          {saved?"✅ Saved!":"Save Pricing"}
        </button>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:4}}>⚙️ Settings</div>
        <Toggle label="Maintenance Mode" sub="Temporarily block all users" on={toggles.maintenance} onToggle={()=>toggle("maintenance")}/>
        <Toggle label="Public Signups" sub="Allow anyone to register (OFF = invite only)" on={toggles.registrations} onToggle={()=>toggle("registrations")}/>
        <Toggle label="WhatsApp Reminders" sub="Send reminders to all seniors" on={toggles.whatsapp} onToggle={()=>toggle("whatsapp")}/>
        <Toggle label="Email Reports" sub="Weekly reports to families" on={toggles.email} onToggle={()=>toggle("email")}/>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>🖥️ System</div>
        {[["Version","2.0.0"],["Database","Supabase"],["Hosting","Vercel"],["Deploy","Today"],["Storage","12.4 MB / 500 MB"]].map(([k,v],i)=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?`1px solid ${T.bd}22`:"none",fontSize:12}}>
            <span style={{color:T.tm}}>{k}</span>
            <span style={{color:T.tx,fontWeight:600}}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── INVITE ACCEPTED PAGE ───────────────────────────────────────────────────────
function InviteAcceptPage(){
  const params=new URLSearchParams(window.location.search);
  const name=decodeURIComponent(params.get("name")||"");
  const email=decodeURIComponent(params.get("email")||"");
  const token=params.get("token");
  const [pass,setPass]=useState("");
  const [confirm,setConfirm]=useState("");
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");

  const setup=()=>{
    if(!pass||pass.length<6){setError("Password must be at least 6 characters");return;}
    if(pass!==confirm){setError("Passwords do not match");return;}
    setDone(true);
  };

  if(done){
    return(
      <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Segoe UI',sans-serif"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div style={{textAlign:"center",maxWidth:360}}>
          <div style={{fontSize:64,marginBottom:16}}>🎉</div>
          <div style={{fontSize:22,fontWeight:900,color:"#E2E8F0",marginBottom:8}}>Account Created!</div>
          <div style={{fontSize:14,color:"#718096",marginBottom:24}}>Welcome to MedGuard, {name}. Your account is ready.</div>
          <button onClick={()=>window.location.href="/"} style={{width:"100%",padding:"14px 0",borderRadius:12,background:"#00D4AA",border:"none",color:"#0D1117",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            Open MedGuard →
          </button>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Segoe UI',sans-serif"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}input{font-family:inherit;}`}</style>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:12}}>💊</div>
          <div style={{fontSize:22,fontWeight:900,color:"#E2E8F0"}}>You're Invited!</div>
          <div style={{fontSize:13,color:"#718096",marginTop:6}}>Set up your MedGuard account</div>
        </div>

        <div style={{background:"#161B22",border:"1px solid #2D3748",borderRadius:16,padding:24}}>
          <div style={{padding:"12px 14px",borderRadius:10,background:"#00D4AA18",border:"1px solid #00D4AA33",marginBottom:20}}>
            <div style={{fontSize:12,color:"#00D4AA",fontWeight:700,marginBottom:4}}>Welcome to MedGuard</div>
            <div style={{fontSize:13,color:"#E2E8F0"}}>{name}</div>
            <div style={{fontSize:11,color:"#718096"}}>{email}</div>
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"#718096",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Create Password</div>
            <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Minimum 6 characters" type="password"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:"#1C2330",border:"1px solid #2D3748",color:"#E2E8F0",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:"#718096",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Confirm Password</div>
            <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Type password again" type="password"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:"#1C2330",border:"1px solid #2D3748",color:"#E2E8F0",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>

          {error&&<div style={{marginBottom:14,padding:"10px 14px",borderRadius:10,background:"#FC818118",border:"1px solid #FC818144",fontSize:13,color:"#FC8181"}}>⚠️ {error}</div>}

          <button onClick={setup} style={{width:"100%",padding:"13px 0",borderRadius:12,background:"#00D4AA",border:"none",color:"#0D1117",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            Create Account →
          </button>
        </div>

        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#4A5568"}}>
          Need help? Contact admin@medguard.in
        </div>
      </div>
    </div>
  );
}

// ── MAIN ADMIN ─────────────────────────────────────────────────────────────────
export default function Admin(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [tab,setTab]=useState("overview");
  const [selectedClient,setSelectedClient]=useState(null);
  const [showCreate,setShowCreate]=useState(false);
  const [inviteFamily,setInviteFamily]=useState(null);
  const [data,setData]=useState({families:INIT_FAMILIES,alerts:INIT_ALERTS});

  // Check if this is invite page
  if(window.location.pathname==="/invite"){
    return <InviteAcceptPage/>;
  }

  const updateClient=(updated)=>{
    setData(p=>({...p,families:p.families.map(f=>f.id===updated.id?updated:f)}));
    setSelectedClient(updated);
  };

  const createFamily=(newFamily)=>{
    setData(p=>({...p,families:[...p.families,newFamily]}));
    setShowCreate(false);
    setInviteFamily(newFamily);
  };

  if(!loggedIn){
    return(
      <div style={{fontFamily:"'Segoe UI',sans-serif"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}input,textarea{font-family:inherit;}`}</style>
        <AdminLogin onLogin={()=>setLoggedIn(true)}/>
      </div>
    );
  }

  const tabs=[
    {id:"overview",label:"Overview",icon:"📊"},
    {id:"clients",label:"Clients",icon:"👨‍👩‍👧"},
    {id:"alerts",label:"Alerts",icon:"🚨"},
    {id:"settings",label:"Settings",icon:"⚙️"},
  ];

  return(
    <div style={{fontFamily:"'Segoe UI',sans-serif",background:T.bg,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        input,select,textarea{font-family:inherit;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#1A2E45;border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>

      {showCreate&&<CreateFamilyModal onSave={createFamily} onClose={()=>setShowCreate(false)}/>}
      {inviteFamily&&<InviteLink family={inviteFamily} onClose={()=>setInviteFamily(null)}/>}

      <div style={{padding:"14px 16px",background:T.sur,borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:T.accD,border:`1px solid ${T.accM}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🛡️</div>
          <div>
            <div style={{fontSize:14,fontWeight:900,color:T.tx}}>MedGuard Admin</div>
            <div style={{fontSize:10,color:T.tm}}>Management Panel</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:T.safe,animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:11,color:T.safe,fontWeight:600}}>Live</span>
        </div>
      </div>

      <div style={{padding:16,paddingBottom:80}}>
        {selectedClient&&tab==="clients"?(
          <ClientDetail client={selectedClient} onBack={()=>setSelectedClient(null)} onUpdate={updateClient} onInvite={setInviteFamily}/>
        ):(
          <>
            {tab==="overview"&&<OverviewTab data={data}/>}
            {tab==="clients"&&<ClientsTab data={data} onView={setSelectedClient} onCreateFamily={()=>setShowCreate(true)} onInvite={setInviteFamily}/>}
            {tab==="alerts"&&<AlertsTab data={data}/>}
            {tab==="settings"&&<SettingsTab onLogout={()=>setLoggedIn(false)}/>}
          </>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,display:"flex",background:T.sur,borderTop:`1px solid ${T.bd}`,paddingBottom:2}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSelectedClient(null);}} style={{flex:1,padding:"8px 0 4px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:tab===t.id?T.acc:T.tf}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}