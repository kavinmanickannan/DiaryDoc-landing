/**
 * Renders the landing page to PNGs for review.
 *   node scripts/preview-shots.mjs [baseUrl]
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = "/tmp/claude-0/preview";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

async function shoot(name, viewport, fullPage) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  // settle webfonts + lazy images
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    await new Promise((r) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += window.innerHeight;
        if (y < document.body.scrollHeight) setTimeout(step, 80);
        else { window.scrollTo(0, 0); setTimeout(r, 400); }
      };
      step();
    });
  });
  // full-page capture races lazy images; force them in and wait for decode
  await page.evaluate(async () => {
    for (const img of document.images) img.loading = "eager";
    await Promise.all(
      [...document.images]
        .filter((i) => !i.complete)
        .map((i) => new Promise((r) => { i.onload = i.onerror = r; }))
    );
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  await ctx.close();
  console.log(name);
}

await shoot("desktop-full", { width: 1440, height: 900 }, true);
await shoot("desktop-fold", { width: 1440, height: 900 }, false);
await shoot("mobile-full", { width: 390, height: 844 }, true);

await browser.close();
console.log("written to", OUT);
