import { useState, useEffect, useRef } from "react";

// ── TOKENS ─────────────────────────────────────────────────────────────────
const T = {
  bg: "#070B10", surface: "#0F1520", surfaceHigh: "#161E2E",
  border: "#1E2D45", borderLight: "#243550",
  accent: "#00C9A7", accentDim: "#00C9A722", accentMid: "#00C9A744",
  gold: "#F5C542", goldDim: "#F5C54222",
  rose: "#F43F5E", roseDim: "#F43F5E22",
  amber: "#FB923C", amberDim: "#FB923C22",
  sky: "#38BDF8", skyDim: "#38BDF822",
  violet: "#A78BFA", violetDim: "#A78BFA22",
  emerald: "#34D399", emeraldDim: "#34D39922",
  text: "#E2EAF4", textMuted: "#607B96", textFaint: "#344B63",
};

// ── SAMPLE DATA ─────────────────────────────────────────────────────────────
const INIT_SENIORS = [
  { id: 1, name: "Rajan Kumar", age: 72, relation: "Father", avatar: "👴", phone: "+91 98765 43210", emergency: "Dr. Mehta (+91 98100 11111)" },
  { id: 2, name: "Kamla Devi", age: 69, relation: "Mother", avatar: "👵", phone: "+91 98765 43211", emergency: "Dr. Sharma (+91 98100 22222)" },
];

const INIT_MEDS = [
  { id: 1, seniorId: 1, name: "Metformin", dose: "500mg", timesPerDay: 2, times: ["08:00","20:00"], stock: 48, totalPrescribed: 60, category: "Diabetes", color: T.accent, startDate: "2026-04-15", intakeLog: [], interactions: ["Alcohol","Contrast dye"] },
  { id: 2, seniorId: 1, name: "Amlodipine", dose: "5mg", timesPerDay: 1, times: ["09:00"], stock: 12, totalPrescribed: 30, category: "Blood Pressure", color: T.amber, startDate: "2026-04-01", intakeLog: [], interactions: ["Grapefruit juice","Simvastatin"] },
  { id: 3, seniorId: 1, name: "Atorvastatin", dose: "10mg", timesPerDay: 1, times: ["21:00"], stock: 25, totalPrescribed: 30, category: "Cholesterol", color: T.violet, startDate: "2026-04-10", intakeLog: [], interactions: ["Amlodipine","Clarithromycin"] },
  { id: 4, seniorId: 1, name: "Vitamin D3", dose: "1000 IU", timesPerDay: 1, times: ["10:00"], stock: 5, totalPrescribed: 30, category: "Supplement", color: T.gold, startDate: "2026-04-20", intakeLog: [], interactions: [] },
  { id: 5, seniorId: 2, name: "Levothyroxine", dose: "50mcg", timesPerDay: 1, times: ["07:00"], stock: 22, totalPrescribed: 30, category: "Thyroid", color: T.sky, startDate: "2026-04-05", intakeLog: [], interactions: ["Calcium supplements","Iron"] },
  { id: 6, seniorId: 2, name: "Pantoprazole", dose: "40mg", timesPerDay: 1, times: ["08:30"], stock: 18, totalPrescribed: 30, category: "Gastric", color: T.emerald, startDate: "2026-04-10", intakeLog: [], interactions: [] },
];

const INIT_INTAKE = [
  { id: 1, medId: 1, seniorId: 1, medName: "Metformin", time: "08:03", status: "taken", source: "app", date: "Today" },
  { id: 2, medId: 2, seniorId: 1, medName: "Amlodipine", time: "09:15", status: "taken", source: "whatsapp", date: "Today" },
  { id: 3, medId: 3, seniorId: 1, medName: "Atorvastatin", time: "21:00", status: "missed", source: "auto", date: "Yesterday" },
  { id: 4, medId: 3, seniorId: 1, medName: "Atorvastatin", time: "21:00", status: "missed", source: "auto", date: "2 days ago" },
  { id: 5, medId: 4, seniorId: 1, medName: "Vitamin D3", time: "10:05", status: "taken", source: "app", date: "Yesterday" },
];

const ESCALATION_RULES = [
  { threshold: 1, action: "Push notification to family", icon: "🔔", color: T.amber },
  { threshold: 2, action: "SMS + WhatsApp alert sent", icon: "📱", color: T.rose },
  { threshold: 3, action: "Emergency contact called", icon: "🚨", color: T.rose },
];

// ── UTILS ───────────────────────────────────────────────────────────────────
const daysLeft = (m) => Math.floor(m.stock / m.timesPerDay);
const adherence = (logs) => {
  if (!logs.length) return 87;
  const t = logs.filter(l => l.status === "taken").length;
  return Math.round((t / logs.length) * 100);
};
const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

// ── ICON ────────────────────────────────────────────────────────────────────
const Ic = ({ n, s = 16, c = "currentColor" }) => {
  const paths = {
    pill: <><path d="M10.5 3.5a6 6 0 0 1 0 8.49l-8.49-8.49a6 6 0 0 1 8.49 0z" fill={c} fillOpacity=".2"/><path d="M10.5 3.5a6 6 0 0 1 0 8.49l-8.49-8.49a6 6 0 0 1 8.49 0zm-9.9 9.07a6 6 0 0 0 8.49 0L.6 3.57a6 6 0 0 0 0 8.49z"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check: <polyline points="20 6 9 11 4 13"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    msg: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    pkg: <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    trend: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    chevron: <polyline points="9 18 15 12 9 6"/>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {paths[n]}
    </svg>
  );
};

// ── PRIMITIVES ──────────────────────────────────────────────────────────────
const Chip = ({ children, color = T.accent, dot }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".04em", background: color + "22", color, border: `1px solid ${color}33` }}>
    {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />}
    {children}
  </span>
);

const Card = ({ children, style = {}, glow }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 18, boxShadow: glow ? `0 0 28px ${glow}28` : "none", ...style }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, color = T.accent, outline, small, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: small ? "6px 14px" : "11px 20px", borderRadius: 12,
    background: outline ? color + "18" : disabled ? T.surfaceHigh : color,
    border: `1px solid ${outline || disabled ? color + "44" : "transparent"}`,
    color: outline || disabled ? color : T.bg, fontSize: small ? 12 : 13, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    display: "inline-flex", alignItems: "center", gap: 6, transition: "all .18s",
    ...style
  }}>{children}</button>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{label}</div>}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: T.surfaceHigh, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
  </div>
);

const SectionHead = ({ children }) => (
  <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 10 }}>{children}</div>
);

// ── AI CALL ─────────────────────────────────────────────────────────────────
const callAI = async (prompt, maxTokens = 1000) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
};

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 1 — ONBOARDING FLOW
// ══════════════════════════════════════════════════════════════════════════════
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [seniorName, setSeniorName] = useState("");
  const [seniorAge, setSeniorAge] = useState("");
  const [seniorPhone, setSeniorPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [reminderMethod, setReminderMethod] = useState("both");

  const steps = [
    {
      title: "Welcome to MedGuard",
      sub: "Your family's medicine intelligence system",
      emoji: "💊",
      content: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>👨‍👩‍👧</div>
          <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.8 }}>
            MedGuard helps families ensure elderly loved ones never miss a dose — with smart reminders, stock tracking, and AI-powered health insights.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            {["✅ Medicine reminders via App & WhatsApp", "📦 Auto stock tracking & refill alerts", "🤖 AI health insights for the family", "🚨 Emergency escalation if doses are missed"].map(f => (
              <div key={f} style={{ padding: "10px 16px", borderRadius: 10, background: T.surfaceHigh, fontSize: 13, color: T.text, textAlign: "left" }}>{f}</div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Create Family Account",
      sub: "Who's managing care?",
      emoji: "👤",
      content: <Input label="Your Name / Family Name" value={familyName} onChange={setFamilyName} placeholder="e.g. The Kumar Family" />
    },
    {
      title: "Add Senior Details",
      sub: "Who are you caring for?",
      emoji: "👴",
      content: <>
        <Input label="Senior's Name" value={seniorName} onChange={setSeniorName} placeholder="e.g. Rajan Kumar" />
        <Input label="Age" value={seniorAge} onChange={setSeniorAge} placeholder="e.g. 72" type="number" />
        <Input label="Phone Number (for reminders)" value={seniorPhone} onChange={setSeniorPhone} placeholder="+91 98765 43210" />
        <Input label="Emergency Contact" value={emergencyContact} onChange={setEmergencyContact} placeholder="Dr. Name + Number" />
      </>
    },
    {
      title: "Choose Reminder Method",
      sub: "How should we notify the senior?",
      emoji: "🔔",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: "app", icon: "📱", label: "App Notifications Only", sub: "Best for tech-savvy seniors" },
            { id: "whatsapp", icon: "💬", label: "WhatsApp Only", sub: "Best for seniors comfortable with WhatsApp" },
            { id: "both", icon: "✨", label: "App + WhatsApp", sub: "Recommended — maximum reach" },
          ].map(opt => (
            <div key={opt.id} onClick={() => setReminderMethod(opt.id)} style={{
              padding: "14px 16px", borderRadius: 14, cursor: "pointer",
              background: reminderMethod === opt.id ? T.accentDim : T.surfaceHigh,
              border: `2px solid ${reminderMethod === opt.id ? T.accent : T.border}`,
              display: "flex", alignItems: "center", gap: 12, transition: "all .2s"
            }}>
              <span style={{ fontSize: 24 }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{opt.sub}</div>
              </div>
              {reminderMethod === opt.id && <div style={{ marginLeft: "auto" }}><Ic n="check" s={16} c={T.accent} /></div>}
            </div>
          ))}
        </div>
      )
    },
    {
      title: "You're all set! 🎉",
      sub: "MedGuard is ready to protect your loved one",
      emoji: "🚀",
      content: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ padding: 20, borderRadius: 16, background: T.surfaceHigh, marginBottom: 16, textAlign: "left" }}>
            {[
              ["Family", familyName || "The Kumar Family"],
              ["Senior", seniorName || "Rajan Kumar"],
              ["Phone", seniorPhone || "+91 98765 43210"],
              ["Reminders", reminderMethod === "both" ? "App + WhatsApp" : reminderMethod],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span style={{ color: T.textMuted }}>{k}</span>
                <span style={{ color: T.text, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ color: T.textMuted, fontSize: 13 }}>Add your first medicines in the next step to get started.</p>
        </div>
      )
    }
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 24 }}>
      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T.accent : T.border, transition: "background .3s" }} />
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>{current.title}</div>
          <div style={{ fontSize: 13, color: T.textMuted }}>{current.sub}</div>
        </div>
        {current.content}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {step > 0 && (
          <Btn outline onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>Back</Btn>
        )}
        <Btn onClick={() => isLast ? onComplete() : setStep(s => s + 1)} style={{ flex: 2 }}>
          {isLast ? "Enter Dashboard →" : "Continue →"}
        </Btn>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 2 — AI REFILL PREDICTOR
// ══════════════════════════════════════════════════════════════════════════════
const RefillPredictor = ({ medicines, intake }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);
    const medData = medicines.map(m => ({
      name: m.name, category: m.category, stock: m.stock,
      daysLeft: daysLeft(m), timesPerDay: m.timesPerDay, totalPrescribed: m.totalPrescribed,
      missedDoses: intake.filter(i => i.medId === m.id && i.status === "missed").length,
      takenDoses: intake.filter(i => i.medId === m.id && i.status === "taken").length,
    }));

    const prompt = `You are a pharmacy intelligence AI. Analyze these medicines and give a JSON response ONLY (no markdown):
${JSON.stringify(medData)}

Return a JSON array with one object per medicine:
{
  "name": "Medicine name",
  "reorderDate": "Specific date to reorder (like 'May 8, 2026')",
  "predictedFinish": "Predicted actual finish date",
  "urgency": "critical|high|medium|low",
  "reasoning": "1-2 sentence explanation including missed dose impact",
  "suggestedQuantity": "How many tablets to reorder",
  "pharmacyLead": "Allow X days for pharmacy"
}

Today is May 1, 2026. Account for missed doses in predictions. Be specific and actionable.`;

    try {
      const text = await callAI(prompt);
      const clean = text.replace(/```json|```/g, "").trim();
      setPredictions(JSON.parse(clean));
    } catch {
      setPredictions(medicines.map(m => ({
        name: m.name, urgency: daysLeft(m) <= 5 ? "critical" : daysLeft(m) <= 10 ? "high" : "medium",
        reorderDate: `May ${1 + daysLeft(m) - 5}, 2026`,
        predictedFinish: `May ${1 + daysLeft(m)}, 2026`,
        reasoning: `${daysLeft(m)} days of stock remaining based on current usage.`,
        suggestedQuantity: `${m.totalPrescribed} tablets`, pharmacyLead: "Allow 2 days"
      })));
    }
    setLoading(false);
  };

  const urgencyColor = { critical: T.rose, high: T.amber, medium: T.gold, low: T.accent };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 0 16px" }}>
      <Card glow={T.accent} style={{ background: `linear-gradient(135deg, ${T.accentDim}, ${T.surface})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Ic n="trend" s={18} c={T.accent} />
          <span style={{ fontWeight: 800, fontSize: 15, color: T.accent }}>AI Refill Predictor</span>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
          Claude analyzes stock levels, missed doses, and consumption patterns to predict the exact right day to reorder each medicine.
        </p>
        <Btn onClick={predict} disabled={loading} style={{ width: "100%" }}>
          <Ic n="zap" s={14} c={T.bg} /> {loading ? "Analyzing patterns…" : "Generate Predictions"}
        </Btn>
      </Card>

      {predictions && predictions.map((p, i) => (
        <Card key={i} glow={urgencyColor[p.urgency]}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{p.name}</div>
            <Chip color={urgencyColor[p.urgency]}>{p.urgency}</Chip>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[
              ["🛒 Reorder By", p.reorderDate],
              ["📅 Runs Out", p.predictedFinish],
              ["💊 Order Qty", p.suggestedQuantity],
              ["🏪 Lead Time", p.pharmacyLead],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: "8px 10px", borderRadius: 10, background: T.surfaceHigh }}>
                <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, padding: "8px 10px", borderRadius: 8, background: T.surfaceHigh }}>
            💡 {p.reasoning}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 3 — ESCALATION CHAIN
// ══════════════════════════════════════════════════════════════════════════════
const EscalationChain = ({ medicines, intake, seniors }) => {
  const [escalations, setEscalations] = useState(() => {
    return medicines.map(med => {
      const senior = seniors.find(s => s.id === med.seniorId);
      const missed = intake.filter(i => i.medId === med.id && i.status === "missed").length;
      return { med, senior, missed, triggered: missed > 0 };
    }).filter(e => e.triggered);
  });
  const [rules, setRules] = useState(ESCALATION_RULES);
  const [sending, setSending] = useState(null);

  const simulate = async (esc) => {
    setSending(esc.med.id);
    await new Promise(r => setTimeout(r, 1500));
    setSending(null);
    setEscalations(prev => prev.map(e =>
      e.med.id === esc.med.id ? { ...e, simulated: true } : e
    ));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 0 16px" }}>
      {/* Escalation Rules */}
      <Card>
        <SectionHead>Escalation Rules</SectionHead>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rules.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: T.surfaceHigh, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 20 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>Miss {r.threshold}× dose{r.threshold > 1 ? "s" : ""}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{r.action}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Active Escalations */}
      <SectionHead>Active Triggers ({escalations.length})</SectionHead>
      {escalations.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            <div style={{ color: T.textMuted, fontSize: 13 }}>No escalations triggered. All doses on track.</div>
          </div>
        </Card>
      )}
      {escalations.map(esc => {
        const level = ESCALATION_RULES[Math.min(esc.missed - 1, 2)];
        return (
          <Card key={esc.med.id} glow={level?.color}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>{esc.med.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{esc.senior?.name} · {esc.senior?.phone}</div>
              </div>
              <Chip color={level?.color}>{esc.missed}× missed</Chip>
            </div>

            {/* Escalation Progress */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              {ESCALATION_RULES.map((r, i) => (
                <div key={i} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, background: i < esc.missed ? r.color + "22" : T.surfaceHigh, border: `1px solid ${i < esc.missed ? r.color + "44" : T.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 14 }}>{r.icon}</div>
                  <div style={{ fontSize: 9, color: i < esc.missed ? r.color : T.textFaint, marginTop: 2, fontWeight: 600 }}>
                    {i < esc.missed ? "DONE" : "PENDING"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
              Emergency: <span style={{ color: T.text }}>{esc.senior?.emergency}</span>
            </div>

            {esc.simulated ? (
              <div style={{ padding: "8px 12px", borderRadius: 8, background: T.emeraldDim, border: `1px solid ${T.emerald}44`, fontSize: 12, color: T.emerald, fontWeight: 600 }}>
                ✅ Alert dispatched · Family notified
              </div>
            ) : (
              <Btn color={level?.color} onClick={() => simulate(esc)} disabled={sending === esc.med.id} style={{ width: "100%" }}>
                {sending === esc.med.id ? "Sending…" : `${level?.icon} Trigger Alert Now`}
              </Btn>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 4 — MEDICINE INTERACTION CHECKER
// ══════════════════════════════════════════════════════════════════════════════
const InteractionChecker = ({ medicines }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customMed, setCustomMed] = useState("");

  const check = async () => {
    setLoading(true);
    setResult(null);
    const medNames = medicines.map(m => `${m.name} ${m.dose}`).join(", ");
    const extra = customMed ? ` + ${customMed} (new)` : "";

    const prompt = `You are a clinical pharmacist AI. Check interactions for this medicine combination:
${medNames}${extra}

Return ONLY a JSON object (no markdown):
{
  "overallRisk": "safe|caution|moderate|high",
  "summary": "2-sentence overall assessment",
  "interactions": [
    {
      "medicines": ["Med A", "Med B"],
      "severity": "mild|moderate|severe",
      "effect": "What happens",
      "recommendation": "What to do"
    }
  ],
  "timingConflicts": [
    {
      "medicines": ["Med A"],
      "issue": "Timing issue description",
      "suggestion": "Better timing"
    }
  ],
  "foodWarnings": ["Food/drink to avoid with which medicine"],
  "doctorFlags": ["Things to tell the doctor"]
}`;

    try {
      const text = await callAI(prompt);
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      setResult({ overallRisk: "caution", summary: "Unable to complete full analysis. Please consult your pharmacist.", interactions: [], timingConflicts: [], foodWarnings: [], doctorFlags: ["Consult doctor about your full medicine list"] });
    }
    setLoading(false);
  };

  const riskColor = { safe: T.emerald, caution: T.gold, moderate: T.amber, high: T.rose };
  const sevColor = { mild: T.gold, moderate: T.amber, severe: T.rose };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 0 16px" }}>
      <Card glow={T.rose} style={{ background: `linear-gradient(135deg, ${T.roseDim}, ${T.surface})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Ic n="shield" s={18} c={T.rose} />
          <span style={{ fontWeight: 800, fontSize: 15, color: T.rose }}>Interaction Checker</span>
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
          Checking: <span style={{ color: T.text }}>{medicines.map(m => m.name).join(", ")}</span>
        </div>
        <Input label="Add new medicine to check (optional)" value={customMed} onChange={setCustomMed} placeholder="e.g. Clarithromycin 500mg" />
        <Btn color={T.rose} onClick={check} disabled={loading} style={{ width: "100%" }}>
          <Ic n="shield" s={14} c="#fff" /> {loading ? "Checking interactions…" : "Run Safety Check"}
        </Btn>
      </Card>

      {result && <>
        {/* Risk Banner */}
        <div style={{ padding: "16px 20px", borderRadius: 16, background: riskColor[result.overallRisk] + "22", border: `2px solid ${riskColor[result.overallRisk]}44`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 36 }}>
            {result.overallRisk === "safe" ? "✅" : result.overallRisk === "caution" ? "⚠️" : result.overallRisk === "moderate" ? "🟠" : "🚨"}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: riskColor[result.overallRisk], textTransform: "uppercase", letterSpacing: ".06em" }}>{result.overallRisk} Risk</div>
            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6, marginTop: 2 }}>{result.summary}</div>
          </div>
        </div>

        {/* Interactions */}
        {result.interactions?.length > 0 && <>
          <SectionHead>Drug Interactions ({result.interactions.length})</SectionHead>
          {result.interactions.map((ix, i) => (
            <Card key={i} glow={sevColor[ix.severity]}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ix.medicines.join(" + ")}</div>
                <Chip color={sevColor[ix.severity]}>{ix.severity}</Chip>
              </div>
              <div style={{ fontSize: 13, color: T.text, marginBottom: 6 }}>{ix.effect}</div>
              <div style={{ fontSize: 12, color: T.accent, padding: "6px 10px", borderRadius: 8, background: T.accentDim }}>💡 {ix.recommendation}</div>
            </Card>
          ))}
        </>}

        {/* Timing Conflicts */}
        {result.timingConflicts?.length > 0 && <>
          <SectionHead>Timing Conflicts</SectionHead>
          {result.timingConflicts.map((tc, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: T.amberDim, border: `1px solid ${T.amber}44` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.amber, marginBottom: 4 }}>{tc.medicines?.join(", ")}</div>
              <div style={{ fontSize: 12, color: T.text, marginBottom: 4 }}>{tc.issue}</div>
              <div style={{ fontSize: 12, color: T.accent }}>→ {tc.suggestion}</div>
            </div>
          ))}
        </>}

        {/* Food Warnings */}
        {result.foodWarnings?.length > 0 && <>
          <SectionHead>Food & Drink Warnings</SectionHead>
          <Card>
            {result.foodWarnings.map((w, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < result.foodWarnings.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 13, color: T.text, display: "flex", gap: 8 }}>
                <span>🍽️</span> {w}
              </div>
            ))}
          </Card>
        </>}

        {/* Doctor Flags */}
        {result.doctorFlags?.length > 0 && <>
          <SectionHead>Tell Your Doctor</SectionHead>
          <Card glow={T.sky}>
            {result.doctorFlags.map((f, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < result.doctorFlags.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 13, color: T.text, display: "flex", gap: 8 }}>
                <span>🩺</span> {f}
              </div>
            ))}
          </Card>
        </>}

        <div style={{ fontSize: 11, color: T.textFaint, textAlign: "center", lineHeight: 1.6 }}>
          ⚠️ This is AI-generated guidance only. Always consult your pharmacist or doctor before making changes.
        </div>
      </>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 5 — WEEKLY REPORT
// ══════════════════════════════════════════════════════════════════════════════
const WeeklyReport = ({ medicines, intake, seniors }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState(seniors[0]?.id);

  const generate = async () => {
    setLoading(true);
    setReport(null);
    const senior = seniors.find(s => s.id === selectedSenior);
    const meds = medicines.filter(m => m.seniorId === selectedSenior);
    const logs = intake.filter(i => i.seniorId === selectedSenior);
    const missedCount = logs.filter(l => l.status === "missed").length;
    const takenCount = logs.filter(l => l.status === "taken").length;

    const prompt = `Generate a weekly medication adherence report for a doctor. Return ONLY JSON (no markdown):
Patient: ${senior?.name}, Age: ${senior?.age}
Medicines: ${meds.map(m => `${m.name} ${m.dose} (${m.timesPerDay}x/day)`).join(", ")}
Week: Apr 25 – May 1, 2026
Doses taken: ${takenCount}, Missed: ${missedCount}
Low stock: ${meds.filter(m => daysLeft(m) <= 7).map(m => m.name).join(", ") || "none"}

Return JSON:
{
  "title": "Weekly Report title",
  "period": "Apr 25 – May 1, 2026",
  "adherenceScore": number (0-100),
  "grade": "A|B|C|D",
  "highlights": ["3 positive observations"],
  "concerns": ["1-2 concerns if any"],
  "medicineBreakdown": [{"name": "...", "taken": number, "missed": number, "notes": "..."}],
  "doctorNotes": "2-3 sentence summary for doctor visit",
  "nextWeekFocus": ["2 action items for next week"],
  "stockAlerts": ["Any refill needed urgently"]
}`;

    try {
      const text = await callAI(prompt, 1500);
      const clean = text.replace(/```json|```/g, "").trim();
      setReport(JSON.parse(clean));
    } catch {
      setReport({ title: "Weekly Health Report", period: "Apr 25 – May 1, 2026", adherenceScore: adherence(intake), grade: "B", highlights: ["Regular morning doses maintained", "WhatsApp responses within 15 minutes", "No emergency escalations triggered"], concerns: ["Evening Atorvastatin missed twice"], medicineBreakdown: meds.map(m => ({ name: m.name, taken: logs.filter(l => l.medId === m.id && l.status === "taken").length, missed: logs.filter(l => l.medId === m.id && l.status === "missed").length, notes: "Monitoring required" })), doctorNotes: "Patient showed good adherence this week with minor lapses in evening doses. Stock levels for Vitamin D3 are critical and require immediate refill.", nextWeekFocus: ["Refill Vitamin D3 urgently", "Set stronger evening reminders for Atorvastatin"], stockAlerts: ["Vitamin D3 — URGENT (5 tablets)", "Amlodipine — Low (12 tablets)"] });
    }
    setLoading(false);
  };

  const gradeColor = { A: T.emerald, B: T.accent, C: T.amber, D: T.rose };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 0 16px" }}>
      <Card glow={T.violet} style={{ background: `linear-gradient(135deg, ${T.violetDim}, ${T.surface})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Ic n="file" s={18} c={T.violet} />
          <span style={{ fontWeight: 800, fontSize: 15, color: T.violet }}>Weekly Family Report</span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <SectionHead>Generate report for</SectionHead>
          <div style={{ display: "flex", gap: 8 }}>
            {seniors.map(s => (
              <div key={s.id} onClick={() => setSelectedSenior(s.id)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: selectedSenior === s.id ? T.violetDim : T.surfaceHigh, border: `2px solid ${selectedSenior === s.id ? T.violet : T.border}`, textAlign: "center", transition: "all .2s" }}>
                <div style={{ fontSize: 24 }}>{s.avatar}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{s.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </div>

        <Btn color={T.violet} onClick={generate} disabled={loading} style={{ width: "100%" }}>
          <Ic n="file" s={14} c="#fff" /> {loading ? "Generating report…" : "Generate AI Report"}
        </Btn>
      </Card>

      {report && <>
        {/* Header */}
        <Card glow={gradeColor[report.grade]}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: T.text }}>{report.title}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{report.period}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: gradeColor[report.grade], lineHeight: 1 }}>{report.grade}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>GRADE</div>
            </div>
          </div>

          {/* Score bar */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: T.textMuted }}>Adherence Score</span>
              <span style={{ color: gradeColor[report.grade], fontWeight: 700 }}>{report.adherenceScore}%</span>
            </div>
            <div style={{ height: 8, background: T.surfaceHigh, borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${report.adherenceScore}%`, background: gradeColor[report.grade], borderRadius: 4, transition: "width 1s" }} />
            </div>
          </div>
        </Card>

        {/* Highlights */}
        <Card>
          <SectionHead>✅ Highlights</SectionHead>
          {report.highlights?.map((h, i) => (
            <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: T.emeraldDim, border: `1px solid ${T.emerald}22`, marginBottom: 6, fontSize: 13, color: T.text, display: "flex", gap: 8 }}>
              <span>🟢</span> {h}
            </div>
          ))}
        </Card>

        {/* Concerns */}
        {report.concerns?.length > 0 && (
          <Card>
            <SectionHead>⚠️ Concerns</SectionHead>
            {report.concerns.map((c, i) => (
              <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: T.amberDim, border: `1px solid ${T.amber}22`, marginBottom: 6, fontSize: 13, color: T.text, display: "flex", gap: 8 }}>
                <span>🟠</span> {c}
              </div>
            ))}
          </Card>
        )}

        {/* Medicine Breakdown */}
        <Card>
          <SectionHead>Medicine Breakdown</SectionHead>
          {report.medicineBreakdown?.map((m, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < report.medicineBreakdown.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{m.name}</span>
                <span style={{ fontSize: 12, color: T.textMuted }}>{m.taken}✅ {m.missed}❌</span>
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{m.notes}</div>
            </div>
          ))}
        </Card>

        {/* Doctor Notes */}
        <Card glow={T.sky}>
          <SectionHead>🩺 For Doctor's Visit</SectionHead>
          <p style={{ fontSize: 13, color: T.text, lineHeight: 1.7, marginBottom: 12 }}>{report.doctorNotes}</p>
          <Btn outline color={T.sky} small onClick={() => navigator.clipboard?.writeText(report.doctorNotes)}>
            <Ic n="link" s={12} c={T.sky} /> Copy for Doctor
          </Btn>
        </Card>

        {/* Next Week */}
        <Card>
          <SectionHead>📋 Next Week Focus</SectionHead>
          {report.nextWeekFocus?.map((f, i) => (
            <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: T.skyDim, border: `1px solid ${T.sky}22`, marginBottom: 6, fontSize: 13, color: T.text, display: "flex", gap: 8 }}>
              <span>→</span> {f}
            </div>
          ))}
        </Card>

        {/* Stock Alerts */}
        {report.stockAlerts?.length > 0 && (
          <Card glow={T.rose}>
            <SectionHead>🚨 Urgent Stock Alerts</SectionHead>
            {report.stockAlerts.map((a, i) => (
              <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: T.roseDim, border: `1px solid ${T.rose}22`, marginBottom: 6, fontSize: 13, color: T.text, display: "flex", gap: 8 }}>
                <span>📦</span> {a}
              </div>
            ))}
          </Card>
        )}
      </>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FAMILY DASHBOARD (v2 — with multi-senior)
// ══════════════════════════════════════════════════════════════════════════════
const FamilyDashboard = ({ medicines, intake, seniors, onAction, onRefill }) => {
  const [activeSenior, setActiveSenior] = useState(seniors[0]?.id);
  const [feature, setFeature] = useState("overview");

  const meds = medicines.filter(m => m.seniorId === activeSenior);
  const logs = intake.filter(i => i.seniorId === activeSenior);
  const adh = adherence(logs);

  const features = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "refill", label: "Refill AI", icon: "trend" },
    { id: "escalation", label: "Alerts", icon: "bell" },
    { id: "interactions", label: "Safety", icon: "shield" },
    { id: "report", label: "Report", icon: "file" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Senior switcher */}
      <div style={{ padding: "14px 16px 0", borderBottom: `1px solid ${T.border}`, background: T.surface }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {seniors.map(s => (
            <div key={s.id} onClick={() => setActiveSenior(s.id)} style={{ flex: 1, padding: "8px 10px", borderRadius: 12, cursor: "pointer", background: activeSenior === s.id ? T.accentDim : T.surfaceHigh, border: `2px solid ${activeSenior === s.id ? T.accent : T.border}`, display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
              <span style={{ fontSize: 20 }}>{s.avatar}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{s.name.split(" ")[0]}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{s.relation}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature tabs */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {features.map(f => (
            <button key={f.id} onClick={() => setFeature(f.id)} style={{ padding: "7px 12px", border: "none", background: "transparent", cursor: "pointer", borderBottom: feature === f.id ? `2px solid ${T.accent}` : "2px solid transparent", color: feature === f.id ? T.accent : T.textMuted, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "all .2s" }}>
              <Ic n={f.icon} s={12} c={feature === f.id ? T.accent : T.textMuted} /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {feature === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Adherence", value: `${adh}%`, color: adh > 80 ? T.emerald : T.amber, icon: "heart" },
                { label: "Medicines", value: meds.length, color: T.sky, icon: "pill" },
                { label: "Low Stock", value: meds.filter(m => daysLeft(m) <= 7).length, color: T.rose, icon: "pkg" },
              ].map(s => (
                <Card key={s.label} style={{ padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Medicines */}
            <SectionHead>Medicines</SectionHead>
            {meds.map(med => {
              const days = daysLeft(med);
              const urg = days <= 3 ? T.rose : days <= 7 ? T.amber : T.accent;
              return (
                <Card key={med.id} glow={urg} style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: med.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Ic n="pill" s={16} c={med.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{med.name}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{med.dose} · {med.category}</div>
                      </div>
                    </div>
                    <Chip color={urg}>{days}d</Chip>
                  </div>
                  <div style={{ height: 4, background: T.surfaceHigh, borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${Math.min((med.stock / med.totalPrescribed) * 100, 100)}%`, background: urg, borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.textMuted }}>
                    <span>{med.stock} tablets left</span>
                    {days <= 7 && <button onClick={() => onRefill(med.name)} style={{ background: "none", border: "none", color: urg, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Refill →</button>}
                  </div>
                </Card>
              );
            })}

            {/* Recent activity */}
            <SectionHead>Recent Activity</SectionHead>
            {logs.slice(0, 5).map(log => (
              <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: T.surfaceHigh, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.status === "taken" ? T.emerald : T.rose, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{log.medName}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}> · {log.date} {log.time} via {log.source}</span>
                </div>
                <Chip color={log.status === "taken" ? T.emerald : T.rose}>{log.status}</Chip>
              </div>
            ))}
          </div>
        )}

        {feature === "refill" && <RefillPredictor medicines={meds} intake={logs} />}
        {feature === "escalation" && <EscalationChain medicines={meds} intake={logs} seniors={seniors} />}
        {feature === "interactions" && <InteractionChecker medicines={meds} />}
        {feature === "report" && <WeeklyReport medicines={medicines} intake={intake} seniors={seniors} />}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ELDERLY DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const ElderlyDashboard = ({ medicines, onAction }) => {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState({});
  const med = medicines[idx];
  const responded = done[idx];

  const handle = (status) => {
    setDone(p => ({ ...p, [idx]: status }));
    onAction(med.id, status, "app");
    setTimeout(() => { if (idx < medicines.length - 1) { setIdx(i => i + 1); setDone({}); } }, 1600);
  };

  const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: "100%", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: T.text }}>{timeStr}</div>
        <div style={{ fontSize: 13, color: T.textMuted }}>Friday, 1 May 2026</div>
      </div>

      <div style={{ width: "100%", padding: 32, borderRadius: 28, background: T.surface, border: `2px solid ${med.color}44`, boxShadow: `0 0 48px ${med.color}22`, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: med.color + "22", border: `2px solid ${med.color}55`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Ic n="pill" s={36} c={med.color} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: T.text }}>{med.name}</div>
        <div style={{ fontSize: 18, color: T.textMuted, marginTop: 4 }}>{med.dose}</div>
        <div style={{ fontSize: 13, color: med.color, fontWeight: 600, marginTop: 4 }}>{med.category}</div>

        {responded ? (
          <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 12, background: responded === "taken" ? T.emeraldDim : T.roseDim, border: `1px solid ${responded === "taken" ? T.emerald : T.rose}44` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: responded === "taken" ? T.emerald : T.rose }}>
              {responded === "taken" ? "✅ Great job! Recorded." : "📝 Noted. Family informed."}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 20, padding: "10px 16px", borderRadius: 12, background: T.surfaceHigh }}>
            <div style={{ fontSize: 13, color: T.textMuted }}>💊 Time for your medicine</div>
          </div>
        )}
      </div>

      {!responded && (
        <div style={{ display: "flex", gap: 14, width: "100%" }}>
          <button onClick={() => handle("taken")} style={{ flex: 1, padding: "22px 0", borderRadius: 20, background: T.emerald, border: "none", fontSize: 18, fontWeight: 900, color: T.bg, cursor: "pointer", boxShadow: `0 8px 28px ${T.emerald}44` }}>✅ TAKEN</button>
          <button onClick={() => handle("missed")} style={{ flex: 1, padding: "22px 0", borderRadius: 20, background: T.surfaceHigh, border: `2px solid ${T.border}`, fontSize: 18, fontWeight: 900, color: T.textMuted, cursor: "pointer" }}>❌ SKIP</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {medicines.map((_, i) => (
          <div key={i} style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 4, background: done[i] === "taken" ? T.emerald : done[i] ? T.rose : i === idx ? T.accent : T.border, transition: "all .3s" }} />
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// WHATSAPP BOT
// ══════════════════════════════════════════════════════════════════════════════
const WhatsApp = ({ medicines, onAction }) => {
  const [msgs, setMsgs] = useState([
    { id: 1, from: "bot", time: "08:00", text: "🌅 Good morning!\n\nTime to take:\n💊 *Metformin 500mg*\n\nReply:\n*1* or *TAKEN* ✅\n*2* or *MISSED* ❌" },
    { id: 2, from: "user", time: "08:05", text: "1" },
    { id: 3, from: "bot", time: "08:05", text: "✅ Recorded! Metformin taken at 8:05 AM.\n\nStock: *47 tablets* (23 days)\n\nFamily dashboard updated 🔄" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const add = (from, text, time) => setMsgs(p => [...p, { id: Date.now(), from, time, text }]);

  const send = async () => {
    const msg = input.trim(); if (!msg) return;
    const t = now(); add("user", msg, t); setInput(""); setTyping(true);
    const lower = msg.toLowerCase();
    const isTaken = ["1", "taken", "yes", "done", "ok", "haan", "li", "le li"].some(k => lower.includes(k));
    const isMissed = ["2", "missed", "no", "nahi", "skip", "bhool"].some(k => lower.includes(k));

    if (isTaken || isMissed) {
      onAction(1, isTaken ? "taken" : "missed", "whatsapp");
      setTimeout(() => {
        setTyping(false);
        add("bot", isTaken
          ? `✅ *Metformin* taken at ${t}\n\nFamily notified 🔄\nStock: 47 tablets (23 days)`
          : `📝 *Missed* noted at ${t}\n\nFamily has been alerted ⚠️\n\nReply *1* if you take it later.`, t);
      }, 1200);
    } else {
      try {
        const meds = medicines.map(m => `${m.name}: ${m.stock} tabs, ${daysLeft(m)} days`).join(", ");
        const text = await callAI(`You are a friendly WhatsApp medicine bot for elderly Indian patient Rajan. Medicines: ${meds}. User said: "${msg}". Reply helpfully in 2-3 short lines with emoji. If off-topic, gently redirect to reply 1 (taken) or 2 (missed).`);
        setTimeout(() => { setTyping(false); add("bot", text || "Reply *1* TAKEN or *2* MISSED 😊", t); }, 800);
      } catch { setTyping(false); add("bot", "Reply *1* if taken or *2* if missed 😊", t); }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0B1014" }}>
      <div style={{ padding: "12px 16px", background: "#1F2C34", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #2A3942" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic n="pill" s={20} c="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#E9EDEF" }}>MedGuard Bot 💊</div>
          <div style={{ fontSize: 12, color: "#8696A0" }}>🟢 AI-Powered · Always On</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8, background: "#0D1418" }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from === "bot" ? "flex-start" : "flex-end" }}>
            <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: m.from === "bot" ? "0 16px 16px 16px" : "16px 0 16px 16px", background: m.from === "bot" ? "#1F2C34" : "#005C4B", fontSize: 14, lineHeight: 1.7, color: "#E9EDEF", whiteSpace: "pre-line" }}>
              {m.text}
              <div style={{ fontSize: 10, color: "#8696A0", textAlign: "right", marginTop: 4 }}>{m.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ padding: "10px 16px", borderRadius: "0 16px 16px 16px", background: "#1F2C34", display: "inline-flex", gap: 4, alignSelf: "flex-start" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#8696A0", animation: "bounce 1.2s infinite", animationDelay: `${i * .2}s` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "6px 12px 4px", background: "#0D1418", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["1 - Taken ✅", "2 - Missed ❌", "Stock left?", "All medicines?"].map(q => (
          <button key={q} onClick={() => setInput(q.split(" - ")[0])} style={{ padding: "3px 10px", borderRadius: 14, background: "#1F2C34", border: "1px solid #2A3942", color: "#8696A0", fontSize: 11, cursor: "pointer" }}>{q}</button>
        ))}
      </div>

      <div style={{ padding: "8px 10px", background: "#1F2C34", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message…" style={{ flex: 1, padding: "10px 14px", borderRadius: 20, background: "#2A3942", border: "none", outline: "none", color: "#E9EDEF", fontSize: 14 }} />
        <button onClick={send} style={{ width: 42, height: 42, borderRadius: "50%", background: "#00A884", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic n="send" s={15} c="#fff" />
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [medicines, setMedicines] = useState(INIT_MEDS);
  const [intake, setIntake] = useState(INIT_INTAKE);
  const [seniors] = useState(INIT_SENIORS);
  const [view, setView] = useState("family");

  const handleAction = (medId, status, source) => {
    const med = medicines.find(m => m.id === medId); if (!med) return;
    setIntake(p => [{ id: Date.now(), medId, seniorId: med.seniorId, medName: med.name, time: now(), status, source, date: "Today" }, ...p]);
    if (status === "taken") setMedicines(p => p.map(m => m.id === medId ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
  };

  const handleRefill = (name) => setMedicines(p => p.map(m => m.name === name ? { ...m, stock: m.totalPrescribed } : m));

  const nav = [
    { id: "family", label: "Family", icon: "users" },
    { id: "elderly", label: "Elderly", icon: "heart" },
    { id: "whatsapp", label: "WhatsApp", icon: "msg" },
  ];

  if (!onboarded) {
    return (
      <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: T.bg, color: T.text, minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          input { font-family: inherit; }
          ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1E2D45; }
          @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        `}</style>
        <Onboarding onComplete={() => setOnboarded(true)} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: T.bg, color: T.text, height: "100vh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", boxShadow: "0 0 80px #00C9A711" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { font-family: inherit; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1E2D45; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {/* Header */}
      <div style={{ padding: "10px 16px", background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: T.accentDim, border: `1px solid ${T.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic n="pill" s={14} c={T.accent} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: T.text, letterSpacing: "-.01em" }}>MedGuard</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>v2 · AI Powered</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: T.accentDim, border: `1px solid ${T.accentMid}` }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, color: T.accent, fontWeight: 700 }}>Live</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {view === "family" && <FamilyDashboard medicines={medicines} intake={intake} seniors={seniors} onAction={handleAction} onRefill={handleRefill} />}
        {view === "elderly" && <ElderlyDashboard medicines={medicines.filter(m => m.seniorId === 1)} onAction={handleAction} />}
        {view === "whatsapp" && <WhatsApp medicines={medicines.filter(m => m.seniorId === 1)} onAction={handleAction} />}
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", background: T.surface, borderTop: `1px solid ${T.border}`, paddingBottom: 2 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{ flex: 1, padding: "8px 0 4px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ padding: 6, borderRadius: 10, background: view === n.id ? T.accentDim : "transparent" }}>
              <Ic n={n.icon} s={18} c={view === n.id ? T.accent : T.textFaint} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: view === n.id ? T.accent : T.textFaint }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
