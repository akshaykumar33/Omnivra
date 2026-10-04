// Loads the built extension into Chromium and drives it through typed commands,
// which run the same path as voice and gestures (parse → background → Chrome APIs).
// Run: npm run build && npm run test:e2e
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const dist = fileURLToPath(new URL("../dist", import.meta.url));

// A page with a long body and a playable media element (a generated silent WAV).
const PAGE = `<!doctype html><title>Fixture</title>
<body style="height:5000px">
<audio id="a" loop></audio>
<script>
  const rate = 8000, seconds = 120, n = rate * seconds;
  const buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVEfmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true);
  v.setUint16(34, 8, true); w(36, "data"); v.setUint32(40, n, true);
  new Uint8Array(buf, 44).fill(128);
  document.getElementById("a").src = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
</script></body>`;

let server, context, panel, page, origin;

before(async () => {
  server = createServer((_req, res) => res.end(PAGE)).listen(0);
  origin = `http://localhost:${server.address().port}`;
  context = await chromium.launchPersistentContext(
    mkdtempSync(join(tmpdir(), "omnivra-")),
    {
      headless: false,
      // BROWSER_CHANNEL=msedge runs the same suite in installed Microsoft Edge.
      channel: process.env.BROWSER_CHANNEL || undefined,
      args: [
        "--headless=new",
        `--disable-extensions-except=${dist}`,
        `--load-extension=${dist}`,
        "--autoplay-policy=no-user-gesture-required",
        // A synthetic camera and auto-accepted permission prompts, for the gesture test.
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  );
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const id = new URL(worker.url()).host;

  panel = await context.newPage();
  await panel.goto(`chrome-extension://${id}/sidepanel.html`);
  page = await context.newPage();
  await page.goto(origin);
  await page.bringToFront();
});

after(async () => {
  await context?.close();
  server?.close();
});

// Types into the panel while the fixture page stays the active tab.
async function run(command) {
  // The log is capped, so mark the current newest entry and wait for a newer one.
  await panel.evaluate(() =>
    document.querySelector("#log li")?.setAttribute("data-seen", ""),
  );
  await panel.fill("#cmd", command);
  await panel.press("#cmd", "Enter");
  await panel.waitForFunction(() => {
    const first = document.querySelector("#log li");
    return first && !first.hasAttribute("data-seen");
  });
  return panel.locator("#log li").first().textContent();
}

const audio = (expr) =>
  page.evaluate(
    `(() => { const a = document.getElementById("a"); return ${expr}; })()`,
  );

test("panel lists commands and gestures", async () => {
  assert.ok((await panel.locator("#examples li").count()) > 10);
  assert.equal(await panel.locator("#gesture-list li").count(), 7);
});

test("play, pause, skip, rewind, mute", async () => {
  await page.waitForFunction(
    () => document.getElementById("a").readyState >= 1,
  );
  assert.match(await run("play"), /✓/);
  await page.waitForFunction(() => !document.getElementById("a").paused);

  assert.match(await run("pause"), /✓/);
  assert.equal(await audio("a.paused"), true);

  await page.evaluate(() => (document.getElementById("a").currentTime = 20));
  await run("skip 30 seconds");
  assert.ok(Math.abs((await audio("a.currentTime")) - 50) < 1);
  await run("rewind twenty");
  assert.ok(Math.abs((await audio("a.currentTime")) - 30) < 1);

  await run("mute");
  assert.equal(await audio("a.muted"), true);
  await run("unmute");
  assert.equal(await audio("a.muted"), false);
});

test("scrolling", async () => {
  await run("scroll down");
  await page.waitForFunction(() => window.scrollY > 100);
  await run("scroll to bottom");
  await page.waitForFunction(() => window.scrollY > 3000);
  await run("scroll to top");
  await page.waitForFunction(() => window.scrollY === 0);
});

test("history back and forward", async () => {
  await page.goto(`${origin}/second`);
  await run("back");
  await page.waitForURL(`${origin}/`);
  await run("forward");
  await page.waitForURL(`${origin}/second`);
});

test("tabs: new, switch, close", async () => {
  const count = () => context.pages().length;
  const start = count();

  const created = context.waitForEvent("page");
  await run("new tab");
  const fresh = await created;
  assert.equal(count(), start + 1);

  // The new tab is now active; "close tab" must close it, not the fixture.
  const closed = fresh.waitForEvent("close");
  await run("close tab");
  await closed;
  assert.equal(count(), start);
  await page.bringToFront();

  await run("tab 1");
  assert.equal(await panel.evaluate(() => document.visibilityState), "visible");
  await page.bringToFront();
});

test("web search opens a results tab", async () => {
  const opened = context.waitForEvent("page");
  await run("search for omnivra voice control");
  const results = await opened;
  await results.waitForLoadState("domcontentloaded").catch(() => {});
  assert.match(results.url(), /omnivra/i);
  await results.close();
  await page.bringToFront();
});

test("unknown commands are reported, not run", async () => {
  assert.match(await run("make me a sandwich"), /Didn't understand/);
});

test("gesture recognizer starts on the camera and stops cleanly", async () => {
  await panel.click("#camera");
  await panel.waitForFunction(
    () =>
      document.getElementById("camera").getAttribute("aria-pressed") === "true",
    null,
    { timeout: 60000 },
  );
  assert.equal(await panel.locator("#preview").isVisible(), true);
  assert.equal(
    await panel.locator("#log li.err", { hasText: "Camera error" }).count(),
    0,
  );

  await panel.click("#camera");
  assert.equal(
    await panel.locator("#camera").getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(await panel.locator("#preview").isHidden(), true);
  await page.bringToFront();
});
