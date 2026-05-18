import { useState, useRef } from "react";
import Admin from './Admin';

const T = {
  bg:"#0D1117",sur:"#161B22",hi:"#1C2330",
  bd:"#2D3748",acc:"#00D4AA",accD:"#00D4AA22",accM:"#00D4AA44",
  warn:"#F6AD55",warnD:"#F6AD5522",
  dan:"#FC8181",danD:"#FC818122",
  safe:"#68D391",safeD:"#68D39122",
  vio:"#B794F4",vioD:"#B794F422",
  blu:"#63B3ED",bluD:"#63B3ED22",
  tx:"#E2E8F0",tm:"#718096",tf:"#4A5568",
};

const INIT_MEDS = [
  {id:1,name:"Metformin",dose:"500mg",tpd:2,times:["08:00","20:00"],
   prescribed:60,purchased:48,stock:48,cat:"Diabetes",color:T.acc,
   bills:[],prescriptions:[],instructions:""},
  {id:2,name:"Amlodipine",dose:"5mg",tpd:1,times:["09:00"],
   prescribed:30,purchased:12,stock:12,cat:"BP",color:T.warn,
   bills:[],prescriptions:[],instructions:""},
  {id:3,name:"Atorvastatin",dose:"10mg",tpd:1,times:["21:00"],
   prescribed:30,purchased:25,stock:25,cat:"Cholesterol",color:T.vio,
   bills:[],prescriptions:[],instructions:""},
  {id:4,name:"Vitamin D3",dose:"1000IU",tpd:1,times:["10:00"],
   prescribed:30,purchased:5,stock:5,cat:"Supplement",color:T.blu,
   bills:[],prescriptions:[],instructions:""},
];

const INIT_LOGS = [
  {id:1,med:"Metformin",time:"08:03",status:"taken",src:"app",day:"Today"},
  {id:2,med:"Amlodipine",time:"09:15",status:"taken",src:"whatsapp",day:"Today"},
  {id:3,med:"Atorvastatin",time:"21:00",status:"missed",src:"auto",day:"Yesterday"},
];

const COLORS=[T.acc,T.warn,T.vio,T.blu,T.safe,T.dan];
const CATS=["Diabetes","Blood Pressure","Cholesterol","Supplement","Thyroid","Gastric","Painkiller","Antibiotic","Other"];
const daysLeft=m=>Math.floor(m.stock/m.tpd);
const inventoryStatus=m=>{
  const diff=m.purchased-m.prescribed;
  if(diff===0) return {status:"exact",color:T.acc,msg:"Exactly as prescribed"};
  if(diff>0) return {status:"excess",color:T.safe,msg:`${diff} extra tablets purchased`};
  return {status:"short",color:T.dan,msg:`${Math.abs(diff)} tablets short — buy more`};
};

function Chip({children,color}){
  return <span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:color+"22",color,border:`1px solid ${color}44`}}>{children}</span>;
}
function Card({children,style={}}){
  return <div style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:18,...style}}>{children}</div>;
}
function Inp({label,value,onChange,placeholder,type="text"}){
  return(
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>{label}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
  );
}
function Btn({children,onClick,color=T.acc,outline,disabled,style={}}){
  return(
    <button onClick={onClick} disabled={disabled} style={{padding:"11px 20px",borderRadius:12,background:outline?color+"18":disabled?T.hi:color,border:`1px solid ${outline||disabled?color+"44":"transparent"}`,color:outline||disabled?color:T.bg,fontSize:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,display:"inline-flex",alignItems:"center",gap:6,fontFamily:"inherit",...style}}>
      {children}
    </button>
  );
}

// ── PRESCRIPTION SCANNER ──────────────────────────────────────────────────────
function PrescriptionScanner({onMedsFound,onClose}){
  const fileRef=useRef();
  const [image,setImage]=useState(null);
  const [scanning,setScanning]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState([]);

  const handleFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      setImage({url:ev.target.result,name:file.name,base64:ev.target.result.split(",")[1],type:file.type});
      setResult(null);setError("");
    };
    reader.readAsDataURL(file);
  };

  const scan=async()=>{
    if(!image)return;
    setScanning(true);setError("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          messages:[{
            role:"user",
            content:[
              {type:"image",source:{type:"base64",media_type:image.type,data:image.base64}},
              {type:"text",text:`This is a DOCTOR PRESCRIPTION. Extract all medicines prescribed.
Return ONLY a JSON array:
[{
  "name": "Medicine name",
  "dose": "e.g. 500mg",
  "cat": "Diabetes/Blood Pressure/Cholesterol/Supplement/Thyroid/Gastric/Painkiller/Antibiotic/Other",
  "tpd": 1,
  "times": ["08:00"],
  "prescribed": 30,
  "instructions": "e.g. after food"
}]
- prescribed = total tablets doctor has prescribed (look for quantity, days supply, #tablets)
- tpd = times per day (1-4)
- times = array based on tpd: morning=08:00, afternoon=14:00, evening=20:00, night=22:00
- If quantity not mentioned, calculate: tpd x days (assume 30 days if not specified)
Return ONLY JSON array, no other text.`}
            ]
          }]
        })
      });
      const data=await res.json();
      const text=data.content?.[0]?.text||"[]";
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      if(!Array.isArray(parsed)||parsed.length===0){
        setError("No medicines found. Try a clearer photo.");
      } else {
        setResult(parsed);
        setSelected(parsed.map((_,i)=>i));
      }
    }catch(e){
      setError("Could not read image. Try a clearer photo.");
    }
    setScanning(false);
  };

  const addSelected=()=>{
    const toAdd=result.filter((_,i)=>selected.includes(i)).map(m=>({
      id:Date.now()+Math.random(),
      name:m.name,dose:m.dose||"",cat:m.cat||"Other",
      tpd:m.tpd||1,times:m.times||["08:00"],
      prescribed:m.prescribed||30,
      purchased:0,
      stock:0,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],
      bills:[],
      prescriptions:[{id:Date.now(),url:image.url,name:image.name,date:new Date().toLocaleDateString("en-IN")}],
      instructions:m.instructions||""
    }));
    onMedsFound(toAdd);
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,maxHeight:"92vh",overflow:"auto",border:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>📋 Scan Prescription</div>
            <div style={{fontSize:12,color:T.tm}}>AI reads prescribed quantities automatically</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{padding:12,borderRadius:12,background:T.vioD,border:`1px solid ${T.vio}33`,marginBottom:16,fontSize:12,color:T.vio}}>
          📋 <strong>Prescription scan</strong> sets how many tablets the doctor prescribed. After this upload your purchase bill to track what you actually bought.
        </div>

        {!image?(
          <div onClick={()=>fileRef.current.click()} style={{width:"100%",padding:"32px 24px",borderRadius:16,border:`2px dashed ${T.bd}`,textAlign:"center",cursor:"pointer",background:T.hi}}>
            <div style={{fontSize:48,marginBottom:12}}>📋</div>
            <div style={{fontSize:15,fontWeight:700,color:T.tx,marginBottom:6}}>Upload Doctor Prescription</div>
            <div style={{fontSize:12,color:T.tm}}>AI reads medicines and prescribed quantities</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}} capture="environment"/>
          </div>
        ):(
          <div style={{marginBottom:16}}>
            <div style={{position:"relative",marginBottom:12}}>
              <img src={image.url} alt="prescription" style={{width:"100%",borderRadius:14,maxHeight:200,objectFit:"cover",border:`1px solid ${T.bd}`}}/>
              <button onClick={()=>{setImage(null);setResult(null);setError("");}} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",background:"#000a",border:"none",color:"#fff",fontSize:14,cursor:"pointer"}}>✕</button>
            </div>
            {!result&&!error&&(
              <Btn onClick={scan} disabled={scanning} style={{width:"100%",justifyContent:"center"}}>
                {scanning?"🔍 Reading prescription...":"🔍 Scan with AI"}
              </Btn>
            )}
          </div>
        )}

        {error&&(
          <div style={{padding:"12px 14px",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan,marginBottom:16}}>
            ⚠️ {error}
            <span onClick={()=>{setImage(null);setError("");}} style={{color:T.acc,fontWeight:700,cursor:"pointer",fontSize:12,marginLeft:8}}>Try again →</span>
          </div>
        )}

        {result&&result.length>0&&(
          <>
            <div style={{padding:"10px 14px",borderRadius:10,background:T.safeD,border:`1px solid ${T.safe}44`,fontSize:13,color:T.safe,marginBottom:14}}>
              ✅ Found {result.length} medicine{result.length>1?"s":""} — prescribed quantities detected
            </div>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Select medicines to add</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {result.map((m,i)=>(
                <div key={i} onClick={()=>setSelected(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{padding:14,borderRadius:14,background:selected.includes(i)?T.accD:T.hi,border:`2px solid ${selected.includes(i)?T.acc:T.bd}`,cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${selected.includes(i)?T.acc:T.tf}`,background:selected.includes(i)?T.acc:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      {selected.includes(i)&&<span style={{fontSize:12,color:T.bg,fontWeight:900}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,color:T.tx}}>{m.name}</div>
                      <div style={{fontSize:12,color:T.tm,marginTop:2}}>{m.dose} · {m.cat}</div>
                      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                        <Chip color={T.vio}>Prescribed: {m.prescribed} tablets</Chip>
                        <Chip color={T.acc}>{m.tpd}x per day</Chip>
                      </div>
                      <div style={{marginTop:8,padding:"6px 10px",borderRadius:8,background:T.warnD,fontSize:11,color:T.warn}}>
                        ⚠️ Stock = 0 until you upload purchase bill
                      </div>
                      {m.instructions&&<div style={{fontSize:11,color:T.vio,marginTop:6}}>💡 {m.instructions}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn outline onClick={()=>{setImage(null);setResult(null);}} style={{flex:1,justifyContent:"center"}}>Rescan</Btn>
              <Btn onClick={addSelected} disabled={selected.length===0} style={{flex:2,justifyContent:"center"}}>＋ Add {selected.length} Medicine{selected.length!==1?"s":""}</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── BILL SCANNER ──────────────────────────────────────────────────────────────
function BillScanner({meds,onUpdate,onClose}){
  const fileRef=useRef();
  const [image,setImage]=useState(null);
  const [scanning,setScanning]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [matches,setMatches]=useState([]);

  const handleFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      setImage({url:ev.target.result,name:file.name,base64:ev.target.result.split(",")[1],type:file.type});
      setResult(null);setError("");setMatches([]);
    };
    reader.readAsDataURL(file);
  };

  const scan=async()=>{
    if(!image)return;
    setScanning(true);setError("");
    try{
      const medNames=meds.map(m=>m.name).join(", ");
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          messages:[{
            role:"user",
            content:[
              {type:"image",source:{type:"base64",media_type:image.type,data:image.base64}},
              {type:"text",text:`This is a MEDICINE PURCHASE BILL from a pharmacy/medical store.
Known medicines in our system: ${medNames}

Extract ALL medicines purchased and their quantities.
Return ONLY a JSON array:
[{
  "name": "Medicine name exactly as in bill",
  "quantity": 30,
  "price": 150.50,
  "matched": "Closest medicine name from known list or null"
}]
- quantity = number of tablets/capsules purchased
- price = total price for this medicine (optional)
- matched = match to known medicine name if similar
Return ONLY JSON array, no other text.`}
            ]
          }]
        })
      });
      const data=await res.json();
      const text=data.content?.[0]?.text||"[]";
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      if(!Array.isArray(parsed)||parsed.length===0){
        setError("No medicines found in bill. Try a clearer photo.");
      } else {
        setResult(parsed);
        // Auto-match to existing medicines
        const matchResults=parsed.map(item=>{
          const matched=meds.find(m=>
            m.name.toLowerCase()===item.name.toLowerCase()||
            m.name.toLowerCase().includes(item.name.toLowerCase())||
            item.name.toLowerCase().includes(m.name.toLowerCase())||
            (item.matched&&m.name.toLowerCase()===item.matched.toLowerCase())
          );
          return {...item,medId:matched?.id||null,medName:matched?.name||null,selected:!!matched};
        });
        setMatches(matchResults);
      }
    }catch(e){
      setError("Could not read bill. Try a clearer photo.");
    }
    setScanning(false);
  };

  const updateMatch=(i,medId)=>{
    const med=meds.find(m=>m.id===parseInt(medId));
    setMatches(p=>p.map((m,idx)=>idx===i?{...m,medId:parseInt(medId),medName:med?.name||null}:m));
  };

  const toggleSelect=(i)=>{
    setMatches(p=>p.map((m,idx)=>idx===i?{...m,selected:!m.selected}:m));
  };

  const applyBill=()=>{
    const updates=[];
    matches.filter(m=>m.selected&&m.medId).forEach(match=>{
      updates.push({
        medId:match.medId,
        quantity:match.quantity,
        bill:{id:Date.now(),url:image.url,name:image.name,date:new Date().toLocaleDateString("en-IN"),quantity:match.quantity,price:match.price}
      });
    });
    onUpdate(updates);
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,maxHeight:"92vh",overflow:"auto",border:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>🧾 Scan Purchase Bill</div>
            <div style={{fontSize:12,color:T.tm}}>Updates actual stock purchased</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{padding:12,borderRadius:12,background:T.safeD,border:`1px solid ${T.safe}33`,marginBottom:16,fontSize:12,color:T.safe}}>
          🧾 <strong>Bill scan</strong> updates your actual purchased quantity and compares against prescription. Any difference is shown as shortage or excess.
        </div>

        {!image?(
          <div onClick={()=>fileRef.current.click()} style={{width:"100%",padding:"32px 24px",borderRadius:16,border:`2px dashed ${T.bd}`,textAlign:"center",cursor:"pointer",background:T.hi}}>
            <div style={{fontSize:48,marginBottom:12}}>🧾</div>
            <div style={{fontSize:15,fontWeight:700,color:T.tx,marginBottom:6}}>Upload Purchase Bill</div>
            <div style={{fontSize:12,color:T.tm}}>Medical store receipt, chemist bill, online pharmacy invoice</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}} capture="environment"/>
          </div>
        ):(
          <div style={{marginBottom:16}}>
            <div style={{position:"relative",marginBottom:12}}>
              <img src={image.url} alt="bill" style={{width:"100%",borderRadius:14,maxHeight:200,objectFit:"cover",border:`1px solid ${T.bd}`}}/>
              <button onClick={()=>{setImage(null);setResult(null);setError("");setMatches([]);}} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",background:"#000a",border:"none",color:"#fff",fontSize:14,cursor:"pointer"}}>✕</button>
            </div>
            {!result&&!error&&(
              <Btn onClick={scan} disabled={scanning} style={{width:"100%",justifyContent:"center"}}>
                {scanning?"🔍 Reading bill...":"🔍 Scan Bill with AI"}
              </Btn>
            )}
          </div>
        )}

        {error&&(
          <div style={{padding:"12px 14px",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan,marginBottom:16}}>
            ⚠️ {error}
            <span onClick={()=>{setImage(null);setError("");}} style={{color:T.acc,fontWeight:700,cursor:"pointer",fontSize:12,marginLeft:8}}>Try again →</span>
          </div>
        )}

        {matches.length>0&&(
          <>
            <div style={{padding:"10px 14px",borderRadius:10,background:T.safeD,border:`1px solid ${T.safe}44`,fontSize:13,color:T.safe,marginBottom:14}}>
              ✅ Found {matches.length} medicine{matches.length>1?"s":""} in bill
            </div>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Match bill items to medicines</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
              {matches.map((m,i)=>{
                const med=meds.find(x=>x.id===m.medId);
                const inv=med?inventoryStatus({...med,purchased:(med.purchased||0)+m.quantity}):null;
                return(
                  <div key={i} style={{padding:14,borderRadius:14,background:m.selected?T.safeD:T.hi,border:`2px solid ${m.selected?T.safe:T.bd}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div onClick={()=>toggleSelect(i)} style={{width:22,height:22,borderRadius:7,border:`2px solid ${m.selected?T.safe:T.tf}`,background:m.selected?T.safe:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                        {m.selected&&<span style={{fontSize:12,color:T.bg,fontWeight:900}}>✓</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:T.tx}}>{m.name}</div>
                        <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                          <Chip color={T.acc}>Bought: {m.quantity} tablets</Chip>
                          {m.price&&<Chip color={T.blu}>₹{m.price}</Chip>}
                        </div>
                      </div>
                    </div>

                    {/* Match to medicine */}
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:10,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Match to medicine</div>
                      <select value={m.medId||""} onChange={e=>updateMatch(i,e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:10,background:T.sur,border:`1px solid ${T.bd}`,color:T.tx,fontSize:13,outline:"none",fontFamily:"inherit"}}>
                        <option value="">-- Select medicine --</option>
                        {meds.map(med=>(
                          <option key={med.id} value={med.id}>{med.name} ({med.dose})</option>
                        ))}
                      </select>
                    </div>

                    {/* Inventory preview */}
                    {inv&&m.selected&&(
                      <div style={{padding:"8px 10px",borderRadius:10,background:inv.color+"18",border:`1px solid ${inv.color}33`,fontSize:12}}>
                        <div style={{fontWeight:700,color:inv.color,marginBottom:4}}>
                          {inv.status==="short"?"📦 Shortage":inv.status==="excess"?"📦 Excess":"📦 Exact"}
                        </div>
                        <div style={{color:T.tx}}>
                          Prescribed: {med.prescribed} · Currently purchased: {(med.purchased||0)} · Adding: {m.quantity}
                        </div>
                        <div style={{color:inv.color,fontWeight:700,marginTop:2}}>{inv.msg}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn outline onClick={()=>{setImage(null);setResult(null);setMatches([]);}} style={{flex:1,justifyContent:"center"}}>Rescan</Btn>
              <Btn onClick={applyBill} disabled={!matches.some(m=>m.selected&&m.medId)} style={{flex:2,justifyContent:"center"}}>✓ Update Inventory</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ADD/EDIT MEDICINE MODAL ───────────────────────────────────────────────────
function MedicineModal({med,onSave,onClose}){
  const isEdit=!!med;
  const [name,setName]=useState(med?.name||"");
  const [dose,setDose]=useState(med?.dose||"");
  const [cat,setCat]=useState(med?.cat||"Diabetes");
  const [tpd,setTpd]=useState(med?.tpd||1);
  const [times,setTimes]=useState(med?.times||["08:00"]);
  const [prescribed,setPrescribed]=useState(med?.prescribed?.toString()||"30");
  const [purchased,setPurchased]=useState(med?.purchased?.toString()||"0");
  const [color,setColor]=useState(med?.color||T.acc);
  const [error,setError]=useState("");

  const adjustTimes=n=>{
    const defaults=["08:00","14:00","20:00","22:00"];
    if(n>times.length) setTimes([...times,...defaults.slice(times.length,n)]);
    else setTimes(times.slice(0,n));
    setTpd(n);
  };

  const save=()=>{
    if(!name||!dose){setError("Name and dose are required");return;}
    const p=parseInt(purchased)||0;
    onSave({
      id:med?.id||Date.now(),name,dose,cat,tpd,times,
      prescribed:parseInt(prescribed)||30,
      purchased:p,stock:p,
      color,bills:med?.bills||[],
      prescriptions:med?.prescriptions||[],
      instructions:med?.instructions||""
    });
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,maxHeight:"90vh",overflow:"auto",border:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:800,color:T.tx}}>{isEdit?"Edit Medicine":"Add Manually"}</div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        <Inp label="Medicine Name" value={name} onChange={setName} placeholder="e.g. Metformin"/>
        <Inp label="Dose" value={dose} onChange={setDose} placeholder="e.g. 500mg"/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Category</div>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",fontFamily:"inherit"}}>
            {CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Times Per Day</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {[1,2,3,4].map(n=>(
              <button key={n} onClick={()=>adjustTimes(n)} style={{flex:1,padding:"10px 0",borderRadius:10,border:`2px solid ${tpd===n?T.acc:T.bd}`,background:tpd===n?T.accD:T.hi,color:tpd===n?T.acc:T.tm,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{n}x</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {times.map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontSize:12,color:T.tm,width:60}}>Dose {i+1}</div>
                <input type="time" value={t} onChange={e=>{const tt=[...times];tt[i]=e.target.value;setTimes(tt);}} style={{flex:1,padding:"8px 12px",borderRadius:10,background:T.hi,border:`1px solid ${T.bd}`,color:T.tx,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
              </div>
            ))}
          </div>
        </div>

        {/* Prescribed vs Purchased */}
        <div style={{padding:14,borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:14}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Inventory</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <div style={{fontSize:11,color:T.vio,fontWeight:700,marginBottom:6}}>📋 Prescribed by doctor</div>
              <input value={prescribed} onChange={e=>setPrescribed(e.target.value)} type="number" placeholder="30" style={{width:"100%",padding:"10px 12px",borderRadius:10,background:T.sur,border:`1px solid ${T.vio}44`,color:T.tx,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:11,color:T.safe,fontWeight:700,marginBottom:6}}>🛒 Purchased from medical</div>
              <input value={purchased} onChange={e=>setPurchased(e.target.value)} type="number" placeholder="0" style={{width:"100%",padding:"10px 12px",borderRadius:10,background:T.sur,border:`1px solid ${T.safe}44`,color:T.tx,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
          {prescribed&&purchased&&(
            <div style={{marginTop:10,padding:"8px 10px",borderRadius:8,background:inventoryStatus({prescribed:parseInt(prescribed),purchased:parseInt(purchased)}).color+"18",fontSize:12,color:inventoryStatus({prescribed:parseInt(prescribed),purchased:parseInt(purchased)}).color,fontWeight:600}}>
              {inventoryStatus({prescribed:parseInt(prescribed)||0,purchased:parseInt(purchased)||0}).msg}
            </div>
          )}
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Color</div>
          <div style={{display:"flex",gap:10}}>
            {COLORS.map(c=>(
              <div key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:"50%",background:c,border:`3px solid ${color===c?"#fff":"transparent"}`,cursor:"pointer"}}/>
            ))}
          </div>
        </div>
        {error&&<div style={{marginBottom:14,padding:"10px 14px",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan}}>⚠️ {error}</div>}
        <div style={{display:"flex",gap:10}}>
          <Btn outline onClick={onClose} style={{flex:1,justifyContent:"center"}}>Cancel</Btn>
          <Btn onClick={save} style={{flex:2,justifyContent:"center"}}>{isEdit?"Save Changes":"Add Medicine"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── MEDICINE DETAIL ───────────────────────────────────────────────────────────
function MedicineDetail({med,onEdit,onDelete,onClose}){
  const d=daysLeft(med);
  const urg=d<=3?T.dan:d<=7?T.warn:T.acc;
  const inv=inventoryStatus(med);
  const diff=med.purchased-med.prescribed;

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,maxHeight:"90vh",overflow:"auto",border:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:med.color+"22",border:`1px solid ${med.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>💊</div>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:T.tx}}>{med.name}</div>
              <div style={{fontSize:12,color:T.tm}}>{med.dose} · {med.cat}</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>

        {/* Inventory Intelligence */}
        <div style={{padding:16,borderRadius:14,background:inv.color+"15",border:`2px solid ${inv.color}33`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:inv.color,textTransform:"uppercase",letterSpacing:".06em",marginBottom:12}}>
            📦 Inventory Status
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            <div style={{textAlign:"center",padding:10,borderRadius:10,background:T.vioD,border:`1px solid ${T.vio}33`}}>
              <div style={{fontSize:20,fontWeight:900,color:T.vio}}>{med.prescribed}</div>
              <div style={{fontSize:10,color:T.vio,marginTop:2}}>📋 Prescribed</div>
            </div>
            <div style={{textAlign:"center",padding:10,borderRadius:10,background:T.safeD,border:`1px solid ${T.safe}33`}}>
              <div style={{fontSize:20,fontWeight:900,color:T.safe}}>{med.purchased}</div>
              <div style={{fontSize:10,color:T.safe,marginTop:2}}>🛒 Purchased</div>
            </div>
            <div style={{textAlign:"center",padding:10,borderRadius:10,background:urg+"18",border:`1px solid ${urg}33`}}>
              <div style={{fontSize:20,fontWeight:900,color:urg}}>{med.stock}</div>
              <div style={{fontSize:10,color:urg,marginTop:2}}>💊 In Hand</div>
            </div>
          </div>

          {/* Difference alert */}
          {diff!==0&&(
            <div style={{padding:"10px 12px",borderRadius:10,background:inv.color+"18",border:`1px solid ${inv.color}33`}}>
              <div style={{fontSize:13,fontWeight:700,color:inv.color}}>
                {diff>0?`✅ You bought ${diff} extra tablets`:`🚨 You are ${Math.abs(diff)} tablets short`}
              </div>
              <div style={{fontSize:12,color:T.tm,marginTop:4}}>
                {diff>0
                  ?`Good stock. Extra ${diff} tablets will last ${Math.floor(diff/med.tpd)} more days.`
                  :`Doctor prescribed ${med.prescribed} but you only bought ${med.purchased}. Buy ${Math.abs(diff)} more tablets.`
                }
              </div>
            </div>
          )}

          {diff===0&&(
            <div style={{padding:"10px 12px",borderRadius:10,background:T.accD,border:`1px solid ${T.accM}`}}>
              <div style={{fontSize:13,fontWeight:700,color:T.acc}}>✅ Exactly as prescribed</div>
              <div style={{fontSize:12,color:T.tm,marginTop:2}}>You purchased exactly what the doctor prescribed.</div>
            </div>
          )}
        </div>

        {/* Days remaining */}
        <div style={{padding:14,borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,color:T.tm}}>Current Stock</span>
            <Chip color={urg}>{d} days left</Chip>
          </div>
          <div style={{height:8,background:T.bg,borderRadius:4,marginBottom:6}}>
            <div style={{height:"100%",width:`${Math.min((med.stock/Math.max(med.prescribed,1))*100,100)}%`,background:urg,borderRadius:4}}/>
          </div>
          <div style={{fontSize:12,color:T.tm,display:"flex",justifyContent:"space-between"}}>
            <span>{med.stock} tablets remaining</span>
            <span>{med.tpd}x per day</span>
          </div>
        </div>

        {/* Schedule */}
        <div style={{padding:14,borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:20}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Schedule</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {med.times.map((t,i)=>(
              <div key={i} style={{padding:"6px 14px",borderRadius:20,background:T.sur,border:`1px solid ${T.bd}`,fontSize:13,color:T.tx,fontWeight:600}}>⏰ {t}</div>
            ))}
          </div>
          {med.instructions&&<div style={{fontSize:12,color:T.vio,marginTop:8}}>💡 {med.instructions}</div>}
        </div>

        <div style={{display:"flex",gap:10}}>
          <Btn onClick={onEdit} style={{flex:1,justifyContent:"center"}}>✏️ Edit</Btn>
          <button onClick={onDelete} style={{flex:1,padding:"11px 0",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,color:T.dan,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🗑️ Delete</button>
        </div>
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
  const handle=status=>{
    setDone(p=>({...p,[idx]:status}));
    onAction(med.id,status);
    setTimeout(()=>{if(idx<meds.length-1){setIdx(i=>i+1);setDone({});}},1800);
  };
  return(
    <div style={{height:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 20px",background:T.sur,borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:T.tx}}>Hello, {user.name} 👋</div>
          <div style={{fontSize:11,color:T.tm}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
        <button onClick={onLogout} style={{padding:"5px 12px",borderRadius:8,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:24}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:52,fontWeight:900,color:T.tx,lineHeight:1}}>{t}</div>
          <div style={{fontSize:13,color:T.tm,marginTop:4}}>Current Time</div>
        </div>
        <div style={{width:"100%",padding:32,borderRadius:28,background:T.sur,border:`2px solid ${med.color}44`,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>💊</div>
          <div style={{fontSize:30,fontWeight:900,color:T.tx}}>{med.name}</div>
          <div style={{fontSize:18,color:T.tm,marginTop:6}}>{med.dose}</div>
          <div style={{fontSize:13,color:med.color,marginTop:4,fontWeight:600}}>{med.cat}</div>
          {med.instructions&&<div style={{fontSize:12,color:T.vio,marginTop:6}}>💡 {med.instructions}</div>}
          {responded&&(
            <div style={{marginTop:20,padding:14,borderRadius:14,background:responded==="taken"?T.safeD:T.danD}}>
              <div style={{fontSize:18,fontWeight:800,color:responded==="taken"?T.safe:T.dan}}>
                {responded==="taken"?"✅ Well done! Recorded.":"📝 Noted. Family informed."}
              </div>
            </div>
          )}
        </div>
        {!responded&&(
          <div style={{display:"flex",gap:16,width:"100%"}}>
            <button onClick={()=>handle("taken")} style={{flex:1,padding:"24px 0",borderRadius:22,background:T.safe,border:"none",fontSize:20,fontWeight:900,color:"#0D1117",cursor:"pointer",fontFamily:"inherit"}}>✅ TAKEN</button>
            <button onClick={()=>handle("missed")} style={{flex:1,padding:"24px 0",borderRadius:22,background:T.hi,border:`2px solid ${T.bd}`,fontSize:20,fontWeight:900,color:T.tm,cursor:"pointer",fontFamily:"inherit"}}>❌ SKIP</button>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          {meds.map((_,i)=>(
            <div key={i} style={{width:i===idx?24:8,height:8,borderRadius:4,background:done[i]==="taken"?T.safe:done[i]?T.dan:i===idx?T.acc:T.bd,transition:"all .3s"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [isSignup,setIsSignup]=useState(false);
  const [role,setRole]=useState("family");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=()=>{
    if(!email||!pass){setError("Please fill all fields");return;}
    if(isSignup&&!name){setError("Please enter your name");return;}
    setError("");setLoading(true);
    setTimeout(()=>{setLoading(false);onLogin({name:name||email.split("@")[0],email,role});},1200);
  };
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:8}}>💊</div>
          <div style={{fontSize:24,fontWeight:900,color:T.tx}}>MedGuard</div>
          <div style={{fontSize:13,color:T.tm,marginTop:4}}>Medicine Management System</div>
        </div>
        <Card style={{padding:24}}>
          <div style={{fontSize:18,fontWeight:800,color:T.tx,marginBottom:20}}>{isSignup?"Create Account":"Welcome Back"}</div>
          {isSignup&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>I am a</div>
              <div style={{display:"flex",gap:10}}>
                {[{id:"family",label:"👨‍👩‍👧 Family",sub:"Full access"},{id:"senior",label:"👴 Senior",sub:"Reminders only"}].map(r=>(
                  <div key={r.id} onClick={()=>setRole(r.id)} style={{flex:1,padding:"12px 10px",borderRadius:12,cursor:"pointer",background:role===r.id?T.accD:T.hi,border:`2px solid ${role===r.id?T.acc:T.bd}`,textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.tx}}>{r.label}</div>
                    <div style={{fontSize:11,color:T.tm,marginTop:2}}>{r.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isSignup&&<Inp label="Full Name" value={name} onChange={setName} placeholder="Your name"/>}
          <Inp label="Email" value={email} onChange={setEmail} placeholder="you@email.com" type="email"/>
          <Inp label="Password" value={pass} onChange={setPass} placeholder="minimum 6 characters" type="password"/>
          {error&&<div style={{marginBottom:14,padding:"10px 14px",borderRadius:10,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan}}>⚠️ {error}</div>}
          <button onClick={handle} disabled={loading} style={{width:"100%",padding:"13px 0",borderRadius:12,background:T.acc,border:"none",color:T.bg,fontSize:15,fontWeight:800,cursor:"pointer",opacity:loading?.7:1,fontFamily:"inherit"}}>
            {loading?"Please wait...":(isSignup?"Create Account":"Sign In")}
          </button>
          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.tm}}>
            {isSignup?"Already have an account? ":"Don't have an account? "}
            <span onClick={()=>{setIsSignup(!isSignup);setError("");}} style={{color:T.acc,fontWeight:700,cursor:"pointer"}}>{isSignup?"Sign In":"Sign Up"}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── FAMILY DASHBOARD ──────────────────────────────────────────────────────────
function FamilyDashboard({user,meds,setMeds,logs,setLogs,onLogout}){
  const [tab,setTab]=useState("overview");
  const [showPrescScanner,setShowPrescScanner]=useState(false);
  const [showBillScanner,setShowBillScanner]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [editMed,setEditMed]=useState(null);
  const [detailMed,setDetailMed]=useState(null);
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const [showSenior,setShowSenior]=useState(false);

  const adh=()=>{
    if(!logs.length)return 75;
    return Math.round((logs.filter(l=>l.status==="taken").length/logs.length)*100);
  };

  const handleBillUpdate=(updates)=>{
    setMeds(prev=>prev.map(med=>{
      const update=updates.find(u=>u.medId===med.id);
      if(!update)return med;
      const newPurchased=(med.purchased||0)+update.quantity;
      const newStock=(med.stock||0)+update.quantity;
      return{
        ...med,
        purchased:newPurchased,
        stock:newStock,
        bills:[...(med.bills||[]),update.bill]
      };
    }));
  };

  const handleAction=(medId,status)=>{
    const med=meds.find(m=>m.id===medId);
    if(!med)return;
    const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setLogs(p=>[{id:Date.now(),med:med.name,time:t,status,src:"app",day:"Today"},...p]);
    if(status==="taken")setMeds(p=>p.map(m=>m.id===medId?{...m,stock:Math.max(0,m.stock-1)}:m));
  };

  // Inventory alerts
  const shortMeds=meds.filter(m=>(m.purchased||0)<(m.prescribed||0));
  const excessMeds=meds.filter(m=>(m.purchased||0)>(m.prescribed||0));
  const lowStockMeds=meds.filter(m=>daysLeft(m)<=7);

  if(showSenior){
    return(
      <div style={{height:"100vh",background:T.bg}}>
        <div style={{padding:"12px 16px",background:T.sur,borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>setShowSenior(false)} style={{padding:"5px 12px",borderRadius:8,background:T.hi,border:`1px solid ${T.bd}`,color:T.acc,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
          <div style={{fontSize:13,fontWeight:700,color:T.tx}}>Senior View Preview</div>
          <div/>
        </div>
        <SeniorView user={{name:"Rajan"}} meds={meds} onAction={handleAction} onLogout={()=>setShowSenior(false)}/>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg}}>
      {showPrescScanner&&<PrescriptionScanner onMedsFound={newMeds=>setMeds(p=>[...p,...newMeds])} onClose={()=>setShowPrescScanner(false)}/>}
      {showBillScanner&&<BillScanner meds={meds} onUpdate={handleBillUpdate} onClose={()=>setShowBillScanner(false)}/>}
      {(showAdd||editMed)&&<MedicineModal med={editMed} onSave={data=>{if(editMed)setMeds(p=>p.map(m=>m.id===data.id?{...m,...data}:m));else setMeds(p=>[...p,data]);setEditMed(null);setShowAdd(false);}} onClose={()=>{setShowAdd(false);setEditMed(null);}}/>}
      {detailMed&&!deleteConfirm&&(
        <MedicineDetail med={detailMed} onEdit={()=>{setEditMed(detailMed);setDetailMed(null);}} onDelete={()=>setDeleteConfirm(detailMed)} onClose={()=>setDetailMed(null)}/>
      )}
      {deleteConfirm&&(
        <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:T.sur,borderRadius:20,padding:24,border:`1px solid ${T.bd}`,width:"100%",maxWidth:360,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
            <div style={{fontSize:17,fontWeight:800,color:T.tx,marginBottom:8}}>Delete {deleteConfirm.name}?</div>
            <div style={{fontSize:13,color:T.tm,marginBottom:24}}>This cannot be undone.</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,padding:"12px 0",borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={()=>{setMeds(p=>p.filter(m=>m.id!==deleteConfirm.id));setDetailMed(null);setDeleteConfirm(null);}} style={{flex:1,padding:"12px 0",borderRadius:12,background:T.dan,border:"none",color:T.bg,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{padding:"14px 16px 0",background:T.sur,borderBottom:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:11,color:T.tm,textTransform:"uppercase",letterSpacing:".1em"}}>Family Portal</div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>{user.name} 👋</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowSenior(true)} style={{padding:"5px 10px",borderRadius:8,background:T.accD,border:`1px solid ${T.acc}44`,color:T.acc,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>👴 Preview</button>
            <button onClick={onLogout} style={{padding:"5px 10px",borderRadius:8,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
          </div>
        </div>
        <div style={{display:"flex",marginTop:4}}>
          {["overview","medicines","inventory","history"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",border:"none",background:"transparent",cursor:"pointer",borderBottom:tab===t?`2px solid ${T.acc}`:"2px solid transparent",color:tab===t?T.acc:T.tm,fontSize:11,fontWeight:700,textTransform:"capitalize",fontFamily:"inherit"}}>{t}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:14}}>

        {tab==="overview"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {l:"Adherence",v:`${adh()}%`,c:T.acc},
              {l:"Medicines",v:meds.length,c:T.blu},
              {l:"Low Stock",v:lowStockMeds.length,c:T.warn},
              {l:"Shortage",v:shortMeds.length,c:T.dan},
            ].map(s=>(
              <Card key={s.l} style={{textAlign:"center",padding:14}}>
                <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:11,color:T.tm,marginTop:2}}>{s.l}</div>
              </Card>
            ))}
          </div>

          {/* Shortage alerts */}
          {shortMeds.map(m=>(
            <div key={m.id} style={{padding:"12px 14px",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>🚨</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.dan}}>{m.name} — Tablet Shortage</div>
                <div style={{fontSize:12,color:T.tx}}>Prescribed {m.prescribed} · Bought {m.purchased} · Need {m.prescribed-m.purchased} more</div>
              </div>
            </div>
          ))}

          {/* Excess alerts */}
          {excessMeds.map(m=>(
            <div key={m.id} style={{padding:"12px 14px",borderRadius:12,background:T.safeD,border:`1px solid ${T.safe}44`,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>✅</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.safe}}>{m.name} — Extra Stock</div>
                <div style={{fontSize:12,color:T.tx}}>Prescribed {m.prescribed} · Bought {m.purchased} · {m.purchased-m.prescribed} extra tablets</div>
              </div>
            </div>
          ))}

          {/* Low stock */}
          {lowStockMeds.map(m=>(
            <div key={m.id} style={{padding:"12px 14px",borderRadius:12,background:T.warnD,border:`1px solid ${T.warn}44`,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>⚠️</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.warn}}>{m.name}</div>
                <div style={{fontSize:12,color:T.tx}}>{daysLeft(m)} days left — refill needed</div>
              </div>
              <button onClick={()=>setMeds(p=>p.map(x=>x.id===m.id?{...x,stock:x.prescribed,purchased:x.prescribed}:x))} style={{padding:"5px 12px",borderRadius:8,background:T.warn+"33",border:`1px solid ${T.warn}66`,color:T.warn,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Refill</button>
            </div>
          ))}

          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Today</div>
          {logs.filter(l=>l.day==="Today").map((l,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:l.status==="taken"?T.safe:T.dan}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.tx}}>{l.med}</div>
                <div style={{fontSize:11,color:T.tm}}>{l.time} · via {l.src}</div>
              </div>
              <Chip color={l.status==="taken"?T.safe:T.dan}>{l.status}</Chip>
            </div>
          ))}
        </>}

        {tab==="medicines"&&<>
          {/* Three add options */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <button onClick={()=>setShowPrescScanner(true)} style={{padding:"14px 8px",borderRadius:14,background:T.vioD,border:`2px solid ${T.vio}44`,color:T.vio,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
              <div style={{fontSize:22,marginBottom:4}}>📋</div>
              Prescription
              <div style={{fontSize:9,color:T.tm,marginTop:2,fontWeight:400}}>Sets prescribed qty</div>
            </button>
            <button onClick={()=>setShowBillScanner(true)} style={{padding:"14px 8px",borderRadius:14,background:T.safeD,border:`2px solid ${T.safe}44`,color:T.safe,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
              <div style={{fontSize:22,marginBottom:4}}>🧾</div>
              Bill
              <div style={{fontSize:9,color:T.tm,marginTop:2,fontWeight:400}}>Updates stock bought</div>
            </button>
            <button onClick={()=>setShowAdd(true)} style={{padding:"14px 8px",borderRadius:14,background:T.hi,border:`2px dashed ${T.bd}`,color:T.tm,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
              <div style={{fontSize:22,marginBottom:4}}>✏️</div>
              Manual
              <div style={{fontSize:9,marginTop:2,fontWeight:400}}>Type yourself</div>
            </button>
          </div>

          {meds.map(m=>{
            const d=daysLeft(m);
            const urg=d<=3?T.dan:d<=7?T.warn:T.acc;
            const inv=inventoryStatus(m);
            return(
              <div key={m.id} onClick={()=>setDetailMed(m)} style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:16,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:11,background:m.color+"22",border:`1px solid ${m.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💊</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:T.tx}}>{m.name}</div>
                      <div style={{fontSize:11,color:T.tm}}>{m.dose} · {m.cat}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <Chip color={urg}>{d}d</Chip>
                    <Chip color={inv.color}>{inv.status==="short"?"Short":inv.status==="excess"?"Excess":"Exact"}</Chip>
                  </div>
                </div>
                {/* Inventory bar */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                  <div style={{textAlign:"center",padding:"4px 0",borderRadius:8,background:T.vioD,fontSize:10,color:T.vio}}>
                    <div style={{fontWeight:700}}>{m.prescribed}</div>
                    <div>prescribed</div>
                  </div>
                  <div style={{textAlign:"center",padding:"4px 0",borderRadius:8,background:T.safeD,fontSize:10,color:T.safe}}>
                    <div style={{fontWeight:700}}>{m.purchased||0}</div>
                    <div>purchased</div>
                  </div>
                  <div style={{textAlign:"center",padding:"4px 0",borderRadius:8,background:urg+"18",fontSize:10,color:urg}}>
                    <div style={{fontWeight:700}}>{m.stock}</div>
                    <div>in hand</div>
                  </div>
                </div>
                <div style={{height:4,background:T.hi,borderRadius:4}}>
                  <div style={{height:"100%",width:`${Math.min((m.stock/Math.max(m.prescribed,1))*100,100)}%`,background:urg,borderRadius:4}}/>
                </div>
              </div>
            );
          })}
        </>}

        {tab==="inventory"&&<>
          <div style={{padding:14,borderRadius:14,background:T.accD,border:`1px solid ${T.accM}`,fontSize:13,color:T.acc,marginBottom:4}}>
            📊 Compare what doctor prescribed vs what you actually purchased from medical store
          </div>

          {meds.map(m=>{
            const inv=inventoryStatus(m);
            const diff=m.purchased-m.prescribed;
            return(
              <Card key={m.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:15,fontWeight:700,color:T.tx}}>{m.name}</div>
                  <Chip color={inv.color}>{inv.status==="short"?"Short":inv.status==="excess"?"Excess":"Exact"}</Chip>
                </div>

                {/* Three column comparison */}
                <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:12}}>
                  <div style={{padding:12,borderRadius:12,background:T.vioD,border:`1px solid ${T.vio}33`,textAlign:"center"}}>
                    <div style={{fontSize:11,color:T.vio,fontWeight:700,marginBottom:4}}>📋 Prescribed</div>
                    <div style={{fontSize:24,fontWeight:900,color:T.vio}}>{m.prescribed}</div>
                    <div style={{fontSize:10,color:T.tm}}>tablets</div>
                  </div>
                  <div style={{textAlign:"center",padding:"0 4px"}}>
                    <div style={{fontSize:20,color:inv.color,fontWeight:900}}>
                      {diff===0?"=":diff>0?"→":"←"}
                    </div>
                    <div style={{fontSize:10,color:T.tm,marginTop:2}}>
                      {diff===0?"exact":diff>0?`+${diff}`:`${diff}`}
                    </div>
                  </div>
                  <div style={{padding:12,borderRadius:12,background:T.safeD,border:`1px solid ${T.safe}33`,textAlign:"center"}}>
                    <div style={{fontSize:11,color:T.safe,fontWeight:700,marginBottom:4}}>🛒 Purchased</div>
                    <div style={{fontSize:24,fontWeight:900,color:T.safe}}>{m.purchased||0}</div>
                    <div style={{fontSize:10,color:T.tm}}>tablets</div>
                  </div>
                </div>

                {/* Alert */}
                <div style={{padding:"10px 12px",borderRadius:10,background:inv.color+"18",border:`1px solid ${inv.color}33`,fontSize:12,color:inv.color,fontWeight:600,marginBottom:10}}>
                  {diff<0&&`🚨 Buy ${Math.abs(diff)} more tablets from medical store`}
                  {diff>0&&`✅ You have ${diff} extra tablets — good buffer stock`}
                  {diff===0&&`✅ Purchased exactly as prescribed`}
                </div>

                {/* Stock progress */}
                <div style={{fontSize:11,color:T.tm,marginBottom:4,display:"flex",justifyContent:"space-between"}}>
                  <span>Current stock: {m.stock} tablets</span>
                  <span>{daysLeft(m)} days left</span>
                </div>
                <div style={{height:6,background:T.hi,borderRadius:4}}>
                  <div style={{height:"100%",width:`${Math.min((m.stock/Math.max(m.prescribed,1))*100,100)}%`,background:daysLeft(m)<=3?T.dan:daysLeft(m)<=7?T.warn:T.acc,borderRadius:4}}/>
                </div>

                {/* Upload bill button */}
                <button onClick={(e)=>{e.stopPropagation();setShowBillScanner(true);}} style={{width:"100%",marginTop:12,padding:"8px 0",borderRadius:10,background:T.safeD,border:`1px solid ${T.safe}44`,color:T.safe,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  🧾 Upload Purchase Bill
                </button>
              </Card>
            );
          })}
        </>}

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

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [meds,setMeds]=useState(INIT_MEDS);
  const [logs,setLogs]=useState(INIT_LOGS);

  const handleAction=(medId,status)=>{
    const med=meds.find(m=>m.id===medId);
    if(!med)return;
    const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setLogs(p=>[{id:Date.now(),med:med.name,time:t,status,src:"app",day:"Today"},...p]);
    if(status==="taken")setMeds(p=>p.map(m=>m.id===medId?{...m,stock:Math.max(0,m.stock-1)}:m));
  };
  // Admin route — go to /admin in URL
if(window.location.pathname==="/admin"){
  return <Admin/>;
    }
if(window.location.pathname==="/invite"){
  return <Admin/>;
    }
  if(!user){
    return(
      <div style={{fontFamily:"'Segoe UI',sans-serif"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}input,select{font-family:inherit;}`}</style>
        <LoginScreen onLogin={setUser}/>
      </div>
    );
  }
  if(user.role==="senior"){
    return(
      <div style={{fontFamily:"'Segoe UI',sans-serif"}}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <SeniorView user={user} meds={meds} onAction={handleAction} onLogout={()=>setUser(null)}/>
      </div>
    );
  }
  return(
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}input,select{font-family:inherit;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2D3748;border-radius:2px;}`}</style>
      <FamilyDashboard user={user} meds={meds} setMeds={setMeds} logs={logs} setLogs={setLogs} onLogout={()=>setUser(null)}/>
    </div>
  );
    }
