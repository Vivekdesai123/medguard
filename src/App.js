import { useState } from "react";

const T = {
  bg:"#0D1117",sur:"#161B22",hi:"#1C2330",
  bd:"#2D3748",acc:"#00D4AA",accD:"#00D4AA22",
  warn:"#F6AD55",dan:"#FC8181",danD:"#FC818122",
  safe:"#68D391",safeD:"#68D39122",
  vio:"#B794F4",blu:"#63B3ED",
  tx:"#E2E8F0",tm:"#718096",tf:"#4A5568",
};

const MEDS = [
  {id:1,name:"Metformin",dose:"500mg",tpd:2,times:["08:00","20:00"],stock:48,total:60,cat:"Diabetes",color:T.acc},
  {id:2,name:"Amlodipine",dose:"5mg",tpd:1,times:["09:00"],stock:12,total:30,cat:"BP",color:T.warn},
  {id:3,name:"Atorvastatin",dose:"10mg",tpd:1,times:["21:00"],stock:25,total:30,cat:"Cholesterol",color:T.vio},
  {id:4,name:"Vitamin D3",dose:"1000IU",tpd:1,times:["10:00"],stock:5,total:30,cat:"Supplement",color:T.blu},
];

const LOGS = [
  {id:1,med:"Metformin",time:"08:03",status:"taken",src:"app",day:"Today"},
  {id:2,med:"Amlodipine",time:"09:15",status:"taken",src:"whatsapp",day:"Today"},
  {id:3,med:"Atorvastatin",time:"21:00",status:"missed",src:"auto",day:"Yesterday"},
];

const daysLeft = m => Math.floor(m.stock / m.tpd);

function Chip({children,color}){
  return(
    <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:color+"22",color,border:`1px solid ${color}44`}}>
      {children}
    </span>
  );
}

function Card({children,style={}}){
  return(
    <div style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:18,...style}}>
      {children}
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [isSignup,setIsSignup]=useState(false);
  const [role,setRole]=useState("family");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handle=async()=>{
    if(!email||!pass){setError("Please fill all fields");return;}
    if(isSignup&&!name){setError("Please enter your name");return;}
    setError("");
    setLoading(true);
    // Simulate login - replace with real Supabase auth later
    setTimeout(()=>{
      setLoading(false);
      onLogin({name:name||email.split("@")[0],email,role});
    },1500);
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:8}}>💊</div>
          <div style={{fontSize:26,fontWeight:900,color:T.tx}}>MedGuard</div>
          <div style={{fontSize:13,color:T.tm,marginTop:4}}>Medicine Management System</div>
        </div>

        {/* Card */}
        <Card style={{padding:24}}>
          <div style={{fontSize:18,fontWeight:800,color:T.tx,marginBottom:20}}>
            {isSignup?"Create Account":"Welcome Back"}
          </div>

          {/* Role selector — only on signup */}
          {isSignup&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>
                I am a
              </div>
              <div style={{display:"flex",gap:10}}>
                {[
                  {id:"family",label:"👨‍👩‍👧 Family / Caretaker",sub:"Full access"},
                  {id:"senior",label:"👴 Senior Citizen",sub:"Medicine reminders only"},
                ].map(r=>(
                  <div key={r.id} onClick={()=>setRole(r.id)} style={{flex:1,padding:"12px 10px",borderRadius:12,cursor:"pointer",background:role===r.id?T.accD:T.hi,border:`2px solid ${role===r.id?T.acc:T.bd}`,textAlign:"center",transition:"all .2s"}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.tx}}>{r.label}</div>
                    <div style={{fontSize:11,color:T.tm,marginTop:2}}>{r.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Name field — only on signup */}
          {isSignup&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Full Name</div>
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder={role==="senior"?"e.g. Rajan Kumar":"e.g. Priya Kumar"}
                style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              />
            </div>
          )}

          {/* Email */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Email</div>
            <input
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="you@email.com"
              type="email"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
            />
          </div>

          {/* Password */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Password</div>
            <input
              value={pass}
              onChange={e=>setPass(e.target.value)}
              placeholder="minimum 6 characters"
              type="password"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
            />
          </div>

          {/* Error */}
          {error&&(
            <div style={{marginBottom:14,padding:"10px 14px",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan}}>
              ⚠️ {error}
            </div>
          )}

          {/* Button */}
          <button onClick={handle} disabled={loading} style={{width:"100%",padding:"13px 0",borderRadius:12,background:T.acc,border:"none",color:T.bg,fontSize:15,fontWeight:800,cursor:loading?"wait":"pointer",opacity:loading?.7:1}}>
            {loading?"Please wait...":(isSignup?"Create Account":"Sign In")}
          </button>

          {/* Toggle */}
          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.tm}}>
            {isSignup?"Already have an account? ":"Don't have an account? "}
            <span onClick={()=>{setIsSignup(!isSignup);setError("");}} style={{color:T.acc,fontWeight:700,cursor:"pointer"}}>
              {isSignup?"Sign In":"Sign Up"}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── SENIOR VIEW ───────────────────────────────────────────────────────────────
function SeniorView({user,meds,onAction,onLogout}){
  const [idx,setIdx]=useState(0);
  const [done,setDone]=useState({});
  const med=meds[idx];
  const responded=done[idx];
  const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  const date=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});

  const handle=(status)=>{
    setDone(p=>({...p,[idx]:status}));
    onAction(med.id,status);
    setTimeout(()=>{
      if(idx<meds.length-1){setIdx(i=>i+1);setDone({});}
    },1800);
  };

  return(
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>

      {/* Header */}
      <div style={{padding:"14px 20px",background:T.sur,borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:T.tx}}>Hello, {user.name} 👋</div>
          <div style={{fontSize:11,color:T.tm}}>{date}</div>
        </div>
        <button onClick={onLogout} style={{padding:"5px 12px",borderRadius:8,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:11,fontWeight:600,cursor:"pointer"}}>
          Logout
        </button>
      </div>

      {/* Main content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:24}}>

        {/* Time */}
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:52,fontWeight:900,color:T.tx,lineHeight:1}}>{t}</div>
          <div style={{fontSize:13,color:T.tm,marginTop:4}}>Current Time</div>
        </div>

        {/* Medicine card */}
        <div style={{width:"100%",padding:32,borderRadius:28,background:T.sur,border:`2px solid ${med.color}44`,boxShadow:`0 0 40px ${med.color}18`,textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:24,background:med.color+"22",border:`2px solid ${med.color}44`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36}}>
            💊
          </div>
          <div style={{fontSize:30,fontWeight:900,color:T.tx}}>{med.name}</div>
          <div style={{fontSize:18,color:T.tm,marginTop:6}}>{med.dose}</div>
          <div style={{fontSize:13,color:med.color,marginTop:4,fontWeight:600}}>{med.cat}</div>
          <div style={{fontSize:12,color:T.tm,marginTop:8}}>
            {med.times.join(" and ")}
          </div>

          {responded&&(
            <div style={{marginTop:20,padding:"14px",borderRadius:14,background:responded==="taken"?T.safeD:T.danD,border:`1px solid ${responded==="taken"?T.safe:T.dan}44`}}>
              <div style={{fontSize:18,fontWeight:800,color:responded==="taken"?T.safe:T.dan}}>
                {responded==="taken"?"✅ Well done! Recorded.":"📝 Noted. Your family has been informed."}
              </div>
            </div>
          )}
        </div>

        {/* Big buttons */}
        {!responded&&(
          <div style={{display:"flex",gap:16,width:"100%"}}>
            <button onClick={()=>handle("taken")} style={{flex:1,padding:"24px 0",borderRadius:22,background:T.safe,border:"none",fontSize:20,fontWeight:900,color:"#0D1117",cursor:"pointer",boxShadow:`0 8px 24px ${T.safe}44`}}>
              ✅ TAKEN
            </button>
            <button onClick={()=>handle("missed")} style={{flex:1,padding:"24px 0",borderRadius:22,background:T.hi,border:`2px solid ${T.bd}`,fontSize:20,fontWeight:900,color:T.tm,cursor:"pointer"}}>
              ❌ SKIP
            </button>
          </div>
        )}

        {/* Progress dots */}
        <div style={{display:"flex",gap:8}}>
          {meds.map((_,i)=>(
            <div key={i} style={{width:i===idx?24:8,height:8,borderRadius:4,background:done[i]==="taken"?T.safe:done[i]?T.dan:i===idx?T.acc:T.bd,transition:"all .3s"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FAMILY DASHBOARD ──────────────────────────────────────────────────────────
function FamilyDashboard({user,meds,logs,onRefill,onLogout,onAction}){
  const [tab,setTab]=useState("overview");
  const [view,setView]=useState("family");

  const adh=()=>{
    if(!logs.length)return 75;
    return Math.round((logs.filter(l=>l.status==="taken").length/logs.length)*100);
  };

  if(view==="elderly"){
    return(
      <div style={{height:"100vh",background:T.bg}}>
        <div style={{padding:"12px 16px",background:T.sur,borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>setView("family")} style={{padding:"5px 12px",borderRadius:8,background:T.hi,border:`1px solid ${T.bd}`,color:T.acc,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            ← Back
          </button>
          <div style={{fontSize:13,fontWeight:700,color:T.tx}}>Elderly View Preview</div>
          <div/>
        </div>
        <SeniorView user={{name:"Rajan"}} meds={meds} onAction={onAction} onLogout={()=>setView("family")}/>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg}}>

      {/* Header */}
      <div style={{padding:"14px 16px 0",background:T.sur,borderBottom:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:T.tm,textTransform:"uppercase",letterSpacing:".1em"}}>Welcome back</div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>{user.name} 👋</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setView("elderly")} style={{padding:"5px 10px",borderRadius:8,background:T.accD,border:`1px solid ${T.acc}44`,color:T.acc,fontSize:11,fontWeight:700,cursor:"pointer"}}>
              👴 Preview
            </button>
            <button onClick={onLogout} style={{padding:"5px 10px",borderRadius:8,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:11,fontWeight:600,cursor:"pointer"}}>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex"}}>
          {["overview","medicines","history"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",border:"none",background:"transparent",cursor:"pointer",borderBottom:tab===t?`2px solid ${T.acc}`:"2px solid transparent",color:tab===t?T.acc:T.tm,fontSize:12,fontWeight:700,textTransform:"capitalize"}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:14}}>

        {tab==="overview"&&<>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {l:"Adherence",v:`${adh()}%`,c:T.acc},
              {l:"Medicines",v:meds.length,c:T.blu},
              {l:"Low Stock",v:meds.filter(m=>daysLeft(m)<=7).length,c:T.warn},
              {l:"Missed",v:logs.filter(l=>l.status==="missed").length,c:T.dan},
            ].map(s=>(
              <Card key={s.l} style={{textAlign:"center",padding:14}}>
                <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:11,color:T.tm,marginTop:2}}>{s.l}</div>
              </Card>
            ))}
          </div>

          {/* Alerts */}
          {meds.filter(m=>daysLeft(m)<=7).map(m=>(
            <div key={m.id} style={{padding:"12px 14px",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>⚠️</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.dan}}>{m.name}</div>
                <div style={{fontSize:12,color:T.tx}}>{daysLeft(m)} days left — refill needed</div>
              </div>
              <button onClick={()=>onRefill(m.id)} style={{padding:"5px 12px",borderRadius:8,background:T.dan+"33",border:`1px solid ${T.dan}66`,color:T.dan,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                Refill
              </button>
            </div>
          ))}

          {/* Today */}
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Today</div>
          {logs.filter(l=>l.day==="Today").map(l=>(
            <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:l.status==="taken"?T.safe:T.dan}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.tx}}>{l.med}</div>
                <div style={{fontSize:11,color:T.tm}}>{l.time} · via {l.src}</div>
              </div>
              <Chip color={l.status==="taken"?T.safe:T.dan}>{l.status}</Chip>
            </div>
          ))}
        </>}

        {tab==="medicines"&&meds.map(m=>{
          const d=daysLeft(m);
          const urg=d<=3?T.dan:d<=7?T.warn:T.acc;
          return(
            <Card key={m.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.tx}}>{m.name}</div>
                  <div style={{fontSize:12,color:T.tm}}>{m.dose} · {m.cat}</div>
                </div>
                <Chip color={urg}>{d}d left</Chip>
              </div>
              <div style={{height:4,background:T.hi,borderRadius:4,marginBottom:8}}>
                <div style={{height:"100%",width:`${(m.stock/m.total)*100}%`,background:urg,borderRadius:4}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.tm}}>
                <span>{m.times.join(" · ")}</span>
                <span>{m.stock}/{m.total} tablets</span>
              </div>
            </Card>
          );
        })}

        {tab==="history"&&logs.map((l,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:l.status==="taken"?T.safe:T.dan,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:T.tx}}>{l.med}</div>
              <div style={{fontSize:11,color:T.tm}}>{l.day} · {l.time} · {l.src}</div>
            </div>
            <Chip color={l.status==="taken"?T.safe:T.dan}>{l.status}</Chip>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [meds,setMeds]=useState(MEDS);
  const [logs,setLogs]=useState(LOGS);

  const handleLogin=(userData)=>{
    setUser(userData);
  };

  const handleLogout=()=>{
    setUser(null);
  };

  const handleAction=(medId,status)=>{
    const med=meds.find(m=>m.id===medId);
    if(!med)return;
    const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setLogs(p=>[{id:Date.now(),med:med.name,time:t,status,src:"app",day:"Today"},...p]);
    if(status==="taken")setMeds(p=>p.map(m=>m.id===medId?{...m,stock:Math.max(0,m.stock-1)}:m));
  };

  const handleRefill=(medId)=>{
    setMeds(p=>p.map(m=>m.id===medId?{...m,stock:m.total}:m));
  };

  // Not logged in — show login screen
  if(!user){
    return(
      <div style={{fontFamily:"'Segoe UI',sans-serif"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}input{font-family:inherit;}`}</style>
        <LoginScreen onLogin={handleLogin}/>
      </div>
    );
  }

  // Logged in as Senior — show only medicine taking screen
  if(user.role==="senior"){
    return(
      <div style={{fontFamily:"'Segoe UI',sans-serif"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <SeniorView user={user} meds={meds} onAction={handleAction} onLogout={handleLogout}/>
      </div>
    );
  }

  // Logged in as Family — show full dashboard
  return(
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}input{font-family:inherit;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2D3748;border-radius:2px;}`}</style>
      <FamilyDashboard
        user={user}
        meds={meds}
        logs={logs}
        onRefill={handleRefill}
        onLogout={handleLogout}
        onAction={handleAction}
      />
    </div>
  );
}
