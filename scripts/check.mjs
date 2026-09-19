/** Quick layout sanity checks at phone width. */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto(BASE, { waitUntil: "networkidle" });

const r = await p.evaluate(() => {
  const bar = document.querySelector(".app-bar");
  const overflowing = [...document.querySelectorAll("body *")]
    .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
    .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 70));
  return {
    sampleDisplay: getComputedStyle(document.querySelector(".sample-label")).display,
    appBarOverflow: bar.scrollWidth - bar.clientWidth,
    pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
    overflowing: [...new Set(overflowing)].slice(0, 8),
  };
});
console.log(r);

// sticky CTA, scrolled into the page
await p.evaluate(() => window.scrollTo(0, 2500));
await p.waitForTimeout(600);
await p.screenshot({ path: "/tmp/claude-0/preview/mobile-sticky.png" });
console.log("mobile-sticky.png written");

await b.close();
