"use client";
import {useState} from "react";
import {ArrowUpRight, ArrowRight, BookOpen, CalendarDays, ClipboardList, CreditCard, Check, ScanLine, Layers, Package, Gift, LockKeyhole, RotateCcw, WifiOff, QrCode, MonitorPlay, Pill, FileCheck2, ScrollText, DatabaseBackup, BadgeCheck, Printer} from "lucide-react";
import {Tabs,TabsList,TabsTrigger} from "@/components/ui/tabs";
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from "@/components/ui/accordion";
import Odontogram from "@/components/Odontogram";
import {type ChartState,toothName} from "@/lib/teeth";
import PilotForm from "./pilot-form";

function seedChart():ChartState{return {16:{toothFdi:16,status:"CARIES",surfaces:["O"],note:null,createdAt:"2026-01-01"},26:{toothFdi:26,status:"FILLED",surfaces:["O","M"],note:null,createdAt:"2026-01-01"},46:{toothFdi:46,status:"CROWN",surfaces:[],note:null,createdAt:"2026-01-01"}}}
function ChartDemo(){const [dentition,setDentition]=useState("adult");const [selected,setSelected]=useState(16);const [chart,setChart]=useState<ChartState>(seedChart);const [note,setNote]=useState("Select a tooth to explore.");function mark(status:string){setChart(c=>({...c,[selected]:{toothFdi:selected,status,surfaces:status==="CROWN"?[]:[selected%10<=3?"I":"O"],note:null,createdAt:"2026-01-01"}}));setNote(`Tooth ${selected} marked ${status.toLowerCase()} in this demo.`)}return <div id="product" className="product-frame"><div className="app-bar"><span><BookOpen size={18}/> DiaryDoc <span className="app-divider">/</span> Dental chart</span><span className="sample-label">Interactive demo · sample data</span></div><div className="chart-toolbar"><div><span className="mini-label">BUILT AROUND DENTISTRY</span><h3>A tooth chart that works<br className="mobile-only"/> the way you think.</h3></div><Tabs value={dentition} onValueChange={v=>{setDentition(v);setSelected(v==="adult"?16:55);setNote("Select a tooth to explore.")}}><TabsList aria-label="Dentition"><TabsTrigger value="adult">Adult · 32</TabsTrigger><TabsTrigger value="primary">Primary · 20</TabsTrigger></TabsList></Tabs></div><div className="chart-body"><div className="chart-canvas"><div className="chart-orientation"><span>Patient’s right</span><span>Patient’s left</span></div><div className="chart-scroll" tabIndex={0} aria-label="Interactive dental chart; scroll horizontally on smaller screens"><Odontogram chart={chart} showPrimary={dentition==="primary"} showAdult={dentition==="adult"} selected={selected} onSelect={n=>{setSelected(n);setNote(`Tooth ${n} selected.`)}}/></div><div className="chart-legend"><span><i className="key-caries"/> Caries</span><span><i className="key-filled"/> Restored</span><span><i className="key-crown"/> Crown</span></div></div><aside className="tooth-panel"><span className="mini-label">SELECTED TOOTH</span><strong>FDI {selected}</strong><p>{toothName(selected)}</p><div className="mark-actions"><button onClick={()=>mark("CARIES")}>Mark caries</button><button onClick={()=>mark("FILLED")}>Mark restored</button><button onClick={()=>mark("CROWN")}>Mark crown</button></div></aside></div><div className="chart-bottom"><span role="status" aria-live="polite">{note}</span><button onClick={()=>{setChart(seedChart());setNote("Demo reset. Select a tooth to explore.")}}><RotateCcw size={13}/> Reset</button></div><div className="demo-caption">Try selecting and marking a tooth. This demo stays in your browser and resets on reload.</div></div>}
export function Brand(){return <a href="#top" className="brand" aria-label="DiaryDoc home"><span className="logo-crop"><img src="/logo-mark.png" alt="" width="96" height="96"/></span>DiaryDoc<span className="brand-period">.</span></a>}

const features=[
  {icon:CalendarDays,title:"A smoother clinic day",text:"Appointments, walk-in tokens and a live waiting queue, with a calendar for each dentist."},
  {icon:ClipboardList,title:"A connected patient record",text:"Medical history, dental findings, structured visit notes and printable prescriptions."},
  {icon:Layers,title:"Treatment, sitting by sitting",text:"Tooth-level plans, cost estimates and progress across multiple visits."},
  {icon:QrCode,title:"Paid before they leave",text:"GST invoices carry a UPI QR for the exact balance. The patient scans with any UPI app and the receipt prints on the spot."},
  {icon:MonitorPlay,title:"A waiting room that runs itself",text:"Put the queue screen on a TV. Token numbers big, first names only — no clinical detail on display."},
  {icon:Pill,title:"Prescriptions that check themselves",text:"A drug library with dosage shorthand, cross-checked against the patient’s allergies and current medication."},
  {icon:ScanLine,title:"Imaging and lab work",text:"Keep X-rays, photos, annotations and lab orders close to the patient record."},
  {icon:Package,title:"The practice behind the care",text:"Consumable stock with batch and expiry, plus reports on clinic activity and collections."},
  {icon:Printer,title:"Everything prints properly",text:"Prescriptions, invoices, receipts, estimates, tooth charts, perio charts, lab slips and purchase orders."},
];

const tour=[
  {
    src:"/tour/dashboard",
    alt:"DiaryDoc dashboard showing month-to-date patients, appointments and collections for a demo clinic",
    w:1500,h:850,
    eyebrow:"FOR THE OWNER",
    title:"Monday morning, in one screen.",
    text:"Collections, billing, appointments and procedures for any period you pick — plus who’s on leave this week. Every card opens into the detail behind it.",
  },
  {
    src:"/tour/invoice",
    alt:"A DiaryDoc tax invoice with GSTIN, HSN/SAC codes, balance due and a UPI payment QR code",
    w:1200,h:1086,
    pad:true,
    eyebrow:"FOR THE FRONT DESK",
    title:"A GST invoice with the QR already on it.",
    text:"HSN/SAC codes, your GSTIN, part-payments and balance due. The QR is generated for the exact amount outstanding, so there’s nothing to type into a payment app.",
  },
  {
    src:"/tour/kiosk",
    alt:"The DiaryDoc waiting-room screen showing the token now being served and the tokens waiting",
    w:1400,h:860,
    eyebrow:"FOR THE WAITING ROOM",
    title:"The screen your patients watch.",
    text:"A public display for any TV or spare monitor. Token numbers and first names only — the rest of the record never reaches the wall.",
  },
];

const trust=[
  {icon:WifiOff,title:"Keeps working when the internet doesn’t",text:"DiaryDoc runs on your clinic’s own machine. A broadband outage doesn’t stop charting, billing or printing."},
  {icon:ScrollText,title:"An audit trail that records reads",text:"Append-only logging of who changed a record and who merely opened one — what the DPDP Act asks a data fiduciary to show."},
  {icon:BadgeCheck,title:"ABDM-ready identity",text:"ABHA number capture with format validation, card-sighting and a purpose-coded consent ledger."},
  {icon:DatabaseBackup,title:"Backups that get tested",text:"Encrypted database and file backups, with scheduled recovery drills so a restore is something you’ve already seen work."},
  {icon:LockKeyhole,title:"Role by role, not all-or-nothing",text:"Seventeen permissions across admin, doctor, receptionist and nurse — switched on and off per role by you."},
  {icon:FileCheck2,title:"Consent on the record",text:"Per-procedure consent forms captured with an on-screen signature, stored against the patient and printable on demand."},
];

const faqs=[
  ["What can I actually do on day one?","Register patients with an auto-generated MRN, book and check in appointments, issue walk-in tokens, chart teeth on the FDI odontogram, write structured visit notes and prescriptions, build treatment plans, and raise a GST invoice with a UPI QR on it. All of it prints."],
  ["Does it keep working if my internet drops?","Yes. DiaryDoc runs on a machine in your clinic, so the front desk and the chair carry on through an outage. Only the parts that genuinely need the outside world — ABDM verification, any future messaging gateway — wait for the connection to come back."],
  ["Who is the pilot for?","Dentists, clinic owners and practice teams in India who want to evaluate DiaryDoc for their dental workflows and share feedback."],
  ["What happens after I apply?","Your application is saved for the DiaryDoc team to review. Submitting it is an expression of interest, not confirmation of a pilot place. Pilot scope, timing, support and commercial terms will need to be agreed before onboarding."],
  ["Can I bring existing patient records?","DiaryDoc includes CSV import tools with an import history you can review batch by batch. Field mapping and data preparation should be looked at for your clinic before a migration."],
  ["Is DiaryDoc cloud-based?","No — and that’s deliberate. DiaryDoc currently runs on-premise for a single clinic, which is what keeps it working during an outage. Your clinic manages its deployment, access, storage and backups. A hosted option is a future direction, not a feature promised with this pilot."],
  ["Are reminders and online payments automated?","Partly. Invoices carry a UPI QR the patient can scan, and payments are recorded in DiaryDoc. Reminder and recall templates open a prefilled WhatsApp message for your staff to send — automatic messaging and a payment gateway need external services and aren’t connected today."],
  ["Does DiaryDoc support ABHA and DICOM?","ABHA capture, format validation and a local consent ledger are present; online ABDM verification needs further integration. X-rays and photos are supported with an annotation layer and structured radiology reports, while built-in DICOM viewing is still planned."],
];

function TourShot({item,flip}:{item:typeof tour[number];flip:boolean}){
  return <article className={`tour-row${flip?" tour-flip":""}`}>
    <div className="tour-copy">
      <p className="eyebrow">{item.eyebrow}</p>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </div>
    <figure className={`tour-shot${"pad" in item&&item.pad?" shot-pad":""}`}>
      <div className="shot-chrome"><span/><span/><span/></div>
      <picture>
        <source srcSet={`${item.src}.webp`} type="image/webp"/>
        <img src={`${item.src}.png`} alt={item.alt} width={item.w} height={item.h} loading="lazy" decoding="async"/>
      </picture>
    </figure>
  </article>;
}

export default function Home(){return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header" id="top"><div className="container nav"><Brand/><nav aria-label="Main navigation"><a href="#product">Product</a><a href="#tour">Tour</a><a href="#pilot">The pilot</a><a href="#faq">FAQs</a></nav><a href="#pilot" className="button button-small">Request pilot access <ArrowUpRight size={17}/></a></div></header><main id="main"><section className="hero container"><div className="eyebrow"><span className="pill">PILOT APPLICATIONS</span> Built for Indian dental clinics</div><h1>Your dental clinic, connected.<br/><span>Chairside to billing.</span></h1><p className="hero-copy">Tooth charting, patient records, treatment plans and GST billing.<br className="desktop-break"/> One system, running in your clinic — with or without the internet.</p><div className="hero-actions"><a className="button" href="#pilot">Request pilot access <ArrowUpRight size={19}/></a><a className="text-link" href="#tour">See it in the clinic <ArrowRight size={18}/></a></div><p className="hero-note">Explore the product. Help shape what comes next.</p><ChartDemo/><div className="benefit-strip"><span><Check/> Works without internet</span><span><Check/> FDI adult &amp; primary charting</span><span><Check/> GST invoices with UPI QR</span></div></section>

<section className="tour-section" id="tour"><div className="container section"><div className="section-heading"><div><p className="eyebrow">THE REAL THING</p><h2>Not a mockup.<br/>The software itself.</h2></div><p>Three screens from a DiaryDoc instance running on a demo clinic’s data.</p></div><div className="tour-list">{tour.map((t,i)=><TourShot key={t.src} item={t} flip={i%2===1}/>)}</div></div></section>

<section className="features-section" id="features"><div className="container section"><div className="section-heading"><div><p className="eyebrow">DENTAL WORKFLOWS, BUILT IN</p><h2>Less switching.<br/>More continuity.</h2></div><p>From the first appointment to the final receipt, keep the clinical details and the front desk in sync.</p></div><div className="features-grid">{features.map(f=><article key={f.title}><span className="feature-icon"><f.icon size={22}/></span><h3>{f.title}</h3><p>{f.text}</p></article>)}</div><div className="journey" aria-label="Patient journey">{["Consultation","Treatment plan","Prescription","Billing & follow-up"].map((s,i)=><div key={s}><span>0{i+1}</span>{s}{i<3&&<ArrowRight size={17}/>}</div>)}</div></div></section>

<section className="trust-section" id="trust"><div className="container section"><div className="section-heading trust-heading"><div><p className="eyebrow">BUILT FOR INDIAN PRACTICE</p><h2>Patient records are<br/>somebody’s private life.</h2></div><p>DiaryDoc is built around India’s DPDP Act and the ABDM ecosystem — not retrofitted to them.</p></div><div className="trust-grid">{trust.map(t=><article key={t.title}><span className="trust-icon"><t.icon size={20}/></span><h3>{t.title}</h3><p>{t.text}</p></article>)}</div><p className="trust-foot">Pilot applications submitted on this page are stored separately from any clinical record.</p></div></section>

<section className="container section practice-section"><div><p className="eyebrow">BEYOND THE BASICS</p><h2>A practice has<br/>more than one specialty.</h2><p>Dedicated workflows for the care you deliver, with everyday practice tools alongside them.</p><div className="specialty-tags"><span>6-site periodontal charting</span><span>Ortho cases, aligners &amp; ceph</span><span>Oral surgery &amp; post-op notes</span><span>Paediatric behaviour records</span></div></div><div className="practice-cards"><article><Gift size={24}/><div><h3>Recognise returning patients.</h3><p>Track reward points, referral bonuses and redemption against invoices, with configurable clinic rules.</p></div></article><article><CreditCard size={24}/><div><h3>Close the day, not just the till.</h3><p>Day-end cash summaries by payment mode, patient advances, outstanding dues and recall lists ready for a WhatsApp nudge.</p></div></article></div></section>

<section className="pilot-section" id="pilot"><div className="container pilot-grid"><div className="pilot-copy"><p className="eyebrow">BUILD WITH US</p><h2>Your experience.<br/>DiaryDoc’s next chapter.</h2><p>Bring your clinic’s everyday workflows to the conversation. Apply to explore DiaryDoc and help shape the product through practical feedback.</p><ol><li><span>01</span><div><strong>Tell us about your clinic</strong><p>A few details to start the conversation.</p></div></li><li><span>02</span><div><strong>Discuss the fit</strong><p>Review your workflows and what you’d like to evaluate.</p></div></li><li><span>03</span><div><strong>Agree the next steps</strong><p>Confirm scope and terms before any onboarding.</p></div></li></ol><p className="pilot-disclaimer">Applications express interest. Pilot availability, timing, pricing and support are subject to discussion.</p></div><PilotForm/></div></section>

<section id="faq" className="container section faq-section"><div><p className="eyebrow">A LITTLE MORE CLARITY</p><h2>Good questions.<br/>Clear answers.</h2></div><Accordion type="single" collapsible className="faq-list">{faqs.map(([q,a],i)=><AccordionItem key={q} value={`q${i}`}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion></section>

<section className="container privacy-section" id="privacy"><details><summary>Pilot application privacy &amp; terms</summary><div><p>This form collects your name, clinic name, email and any optional practice details you choose to share. The DiaryDoc team uses these details to review pilot interest and contact you about your application. Applications are stored in this website’s hosted database and emailed to the DiaryDoc support inbox, separately from DiaryDoc patient records.</p><p>Do not include patient names, reports or other clinical information. Submission does not reserve a place, establish a service agreement or commit either party to pricing, duration or support. Terms must be agreed separately before onboarding.</p><p>To correct or request removal of an application, use the same email in this form and write “Correction request” or “Delete my application” in the optional field. Requests are stored for team review and are not processed automatically.</p></div></details></section></main><a href="#pilot" className="sticky-cta">Request pilot access <ArrowUpRight size={16}/></a><footer className="container footer"><Brand/><span>Built around the everyday of dental care.</span><a href="#privacy">Application privacy</a><span>© {new Date().getFullYear()} DiaryDoc</span></footer></>}
