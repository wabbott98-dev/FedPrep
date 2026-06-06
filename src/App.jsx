import { useState, useEffect, useRef } from "react"; // v2


const STRIPE_PUBLISHABLE_KEY = "pk_live_51Tco3CFfuzArQ7hQsWZwJ5qfvrYjQWJQQS0SJCeUQGyJHOWIBfCDd9tNGWny5DFF72cpzO9O8elhao90c1wHF0YN00AT7F77RF";
const STRIPE_PRICES = {
  monthly: "price_1Tcuu0FfuzArQ7hQbsfMOIJg",
  federal_pack: "price_1TcutvFfuzArQ7hQa8Bn6suA",
  coaching: "price_1TcutvFfuzArQ7hQoYnNeM0Y",
};

const QUESTIONS = [
  { id:"B01", category:"Behavioral", format:"STAR", competency:"Integrity", difficulty:"Medium", tier:"free",
    text:"Tell me about a time you had to enforce a rule someone disagreed with.",
    tip:"Use a specific work example. Be precise about the rule, your action, and the outcome." },
  { id:"B02", category:"Behavioral", format:"STAR", competency:"Attention to Detail", difficulty:"Medium", tier:"free",
    text:"Describe a situation where you identified a problem others had missed.",
    tip:"Focus on your specific observation process and what made you notice what others didn't." },
  { id:"B03", category:"Behavioral", format:"STAR", competency:"Stress Management", difficulty:"Hard", tier:"monthly",
    text:"Tell me about a time you worked under significant pressure.",
    tip:"Quantify the pressure if possible. Show composure and systematic thinking." },
  { id:"S01", category:"Situational", format:"Scenario", competency:"De-escalation", difficulty:"Hard", tier:"free",
    text:"A traveler becomes aggressive when you flag their luggage for inspection. How do you handle it?",
    tip:"Walk through your steps clearly. Reference protocol, officer safety, and professionalism." },
  { id:"S02", category:"Situational", format:"Scenario", competency:"Integrity", difficulty:"Hard", tier:"monthly",
    text:"You discover a colleague is falsifying inspection records. What do you do?",
    tip:"Be direct. Federal panels expect you to report misconduct through proper channels without hesitation." },
  { id:"M01", category:"Motivational", format:"Direct", competency:"Mission Alignment", difficulty:"Easy", tier:"free",
    agency:["CBP Officer","Border Patrol Agent","Import Specialist","Special Agent","Federal Police Officer"],
    text:"Why do you want to work for CBP, and what specifically draws you to this agency's mission?",
    tip:"Connect your personal values to CBP's border security mission. Be specific — avoid generic answers about wanting to serve." },
  { id:"M02", category:"Motivational", format:"Direct", competency:"Mission Alignment", difficulty:"Easy", tier:"free",
    agency:["Agriculture Specialist"],
    text:"Why do you want to work as a CBP Agriculture Specialist, and how do you see your role in protecting the U.S. from agricultural threats at our ports of entry?",
    tip:"Focus on CBP's agricultural mission — intercepting prohibited items, enforcing import regulations, and preventing foreign pests from entering the U.S." },
  { id:"M03", category:"Motivational", format:"Direct", competency:"Mission Alignment", difficulty:"Easy", tier:"free",
    agency:["PPQ Officer"],
    text:"Why do you want to work as a USDA PPQ Officer, and how would you contribute to protecting American agriculture from foreign pests and diseases?",
    tip:"Focus on USDA APHIS's mission — safeguarding U.S. plant and animal resources. Reference your understanding of biological threats and regulatory enforcement." },
  { id:"T03", category:"Technical", format:"Direct", competency:"Regulatory Knowledge", difficulty:"Medium", tier:"federal_pack",
    agency:["PPQ Officer"],
    text:"What is the role of USDA APHIS in regulating the importation of plants and plant products, and what authority does a PPQ Officer have at ports of entry?",
    tip:"Reference the Plant Protection Act, 7 CFR Part 319, and APHIS's authority to inspect, detain, and order treatment or destruction of regulated articles." },
  { id:"T04", category:"Technical", format:"Direct", competency:"Domain Knowledge", difficulty:"Hard", tier:"federal_pack",
    agency:["PPQ Officer"],
    text:"Walk me through how you would handle a shipment of cut flowers arriving from a country with known pest risks. What steps would you take?",
    tip:"Walk through the inspection process — documentation review, physical inspection, pest identification, treatment options (fumigation, cold treatment), and reporting requirements." },
  { id:"T01", category:"Technical", format:"Direct", competency:"Domain Knowledge", difficulty:"Medium", tier:"federal_pack",
    text:"What are the primary agricultural pests or diseases you would screen for at the border?",
    tip:"Name specific pests, diseases, and the regulatory framework governing your decisions." },
  { id:"T02", category:"Technical", format:"Direct", competency:"Regulatory Knowledge", difficulty:"Hard", tier:"federal_pack",
    text:"What federal regulations govern agricultural imports at ports of entry?",
    tip:"Reference 7 CFR and APHIS authority. Show you know the legal framework." },
  { id:"I01", category:"Integrity", format:"STAR", competency:"Moral Courage", difficulty:"Hard", tier:"monthly",
    text:"Have you ever been asked to do something unethical at work? How did you handle it?",
    tip:"Be honest and specific. Show you understood the ethical line and took appropriate action." },
  { id:"I02", category:"Integrity", format:"STAR", competency:"Accountability", difficulty:"Medium", tier:"free",
    text:"Describe a time you made a mistake. What did you do?",
    tip:"Own it fully. Show what you learned and how you prevented it from happening again." },
  { id:"L01", category:"Leadership", format:"STAR", competency:"Leadership", difficulty:"Medium", tier:"coaching",
    text:"Describe your leadership style with a concrete example.",
    tip:"Show results. Panels want to see impact on team performance or mission outcomes." },
  { id:"L02", category:"Leadership", format:"STAR", competency:"Team Management", difficulty:"Hard", tier:"coaching",
    text:"How do you handle a team member who consistently underperforms?",
    tip:"Show empathy but also accountability. Reference documentation and progressive steps." },

  // ── BTOS (GS-12) ──
  { id:"BTOS01", category:"Motivational", format:"Direct", competency:"Mission Alignment", difficulty:"Easy", tier:"federal_pack",
    agency:["BTOS"],
    text:"Why do you want to serve as a Biological Threat Operations Specialist, and how does your background prepare you for this role?",
    tip:"Connect your CBP agriculture or inspection experience directly to biological threat detection. Reference specific pests, pathogens, or interceptions you've handled." },
  { id:"BTOS02", category:"Technical", format:"Direct", competency:"Domain Knowledge", difficulty:"Medium", tier:"federal_pack",
    agency:["BTOS"],
    text:"What are the primary biological threats you would be responsible for identifying and intercepting at a port of entry, and what makes them high priority?",
    tip:"Reference specific agricultural pests (e.g. Khapra beetle, Asian longhorned beetle), plant pathogens, and animal diseases (e.g. FMD, ASF). Show you understand risk pathways." },
  { id:"BTOS03", category:"Technical", format:"Direct", competency:"Regulatory Knowledge", difficulty:"Hard", tier:"federal_pack",
    agency:["BTOS"],
    text:"Walk me through the regulatory framework that governs biological threat interceptions at ports of entry. What authorities does CBP operate under?",
    tip:"Reference the Plant Protection Act, Animal Health Protection Act, Public Health Service Act, and CBP's coordination with USDA APHIS, CDC, and USFWS. Show layered authority." },
  { id:"BTOS04", category:"Behavioral", format:"STAR", competency:"Attention to Detail", difficulty:"Medium", tier:"federal_pack",
    agency:["BTOS"],
    text:"Describe a time when your attention to detail during an inspection led to the identification of a significant threat or violation.",
    tip:"Be specific about what you observed, what triggered your suspicion, and what the outcome was. Quantify the significance if possible." },
  { id:"BTOS05", category:"Situational", format:"Scenario", competency:"Decision Making", difficulty:"Hard", tier:"federal_pack",
    agency:["BTOS"],
    text:"You intercept a commercial shipment containing what appears to be an unknown insect species not listed in any manifest. The importer is pressuring for immediate release due to time-sensitive cargo. What do you do?",
    tip:"Walk through your steps: hold the shipment, document findings, contact USDA APHIS for identification, follow CBPA protocols. Show you don't release under pressure without proper clearance." },
  { id:"BTOS06", category:"Behavioral", format:"STAR", competency:"Interagency Coordination", difficulty:"Medium", tier:"federal_pack",
    agency:["BTOS"],
    text:"Tell me about a time you worked with another agency or team to resolve a complex agricultural or biological threat situation.",
    tip:"Reference coordination with USDA, CDC, or other CBP components. Show your communication skills and ability to work within a multi-agency framework." },
  { id:"BTOS07", category:"Technical", format:"Direct", competency:"Intelligence Analysis", difficulty:"Hard", tier:"federal_pack",
    agency:["BTOS"],
    text:"How would you use targeting intelligence to prioritize which shipments or travelers to examine for biological threats?",
    tip:"Reference ACAS, NTC targeting, manifest review, country of origin risk profiles, and seasonal pest threat calendars. Show you understand intelligence-driven enforcement." },
  { id:"BTOS08", category:"Integrity", format:"STAR", competency:"Accountability", difficulty:"Medium", tier:"federal_pack",
    agency:["BTOS"],
    text:"Describe a situation where you identified a gap or error in a biological threat screening process. What did you do?",
    tip:"Show you took ownership, reported through proper channels, and contributed to a solution. Panels want accountability and process improvement mindset." },

  // ── BTEC (GS-13) ──
  { id:"BTEC01", category:"Motivational", format:"Direct", competency:"Mission Alignment", difficulty:"Easy", tier:"coaching",
    agency:["BTEC"],
    text:"Why do you want to serve as a Biological Threat Exclusion Coordinator at the GS-13 level, and what specific experience qualifies you for this role?",
    tip:"Connect operational field experience to the HQ coordination role. Emphasize your understanding of both the port-level enforcement side and the policy/coordination side." },
  { id:"BTEC02", category:"Technical", format:"Direct", competency:"Program Management", difficulty:"Hard", tier:"coaching",
    agency:["BTEC"],
    text:"As a BTEC, you serve as the primary liaison between CBP OFO and partner agencies on biological threat exclusion. How would you structure and manage those interagency relationships?",
    tip:"Reference USDA APHIS, CDC, USFWS, DHS S&T, and HHS. Discuss MOUs, working groups, information sharing protocols, and escalation procedures." },
  { id:"BTEC03", category:"Behavioral", format:"STAR", competency:"Leadership", difficulty:"Hard", tier:"coaching",
    agency:["BTEC"],
    text:"Tell me about a time you led a complex, multi-stakeholder project or initiative. How did you manage competing priorities and keep all parties aligned?",
    tip:"This is a program management competency question. Show planning, communication, conflict resolution, and outcome delivery. Quantify results where possible." },
  { id:"BTEC04", category:"Situational", format:"Scenario", competency:"Crisis Management", difficulty:"Hard", tier:"coaching",
    agency:["BTEC"],
    text:"A novel plant pathogen with no known treatment has been detected in three separate international shipments arriving at different ports within 48 hours. As BTEC, what actions do you take?",
    tip:"Show your incident response framework: immediate containment at the port level, notification up the chain, coordination with USDA APHIS and CDC, public health assessment, and communication to port directors. Show you can operate in ambiguity under pressure." },
  { id:"BTEC05", category:"Technical", format:"Direct", competency:"Policy Development", difficulty:"Hard", tier:"coaching",
    agency:["BTEC"],
    text:"How would you approach developing or revising a national biological threat exclusion policy for CBP? Walk us through your process.",
    tip:"Reference stakeholder engagement, regulatory review, field input, legal coordination, pilot testing, and implementation rollout. Show you understand the policy development lifecycle." },
  { id:"BTEC06", category:"Behavioral", format:"STAR", competency:"Influence Without Authority", difficulty:"Hard", tier:"coaching",
    agency:["BTEC"],
    text:"Describe a time you had to influence or persuade a senior official or partner agency to adopt a position or course of action you believed was correct, without having direct authority over them.",
    tip:"This is critical for a GS-13 coordinator role. Show data-driven persuasion, relationship building, and professional persistence without overstepping your role." },
  { id:"BTEC07", category:"Technical", format:"Direct", competency:"Risk Assessment", difficulty:"Hard", tier:"coaching",
    agency:["BTEC"],
    text:"How do you conduct a biological threat risk assessment for a new trade route or commodity not previously seen at U.S. ports of entry?",
    tip:"Reference pathway analysis, pest risk assessments, consultation with APHIS PPQ, historical interception data, and country-specific biosecurity standards. Show systematic thinking." },
  { id:"BTEC08", category:"Integrity", format:"STAR", competency:"Moral Courage", difficulty:"Hard", tier:"coaching",
    agency:["BTEC"],
    text:"Tell me about a time you had to push back on a decision made by leadership or a partner agency that you believed posed a risk to the mission. How did you handle it?",
    tip:"Show professional courage. Panels want to see you can respectfully disagree, escalate appropriately, and advocate for the right outcome without being insubordinate." },

  // ── JCD (GS-13) ──
  { id:"JCD01", category:"Motivational", format:"Direct", competency:"Mission Alignment", difficulty:"Easy", tier:"coaching",
    agency:["JCD"],
    text:"Why are you interested in this GS-13 program management position, and how has your career prepared you for a non-supervisory leadership role at this level?",
    tip:"Emphasize your operational depth, cross-functional experience, and readiness to operate at the program level without day-to-day supervisory responsibilities. Show strategic thinking." },
  { id:"JCD02", category:"Technical", format:"Direct", competency:"Program Management", difficulty:"Hard", tier:"coaching",
    agency:["JCD"],
    text:"Walk me through how you would manage a major CBP program initiative from concept through implementation. What frameworks or tools would you use?",
    tip:"Reference project planning, stakeholder mapping, risk management, milestone tracking, and after-action review. Show familiarity with federal program management principles." },
  { id:"JCD03", category:"Behavioral", format:"STAR", competency:"Strategic Thinking", difficulty:"Hard", tier:"coaching",
    agency:["JCD"],
    text:"Describe a time you identified a systemic problem in a program or process and developed a solution that had broader organizational impact.",
    tip:"Show you can think beyond your immediate lane. Panels want GS-13s who see the big picture and drive improvement at a program level, not just task level." },
  { id:"JCD04", category:"Situational", format:"Scenario", competency:"Decision Making", difficulty:"Hard", tier:"coaching",
    agency:["JCD"],
    text:"You are managing a CBP program with three competing agency priorities, limited resources, and a deadline that cannot move. Two stakeholders are pushing back on your proposed approach. How do you move forward?",
    tip:"Show structured decision-making: prioritize based on mission impact, document trade-offs, communicate transparently with stakeholders, escalate only what can't be resolved at your level, and deliver on the deadline." },
  { id:"JCD05", category:"Behavioral", format:"STAR", competency:"Communication", difficulty:"Medium", tier:"coaching",
    agency:["JCD"],
    text:"Tell me about a time you had to communicate a complex technical or operational issue to a non-technical senior audience. How did you prepare and what was the outcome?",
    tip:"GS-13 program managers are expected to brief up clearly and concisely. Show your ability to translate complexity into actionable information for decision-makers." },
  { id:"JCD06", category:"Technical", format:"Direct", competency:"Budget & Resources", difficulty:"Hard", tier:"coaching",
    agency:["JCD"],
    text:"How do you approach resource allocation and budget management for a federal program? What factors drive your prioritization decisions?",
    tip:"Reference mission alignment, statutory requirements, risk-based prioritization, and stakeholder input. Show fiscal responsibility and awareness of federal appropriations constraints." },
  { id:"JCD07", category:"Behavioral", format:"STAR", competency:"Collaboration", difficulty:"Medium", tier:"coaching",
    agency:["JCD"],
    text:"Describe a time you built a strong working relationship with a difficult stakeholder or partner that ultimately benefited your program or mission.",
    tip:"Show emotional intelligence, patience, and relationship investment. Panels want to see that you can work across organizational boundaries effectively." },
  { id:"JCD08", category:"Integrity", format:"STAR", competency:"Accountability", difficulty:"Medium", tier:"coaching",
    agency:["JCD"],
    text:"Tell me about a time a program or project you were managing did not go as planned. What happened, how did you respond, and what did you learn?",
    tip:"Own it fully. Show transparency with leadership, corrective action, and lessons learned. GS-13 panels expect maturity and accountability, not blame-shifting." },

];

const MOCK_SETS = {
  "Agriculture Specialist": ["M01","B01","S01","I02","T01","B02"],
  "CBP Officer":            ["M01","B01","S01","I01","B03","S02"],
  "Border Patrol Agent":    ["M01","S01","B03","I01","B01","S02"],
  "BTOS":                   ["BTOS01","BTOS02","BTOS04","BTOS05","BTOS06","BTOS07"],
  "BTEC":                   ["BTEC01","BTEC03","BTEC04","BTEC05","BTEC06","BTEC08"],
  "JCD":                    ["JCD01","JCD02","JCD03","JCD04","JCD05","JCD08"],
  "default":                ["M01","B01","S01","I02","B02","B03"],
};

const TIERS = {
  free:         { label:"Free",             color:"#64748b", questions:7,  price:"$0",   period:"",      features:["7 practice questions","Basic AI feedback","Score breakdown"] },
  monthly:      { label:"Monthly",          color:"#4a9eff", questions:8,  price:"$19",  period:"/mo",   features:["8 questions unlocked","Full AI coaching","Progress tracking","Panel flags & tips"] },
  federal_pack: { label:"Federal Pack",     color:"#f59e0b", questions:10, price:"$97",  period:" once", features:["10 questions + Technical bank","Agency-specific questions","Lifetime access","All Monthly features"] },
  coaching:     { label:"Coaching Premium", color:"#a855f7", questions:12, price:"$149", period:"/mo",   features:["All 12 questions","Leadership & supervisory prep","Priority AI feedback","All Federal Pack features"] },
};

const TIER_ORDER = ["free","monthly","federal_pack","coaching"];
const canAccess = (qTier, uTier) => TIER_ORDER.indexOf(uTier) >= TIER_ORDER.indexOf(qTier);

const CATEGORY_COLORS = {
  Behavioral:   { bg:"#1a3a5c", accent:"#4a9eff" },
  Situational:  { bg:"#2d1a4a", accent:"#a855f7" },
  Motivational: { bg:"#1a3a2a", accent:"#22c55e" },
  Technical:    { bg:"#3a2a1a", accent:"#f59e0b" },
  Integrity:    { bg:"#3a1a1a", accent:"#ef4444" },
  Leadership:   { bg:"#1a2a3a", accent:"#06b6d4" },
};

const DIFFICULTY_COLORS = { Easy:"#22c55e", Medium:"#f59e0b", Hard:"#ef4444" };
const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const getScoreColor = (score, max=25) => { const p=score/max; return p>=0.84?"#22c55e":p>=0.6?"#f59e0b":"#ef4444"; };
const getRating = (t) => t>=21?{label:"Panel Ready",color:"#22c55e"}:t>=15?{label:"Developing",color:"#f59e0b"}:{label:"Needs Work",color:"#ef4444"};

function ScoreBar({ label, value, max=5, color }) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:"#94a3b8"}}>{label}</span>
        <span style={{fontSize:12,fontWeight:700,color}}>{value}/{max}</span>
      </div>
      <div style={{height:6,background:"#1e293b",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(value/max)*100}%`,background:`linear-gradient(90deg,${color},${color}aa)`,borderRadius:3,transition:"width 1s ease"}}/>
      </div>
    </div>
  );
}

function RadarChart({ scores }) {
  const dims=["Structure","Relevance","Specificity","Competency","Professionalism"];
  const cx=110,cy=110,r=80;
  const pts=dims.map((_,i)=>{const a=(i/dims.length)*2*Math.PI-Math.PI/2;const v=scores?Object.values(scores)[i]||0:0;return{x:cx+(v/5)*r*Math.cos(a),y:cy+(v/5)*r*Math.sin(a)};});
  const gp=(s)=>dims.map((_,i)=>{const a=(i/dims.length)*2*Math.PI-Math.PI/2;return`${cx+s*r*Math.cos(a)},${cy+s*r*Math.sin(a)}`;}).join(" ");
  return (
    <svg width={220} height={220} style={{display:"block",margin:"0 auto"}}>
      {[.25,.5,.75,1].map(s=><polygon key={s} points={gp(s)} fill="none" stroke="#1e3a5f" strokeWidth={1}/>)}
      {dims.map((_,i)=>{const a=(i/dims.length)*2*Math.PI-Math.PI/2;return<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#1e3a5f" strokeWidth={1}/>;} )}
      <polygon points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="#4a9eff33" stroke="#4a9eff" strokeWidth={2}/>
      {dims.map((d,i)=>{const a=(i/dims.length)*2*Math.PI-Math.PI/2;return<text key={i} x={cx+(r+18)*Math.cos(a)} y={cy+(r+18)*Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize={9} fontFamily="'DM Sans',sans-serif">{d}</text>;})}
    </svg>
  );
}

function StatPill({ value, label }) {
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#f1f5f9",letterSpacing:2,lineHeight:1}}>{value}</div>
      <div style={{fontSize:11,color:"#475569",textTransform:"uppercase",letterSpacing:1,marginTop:2}}>{label}</div>
    </div>
  );
}

function AgencyBadge({ name }) {
  return <div style={{padding:"6px 14px",background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:20,fontSize:11,color:"#64748b",whiteSpace:"nowrap"}}>{name}</div>;
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:14,padding:20}}>
      <div style={{fontSize:28,marginBottom:10}}>{icon}</div>
      <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>{title}</div>
      <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{desc}</div>
    </div>
  );
}

function TestimonialCard({ quote, name, role }) {
  return (
    <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:14,padding:20}}>
      <div style={{fontSize:20,color:"#4a9eff",marginBottom:10}}>"</div>
      <p style={{margin:"0 0 14px",fontSize:13,color:"#94a3b8",lineHeight:1.7,fontStyle:"italic"}}>{quote}</p>
      <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{name}</div>
      <div style={{fontSize:11,color:"#475569"}}>{role}</div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen]             = useState("landing");
  const [authMode, setAuthMode]         = useState("signin");
  const [authMethod, setAuthMethod]     = useState("email");
  const [user, setUser]                 = useState(null);
  const [authForm, setAuthForm]         = useState({name:"",email:"",password:""});
  const [authError, setAuthError]       = useState("");
  const [profile, setProfile]           = useState({role:"Agriculture Specialist",agency:"CBP / USDA",level:"Experienced"});
  const [profiles, setProfiles]         = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [selectedQ, setSelectedQ]       = useState(null);
  const [response, setResponse]         = useState("");
  const [feedback, setFeedback]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [sessions, setSessions]         = useState([]);
  const [filterCat, setFilterCat]       = useState("All");
  const [timer, setTimer]               = useState(0);
  const [timerActive, setTimerActive]   = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [isRecording, setIsRecording]   = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef                  = useRef(null);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [panelVoiceEnabled, setPanelVoiceEnabled] = useState(true);
  const [mockMode, setMockMode]         = useState(false);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockIndex, setMockIndex]       = useState(0);
  const [mockResponses, setMockResponses] = useState([]);
  const [mockTimer, setMockTimer]       = useState(0);
  const [mockTimerActive, setMockTimerActive] = useState(false);
  const mockTimerRef                    = useRef(null);
  const timerRef                        = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fedprep_user");
      if (saved) { const u=JSON.parse(saved); setUser(u); setScreen("dashboard"); }
      const ss = localStorage.getItem("fedprep_sessions");
      if (ss) setSessions(JSON.parse(ss));
      const sp = localStorage.getItem("fedprep_profile");
      if (sp) setProfile(JSON.parse(sp));
      const sps = localStorage.getItem("fedprep_profiles");
      if (sps) {
        const parsed = JSON.parse(sps);
        setProfiles(parsed);
        const active = localStorage.getItem("fedprep_active_profile");
        if (active) {
          setActiveProfileId(active);
          const found = parsed.find(p => p.id === active);
          if (found) setProfile(found);
        }
      }
    } catch(e) {}
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setVoiceSupported(true);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      const tier = params.get("tier");
      const savedUser = localStorage.getItem("fedprep_user");
      if (savedUser && tier) {
        const u = JSON.parse(savedUser);
        const updated = {...u, tier};
        setUser(updated);
        localStorage.setItem("fedprep_user", JSON.stringify(updated));
      }
      window.history.replaceState({}, "", "/");
      setScreen("dashboard");
    }
  }, []);

  useEffect(() => {
    if (sessions.length) {
      localStorage.setItem("fedprep_sessions", JSON.stringify(sessions));
      if (activeProfileId) localStorage.setItem(`fedprep_sessions_${activeProfileId}`, JSON.stringify(sessions));
    }
  }, [sessions, activeProfileId]);

  useEffect(() => {
    if (timerActive) { timerRef.current = setInterval(() => setTimer(t=>t+1), 1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    if (mockTimerActive) { mockTimerRef.current = setInterval(() => setMockTimer(t=>t+1), 1000); }
    else { clearInterval(mockTimerRef.current); }
    return () => clearInterval(mockTimerRef.current);
  }, [mockTimerActive]);

  // ── STRIPE CHECKOUT ──
  const handleStripeCheckout = async (tier) => {
    setStripeLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          priceId: STRIPE_PRICES[tier],
          email: user?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout error");
      window.location.href = data.url;
    } catch(e) {
      alert("Payment setup error: " + e.message);
    }
    setStripeLoading(false);
  };

  // ── AUTH ──
  const handleAuth = () => {
    setAuthError("");
    if (!authForm.email.includes("@")) { setAuthError("Please enter a valid email address."); return; }
    if (authForm.password.length < 6)  { setAuthError("Password must be at least 6 characters."); return; }
    if (authMode==="signup" && !authForm.name.trim()) { setAuthError("Please enter your name."); return; }
    const u = { id:`u_${Date.now()}`, name:authMode==="signup"?authForm.name:authForm.email.split("@")[0], email:authForm.email, tier:"free", createdAt:new Date().toISOString(), provider:"email" };
    setUser(u); localStorage.setItem("fedprep_user",JSON.stringify(u));
    setScreen(authMode==="signup"?"onboarding":"dashboard");
  };

  const handleGoogleAuth = () => {
    const u = { id:`g_${Date.now()}`, name:"Google User", email:"user@gmail.com", tier:"free", createdAt:new Date().toISOString(), provider:"google" };
    setUser(u); localStorage.setItem("fedprep_user",JSON.stringify(u));
    setScreen("onboarding");
  };

  const handleSignOut = () => {
    localStorage.removeItem("fedprep_user");
    setUser(null); setAuthForm({name:"",email:"",password:""});
    setScreen("landing");
  };

  const saveProfile = () => {
    const id = activeProfileId || `p_${Date.now()}`;
    const newProfile = { ...profile, id };
    const existing = profiles.find(p => p.id === id);
    const updated = existing
      ? profiles.map(p => p.id === id ? newProfile : p)
      : [...profiles, newProfile];
    setProfiles(updated);
    setActiveProfileId(id);
    setProfile(newProfile);
    localStorage.setItem("fedprep_profile", JSON.stringify(newProfile));
    localStorage.setItem("fedprep_profiles", JSON.stringify(updated));
    localStorage.setItem("fedprep_active_profile", id);
    setScreen("dashboard");
  };

  const switchProfile = (p) => {
    setProfile(p);
    setActiveProfileId(p.id);
    localStorage.setItem("fedprep_profile", JSON.stringify(p));
    localStorage.setItem("fedprep_active_profile", p.id);
    setShowProfileSwitcher(false);
    setSessions([]);
    const saved = localStorage.getItem(`fedprep_sessions_${p.id}`);
    if (saved) setSessions(JSON.parse(saved));
  };

  const addNewProfile = () => {
    setActiveProfileId(null);
    setProfile({role:"Agriculture Specialist", agency:"CBP / USDA", level:"Experienced"});
    setScreen("onboarding");
  };

  const deleteProfile = (id) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem("fedprep_profiles", JSON.stringify(updated));
    if (activeProfileId === id && updated.length > 0) {
      switchProfile(updated[0]);
    }
  };

  const initiateUpgrade = (tier) => { setUpgradeTarget(tier); setScreen("upgrade"); };

  // ── VOICE INPUT ──
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalTranscript = response;
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) { finalTranscript += event.results[i][0].transcript + " "; }
        else { interim += event.results[i][0].transcript; }
      }
      setResponse(finalTranscript + interim);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopVoice = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); }
    setIsRecording(false);
  };

  // ── PANEL VOICE (ElevenLabs TTS) ──
  const speakQuestion = async (text) => {
    if (!panelVoiceEnabled) return;
    window.speechSynthesis?.cancel();
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Audio error");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setIsSpeaking(false);
      audio.play();
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // ── PRACTICE ──
  const startPractice = (q) => {
    if (!canAccess(q.tier, user?.tier||"free")) { initiateUpgrade(q.tier); return; }
    setSelectedQ(q); setResponse(""); setFeedback(null); setTimer(0); setTimerActive(true);
    setMockMode(false); setScreen("practice");
    setTimeout(() => speakQuestion(q.text), 500);
  };

  // ── MOCK INTERVIEW ──
  const DIFFICULTY_ORDER = { Easy: 1, Medium: 2, Hard: 3 };

  const startMockInterview = () => {
    const accessible = QUESTIONS.filter(q => {
      if (!canAccess(q.tier, user?.tier||"free")) return false;
      if (q.agency) return q.agency.includes(profile.role);
      return true;
    });
    if (accessible.length < 3) { initiateUpgrade("monthly"); return; }
    const shuffled = [...accessible].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(6, shuffled.length));
    const sorted = picked.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
    setMockQuestions(sorted);
    setMockIndex(0);
    setMockResponses([]);
    setMockMode(true);
    setMockTimer(0);
    setMockTimerActive(true);
    setSelectedQ(sorted[0]);
    setResponse("");
    setFeedback(null);
    setTimer(0);
    setTimerActive(true);
    setScreen("practice");
    setTimeout(() => speakQuestion(sorted[0].text), 600);
  };

  const submitAnswer = async () => {
    if (!response.trim()) return;
    setTimerActive(false);
    setLoading(true);
    const sys = `You are a federal law enforcement interview coach with 20+ years evaluating CBP, USDA, and Border Patrol oral board panels. Return ONLY valid JSON, no markdown, no preamble.
SCORING (1-5 each): structure, relevance, specificity, competency_alignment, professionalism.
RULES: Flag missing STAR components, vague language, blame toward supervisors, "we did" without personal ownership.
Return ONLY: {"scores":{"structure":0,"relevance":0,"specificity":0,"competency_alignment":0,"professionalism":0},"total":0,"strengths":[],"improvements":[],"suggested_answer":"","flags":[],"next_tip":""}`;
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: selectedQ.text,
          competency: selectedQ.category,
          format: selectedQ.format,
          response: response
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setFeedback(data);
      const newSession = { question:selectedQ, response, feedback:data, time:timer, date:new Date().toLocaleDateString() };
      setSessions(prev=>[...prev, newSession]);
      if (mockMode) {
        const newResponses = [...mockResponses, { question:selectedQ, response, feedback:data }];
        setMockResponses(newResponses);
        if (mockIndex < mockQuestions.length - 1) {
          setScreen("mockFeedback");
        } else {
          setMockTimerActive(false);
          setScreen("mockReport");
        }
      } else {
        setScreen("feedback");
      }
    } catch(e) {
      console.error("Evaluation error:", e);
      setFeedback({error:true, message:`Evaluation failed: ${e.message}. Please check your connection and try again.`});
      setScreen("feedback");
    }
    setLoading(false);
  };

  const nextMockQuestion = () => {
    const nextIdx = mockIndex + 1;
    setMockIndex(nextIdx);
    setSelectedQ(mockQuestions[nextIdx]);
    setResponse("");
    setFeedback(null);
    setTimer(0);
    setTimerActive(true);
    setScreen("practice");
    setTimeout(() => speakQuestion(mockQuestions[nextIdx].text), 500);
  };

  const avgScore = sessions.length ? Math.round(sessions.reduce((a,s)=>a+(s.feedback?.total||0),0)/sessions.length) : 0;
  const mockAvgScore = mockResponses.length ? Math.round(mockResponses.reduce((a,r)=>a+(r.feedback?.total||0),0)/mockResponses.length) : 0;
  const categories = ["All",...new Set(QUESTIONS.map(q=>q.category))];
  const filteredQs = filterCat==="All"?QUESTIONS:QUESTIONS.filter(q=>q.category===filterCat);
  const tierInfo = TIERS[user?.tier||"free"];

  const S = {
    page:       { minHeight:"100vh", background:"#020b18", fontFamily:"'DM Sans',sans-serif", color:"#f1f5f9" },
    header:     { background:"#0a1628", borderBottom:"1px solid #1e3a5f", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" },
    card:       { background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:16, padding:20, marginBottom:16 },
    label:      { display:"block", fontSize:11, letterSpacing:2, color:"#4a9eff", textTransform:"uppercase", marginBottom:8 },
    input:      { width:"100%", background:"#0f1f33", border:"1px solid #1e3a5f", borderRadius:8, padding:"12px 14px", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box" },
    btnPrimary: { width:"100%", padding:"14px", background:"linear-gradient(135deg,#1a5c9e,#4a9eff)", border:"none", borderRadius:10, color:"#fff", fontSize:18, fontWeight:700, cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 },
    btnGhost:   { width:"100%", padding:"13px", background:"transparent", border:"1px solid #1e3a5f", borderRadius:10, color:"#4a9eff", fontSize:13, cursor:"pointer", fontWeight:600 },
    sectionLbl: { fontSize:11, letterSpacing:2, color:"#4a9eff", textTransform:"uppercase", marginBottom:10 },
  };

  // ════════════════════════════════════════
  // LANDING
  // ════════════════════════════════════════
  if (screen==="landing") return (
    <div style={{...S.page,overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <nav style={{position:"sticky",top:0,zIndex:100,background:"#020b18ee",backdropFilter:"blur(12px)",borderBottom:"1px solid #1e3a5f22",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3,color:"#4a9eff"}}>FED PREP</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{setAuthMode("signin");setScreen("auth");}} style={{padding:"7px 16px",background:"transparent",border:"1px solid #1e3a5f",borderRadius:8,color:"#94a3b8",fontSize:12,cursor:"pointer"}}>Sign In</button>
          <button onClick={()=>{setAuthMode("signup");setScreen("auth");}} style={{padding:"7px 16px",background:"linear-gradient(135deg,#1a5c9e,#4a9eff)",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Start Free</button>
        </div>
      </nav>
      <section style={{padding:"60px 20px 50px",maxWidth:640,margin:"0 auto",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:300,height:300,background:"radial-gradient(circle,#4a9eff15,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:20,padding:"6px 16px",marginBottom:24}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e"}}/>
          <span style={{fontSize:11,letterSpacing:2,color:"#94a3b8",textTransform:"uppercase"}}>Built by a 17-Year Federal Insider</span>
        </div>
        <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:58,color:"#f1f5f9",letterSpacing:3,margin:"0 0 8px",lineHeight:1}}>ACE YOUR<br/><span style={{color:"#4a9eff"}}>FEDERAL</span> ORAL BOARD</h1>
        <p style={{fontSize:15,color:"#64748b",lineHeight:1.7,margin:"16px auto 32px",maxWidth:480}}>Most candidates walk into federal panel interviews unprepared. Our AI-powered coaching platform trains you the way real hiring panels evaluate — question by question, response by response.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:40}}>
          <button onClick={()=>{setAuthMode("signup");setScreen("auth");}} style={{padding:"14px 32px",background:"linear-gradient(135deg,#1a5c9e,#4a9eff)",border:"none",borderRadius:10,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>START FREE — NO CARD NEEDED →</button>
          <button onClick={()=>{setAuthMode("signin");setScreen("auth");}} style={{padding:"14px 24px",background:"transparent",border:"1px solid #1e3a5f",borderRadius:10,color:"#94a3b8",fontSize:13,cursor:"pointer"}}>Sign In</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:16,padding:"20px 16px"}}>
          <StatPill value="12+" label="Panel Questions"/>
          <StatPill value="6" label="Competency Areas"/>
          <StatPill value="17yr" label="Insider Experience"/>
        </div>
      </section>
      <section style={{padding:"0 20px 40px",maxWidth:640,margin:"0 auto"}}>
        <p style={{textAlign:"center",fontSize:11,letterSpacing:2,color:"#334155",textTransform:"uppercase",marginBottom:16}}>Prep for these agencies and more</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
          {["CBP","USDA / APHIS","Border Patrol","ICE / HSI","DEA","ATF","FBI","Secret Service","USMS","TSA"].map(a=><AgencyBadge key={a} name={a}/>)}
        </div>
      </section>
      <section style={{padding:"40px 20px",background:"#0a1628",borderTop:"1px solid #1e3a5f",borderBottom:"1px solid #1e3a5f"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:28}}>
            <div style={{flexShrink:0,width:48,height:48,borderRadius:12,background:"#1a3a5c",border:"1px solid #4a9eff44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🎖️</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>Built by someone who's been on both sides of the table</div>
              <p style={{margin:0,fontSize:13,color:"#64748b",lineHeight:1.7}}>With 17 years as a CBP Agriculture Specialist, I've watched qualified candidates fail federal oral boards — not because they weren't capable, but because they didn't know how panels actually evaluate responses. FedPrep closes that gap.</p>
            </div>
          </div>
          <div style={{background:"#020b18",border:"1px solid #1e3a5f",borderLeft:"3px solid #ef4444",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#ef4444",marginBottom:6}}>The Problem</div>
            <p style={{margin:0,fontSize:13,color:"#64748b",lineHeight:1.7}}>Generic interview prep doesn't account for the structured oral board format used by federal agencies. CBP, ICE, DEA, and Border Patrol panels score responses on specific competency rubrics — most candidates never see these until it's too late.</p>
          </div>
          <div style={{background:"#020b18",border:"1px solid #1e3a5f",borderLeft:"3px solid #22c55e",borderRadius:12,padding:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#22c55e",marginBottom:6}}>The Solution</div>
            <p style={{margin:0,fontSize:13,color:"#64748b",lineHeight:1.7}}>FedPrep's AI evaluates your answers using the same 5-dimension rubric real panels use — structure, relevance, specificity, competency alignment, and professionalism. You get instant coaching, flagged weaknesses, and a stronger answer example every time.</p>
          </div>
        </div>
      </section>
      <section style={{padding:"48px 20px",maxWidth:640,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:11,letterSpacing:3,color:"#4a9eff",textTransform:"uppercase",marginBottom:8}}>How It Works</div>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#f1f5f9",letterSpacing:2,margin:0}}>TRAIN LIKE THE PANEL IS WATCHING</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <FeatureCard icon="🎯" title="Role-Specific Questions" desc="Questions built for CBP, USDA, Border Patrol, ICE, DEA and more."/>
          <FeatureCard icon="🤖" title="AI Scoring Engine" desc="Instant feedback across 5 dimensions with a 25-point panel rubric."/>
          <FeatureCard icon="🎤" title="Voice Practice" desc="Speak your answers like a real panel. Speech-to-text captures everything."/>
          <FeatureCard icon="🎭" title="Full Mock Interview" desc="Complete 6-question panel simulation with final report card."/>
          <FeatureCard icon="⚠️" title="Panel Flag Detection" desc="AI catches vague language and missing STAR components."/>
          <FeatureCard icon="📈" title="Progress Tracking" desc="Radar chart and session history show exactly where you're growing."/>
        </div>
      </section>
      <section style={{padding:"0 20px 48px",maxWidth:640,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:11,letterSpacing:3,color:"#4a9eff",textTransform:"uppercase",marginBottom:8}}>Results</div>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#f1f5f9",letterSpacing:2,margin:0}}>CANDIDATES WHO PREPARED</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <TestimonialCard quote="I'd failed two CBP oral boards before using FedPrep. The AI feedback showed me I was using 'we did' instead of owning my actions. Fixed that one habit and passed on my third attempt." name="Marcus T." role="CBP Officer Candidate · Tampa, FL"/>
          <TestimonialCard quote="The STAR format breakdown is exactly what was missing from my prep. I didn't realize panels scored structure separately from content. Game changer." name="Denise R." role="Border Patrol Agent Candidate · El Paso, TX"/>
          <TestimonialCard quote="The technical questions for agriculture and import inspection are unlike anything else out there. Clearly built by someone who knows the job." name="James K." role="Agriculture Specialist Candidate · Miami, FL"/>
        </div>
      </section>
      <section style={{padding:"0 20px 48px",maxWidth:640,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:11,letterSpacing:3,color:"#4a9eff",textTransform:"uppercase",marginBottom:8}}>Pricing</div>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#f1f5f9",letterSpacing:2,margin:0}}>START FREE. SCALE AS YOU GROW.</h2>
        </div>
        <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#64748b",letterSpacing:1}}>Free</div><div style={{fontSize:11,color:"#334155"}}>No credit card required</div></div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#f1f5f9"}}>$0</div>
          </div>
          {TIERS.free.features.map((f,i)=><div key={i} style={{fontSize:12,color:"#475569",marginBottom:4,display:"flex",gap:8}}><span style={{color:"#334155"}}>✓</span>{f}</div>)}
          <button onClick={()=>{setAuthMode("signup");setScreen("auth");}} style={{...S.btnPrimary,marginTop:14,background:"#0f1f33",color:"#64748b",fontSize:14}}>GET STARTED FREE →</button>
        </div>
        {["monthly","federal_pack","coaching"].map(tierKey=>{
          const t=TIERS[tierKey]; const featured=tierKey==="federal_pack";
          return (
            <div key={tierKey} style={{background:"#0a1628",border:`2px solid ${featured?t.color:"#1e3a5f"}`,borderRadius:16,padding:20,marginBottom:12,position:"relative",overflow:"hidden"}}>
              {featured && <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${t.color},${t.color}66)`}}/>}
              {featured && <div style={{position:"absolute",top:12,right:12,fontSize:10,padding:"3px 10px",background:`${t.color}22`,color:t.color,borderRadius:20,fontWeight:700,letterSpacing:1}}>MOST POPULAR</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:t.color,letterSpacing:1}}>{t.label}</div><div style={{fontSize:11,color:"#475569"}}>{t.questions} questions unlocked</div></div>
                <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#f1f5f9",letterSpacing:1}}>{t.price}</div><div style={{fontSize:11,color:"#64748b"}}>{t.period}</div></div>
              </div>
              {t.features.map((f,i)=><div key={i} style={{fontSize:12,color:"#94a3b8",marginBottom:5,display:"flex",gap:8}}><span style={{color:t.color}}>✓</span>{f}</div>)}
              <button onClick={()=>{setAuthMode("signup");setScreen("auth");}}
                style={{width:"100%",marginTop:14,padding:"12px",background:featured?`linear-gradient(135deg,${t.color}88,${t.color})`:`${t.color}22`,border:`1px solid ${t.color}44`,borderRadius:10,color:featured?"#fff":t.color,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
                {tierKey==="federal_pack"?"BUY ONE-TIME ACCESS →":"SUBSCRIBE →"}
              </button>
            </div>
          );
        })}
        <p style={{textAlign:"center",fontSize:11,color:"#334155",marginTop:8}}>🔒 Secure payment via Stripe · Cancel anytime · 7-day money-back guarantee</p>
      </section>
      <section style={{padding:"0 20px 60px",maxWidth:640,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,#0a1628,#0f1f33)",border:"1px solid #1e3a5f",borderRadius:20,padding:"40px 28px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:280,height:280,background:"radial-gradient(circle,#4a9eff08,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{fontSize:11,letterSpacing:3,color:"#4a9eff",textTransform:"uppercase",marginBottom:12}}>Your Panel Is Waiting</div>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:"#f1f5f9",letterSpacing:2,margin:"0 0 12px",lineHeight:1}}>DON'T WALK IN<br/>UNPREPARED</h2>
          <p style={{fontSize:13,color:"#64748b",margin:"0 0 28px",lineHeight:1.7}}>Start with 3 free questions today. No credit card. No commitment.</p>
          <button onClick={()=>{setAuthMode("signup");setScreen("auth");}} style={{padding:"16px 40px",background:"linear-gradient(135deg,#1a5c9e,#4a9eff)",border:"none",borderRadius:12,color:"#fff",fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>START FREE NOW →</button>
        </div>
      </section>
      <footer style={{borderTop:"1px solid #0f1f33",padding:"20px",textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:3,color:"#1e3a5f",marginBottom:6}}>FED PREP</div>
        <p style={{fontSize:11,color:"#1e3a5f",margin:0}}>Built by a CBP Agriculture Specialist with 17 years of federal service · AI-powered · Stripe-secured</p>
      </footer>
    </div>
  );

  // ════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════
  if (screen==="auth") return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={{width:"100%",maxWidth:440}}>
        <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:13,marginBottom:20}}>← Back to Home</button>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:44,color:"#f1f5f9",letterSpacing:3,margin:"0 0 4px",lineHeight:1}}>{authMode==="signup"?"JOIN FED PREP":"WELCOME BACK"}</div>
          <p style={{color:"#64748b",fontSize:13,margin:0}}>{authMode==="signup"?"Create your free account":"Sign in to continue training"}</p>
        </div>
        <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:16,padding:28}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,background:"#0f1f33",borderRadius:10,padding:4,marginBottom:22}}>
            {["signin","signup"].map(m=>(
              <button key={m} onClick={()=>{setAuthMode(m);setAuthError("");}} style={{padding:"9px",borderRadius:8,border:"none",background:authMode===m?"#1a3a5c":"transparent",color:authMode===m?"#4a9eff":"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {m==="signin"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {["email","google"].map(m=>(
              <button key={m} onClick={()=>setAuthMethod(m)} style={{padding:"10px",borderRadius:8,border:`1px solid ${authMethod===m?"#4a9eff":"#1e3a5f"}`,background:authMethod===m?"#1a3a5c":"transparent",color:authMethod===m?"#4a9eff":"#64748b",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                {m==="email"?"✉️ Email":"🔵 Google"}
              </button>
            ))}
          </div>
          {authMethod==="google" ? (
            <div>
              <button onClick={handleGoogleAuth} style={{...S.btnPrimary,background:"#fff",color:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:14}}>
                <span style={{fontSize:18}}>🔵</span> Continue with Google
              </button>
              <p style={{textAlign:"center",fontSize:11,color:"#475569",marginTop:10}}>Fastest sign-in method</p>
            </div>
          ) : (
            <div>
              {authMode==="signup" && (
                <div style={{marginBottom:14}}>
                  <label style={S.label}>Full Name</label>
                  <input value={authForm.name} onChange={e=>setAuthForm(p=>({...p,name:e.target.value}))} placeholder="Your full name" style={S.input}/>
                </div>
              )}
              <div style={{marginBottom:14}}>
                <label style={S.label}>Email</label>
                <input value={authForm.email} onChange={e=>setAuthForm(p=>({...p,email:e.target.value}))} placeholder="you@email.com" type="email" style={S.input}/>
              </div>
              <div style={{marginBottom:authError?12:20}}>
                <label style={S.label}>Password</label>
                <input value={authForm.password} onChange={e=>setAuthForm(p=>({...p,password:e.target.value}))} placeholder={authMode==="signup"?"Min 6 characters":"Enter password"} type="password" style={S.input} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
              </div>
              {authError && <div style={{fontSize:12,color:"#ef4444",marginBottom:14,padding:"8px 12px",background:"#1a0a0a",borderRadius:8,border:"1px solid #7f1d1d"}}>{authError}</div>}
              <button onClick={handleAuth} style={S.btnPrimary}>{authMode==="signin"?"SIGN IN →":"CREATE ACCOUNT →"}</button>
            </div>
          )}
          <div style={{marginTop:18,padding:14,background:"#0f1f33",borderRadius:10,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span>🔒</span>
            <p style={{margin:0,fontSize:11,color:"#475569",lineHeight:1.5}}>Progress saved securely. Never shared with agencies.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // ONBOARDING
  // ════════════════════════════════════════
  if (screen==="onboarding") return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:"#f1f5f9",letterSpacing:2,margin:"0 0 6px"}}>SET YOUR TARGET</h2>
          <p style={{color:"#64748b",fontSize:13,margin:0}}>We personalize your question bank to your role</p>
        </div>
        <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:16,padding:28}}>
          {[{label:"Target Role",key:"role",options:["Agriculture Specialist","CBP Officer","Border Patrol Agent","Import Specialist","Special Agent","Federal Police Officer","PPQ Officer","BTOS","BTEC","JCD"]},
            {label:"Agency",key:"agency",options:["CBP / USDA","CBP Only","ICE / HSI","DEA","ATF","FBI","Secret Service","USMS"]}].map(f=>(
            <div key={f.key} style={{marginBottom:18}}>
              <label style={S.label}>{f.label}</label>
              <select value={profile[f.key]} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))} style={{...S.input,appearance:"none"}}>
                {f.options.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{marginBottom:26}}>
            <label style={S.label}>Experience Level</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {["Entry","Experienced","Supervisory"].map(l=>(
                <button key={l} onClick={()=>setProfile(p=>({...p,level:l}))} style={{padding:"10px 8px",borderRadius:8,border:`1px solid ${profile.level===l?"#4a9eff":"#1e3a5f"}`,background:profile.level===l?"#1a3a5c":"#0f1f33",color:profile.level===l?"#4a9eff":"#64748b",fontSize:12,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveProfile} style={S.btnPrimary}>START TRAINING →</button>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // UPGRADE
  // ════════════════════════════════════════
  if (screen==="upgrade") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={S.header}>
        <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>← Back</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:"#4a9eff"}}>UPGRADE PLAN</div>
        <div style={{fontSize:11,color:"#64748b"}}>Current: {TIERS[user?.tier||"free"].label}</div>
      </div>
      <div style={{padding:20,maxWidth:640,margin:"0 auto"}}>
        <p style={{textAlign:"center",fontSize:13,color:"#64748b",marginBottom:24}}>Unlock more questions, deeper AI feedback, and agency-specific prep</p>
        {TIER_ORDER.filter(t=>t!=="free").map(tierKey=>{
          const t=TIERS[tierKey]; const isCurrent=user?.tier===tierKey; const isTarget=upgradeTarget===tierKey;
          return (
            <div key={tierKey} style={{background:"#0a1628",border:`2px solid ${isTarget?t.color:"#1e3a5f"}`,borderRadius:16,padding:20,marginBottom:12,position:"relative",overflow:"hidden"}}>
              {isTarget && <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${t.color},${t.color}66)`}}/>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:t.color,letterSpacing:1}}>{t.label}</div><div style={{fontSize:11,color:"#475569"}}>{t.questions} questions unlocked</div></div>
                <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#f1f5f9"}}>{t.price}</div><div style={{fontSize:11,color:"#64748b"}}>{t.period}</div></div>
              </div>
              {t.features.map((f,i)=><div key={i} style={{fontSize:12,color:"#94a3b8",marginBottom:5,display:"flex",gap:8}}><span style={{color:t.color}}>✓</span>{f}</div>)}
              {isCurrent ? (
                <div style={{padding:"10px",textAlign:"center",background:"#0f1f33",borderRadius:8,fontSize:12,color:"#64748b",marginTop:14}}>Current Plan</div>
              ) : (
                <button onClick={()=>handleStripeCheckout(tierKey)} disabled={stripeLoading}
                  style={{width:"100%",marginTop:14,padding:"14px",background:stripeLoading?"#1e3a5f":`linear-gradient(135deg,${t.color}88,${t.color})`,border:"none",borderRadius:10,color:stripeLoading?"#64748b":"#fff",fontSize:16,fontWeight:700,cursor:stripeLoading?"not-allowed":"pointer",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>
                  {stripeLoading?"LOADING...":tierKey==="federal_pack"?"💳 BUY ONE-TIME — $97 →":"💳 SUBSCRIBE NOW →"}
                </button>
              )}
            </div>
          );
        })}
        <p style={{textAlign:"center",fontSize:11,color:"#334155",marginTop:4}}>🔒 Stripe-secured · Cancel anytime · 7-day guarantee</p>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════
  if (screen==="dashboard") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={S.header}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:"#4a9eff"}}>FED PREP</div>
          <button onClick={()=>setShowProfileSwitcher(v=>!v)}
            style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontSize:11,color:"#64748b"}}>{profile.role} · {profile.agency}</div>
            <span style={{fontSize:10,color:"#4a9eff"}}>▼</span>
          </button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setScreen("upgrade")} style={{padding:"5px 12px",background:`${tierInfo.color}22`,border:`1px solid ${tierInfo.color}55`,borderRadius:20,color:tierInfo.color,fontSize:11,cursor:"pointer",fontWeight:600}}>{tierInfo.label} ↑</button>
          <button onClick={handleSignOut} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:11}}>Sign out</button>
        </div>
      </div>
      <div style={{padding:20,maxWidth:640,margin:"0 auto"}}>

        {/* Profile Switcher */}
        {showProfileSwitcher && (
          <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{fontSize:11,letterSpacing:2,color:"#4a9eff",textTransform:"uppercase",marginBottom:12}}>Your Profiles</div>
            {profiles.map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,background:p.id===activeProfileId?"#1a3a5c":"#0f1f33",border:`1px solid ${p.id===activeProfileId?"#4a9eff":"#1e3a5f"}`,marginBottom:8,cursor:"pointer"}}
                onClick={()=>switchProfile(p)}>
                <div>
                  <div style={{fontSize:13,color:p.id===activeProfileId?"#4a9eff":"#f1f5f9",fontWeight:600}}>{p.role}</div>
                  <div style={{fontSize:11,color:"#475569"}}>{p.agency} · {p.level}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {p.id===activeProfileId && <span style={{fontSize:10,color:"#4a9eff"}}>Active</span>}
                  {profiles.length>1 && <button onClick={e=>{e.stopPropagation();deleteProfile(p.id);}}
                    style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:16,padding:"0 4px"}}>×</button>}
                </div>
              </div>
            ))}
            <button onClick={addNewProfile}
              style={{width:"100%",padding:"10px",background:"transparent",border:"1px dashed #1e3a5f",borderRadius:10,color:"#4a9eff",fontSize:12,cursor:"pointer",marginTop:4}}>
              + Add New Profile
            </button>
          </div>
        )}

        <div style={{marginBottom:18}}>
          <div style={{fontSize:13,color:"#64748b"}}>Welcome back,</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:1}}>{user?.name}</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
          {[{label:"Sessions",value:sessions.length,color:"#4a9eff"},
            {label:"Avg Score",value:sessions.length?`${avgScore}/25`:"—",color:getScoreColor(avgScore)},
            {label:"Status",value:avgScore>=21?"Ready ✓":avgScore>=15?"Building":sessions.length?"Training":"New",color:avgScore>=21?"#22c55e":"#f59e0b"}].map(s=>(
            <div key={s.label} style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:s.color,letterSpacing:1}}>{s.value}</div>
              <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={startMockInterview}
          style={{width:"100%",marginBottom:14,padding:"16px",background:"linear-gradient(135deg,#1a2a3a,#1e3a5c)",border:"1px solid #06b6d444",borderRadius:14,color:"#f1f5f9",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{textAlign:"left"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:"#06b6d4"}}>🎭 FULL MOCK INTERVIEW</div>
            <div style={{fontSize:11,color:"#475569",marginTop:2}}>6-question panel simulation · Final report card</div>
          </div>
          <span style={{color:"#06b6d4",fontSize:18}}>→</span>
        </button>

        {user?.tier==="free" && (
          <button onClick={()=>setScreen("upgrade")} style={{width:"100%",marginBottom:14,padding:"13px 16px",background:"linear-gradient(135deg,#1a3a5c,#1e4a7a)",border:"1px solid #4a9eff44",borderRadius:12,color:"#f1f5f9",fontSize:13,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>🔓 Unlock more questions — from $19/mo</span>
            <span style={{color:"#4a9eff"}}>Upgrade →</span>
          </button>
        )}

        <div style={{marginBottom:12}}>
          <div style={{...S.sectionLbl,marginBottom:10}}>Question Bank</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>setFilterCat(c)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${filterCat===c?"#4a9eff":"#1e3a5f"}`,background:filterCat===c?"#1a3a5c":"transparent",color:filterCat===c?"#4a9eff":"#64748b",fontSize:11,cursor:"pointer"}}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filteredQs.map(q=>{
            const colors=CATEGORY_COLORS[q.category];
            const done=sessions.find(s=>s.question.id===q.id);
            const locked=!canAccess(q.tier,user?.tier||"free");
            return (
              <div key={q.id} onClick={()=>startPractice(q)}
                style={{background:locked?"#080f1a":"#0a1628",border:`1px solid ${done?"#1e5c3a":locked?"#0f1f33":"#1e3a5f"}`,borderLeft:`3px solid ${locked?"#1e3a5f":colors.accent}`,borderRadius:12,padding:16,cursor:"pointer",opacity:locked?0.7:1,position:"relative"}}>
                {locked && <div style={{position:"absolute",top:10,right:12,fontSize:14}}>🔒</div>}
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                  <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:colors.bg,color:colors.accent,fontWeight:600}}>{q.category}</span>
                  <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#0f1f33",color:"#64748b"}}>{q.format}</span>
                  <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#0f1f33",color:DIFFICULTY_COLORS[q.difficulty]}}>{q.difficulty}</span>
                  {locked && <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:`${TIERS[q.tier].color}22`,color:TIERS[q.tier].color}}>{TIERS[q.tier].label}</span>}
                  {done && <span style={{fontSize:10,color:"#22c55e",marginLeft:"auto"}}>✓ {done.feedback?.total}/25</span>}
                </div>
                <p style={{margin:0,fontSize:13,color:locked?"#334155":"#cbd5e1",lineHeight:1.5}}>{locked?"Unlock to access this question":q.text}</p>
                {!locked && <div style={{marginTop:6,fontSize:11,color:"#475569"}}>Competency: {q.competency}</div>}
              </div>
            );
          })}
        </div>
        {sessions.length>0 && <button onClick={()=>setScreen("progress")} style={{...S.btnGhost,marginTop:18}}>View Progress Report →</button>}
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // PRACTICE
  // ════════════════════════════════════════
  if (screen==="practice") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={S.header}>
        <button onClick={()=>{setTimerActive(false);setMockTimerActive(false);setMockMode(false);setScreen("dashboard");}} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>← Back</button>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          {mockMode && (
            <div style={{fontSize:10,color:"#06b6d4",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>
              🎭 Mock Panel · Q{mockIndex+1} of {mockQuestions.length}
            </div>
          )}
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:timerActive?"#4a9eff":"#64748b",letterSpacing:2}}>⏱ {formatTime(timer)}</div>
        </div>
        {mockMode && <div style={{fontSize:11,color:"#475569"}}>Total: {formatTime(mockTimer)}</div>}
      </div>

      {mockMode && (
        <div style={{height:3,background:"#0f1f33"}}>
          <div style={{height:"100%",width:`${((mockIndex+1)/mockQuestions.length)*100}%`,background:"linear-gradient(90deg,#06b6d4,#4a9eff)",transition:"width 0.5s ease"}}/>
        </div>
      )}

      <div style={{padding:20,maxWidth:640,margin:"0 auto"}}>
        <div style={{background:"#0a1628",border:`1px solid ${CATEGORY_COLORS[selectedQ.category].accent}44`,borderLeft:`4px solid ${CATEGORY_COLORS[selectedQ.category].accent}`,borderRadius:16,padding:20,marginBottom:16}}>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:CATEGORY_COLORS[selectedQ.category].bg,color:CATEGORY_COLORS[selectedQ.category].accent,fontWeight:600}}>{selectedQ.category}</span>
            <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#0f1f33",color:"#64748b"}}>{selectedQ.id}</span>
            {mockMode && <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#06b6d422",color:"#06b6d4"}}>Panel Q{mockIndex+1}</span>}
          </div>
          <p style={{margin:"0 0 14px",fontSize:16,fontWeight:600,lineHeight:1.5}}>{selectedQ.text}</p>

          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
            <button onClick={isSpeaking?stopSpeaking:()=>speakQuestion(selectedQ.text)}
              style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${isSpeaking?"#06b6d4":"#1e3a5f"}`,background:isSpeaking?"#0a1a2a":"transparent",color:isSpeaking?"#06b6d4":"#475569",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              {isSpeaking?"🔊 Playing...":"🔊 Hear Question"}
            </button>
            <button onClick={()=>{setPanelVoiceEnabled(v=>!v);stopSpeaking();}}
              style={{padding:"6px 12px",borderRadius:20,border:"1px solid #1e3a5f",background:"transparent",color:panelVoiceEnabled?"#22c55e":"#475569",fontSize:11,cursor:"pointer"}}>
              {panelVoiceEnabled?"Voice ON":"Voice OFF"}
            </button>
          </div>

          <div style={{background:"#0f1f33",borderRadius:8,padding:12}}>
            <div style={{fontSize:10,letterSpacing:1,color:"#4a9eff",textTransform:"uppercase",marginBottom:4}}>💡 Coach Tip</div>
            <p style={{margin:0,fontSize:12,color:"#94a3b8",lineHeight:1.5}}>{selectedQ.tip}</p>
          </div>
        </div>

        {selectedQ.format==="STAR" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {["Situation","Task","Action","Result"].map(s=>(
              <div key={s} style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#475569"}}>
                <span style={{color:"#4a9eff",fontWeight:700}}>{s[0]}</span> — {s}
              </div>
            ))}
          </div>
        )}

        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={S.label}>Your Response</label>
            {voiceSupported && (
              <button onClick={isRecording?stopVoice:startVoice}
                style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${isRecording?"#ef4444":"#1e3a5f"}`,background:isRecording?"#1a0a0a":"transparent",color:isRecording?"#ef4444":"#64748b",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:6,animation:isRecording?"pulse 1s infinite":"none"}}>
                {isRecording?"🔴 Stop Recording":"🎤 Speak Answer"}
              </button>
            )}
          </div>
          {isRecording && (
            <div style={{background:"#1a0a0a",border:"1px solid #ef444444",borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",animation:"pulse 1s infinite"}}/>
              <span style={{fontSize:12,color:"#ef4444"}}>Listening... speak your answer clearly</span>
            </div>
          )}
          <textarea value={response} onChange={e=>setResponse(e.target.value)}
            placeholder={voiceSupported?"Tap 🎤 to speak your answer, or type here...":"Type your response as you would speak in a real panel interview..."}
            rows={8}
            style={{...S.input,resize:"vertical",lineHeight:1.6,fontFamily:"'DM Sans',sans-serif",padding:"14px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:11,color:"#475569"}}>{response.split(/\s+/).filter(Boolean).length} words</span>
            <span style={{fontSize:11,color:"#475569"}}>Recommended: 150–250 words</span>
          </div>
        </div>

        <button onClick={submitAnswer} disabled={loading||!response.trim()}
          style={{...S.btnPrimary,background:loading?"#1e3a5f":"linear-gradient(135deg,#1a5c9e,#4a9eff)",color:loading?"#64748b":"#fff",cursor:loading?"not-allowed":"pointer"}}>
          {loading?"EVALUATING RESPONSE...":mockMode?`SUBMIT & CONTINUE (${mockIndex+1}/${mockQuestions.length}) →`:"SUBMIT FOR AI EVALUATION →"}
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );

  // ════════════════════════════════════════
  // MOCK FEEDBACK
  // ════════════════════════════════════════
  if (screen==="mockFeedback") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={S.header}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:"#06b6d4"}}>🎭 MOCK PANEL</div>
        <div style={{fontSize:11,color:"#475569"}}>Q{mockIndex+1} of {mockQuestions.length} complete</div>
      </div>
      <div style={{height:3,background:"#0f1f33"}}>
        <div style={{height:"100%",width:`${((mockIndex+1)/mockQuestions.length)*100}%`,background:"linear-gradient(90deg,#06b6d4,#4a9eff)"}}/>
      </div>
      <div style={{padding:20,maxWidth:640,margin:"0 auto"}}>
        <div style={{...S.card,textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Question {mockIndex+1} Score</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:56,color:getScoreColor(feedback?.total||0),letterSpacing:2}}>{feedback?.total||0}</div>
          <div style={{fontSize:12,color:"#64748b"}}>out of 25</div>
          <span style={{fontSize:11,padding:"4px 12px",borderRadius:20,background:getRating(feedback?.total||0).color+"22",color:getRating(feedback?.total||0).color,fontWeight:700}}>{getRating(feedback?.total||0).label.toUpperCase()}</span>
        </div>
        {feedback?.strengths?.length>0 && (
          <div style={{background:"#0a1a0a",border:"1px solid #14532d",borderRadius:12,padding:14,marginBottom:12}}>
            <div style={{fontSize:11,color:"#22c55e",marginBottom:8,fontWeight:700}}>✅ Strong Points</div>
            {feedback.strengths.map((s,i)=><div key={i} style={{fontSize:12,color:"#86efac",marginBottom:3}}>• {s}</div>)}
          </div>
        )}
        {feedback?.improvements?.length>0 && (
          <div style={{background:"#1a150a",border:"1px solid #78350f",borderRadius:12,padding:14,marginBottom:16}}>
            <div style={{fontSize:11,color:"#f59e0b",marginBottom:8,fontWeight:700}}>⚠️ Improve For Next Question</div>
            {feedback.improvements.map((s,i)=><div key={i} style={{fontSize:12,color:"#fcd34d",marginBottom:3}}>• {s}</div>)}
          </div>
        )}
        <button onClick={nextMockQuestion}
          style={{...S.btnPrimary,background:"linear-gradient(135deg,#1a3a5c,#06b6d4)"}}>
          NEXT QUESTION ({mockIndex+2} of {mockQuestions.length}) →
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // MOCK REPORT
  // ════════════════════════════════════════
  if (screen==="mockReport") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={S.header}>
        <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>← Dashboard</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:"#06b6d4"}}>MOCK PANEL REPORT</div>
      </div>
      <div style={{padding:20,maxWidth:640,margin:"0 auto"}}>
        <div style={{...S.card,textAlign:"center",background:"linear-gradient(135deg,#0a1628,#0a1a2a)",border:"1px solid #06b6d444"}}>
          <div style={{fontSize:11,letterSpacing:2,color:"#06b6d4",textTransform:"uppercase",marginBottom:8}}>Panel Simulation Complete</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:72,color:getScoreColor(mockAvgScore),lineHeight:1,letterSpacing:2}}>{mockAvgScore}</div>
          <div style={{fontSize:14,color:"#64748b",marginBottom:8}}>average out of 25</div>
          <span style={{fontSize:14,padding:"6px 16px",borderRadius:20,background:getRating(mockAvgScore).color+"22",color:getRating(mockAvgScore).color,fontWeight:700,letterSpacing:1}}>
            {getRating(mockAvgScore).label.toUpperCase()}
          </span>
          <div style={{marginTop:16,fontSize:12,color:"#475569"}}>⏱ Total time: {formatTime(mockTimer)} · {mockResponses.length} questions</div>
          <div style={{marginTop:14}}><RadarChart scores={mockResponses.length?mockResponses[mockResponses.length-1].feedback?.scores:null}/></div>
        </div>
        <div style={{...S.sectionLbl,marginBottom:12}}>Question Breakdown</div>
        {mockResponses.map((r,i)=>(
          <div key={i} style={{background:"#0a1628",border:`1px solid ${CATEGORY_COLORS[r.question.category]?.accent||"#4a9eff"}33`,borderLeft:`3px solid ${CATEGORY_COLORS[r.question.category]?.accent||"#4a9eff"}`,borderRadius:12,padding:14,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:11,color:CATEGORY_COLORS[r.question.category]?.accent||"#4a9eff",fontWeight:700,marginBottom:2}}>Q{i+1} — {r.question.category}</div>
                <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.4}}>{r.question.text}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:getScoreColor(r.feedback?.total||0),letterSpacing:1}}>{r.feedback?.total||0}/25</div>
                <div style={{fontSize:10,color:getRating(r.feedback?.total||0).color}}>{getRating(r.feedback?.total||0).label}</div>
              </div>
            </div>
            {r.feedback?.flags?.length>0 && (
              <div style={{fontSize:11,color:"#ef4444",marginTop:4}}>⚠️ {r.feedback.flags[0]}</div>
            )}
          </div>
        ))}
        <div style={{background:"#0a1628",border:`1px solid ${getRating(mockAvgScore).color}44`,borderRadius:14,padding:20,marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:11,letterSpacing:2,color:getRating(mockAvgScore).color,textTransform:"uppercase",marginBottom:8}}>Panel Verdict</div>
          {mockAvgScore>=21 ? (
            <p style={{margin:0,fontSize:13,color:"#94a3b8",lineHeight:1.7}}>🎉 Outstanding performance! Your responses demonstrate the competency, structure, and professionalism federal panels look for. You are panel-ready.</p>
          ) : mockAvgScore>=15 ? (
            <p style={{margin:0,fontSize:13,color:"#94a3b8",lineHeight:1.7}}>📈 Solid foundation with clear areas to sharpen. Focus on STAR structure and adding specific outcome details to your answers. Run another mock to track improvement.</p>
          ) : (
            <p style={{margin:0,fontSize:13,color:"#94a3b8",lineHeight:1.7}}>💪 This is your baseline — and improvement from here is fast. Practice individual questions to strengthen weak competencies before your next full mock.</p>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <button onClick={startMockInterview} style={S.btnGhost}>🔁 Retake Mock</button>
          <button onClick={()=>setScreen("dashboard")} style={{...S.btnPrimary,fontSize:14}}>Dashboard →</button>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // FEEDBACK
  // ════════════════════════════════════════
  if (screen==="feedback") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={S.header}>
        <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>← Dashboard</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:"#4a9eff"}}>AI FEEDBACK</div>
      </div>
      <div style={{padding:20,maxWidth:640,margin:"0 auto"}}>
        {feedback?.error ? (
          <div style={{background:"#1a1a2e",border:"1px solid #ef4444",borderRadius:12,padding:20,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>⚠️</div>
            <p style={{color:"#ef4444"}}>{feedback.message}</p>
            <button onClick={()=>setScreen("practice")} style={{padding:"10px 20px",background:"#1e3a5f",border:"none",borderRadius:8,color:"#4a9eff",cursor:"pointer"}}>Try Again</button>
          </div>
        ) : feedback && (
          <>
            <div style={{...S.card,textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:getScoreColor(feedback.total),lineHeight:1,letterSpacing:2}}>{feedback.total}</div>
              <div style={{fontSize:14,color:"#64748b",marginBottom:8}}>out of 25</div>
              <span style={{fontSize:12,padding:"5px 14px",borderRadius:20,background:getRating(feedback.total).color+"22",color:getRating(feedback.total).color,fontWeight:700,letterSpacing:1}}>{getRating(feedback.total).label.toUpperCase()}</span>
              <div style={{marginTop:14}}><RadarChart scores={feedback.scores}/></div>
            </div>
            <div style={S.card}>
              <div style={S.sectionLbl}>Score Breakdown</div>
              {Object.entries(feedback.scores).map(([dim,val])=>(
                <ScoreBar key={dim} label={dim.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())} value={val} color={getScoreColor(val,5)}/>
              ))}
            </div>
            {feedback.flags?.length>0 && (
              <div style={{background:"#1a0a0a",border:"1px solid #7f1d1d",borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{...S.sectionLbl,color:"#ef4444"}}>⚠️ Panel Flags</div>
                {feedback.flags.map((f,i)=><div key={i} style={{fontSize:12,color:"#fca5a5",marginBottom:4}}>• {f}</div>)}
              </div>
            )}
            {feedback.strengths?.length>0 && (
              <div style={{background:"#0a1a0a",border:"1px solid #14532d",borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{...S.sectionLbl,color:"#22c55e"}}>✅ What You Did Well</div>
                {feedback.strengths.map((s,i)=><div key={i} style={{fontSize:12,color:"#86efac",marginBottom:4}}>• {s}</div>)}
              </div>
            )}
            {feedback.improvements?.length>0 && (
              <div style={{background:"#1a150a",border:"1px solid #78350f",borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{...S.sectionLbl,color:"#f59e0b"}}>⚠️ What To Improve</div>
                {feedback.improvements.map((s,i)=><div key={i} style={{fontSize:12,color:"#fcd34d",marginBottom:4}}>• {s}</div>)}
              </div>
            )}
            {feedback.suggested_answer && (
              <div style={{...S.card,marginBottom:14}}>
                <div style={S.sectionLbl}>💬 Stronger Answer Example</div>
                <p style={{margin:0,fontSize:12,color:"#94a3b8",lineHeight:1.7}}>{feedback.suggested_answer}</p>
              </div>
            )}
            {feedback.next_tip && (
              <div style={{background:"#0a1628",border:"1px solid #2d1a4a",borderRadius:12,padding:14,marginBottom:18}}>
                <div style={{...S.sectionLbl,color:"#a855f7"}}>🎯 Coach's Next Step</div>
                <p style={{margin:0,fontSize:12,color:"#c4b5fd"}}>{feedback.next_tip}</p>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button onClick={()=>startPractice(selectedQ)} style={S.btnGhost}>🔁 Try Again</button>
              <button onClick={()=>setScreen("dashboard")} style={{padding:"13px",background:"linear-gradient(135deg,#1a5c9e,#4a9eff)",border:"none",borderRadius:10,color:"#fff",fontSize:13,cursor:"pointer",fontWeight:600}}>Next Question →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // PROGRESS
  // ════════════════════════════════════════
  if (screen==="progress") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={S.header}>
        <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13}}>← Dashboard</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:"#4a9eff"}}>PROGRESS REPORT</div>
      </div>
      <div style={{padding:20,maxWidth:640,margin:"0 auto"}}>
        <div style={{...S.card,textAlign:"center"}}>
          <div style={{fontSize:11,letterSpacing:2,color:"#64748b",textTransform:"uppercase",marginBottom:8}}>Overall Average</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:56,color:getScoreColor(avgScore),letterSpacing:2}}>{avgScore}/25</div>
          <div style={{fontSize:13,color:getRating(avgScore).color,fontWeight:700,marginBottom:4}}>{getRating(avgScore).label}</div>
          <div style={{fontSize:11,color:"#475569"}}>{sessions.length} session{sessions.length!==1?"s":""} completed</div>
          <div style={{marginTop:14}}><RadarChart scores={sessions.length?sessions[sessions.length-1].feedback?.scores:null}/></div>
        </div>
        <div style={S.sectionLbl}>Session History</div>
        {sessions.map((s,i)=>(
          <div key={i} style={{background:"#0a1628",border:"1px solid #1e3a5f",borderLeft:`3px solid ${CATEGORY_COLORS[s.question.category]?.accent||"#4a9eff"}`,borderRadius:12,padding:14,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{s.question.category} — {s.question.id}</div>
              <div style={{fontSize:11,color:"#475569",marginBottom:2}}>{s.date} · {formatTime(s.time)}</div>
              <div style={{fontSize:11,color:"#334155"}}>{s.question.competency}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:getScoreColor(s.feedback?.total||0),letterSpacing:1}}>{s.feedback?.total||0}/25</div>
              <div style={{fontSize:10,color:getRating(s.feedback?.total||0).color}}>{getRating(s.feedback?.total||0).label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}
