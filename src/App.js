import { useState, useRef, useEffect } from "react";

const T = {
  bg:"#0D1117",sur:"#161B22",hi:"#1C2330",
  bd:"#2D3748",acc:"#00D4AA",accD:"#00D4AA22",
  warn:"#F6AD55",warnD:"#F6AD5522",
  dan:"#FC8181",danD:"#FC818122",
  safe:"#68D391",safeD:"#68D39122",
  vio:"#B794F4",vioD:"#B794F422",
  blu:"#63B3ED",bluD:"#63B3ED22",
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
  {id:4,med:"Vitamin D3",time:"10:05",status:"taken",src:"app",day:"Yesterday"},
];

const daysLeft = m => Math.floor(m.stock / m.tpd);
const adh = logs => {
  if(!logs.length) return 87;
  return Math.round((logs.filter(l=>l.status==="taken").length/logs.length)*100);
};

function Chip({children,color}){
  return <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:color+"22",color,border:`1px solid ${color}44`}}>{children}</span>;
}

function Card({children,style={}}){
  return <div style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:18,...style}}>{children}</div>;
}

function FamilyView({meds,logs,onRefill}){
  const [tab,setTab]=useState("overview");
  const tabs=["overview","medicines","history"];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"16px 16px 0",background:T.sur,borderBottom:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:T.tm,textTransform:"uppercase",letterSpacing:".1em"}}>Family Portal</div>
            <div style={{fontSize:20,fontWeight:800,color:T.tx}}>Rajan's Health</div>
          </div>
          <Chip color={T.acc}>● Live</Chip>
        </div>
        <div style={{display:"flex",gap:0}}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",border:"none",background:"transparent",cursor:"pointer",borderBottom:tab===t?`2px solid ${T.acc}`:"2px solid transparent",color:tab===t?T.acc:T.tm,fontSize:12,fontWeight:700,textTransform:"capitalize"}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {tab==="overview"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {l:"Adherence",v:`${adh(logs)}%`,c:T.acc},
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

          {meds.filter(m=>daysLeft(m)<=7).map(m=>(
            <div key={m.id} style={{padding:"12px 14px",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>⚠️</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.dan}}>{m.name}</div>
                <div style={{fontSize:12,color:T.tx}}>{daysLeft(m)} days left — refill needed</div>
              </div>
              <button onClick={()=>onRefill(m.id)} style={{padding:"4px 12px",borderRadius:8,background:T.dan+"33",border:`1px solid ${T.dan}66`,color:T.dan,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                Refill
              </button>
            </div>
          ))}

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

        {tab==="history"&&logs.map(l=>(
          <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`}}>
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

function ElderlyView({meds,onAction}){
  const [idx,setIdx]=useState(0);
  const [done,setDone]=useState({});
  const med=meds[idx];
  const responded=done[idx];
  const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});

  const handle=(status)=>{
    setDone(p=>({...p,[idx]:status}));
    onAction(med.id,status);
    setTimeout(()=>{
      if(idx<meds.length-1){setIdx(i=>i+1);setDone({});}
    },1500);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",height:"100%",padding:24}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,fontWeight:900,color:T.tx}}>{t}</div>
        <div style={{fontSize:13,color:T.tm}}>Medicine Time</div>
      </div>

      <div style={{width:"100%",padding:32,borderRadius:28,background:T.sur,border:`2px solid ${med.color}44`,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>💊</div>
        <div style={{fontSize:28,fontWeight:900,color:T.tx}}>{med.name}</div>
        <div style={{fontSize:18,color:T.tm,marginTop:4}}>{med.dose}</div>
        <div style={{fontSize:13,color:med.color,marginTop:4,fontWeight:600}}>{med.cat}</div>
        {responded&&(
          <div style={{marginTop:20,padding:"12px",borderRadius:12,background:responded==="taken"?T.safeD:T.danD,color:responded==="taken"?T.safe:T.dan,fontWeight:700,fontSize:16}}>
            {responded==="taken"?"✅ Recorded!":"📝 Noted. Family informed."}
          </div>
        )}
      </div>

      {!responded&&(
        <div style={{display:"flex",gap:16,width:"100%"}}>
          <button onClick={()=>handle("taken")} style={{flex:1,padding:"22px 0",borderRadius:20,background:T.safe,border:"none",fontSize:18,fontWeight:900,color:T.bg,cursor:"pointer"}}>
            ✅ TAKEN
          </button>
          <button onClick={()=>handle("missed")} style={{flex:1,padding:"22px 0",borderRadius:20,background:T.hi,border:`2px solid ${T.bd}`,fontSize:18,fontWeight:900,color:T.tm,cursor:"pointer"}}>
            ❌ SKIP
          </button>
        </div>
      )}

      <div style={{display:"flex",gap:8}}>
        {meds.map((_,i)=>(
          <div key={i} style={{width:i===idx?20:8,height:8,borderRadius:4,background:done[i]==="taken"?T.safe:done[i]?T.dan:i===idx?T.acc:T.bd,transition:"all .3s"}}/>
        ))}
      </div>
    </div>
  );
}

function WhatsAppView({meds,onAction}){
  const [msgs,setMsgs]=useState([
    {id:1,from:"bot",time:"08:00",text:"🌅 Good morning!\n\nTime to take:\n💊 *Metformin 500mg*\n\nReply:\n*1* TAKEN ✅\n*2* MISSED ❌"},
    {id:2,from:"user",time:"08:05",text:"1"},
    {id:3,from:"bot",time:"08:05",text:"✅ Metformin marked as taken!\nStock: 47 tablets remaining."},
  ]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const ref=useRef(null);

  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send=()=>{
    const msg=input.trim();
    if(!msg)return;
    const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>[...p,{id:Date.now(),from:"user",time:t,text:msg}]);
    setInput("");
    setTyping(true);
    const low=msg.toLowerCase();
    const taken=["1","taken","yes","haan","done","ok","li"].some(k=>low.includes(k));
    const missed=["2","missed","no","nahi","skip","bhool"].some(k=>low.includes(k));
    setTimeout(()=>{
      setTyping(false);
      if(taken){
        onAction(1,"taken");
        setMsgs(p=>[...p,{id:Date.now()+1,from:"bot",time:t,text:`✅ Metformin taken at ${t}\nFamily dashboard updated 🔄\nStock: 47 tablets`}]);
      } else if(missed){
        onAction(1,"missed");
        setMsgs(p=>[...p,{id:Date.now()+1,from:"bot",time:t,text:`📝 Missed noted at ${t}\nFamily has been alerted ⚠️\nReply 1 if you take it later.`}]);
      } else {
        setMsgs(p=>[...p,{id:Date.now()+1,from:"bot",time:t,text:"Reply *1* if TAKEN ✅ or *2* if MISSED ❌\n\nOr ask me anything about your medicines 😊"}]);
      }
    },1200);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#0B1014"}}>
      <div style={{padding:"12px 16px",background:"#1F2C34",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #2A3942"}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>💊</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#E9EDEF"}}>MedGuard Bot</div>
          <div style={{fontSize:12,color:"#8696A0"}}>🟢 Online</div>
        </div>
      </div>

      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:8,background:"#0D1418"}}>
        {msgs.map(m=>(
          <div key={m.id} style={{display:"flex",justifyContent:m.from==="bot"?"flex-start":"flex-end"}}>
            <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.from==="bot"?"0 16px 16px 16px":"16px 0 16px 16px",background:m.from==="bot"?"#1F2C34":"#005C4B",fontSize:14,lineHeight:1.7,color:"#E9EDEF",whiteSpace:"pre-line"}}>
              {m.text}
              <div style={{fontSize:10,color:"#8696A0",textAlign:"right",marginTop:4}}>{m.time}</div>
            </div>
          </div>
        ))}
        {typing&&(
          <div style={{padding:"10px 16px",borderRadius:"0 16px 16px 16px",background:"#1F2C34",display:"inline-flex",gap:4,alignSelf:"flex-start"}}>
            {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#8696A0",animation:"bounce 1.2s infinite",animationDelay:`${i*.2}s`}}/>)}
          </div>
        )}
        <div ref={ref}/>
      </div>

      <div style={{padding:"6px 12px 4px",background:"#0D1418",display:"flex",gap:6,flexWrap:"wrap"}}>
        {["1 - Taken","2 - Missed","Stock?","All meds?"].map(q=>(
          <button key={q} onClick={()=>setInput(q.split(" - ")[0])} style={{padding:"3px 10px",borderRadius:14,background:"#1F2C34",border:"1px solid #2A3942",color:"#8696A0",fontSize:11,cursor:"pointer"}}>
            {q}
          </button>
        ))}
      </div>

      <div style={{padding:"8px 10px",background:"#1F2C34",display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message..." style={{flex:1,padding:"10px 14px",borderRadius:20,background:"#2A3942",border:"none",outline:"none",color:"#E9EDEF",fontSize:14,fontFamily:"inherit"}}/>
        <button onClick={send} style={{width:42,height:42,borderRadius:"50%",background:"#00A884",border:"none",cursor:"pointer",fontSize:18}}>➤</button>
      </div>
    </div>
  );
}

export default function App(){
  const [meds,setMeds]=useState(MEDS);
  const [logs,setLogs]=useState(LOGS);
  const [view,setView]=useState("family");

  const handleAction=(medId,status)=>{
    const med=meds.find(m=>m.id===medId);
    if(!med)return;
    const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setLogs(p=>[{id:Date.now(),med:med.name,time:t,status,src:view==="elderly"?"app":"whatsapp",day:"Today"},...p]);
    if(status==="taken")setMeds(p=>p.map(m=>m.id===medId?{...m,stock:Math.max(0,m.stock-1)}:m));
  };

  const handleRefill=(medId)=>{
    setMeds(p=>p.map(m=>m.id===medId?{...m,stock:m.total}:m));
  };

  const nav=[
    {id:"family",label:"Family",icon:"👨‍👩‍👧"},
    {id:"elderly",label:"Elderly",icon:"👴"},
    {id:"whatsapp",label:"WhatsApp",icon:"💬"},
  ];

  return(
    <div style={{fontFamily:"'Segoe UI',sans-serif",background:T.bg,color:T.tx,height:"100vh",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#2D3748;border-radius:2px;}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
      `}</style>

      <div style={{padding:"10px 16px",background:T.sur,borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>💊</span>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:T.tx}}>MedGuard</div>
            <div style={{fontSize:10,color:T.tm}}>Medicine Manager</div>
          </div>
        </div>
        <Chip color={T.acc}>● Live Sync</Chip>
      </div>

      <div style={{flex:1,overflow:"hidden"}}>
        {view==="family"&&<FamilyView meds={meds} logs={logs} onRefill={handleRefill}/>}
        {view==="elderly"&&<ElderlyView meds={meds} onAction={handleAction}/>}
        {view==="whatsapp"&&<WhatsAppView meds={meds} onAction={handleAction}/>}
      </div>

      <div style={{display:"flex",background:T.sur,borderTop:`1px solid ${T.bd}`}}>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>setView(n.id)} style={{flex:1,padding:"10px 0 6px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:20}}>{n.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:view===n.id?T.acc:T.tf}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
