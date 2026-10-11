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

// Web Store 300x300 icon
const storeDir = new URL("../store/", import.meta.url);
const storePage = await browser.newPage({
  viewport: { width: 300, height: 300 },
});
await storePage.setContent(
  `<style>html,body{margin:0;background:transparent}svg{width:300px;height:300px;display:block}</style>${svg}`,
);
await storePage.screenshot({
  path: fileURLToPath(new URL("logo-300.png", storeDir)),
  omitBackground: true,
});
await storePage.close();

await browser.close();
console.log("Icons written to", dir.pathname, "and store/logo-300.png");
