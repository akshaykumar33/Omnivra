// Renders src/icons/icon.svg to the PNG sizes Chrome and the Web Store need.
// Run after changing the SVG: node scripts/icons.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const dir = new URL("../src/icons/", import.meta.url);
const svg = readFileSync(new URL("icon.svg", dir), "utf8");
const browser = await chromium.launch();

for (const size of [16, 32, 48, 128]) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
  });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`,
  );
  await page.screenshot({
    path: fileURLToPath(new URL(`icon-${size}.png`, dir)),
    omitBackground: true,
  });
  await page.close();
}

await browser.close();
console.log("Icons written to", dir.pathname);
