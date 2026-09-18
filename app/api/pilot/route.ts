import {z} from "zod";
import { neon } from "@neondatabase/serverless";

const application=z.object({clinic:z.string().trim().min(2).max(120),name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254),details:z.string().trim().max(1000).default(""),consent:z.literal(true),website:z.string().max(500).optional()});
type Application=z.infer<typeof application>;

const NOTIFY_TO=process.env.PILOT_NOTIFY_EMAIL||"diarydocsupport@gmail.com";
// Resend's shared sender only delivers to the Resend account's own email; verify a domain to change it.
const NOTIFY_FROM=process.env.PILOT_FROM_EMAIL||"DiaryDoc Pilot <onboarding@resend.dev>";

export const runtime = "nodejs";

async function save(id:string,p:Application,databaseUrl:string){
  const sql=neon(databaseUrl);
  await sql`CREATE TABLE IF NOT EXISTS pilot_applications (id text PRIMARY KEY, clinic text NOT NULL, name text NOT NULL, email text NOT NULL, details text NOT NULL DEFAULT '', consent boolean NOT NULL, notice_version text NOT NULL, created_at timestamptz NOT NULL)`;
  await sql`INSERT INTO pilot_applications (id, clinic, name, email, details, consent, notice_version, created_at) VALUES (${id}, ${p.clinic}, ${p.name}, ${p.email.toLowerCase()}, ${p.details}, ${true}, ${"2026-09-10"}, NOW())`;
}

async function notify(id:string,p:Application,apiKey:string){
  const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      from:NOTIFY_FROM,
      to:[NOTIFY_TO],
      reply_to:p.email,
      subject:`New pilot application: ${p.clinic}`,
      // Plain text only, so applicant input is never rendered as HTML.
      text:[`Clinic: ${p.clinic}`,`Name: ${p.name}`,`Email: ${p.email}`,`About the practice: ${p.details||"(not provided)"}`,"",`Reference: ${id}`,`Submitted: ${new Date().toISOString()}`].join("\n"),
    }),
  });
  if(!response.ok)throw new Error(`Resend responded ${response.status}`);
}

export async function POST(request:Request){
  const origin=request.headers.get("origin");
  if(!origin||new URL(request.url).origin!==origin)return Response.json({error:"Please submit your application from the DiaryDoc page."},{status:403});
  if(!request.headers.get("content-type")?.includes("application/json"))return Response.json({error:"Invalid application format."},{status:415});
  let body;
  try{const raw=await request.text();if(new TextEncoder().encode(raw).length>8192)return Response.json({error:"Your application is too long."},{status:413});body=JSON.parse(raw);}
  catch{return Response.json({error:"We couldn’t read your application. Please try again."},{status:400});}
  const result=application.safeParse(body);
  if(!result.success)return Response.json({error:"Enter a clinic name and your name (at least 2 characters each), a valid email, and agree to be contacted."},{status:400});
  if(result.data.website)return Response.json({error:"We couldn’t accept this application. Please refresh and try again."},{status:400});

  const databaseUrl=process.env.DATABASE_URL;
  const resendKey=process.env.RESEND_API_KEY;
  if(!databaseUrl&&!resendKey)return Response.json({error:"Pilot applications are being configured. Please try again shortly."},{status:503});

  // Save and email independently; the application counts as received if either succeeds.
  const id=crypto.randomUUID();
  const [saved,emailed]=await Promise.allSettled([
    databaseUrl?save(id,result.data,databaseUrl):Promise.reject(new Error("DATABASE_URL not set")),
    resendKey?notify(id,result.data,resendKey):Promise.reject(new Error("RESEND_API_KEY not set")),
  ]);
  if(saved.status==="rejected"&&databaseUrl)console.error("Pilot application storage failed",saved.reason);
  if(emailed.status==="rejected"&&resendKey)console.error("Pilot application email failed",emailed.reason);
  if(saved.status==="rejected"&&emailed.status==="rejected")return Response.json({error:"We couldn’t save your application right now. Your details are still in the form; please try again."},{status:503});
  return Response.json({reference:id,status:"received"},{status:201,headers:{"Cache-Control":"no-store"}});
}
