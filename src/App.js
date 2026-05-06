import { useState, useRef } from "react";

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
  {id:1,name:"Metformin",dose:"500mg",tpd:2,times:["08:00","20:00"],stock:48,total:60,cat:"Diabetes",color:T.acc,bills:[]},
  {id:2,name:"Amlodipine",dose:"5mg",tpd:1,times:["09:00"],stock:12,total:30,cat:"BP",color:T.warn,bills:[]},
  {id:3,name:"Atorvastatin",dose:"10mg",tpd:1,times:["21:00"],stock:25,total:30,cat:"Cholesterol",color:T.vio,bills:[]},
  {id:4,name:"Vitamin D3",dose:"1000IU",tpd:1,times:["10:00"],stock:5,total:30,cat:"Supplement",color:T.blu,bills:[]},
];

const INIT_LOGS = [
  {id:1,med:"Metformin",time:"08:03",status:"taken",src:"app",day:"Today"},
  {id:2,med:"Amlodipine",time:"09:15",status:"taken",src:"whatsapp",day:"Today"},
  {id:3,med:"Atorvastatin",time:"21:00",status:"missed",src:"auto",day:"Yesterday"},
];

const COLORS=[T.acc,T.warn,T.vio,T.blu,T.safe,T.dan];
const CATS=["Diabetes","Blood Pressure","Cholesterol","Supplement","Thyroid","Gastric","Painkiller","Antibiotic","Other"];
const daysLeft=m=>Math.floor(m.stock/m.tpd);

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

// ── AI PRESCRIPTION SCANNER ───────────────────────────────────────────────────
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
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const scan=async()=>{
    if(!image)return;
    setScanning(true);
    setError("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1500,
          messages:[{
            role:"user",
            content:[
              {
                type:"image",
                source:{type:"base64",media_type:image.type,data:image.base64}
              },
              {
                type:"text",
                text:`You are a medical prescription reader. Look at this prescription or medicine bill image carefully.

Extract ALL medicines you can see and return ONLY a JSON array, no other text, no markdown:

[
  {
    "name": "Medicine name",
    "dose": "Dosage like 500mg or 10mg",
    "cat": "Category like Diabetes/Blood Pressure/Cholesterol/Supplement/Thyroid/Gastric/Painkiller/Antibiotic/Other",
    "tpd": 1,
    "times": ["08:00"],
    "stock": 30,
    "total": 30,
    "instructions": "Any special instructions like take after food"
  }
]

Rules:
- tpd means times per day — a number 1 to 4
- times is array of HH:MM strings based on tpd (morning=08:00, afternoon=14:00, evening=20:00, night=22:00)
- stock and total default to 30 if not mentioned
- If you cannot read the image clearly, return an empty array []
- Return ONLY the JSON array, nothing else`
              }
            ]
          }]
        })
      });
      const data=await res.json();
      const text=data.content?.[0]?.text||"[]";
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      if(!Array.isArray(parsed)||parsed.length===0){
        setError("No medicines found in this image. Try a clearer photo.");
      } else {
        setResult(parsed);
        setSelected(parsed.map((_,i)=>i));
      }
    } catch(e){
      setError("Could not read the image. Please try a clearer photo of the prescription.");
    }
    setScanning(false);
  };

  const addSelected=()=>{
    const toAdd=result.filter((_,i)=>selected.includes(i)).map(m=>({
      id:Date.now()+Math.random(),
      name:m.name,
      dose:m.dose||"",
      cat:m.cat||"Other",
      tpd:m.tpd||1,
      times:m.times||["08:00"],
      stock:m.stock||30,
      total:m.total||30,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],
      bills:[{id:Date.now(),url:image.url,name:image.name,note:"Added from prescription",date:new Date().toLocaleDateString("en-IN")}],
      instructions:m.instructions||""
    }));
    onMedsFound(toAdd);
    onClose();
  };

  const toggleSelect=i=>setSelected(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,maxHeight:"92vh",overflow:"auto",border:`1px solid ${T.bd}`}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>📋 Scan Prescription</div>
            <div style={{fontSize:12,color:T.tm}}>AI reads and adds medicines automatically</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>

        {/* How it works */}
        {!image&&(
          <div style={{padding:14,borderRadius:14,background:T.accD,border:`1px solid ${T.accM}`,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:T.acc,marginBottom:8}}>How it works</div>
            {["Take a clear photo of doctor's prescription or medicine bill","AI scans and reads all medicine names and doses","Review the medicines found","Tap Add to add them all at once"].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:6}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:T.acc,color:T.bg,fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:12,color:T.tx,lineHeight:1.5}}>{s}</div>
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        {!image?(
          <div onClick={()=>fileRef.current.click()} style={{width:"100%",padding:"32px 24px",borderRadius:16,border:`2px dashed ${T.bd}`,textAlign:"center",cursor:"pointer",background:T.hi,marginBottom:16}}>
            <div style={{fontSize:48,marginBottom:12}}>📸</div>
            <div style={{fontSize:15,fontWeight:700,color:T.tx,marginBottom:6}}>Upload Prescription or Bill</div>
            <div style={{fontSize:12,color:T.tm,marginBottom:4}}>Take a photo or choose from gallery</div>
            <div style={{fontSize:11,color:T.tf}}>Works with doctor prescriptions, medicine bills, chemist receipts</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}} capture="environment"/>
          </div>
        ):(
          <div style={{marginBottom:16}}>
            {/* Image preview */}
            <div style={{position:"relative",marginBottom:12}}>
              <img src={image.url} alt="prescription" style={{width:"100%",borderRadius:14,maxHeight:220,objectFit:"cover",border:`1px solid ${T.bd}`}}/>
              <button onClick={()=>{setImage(null);setResult(null);setError("");}} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",background:"#000a",border:"none",color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{fontSize:12,color:T.tm,marginBottom:12}}>📄 {image.name}</div>

            {!result&&!error&&(
              <Btn onClick={scan} disabled={scanning} style={{width:"100%",justifyContent:"center"}}>
                {scanning?(
                  <span style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span>
                    AI is reading prescription...
                  </span>
                ):"🔍 Scan with AI"}
              </Btn>
            )}
          </div>
        )}

        {/* Error */}
        {error&&(
          <div style={{padding:"12px 14px",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,fontSize:13,color:T.dan,marginBottom:16}}>
            ⚠️ {error}
            <div style={{marginTop:8}}>
              <span onClick={()=>{setImage(null);setError("");}} style={{color:T.acc,fontWeight:700,cursor:"pointer",fontSize:12}}>Try another photo →</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result&&result.length>0&&(
          <>
            <div style={{padding:"10px 14px",borderRadius:10,background:T.safeD,border:`1px solid ${T.safe}44`,fontSize:13,color:T.safe,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              ✅ Found {result.length} medicine{result.length>1?"s":""} in your prescription
            </div>

            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>
              Select medicines to add ({selected.length} selected)
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {result.map((m,i)=>(
                <div key={i} onClick={()=>toggleSelect(i)} style={{padding:14,borderRadius:14,background:selected.includes(i)?T.accD:T.hi,border:`2px solid ${selected.includes(i)?T.acc:T.bd}`,cursor:"pointer",transition:"all .2s"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                    {/* Checkbox */}
                    <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${selected.includes(i)?T.acc:T.tf}`,background:selected.includes(i)?T.acc:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .2s"}}>
                      {selected.includes(i)&&<span style={{fontSize:12,color:T.bg,fontWeight:900}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,color:T.tx}}>{m.name}</div>
                      <div style={{fontSize:12,color:T.tm,marginTop:2}}>{m.dose} · {m.cat}</div>
                      <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                        <Chip color={T.acc}>{m.tpd}x per day</Chip>
                        <Chip color={T.blu}>{m.times?.join(", ")}</Chip>
                        <Chip color={T.warn}>{m.stock} tablets</Chip>
                      </div>
                      {m.instructions&&(
                        <div style={{fontSize:11,color:T.vio,marginTop:6}}>💡 {m.instructions}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:10}}>
              <Btn outline onClick={()=>{setImage(null);setResult(null);}} style={{flex:1,justifyContent:"center"}}>Rescan</Btn>
              <Btn onClick={addSelected} disabled={selected.length===0} style={{flex:2,justifyContent:"center"}}>
                ＋ Add {selected.length} Medicine{selected.length!==1?"s":""}
              </Btn>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
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
  const [stock,setStock]=useState(med?.stock?.toString()||"");
  const [total,setTotal]=useState(med?.total?.toString()||"");
  const [color,setColor]=useState(med?.color||T.acc);
  const [error,setError]=useState("");

  const adjustTimes=n=>{
    const defaults=["08:00","14:00","20:00","22:00"];
    if(n>times.length) setTimes([...times,...defaults.slice(times.length,n)]);
    else setTimes(times.slice(0,n));
    setTpd(n);
  };

  const save=()=>{
    if(!name||!dose||!stock){setError("Name, dose and stock are required");return;}
    onSave({id:med?.id||Date.now(),name,dose,cat,tpd,times,stock:parseInt(stock),total:parseInt(total)||parseInt(stock),color,bills:med?.bills||[]});
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
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <Inp label="Current Stock" value={stock} onChange={setStock} placeholder="60" type="number"/>
          <Inp label="Total Prescribed" value={total} onChange={setTotal} placeholder="60" type="number"/>
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

// ── BILL MODAL ────────────────────────────────────────────────────────────────
function BillModal({med,onSave,onClose}){
  const fileRef=useRef();
  const [bills,setBills]=useState(med.bills||[]);
  const [preview,setPreview]=useState(null);
  const [note,setNote]=useState("");

  const handleFile=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>setPreview({url:ev.target.result,name:file.name,size:(file.size/1024).toFixed(0)+"KB"});
    reader.readAsDataURL(file);
  };

  const addBill=()=>{
    if(!preview)return;
    setBills(b=>[...b,{id:Date.now(),url:preview.url,name:preview.name,size:preview.size,note,date:new Date().toLocaleDateString("en-IN")}]);
    setPreview(null);setNote("");
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,maxHeight:"90vh",overflow:"auto",border:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>Bills & Prescriptions</div>
            <div style={{fontSize:12,color:T.tm}}>{med.name}</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        <div onClick={()=>fileRef.current.click()} style={{width:"100%",padding:"24px",borderRadius:16,border:`2px dashed ${T.bd}`,textAlign:"center",cursor:"pointer",background:T.hi,marginBottom:16}}>
          <div style={{fontSize:32,marginBottom:8}}>📄</div>
          <div style={{fontSize:14,fontWeight:700,color:T.tx}}>Upload bill or prescription</div>
          <div style={{fontSize:12,color:T.tm,marginTop:4}}>Photo or image file</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
        </div>
        {preview&&(
          <div style={{padding:14,borderRadius:14,background:T.accD,border:`1px solid ${T.accM}`,marginBottom:16}}>
            <img src={preview.url} alt="bill" style={{width:"100%",borderRadius:10,maxHeight:160,objectFit:"cover",marginBottom:10}}/>
            <Inp label="Note (optional)" value={note} onChange={setNote} placeholder="e.g. April refill receipt"/>
            <div style={{display:"flex",gap:8}}>
              <Btn outline onClick={()=>setPreview(null)} style={{flex:1,justifyContent:"center"}}>Remove</Btn>
              <Btn onClick={addBill} style={{flex:2,justifyContent:"center"}}>✓ Add Bill</Btn>
            </div>
          </div>
        )}
        {bills.length>0&&(
          <>
            <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Uploaded ({bills.length})</div>
            {bills.map(b=>(
              <div key={b.id} style={{padding:12,borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
                <img src={b.url} alt="bill" style={{width:50,height:50,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.tx}}>{b.name}</div>
                  <div style={{fontSize:11,color:T.tm}}>{b.date}{b.note?` · ${b.note}`:""}</div>
                </div>
                <button onClick={()=>setBills(p=>p.filter(x=>x.id!==b.id))} style={{padding:"4px 8px",borderRadius:8,background:T.danD,border:`1px solid ${T.dan}44`,color:T.dan,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
              </div>
            ))}
          </>
        )}
        {bills.length===0&&!preview&&<div style={{textAlign:"center",padding:"20px 0",color:T.tm,fontSize:13}}>No bills uploaded yet</div>}
        <Btn onClick={()=>{onSave(bills);onClose();}} style={{width:"100%",justifyContent:"center",marginTop:8}}>Save & Close</Btn>
      </div>
    </div>
  );
}

// ── MEDICINE DETAIL ───────────────────────────────────────────────────────────
function MedicineDetail({med,onEdit,onDelete,onBills,onClose}){
  const d=daysLeft(med);
  const urg=d<=3?T.dan:d<=7?T.warn:T.acc;
  return(
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:480,background:T.sur,borderRadius:"24px 24px 0 0",padding:24,border:`1px solid ${T.bd}`}}>
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
        <div style={{padding:14,borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,color:T.tm}}>Stock</span>
            <Chip color={urg}>{d} days left</Chip>
          </div>
          <div style={{height:8,background:T.bg,borderRadius:4,marginBottom:6}}>
            <div style={{height:"100%",width:`${(med.stock/med.total)*100}%`,background:urg,borderRadius:4}}/>
          </div>
          <div style={{fontSize:12,color:T.tm,display:"flex",justifyContent:"space-between"}}>
            <span>{med.stock} remaining</span><span>of {med.total}</span>
          </div>
        </div>
        <div style={{padding:14,borderRadius:12,background:T.hi,border:`1px solid ${T.bd}`,marginBottom:20}}>
          <div style={{fontSize:11,color:T.tm,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Schedule — {med.tpd}x per day</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {med.times.map((t,i)=>(
              <div key={i} style={{padding:"6px 14px",borderRadius:20,background:T.sur,border:`1px solid ${T.bd}`,fontSize:13,color:T.tx,fontWeight:600}}>⏰ {t}</div>
            ))}
          </div>
          {med.instructions&&<div style={{fontSize:12,color:T.vio,marginTop:8}}>💡 {med.instructions}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",gap:10}}>
            <Btn onClick={onEdit} style={{flex:1,justifyContent:"center"}}>✏️ Edit</Btn>
            <Btn onClick={onBills} outline style={{flex:1,justifyContent:"center"}}>📄 Bills {med.bills?.length>0?`(${med.bills.length})`:""}</Btn>
          </div>
          <button onClick={onDelete} style={{width:"100%",padding:"11px 0",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,color:T.dan,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🗑️ Delete Medicine</button>
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

// ── LOGIN ─────────────────────────────────────────────────────────────────────
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
                  <div key={r.id} onClick={()=>setRole(r.id)} style={{flex:1,padding:"12px 10px",borderRadius:12,cursor:"pointer",background:role===r.id?T.accD:T.hi,border:`2px solid ${role===r.id?T.acc:T.bd}`,textAlign:"center",transition:"all .2s"}}>
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
  const [showScanner,setShowScanner]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [editMed,setEditMed]=useState(null);
  const [detailMed,setDetailMed]=useState(null);
  const [billMed,setBillMed]=useState(null);
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const [showSenior,setShowSenior]=useState(false);

  const adh=()=>{
    if(!logs.length)return 75;
    return Math.round((logs.filter(l=>l.status==="taken").length/logs.length)*100);
  };

  const handleSaveMed=data=>{
    if(editMed) setMeds(p=>p.map(m=>m.id===data.id?{...m,...data}:m));
    else setMeds(p=>[...p,data]);
    setEditMed(null);
  };

  const handleMedsFromScan=newMeds=>{
    setMeds(p=>[...p,...newMeds]);
  };

  const handleAction=(medId,status)=>{
    const med=meds.find(m=>m.id===medId);
    if(!med)return;
    const t=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setLogs(p=>[{id:Date.now(),med:med.name,time:t,status,src:"app",day:"Today"},...p]);
    if(status==="taken")setMeds(p=>p.map(m=>m.id===medId?{...m,stock:Math.max(0,m.stock-1)}:m));
  };

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
      {showScanner&&<PrescriptionScanner onMedsFound={handleMedsFromScan} onClose={()=>setShowScanner(false)}/>}
      {(showAdd||editMed)&&<MedicineModal med={editMed} onSave={handleSaveMed} onClose={()=>{setShowAdd(false);setEditMed(null);}}/>}
      {detailMed&&!deleteConfirm&&(
        <MedicineDetail med={detailMed} onEdit={()=>{setEditMed(detailMed);setDetailMed(null);}} onDelete={()=>setDeleteConfirm(detailMed)} onBills={()=>{setBillMed(detailMed);setDetailMed(null);}} onClose={()=>setDetailMed(null)}/>
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
      {billMed&&<BillModal med={billMed} onSave={bills=>setMeds(p=>p.map(m=>m.id===billMed.id?{...m,bills}:m))} onClose={()=>setBillMed(null)}/>}

      {/* Header */}
      <div style={{padding:"14px 16px 0",background:T.sur,borderBottom:`1px solid ${T.bd}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:T.tm,textTransform:"uppercase",letterSpacing:".1em"}}>Family Portal</div>
            <div style={{fontSize:18,fontWeight:800,color:T.tx}}>{user.name} 👋</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowSenior(true)} style={{padding:"5px 10px",borderRadius:8,background:T.accD,border:`1px solid ${T.acc}44`,color:T.acc,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>👴 Preview</button>
            <button onClick={onLogout} style={{padding:"5px 10px",borderRadius:8,background:T.hi,border:`1px solid ${T.bd}`,color:T.tm,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
          </div>
        </div>
        <div style={{display:"flex"}}>
          {["overview","medicines","history"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",border:"none",background:"transparent",cursor:"pointer",borderBottom:tab===t?`2px solid ${T.acc}`:"2px solid transparent",color:tab===t?T.acc:T.tm,fontSize:12,fontWeight:700,textTransform:"capitalize",fontFamily:"inherit"}}>{t}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {tab==="overview"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{l:"Adherence",v:`${adh()}%`,c:T.acc},{l:"Medicines",v:meds.length,c:T.blu},{l:"Low Stock",v:meds.filter(m=>daysLeft(m)<=7).length,c:T.warn},{l:"Missed",v:logs.filter(l=>l.status==="missed").length,c:T.dan}].map(s=>(
              <Card key={s.l} style={{textAlign:"center",padding:14}}>
                <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:11,color:T.tm,marginTop:2}}>{s.l}</div>
              </Card>
            ))}
          </div>
          {meds.filter(m=>daysLeft(m)<=7).map(m=>(
            <div key={m.id} style={{padding:"12px 14px",borderRadius:12,background:T.danD,border:`1px solid ${T.dan}44`,display:"flex",alignItems:"center",gap:12}}>
              <span>⚠️</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.dan}}>{m.name}</div>
                <div style={{fontSize:12,color:T.tx}}>{daysLeft(m)} days left</div>
              </div>
              <button onClick={()=>setMeds(p=>p.map(x=>x.id===m.id?{...x,stock:x.total}:x))} style={{padding:"5px 12px",borderRadius:8,background:T.dan+"33",border:`1px solid ${T.dan}66`,color:T.dan,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Refill</button>
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
          {/* Two add options */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>setShowScanner(true)} style={{padding:"16px 10px",borderRadius:14,background:`linear-gradient(135deg,${T.accD},${T.bluD})`,border:`2px solid ${T.acc}55`,color:T.acc,fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
              <div style={{fontSize:24,marginBottom:6}}>📋</div>
              Scan Prescription
              <div style={{fontSize:10,color:T.tm,marginTop:3,fontWeight:400}}>AI reads automatically</div>
            </button>
            <button onClick={()=>setShowAdd(true)} style={{padding:"16px 10px",borderRadius:14,background:T.hi,border:`2px dashed ${T.bd}`,color:T.tm,fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
              <div style={{fontSize:24,marginBottom:6}}>✏️</div>
              Add Manually
              <div style={{fontSize:10,marginTop:3,fontWeight:400}}>Type details yourself</div>
            </button>
          </div>

          {meds.map(m=>{
            const d=daysLeft(m);
            const urg=d<=3?T.dan:d<=7?T.warn:T.acc;
            return(
              <div key={m.id} onClick={()=>setDetailMed(m)} style={{background:T.sur,border:`1px solid ${T.bd}`,borderRadius:16,padding:18,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:11,background:m.color+"22",border:`1px solid ${m.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💊</div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:T.tx}}>{m.name}</div>
                      <div style={{fontSize:12,color:T.tm}}>{m.dose} · {m.cat}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <Chip color={urg}>{d}d</Chip>
                    {m.bills?.length>0&&<span style={{fontSize:10,color:T.tm}}>📄 {m.bills.length}</span>}
                  </div>
                </div>
                <div style={{height:4,background:T.hi,borderRadius:4,marginBottom:8}}>
                  <div style={{height:"100%",width:`${(m.stock/m.total)*100}%`,background:urg,borderRadius:4}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.tm}}>
                  <span>{m.times.join(" · ")}</span>
                  <span>{m.stock}/{m.total}</span>
                </div>
              </div>
            );
          })}
          {meds.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:T.tm}}>
              <div style={{fontSize:40,marginBottom:12}}>💊</div>
              <div style={{fontSize:15,fontWeight:700,color:T.tx,marginBottom:6}}>No medicines yet</div>
              <div style={{fontSize:13}}>Scan a prescription or add manually</div>
            </div>
          )}
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

// ── ROOT ──────────────────────────────────────────────────────────────────────
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
