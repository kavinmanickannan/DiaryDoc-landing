import {env} from "cloudflare:workers";
export function pilotDatabase(){if(!env.DB)throw new Error("Pilot application storage unavailable");return env.DB;}
