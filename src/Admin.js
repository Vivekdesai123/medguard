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

const MOCK = {
  families:[
    {id:1,name:"Kumar Family",email:"rajan.kumar@gmail.com",phone:"+91 98765 43210",plan:"pro",status:"active",joined:"Apr 1, 2026",lastActive:"Today",seniors:[{id:1,name:"Rajan Kumar",age:72,medicines:4,adherence:87},{id:2,name:"Kamla Kumar",age:68,medicines:3,adherence:92}],totalMeds:7,revenue:199},
    {id:2,name:"Sharma Family",email:"priya.sharma@gmail.com",phone:"+91 87654 32109",plan:"basic",status:"active",joined:"Apr 15, 2026",lastActive:"Yesterday",seniors:[{id:3,name:"Ram Sharma",age:75,medicines:6,adherence:71}],totalMeds:6,revenue:99},
    {id:3,name:"Patel Family",email:"amit.patel@gmail.com",phone:"+91 76543 21098",plan:"trial",status:"trial",joined:"May 10, 2026",lastActive:"Today",seniors:[{id:4,name:"Bhavna Patel",age:70,medicines:2,adherence:95}],totalMeds:2,revenue:0},
    {id:4,name:"Singh Family",email:"gurpreet.singh@gmail.com",phone:"+91 65432 10987",plan:"basic",status:"inactive",joined:"Mar 1, 2026",lastActive:"2 weeks ago",seniors:[{id:5,name:"Harjit Singh",age:80,medicines:5,adherence:45}],totalMeds:5,revenue:99},
    {id:5,name:"Desai Family",email:"neha.desai@gmail.com",phone:"+91 54321 09876",plan:"pro",status:"active",joined:"Mar 20, 2026",lastActive:"Today",seniors:[{id:6,name:"Ramesh Desai",age:77,medicines:8,adherence:83}],totalMeds:8,revenue:199},
  ],
  alerts:[
    {id:1,type:"low_stock",family:"Kumar Family",senior:"Rajan Kumar",msg:"Vitamin D3 — 3 days left",severity:"danger",time:"2h ago"},
    {id:2,type:"missed",family:"Singh Family",senior:"Harjit Singh",msg:"Missed 3 doses this week",severity:"danger",time:"5h ago"},
    {id:3,type:"trial_ending",family:"Patel Family",senior:"",msg:"Trial ends in 4 days",severity:"warn",time:"1d ago"},
    {id:4,type:"inactive",family:"Singh Family",senior:"",msg:"No login in 14 days",severity:"warn",time:"2d ago"},
    {id:5,type:"low_stock",family:"Sharma Family",senior:"Ram Sharma",msg:"Amlodipine — 5 days left",severity:"warn",time:"3h ago"},
  ],
};

// ── PRIMITIVES ─────────────────────────────────────────────────────────────────
function Chip({children,color}){
  return(
    <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:color+"22",color,border:`1px solid ${color}33`,letterSpacing:".03em"}}>
      {children}
    </span>
  );
}

function Card({children,style={}}){
  return(
    <div style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:16,...style}}>
      {children}
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

// ── LOGIN ──────────────────────────────────────────────────────────────────────
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
          <div style={{width:64,height:64,borderRadius:20,background:T.accD,border:`2px solid ${T.accM}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px"}}>
            🛡️
          </div>
          <div style={{fontSize:22,fontWeight:900,color:T.tx}}>MedGuard Admin</div>
          <div style={{fontSize:12,color:T.tm,marginTop:4}}>Secure admin access only</div>
        </div>

        <Card style={{padding:24}}>
          <div style={{fontSize:16,fontWeight:800,color:T.tx,marginBottom:20}}>Sign In to Admin Panel</div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Admin Email</div>
            <input
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="admin@medguard.in"
              type="email"
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
            />
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Password</div>
            <div style={{position:"relative"}}>
              <input
                value={pass}
                onChange={e=>setPass(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handle()}
                placeholder="Admin password"
                type={showPass?"text":"password"}
                style={{width:"100%",padding:"11px 44px 11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              />
              <button
                onClick={()=>setShowPass(!showPass)}
                style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.tm,cursor:"pointer",fontSize:16}}
              >
                {showPass?"🙈":"👁️"}
              </button>
            </div>
          </div>

          {error&&(
            <div style={{marginBottom:14,padding:"10px 14px",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan}}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handle}
            disabled={loading}
            style={{width:"100%",padding:"13px 0",borderRadius:12,background:T.acc,border:"none",color:T.bg,fontSize:15,fontWeight:800,cursor:"pointer",opacity:loading?.7:1,fontFamily:"inherit"}}
          >
            {loading?"Verifying...":"Sign In →"}
          </button>

          <div style={{marginTop:16,padding:"10px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,fontSize:11,color:T.tm}}>
            🔐 This page is for MedGuard administrators only.
          </div>
        </Card>

        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:T.tf}}>
          MedGuard Admin Panel v2.0 · Confidential
        </div>
      </div>
    </div>
  );
}

// ── OVERVIEW ───────────────────────────────────────────────────────────────────
function OverviewTab({data}){
  const totalRev=data.families.reduce((s,f)=>s+f.revenue,0);
  const active=data.families.filter(f=>f.status==="active").length;
  const trial=data.families.filter(f=>f.status==="trial").length;
  const allSeniors=data.families.flatMap(f=>f.seniors);
  const avgAdh=Math.round(allSeniors.reduce((s,sr)=>s+sr.adherence,0)/allSeniors.length);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <StatCard label="Monthly Revenue" value={`₹${totalRev}`} sub="This month" color={T.gold} icon="💰"/>
        <StatCard label="Active Clients" value={active} sub={`${trial} on trial`} color={T.acc} icon="👨‍👩‍👧"/>
        <StatCard label="Seniors Monitored" value={allSeniors.length} sub="Across all families" color={T.blu} icon="👴"/>
        <StatCard label="Avg Adherence" value={`${avgAdh}%`} sub="All seniors" color={avgAdh>=80?T.safe:T.warn} icon="💊"/>
      </div>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:14}}>💰 Revenue Breakdown</div>
        {[
          {label:"Pro Plan (₹199/month)",count:data.families.filter(f=>f.plan==="pro").length,color:T.gold,rev:data.families.filter(f=>f.plan==="pro").length*199},
          {label:"Basic Plan (₹99/month)",count:data.families.filter(f=>f.plan==="basic").length,color:T.acc,rev:data.families.filter(f=>f.plan==="basic").length*99},
          {label:"Trial (Free)",count:trial,color:T.warn,rev:0},
        ].map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:p.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:T.tx}}>{p.label}</div>
              <div style={{fontSize:11,color:T.tm}}>{p.count} families</div>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:p.color}}>₹{p.rev}/mo</div>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",borderRadius:10,background:T.accD,border:`1px solid ${T.accM}`,marginBottom:6}}>
          <span style={{fontSize:13,fontWeight:700,color:T.acc}}>Total Monthly</span>
          <span style={{fontSize:16,fontWeight:900,color:T.acc}}>₹{totalRev}/mo</span>
        </div>
        <div style={{fontSize:11,color:T.tm,textAlign:"center"}}>Annual projection: ₹{totalRev*12}/year</div>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>🚨 Alerts Requiring Action</div>
        {data.alerts.map(a=>(
          <div key={a.id} style={{padding:"10px 12px",borderRadius:10,background:a.severity==="danger"?T.danD:T.warnD,border:`1px solid ${a.severity==="danger"?T.dan:T.warn}33`,display:"flex",gap:10,marginBottom:8}}>
            <span style={{fontSize:16}}>{a.severity==="danger"?"🔴":"🟡"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:a.severity==="danger"?T.dan:T.warn}}>
                {a.family}{a.senior?` · ${a.senior}`:""}
              </div>
              <div style={{fontSize:11,color:T.tx}}>{a.msg}</div>
              <div style={{fontSize:10,color:T.tm,marginTop:2}}>{a.time}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>📊 Quick Stats</div>
        {[
          {k:"Total medicines tracked",v:data.families.reduce((s,f)=>s+f.totalMeds,0)+" medicines"},
          {k:"Low adherence seniors (<70%)",v:allSeniors.filter(s=>s.adherence<70).length+" seniors"},
          {k:"Trial conversions this week",v:"2 families"},
          {k:"Support tickets open",v:"0 tickets"},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<3?`1px solid ${T.bd}22`:"none"}}>
            <span style={{fontSize:12,color:T.tm}}>{s.k}</span>
            <span style={{fontSize:12,fontWeight:700,color:T.tx}}>{s.v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── CLIENTS ────────────────────────────────────────────────────────────────────
function ClientsTab({data,onView}){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const statusColor={active:T.safe,trial:T.warn,inactive:T.dan};
  const planColor={pro:T.gold,basic:T.acc,trial:T.warn};

  const filtered=data.families.filter(f=>{
    const ms=f.name.toLowerCase().includes(search.toLowerCase())||f.email.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="all"||f.status===filter||f.plan===filter;
    return ms&&mf;
  });

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <input
        value={search}
        onChange={e=>setSearch(e.target.value)}
        placeholder="🔍 Search families..."
        style={{width:"100%",padding:"11px 14px",borderRadius:12,background:T.sur,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
      />

      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["all","active","trial","inactive","pro","basic"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${filter===f?T.acc:T.bd}`,background:filter===f?T.accD:T.sur,color:filter===f?T.acc:T.tm,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
            {f}
          </button>
        ))}
      </div>

      <div style={{fontSize:11,color:T.tm}}>{filtered.length} of {data.families.length} clients</div>

      {filtered.map(f=>{
        const avgAdh=Math.round(f.seniors.reduce((s,sr)=>s+sr.adherence,0)/f.seniors.length);
        return(
          <div key={f.id} onClick={()=>onView(f)} style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:16,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:T.tx}}>{f.name}</div>
                <div style={{fontSize:11,color:T.tm,marginTop:2}}>{f.email}</div>
                <div style={{fontSize:11,color:T.tm}}>{f.phone}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                <Chip color={statusColor[f.status]||T.tm}>{f.status}</Chip>
                <Chip color={planColor[f.plan]||T.tm}>{f.plan}</Chip>
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
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.tm}}>
              <span>Joined {f.joined}</span>
              <span>Active {f.lastActive}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── CLIENT DETAIL ──────────────────────────────────────────────────────────────
function ClientDetail({client,onBack,onUpdate}){
  const [plan,setPlan]=useState(client.plan);
  const [status,setStatus]=useState(client.status);
  const [showMsg,setShowMsg]=useState(false);
  const [msg,setMsg]=useState("");
  const [saved,setSaved]=useState(false);

  const planColor={pro:T.gold,basic:T.acc,trial:T.warn};
  const statusColor={active:T.safe,trial:T.warn,inactive:T.dan};

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

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Change Plan</div>
          <div style={{display:"flex",gap:8}}>
            {["trial","basic","pro"].map(p=>(
              <button key={p} onClick={()=>setPlan(p)} style={{flex:1,padding:"8px 0",borderRadius:10,border:`2px solid ${plan===p?planColor[p]:T.bd}`,background:plan===p?planColor[p]+"22":T.hi,color:plan===p?planColor[p]:T.tm,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
                {p}
                <div style={{fontSize:10,fontWeight:400,marginTop:2}}>
                  {p==="trial"?"Free":p==="basic"?"₹99/mo":"₹199/mo"}
                </div>
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
                <div style={{fontSize:11,color:T.tm}}>Age {s.age} · {s.medicines} medicines</div>
              </div>
              <Chip color={s.adherence>=80?T.safe:s.adherence>=60?T.warn:T.dan}>{s.adherence}%</Chip>
            </div>
            <div style={{height:4,background:T.hi,borderRadius:4}}>
              <div style={{height:"100%",width:`${s.adherence}%`,background:s.adherence>=80?T.safe:s.adherence>=60?T.warn:T.dan,borderRadius:4}}/>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>📨 Send Message to Family</div>
        {!showMsg?(
          <button onClick={()=>setShowMsg(true)} style={{width:"100%",padding:"10px 0",borderRadius:10,background:T.accD,border:`1px solid ${T.accM}`,color:T.acc,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            ✉️ Compose Message
          </button>
        ):(
          <>
            <textarea
              value={msg}
              onChange={e=>setMsg(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",resize:"none",marginBottom:10}}
            />
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowMsg(false)} style={{flex:1,padding:"10px 0",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={()=>{setShowMsg(false);setMsg("");alert("Message sent to "+client.name);}} style={{flex:2,padding:"10px 0",borderRadius:10,background:T.acc,border:"none",color:T.bg,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Send Message
              </button>
            </div>
          </>
        )}
      </Card>

      <Card style={{border:`1px solid ${T.dan}33`}}>
        <div style={{fontSize:13,fontWeight:800,color:T.dan,marginBottom:12}}>⚠️ Danger Zone</div>
        <button onClick={()=>alert("Account suspended: "+client.name)} style={{width:"100%",padding:"10px 0",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,color:T.dan,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>
          🚫 Suspend Account
        </button>
        <button onClick={()=>{if(window.confirm("Delete "+client.name+"? Cannot be undone."))alert("Deleted");}} style={{width:"100%",padding:"10px 0",borderRadius:10,background:"transparent",border:`1px solid ${T.dan}44`,color:T.dan,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          🗑️ Delete Account & All Data
        </button>
      </Card>
    </div>
  );
}

// ── ALERTS ─────────────────────────────────────────────────────────────────────
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
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:20}}>{a.severity==="danger"?"🔴":"🟡"}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:a.severity==="danger"?T.dan:T.warn}}>{a.family}</div>
                {a.senior&&<div style={{fontSize:11,color:T.tm}}>{a.senior}</div>}
                <div style={{fontSize:12,color:T.tx,marginTop:4}}>{a.msg}</div>
                <div style={{fontSize:10,color:T.tm,marginTop:2}}>{a.time}</div>
              </div>
            </div>
            <Chip color={a.severity==="danger"?T.dan:T.warn}>{a.type.replace(/_/g," ")}</Chip>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setResolved(p=>[...p,a.id])} style={{flex:1,padding:"7px 0",borderRadius:8,background:T.safeD,border:`1px solid ${T.safe}44`,color:T.safe,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              ✅ Resolved
            </button>
            <button onClick={()=>alert("Message sent to "+a.family)} style={{flex:1,padding:"7px 0",borderRadius:8,background:T.accD,border:`1px solid ${T.accM}`,color:T.acc,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              📨 Contact
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── SETTINGS ───────────────────────────────────────────────────────────────────
function SettingsTab({onLogout}){
  const [pricing,setPricing]=useState({basic:99,pro:199,trial:14});
  const [saved,setSaved]=useState(false);
  const [toggles,setToggles]=useState({maintenance:false,registrations:true,whatsapp:true,email:false});

  const toggleItem=(key)=>setToggles(p=>({...p,[key]:!p[key]}));

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
          🚪 Logout from Admin
        </button>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:14}}>💰 Pricing Settings</div>
        {[
          {key:"trial",label:"Trial Period",suffix:"days",color:T.warn},
          {key:"basic",label:"Basic Plan",suffix:"₹/month",color:T.acc},
          {key:"pro",label:"Pro Plan",suffix:"₹/month",color:T.gold},
        ].map(p=>(
          <div key={p.key} style={{marginBottom:14}}>
            <div style={{fontSize:11,color:p.color,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{p.label}</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input
                value={pricing[p.key]}
                onChange={e=>setPricing(prev=>({...prev,[p.key]:e.target.value}))}
                type="number"
                style={{flex:1,padding:"10px 12px",borderRadius:10,background:T.hi,border:`1px solid ${p.color}44`,color:T.tx,fontSize:14,outline:"none",fontFamily:"inherit"}}
              />
              <span style={{fontSize:12,color:T.tm,flexShrink:0}}>{p.suffix}</span>
            </div>
          </div>
        ))}
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{width:"100%",padding:"11px 0",borderRadius:12,background:saved?T.safe:T.acc,border:"none",color:T.bg,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>
          {saved?"✅ Saved!":"Save Pricing"}
        </button>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:4}}>⚙️ App Settings</div>
        <Toggle label="Maintenance Mode" sub="Temporarily disable user access" on={toggles.maintenance} onToggle={()=>toggleItem("maintenance")}/>
        <Toggle label="New Registrations" sub="Allow new families to sign up" on={toggles.registrations} onToggle={()=>toggleItem("registrations")}/>
        <Toggle label="WhatsApp Reminders" sub="Send WhatsApp to all seniors" on={toggles.whatsapp} onToggle={()=>toggleItem("whatsapp")}/>
        <Toggle label="Email Reports" sub="Weekly email to all families" on={toggles.email} onToggle={()=>toggleItem("email")}/>
      </Card>

      <Card>
        <div style={{fontSize:13,fontWeight:800,color:T.tx,marginBottom:12}}>🖥️ System Info</div>
        {[
          {k:"App Version",v:"2.0.0"},
          {k:"Database",v:"Supabase (medguard-b6257)"},
          {k:"Hosting",v:"Vercel"},
          {k:"Last Deploy",v:"Today"},
          {k:"Storage Used",v:"12.4 MB / 500 MB"},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?`1px solid ${T.bd}22`:"none",fontSize:12}}>
            <span style={{color:T.tm}}>{s.k}</span>
            <span style={{color:T.tx,fontWeight:600}}>{s.v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
export default function Admin(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [tab,setTab]=useState("overview");
  const [selectedClient,setSelectedClient]=useState(null);
  const [data,setData]=useState(MOCK);

  const updateClient=(updated)=>{
    setData(p=>({...p,families:p.families.map(f=>f.id===updated.id?updated:f)}));
    setSelectedClient(updated);
  };

  if(!loggedIn){
    return(
      <div style={{fontFamily:"'Segoe UI',sans-serif"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}input,select,textarea{font-family:inherit;}`}</style>
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

      {/* Header */}
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

      {/* Content */}
      <div style={{padding:16,paddingBottom:80}}>
        {selectedClient&&tab==="clients"?(
          <ClientDetail client={selectedClient} onBack={()=>setSelectedClient(null)} onUpdate={updateClient}/>
        ):(
          <>
            {tab==="overview"&&<OverviewTab data={data}/>}
            {tab==="clients"&&<ClientsTab data={data} onView={setSelectedClient}/>}
            {tab==="alerts"&&<AlertsTab data={data}/>}
            {tab==="settings"&&<SettingsTab onLogout={()=>setLoggedIn(false)}/>}
          </>
        )}
      </div>

      {/* Bottom nav */}
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
