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

// Stand-in for the website's /listen page: same messages, results injected by the test.
const FAKE_LISTENER = `<!doctype html><title>listener</title><script>
  const post = (m) => parent.postMessage({ source: "omnivra-listener", ...m }, "*");
  window.__started = [];
  addEventListener("message", (e) => {
    if (e.data?.type !== "omnivra-listen") return;
    window.__started.push(e.data);
    post({ kind: "state", listening: e.data.action === "start" });
  });
  window.__emit = (id, alternatives, isFinal) => post({ kind: "result", id, alternatives, isFinal });
  window.__error = (error, fatal = true) => post({ kind: "error", error, fatal });
  post({ kind: "ready" });
</script>`;

let server, context, panel, page, origin;

before(async () => {
  server = createServer((req, res) =>
    res.end(req.url.startsWith("/listen") ? FAKE_LISTENER : PAGE),
  ).listen(0);
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
  // Speech recognition runs in an embedded page on the website; point the
  // panel at a stand-in that speaks the same postMessage protocol.
  await panel.goto(
    `chrome-extension://${id}/sidepanel.html?listenerPort=${server.address().port}`,
  );
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

test("voice: acts on interim speech once, picks the right alternative", async () => {
  await page.bringToFront();
  await page.evaluate(() => document.getElementById("a").play());
  await panel.click("#toggle");
  await panel.waitForFunction(
    () =>
      document.getElementById("toggle").getAttribute("aria-pressed") === "true",
  );
  const listener = () =>
    panel.frames().find((f) => f.url().includes("/listen"));
  await panel.waitForFunction(() =>
    document.querySelector('iframe[title="Omnivra speech recognition"]'),
  );
  await new Promise((r) => setTimeout(r, 300));
  const started = await listener().evaluate(() => window.__started.at(-1));
  assert.equal(started.action, "start");
  assert.match(started.lang, /^en/);
  const emit = (i, alts, final) =>
    listener().evaluate(
      ([i, alts, final]) => window.__emit("s0:" + i, alts, final),
      [i, alts, final],
    );
  const logCount = () => panel.locator("#log li").count();

  // Interim "paws the" (a mishearing) already pauses, before speech ends.
  const before = await logCount();
  await emit(0, ["post a", "paws the"], false);
  await page.waitForFunction(() => document.getElementById("a").paused);
  assert.match(await panel.locator("#status").textContent(), /Heard: "post a"/);

  // The same phrase turning final must not run it a second time.
  await emit(0, ["pause the video please"], true);
  assert.equal(await logCount(), before + 1);

  // "go back" waits: it might still become "go back 10 seconds".
  await page.evaluate(() => (document.getElementById("a").currentTime = 40));
  const url = page.url();
  await emit(1, ["go back"], false);
  await emit(1, ["go back 10 seconds"], true);
  await panel.waitForFunction(
    (n) => document.querySelectorAll("#log li").length > n,
    before + 1,
  );
  assert.ok(
    Math.abs(
      (await page.evaluate(() => document.getElementById("a").currentTime)) -
        30,
    ) < 1,
  );
  assert.equal(page.url(), url);

  // Unrecognised final speech is reported.
  await emit(2, ["what's the weather like"], true);
  assert.match(
    await panel.locator("#log li").first().textContent(),
    /Didn't understand/,
  );

  await panel.click("#toggle");
  assert.equal(
    (await listener().evaluate(() => window.__started.at(-1))).action,
    "stop",
  );
});

test("voice: a refused microphone stops listening without opening tabs", async () => {
  await panel.click("#toggle");
  await panel.waitForFunction(
    () =>
      document.getElementById("toggle").getAttribute("aria-pressed") === "true",
  );
  const pagesBefore = context.pages().length;
  // Even repeated refusals must not open tabs (each would steal focus).
  const listener = panel.frames().find((f) => f.url().includes("/listen"));
  await listener.evaluate(() => {
    window.__error("not-allowed");
    window.__error("not-allowed");
    window.__error("not-allowed");
  });
  await panel.waitForTimeout(1000);
  assert.equal(context.pages().length, pagesBefore);
  assert.equal(
    await panel.locator("#toggle").getAttribute("aria-pressed"),
    "false",
  );
  assert.match(
    await panel.locator("#log li").first().textContent(),
    /Microphone access for Omnivra is off/,
  );
  await page.bringToFront();
});

test("voice: a transient error keeps listening and shows reconnecting", async () => {
  await panel.click("#toggle");
  await panel.waitForFunction(
    () =>
      document.getElementById("toggle").getAttribute("aria-pressed") === "true",
  );
  await panel
    .frames()
    .find((f) => f.url().includes("/listen"))
    .evaluate(() => window.__error("network", false));
  await panel.waitForFunction(() =>
    document.getElementById("status").textContent.includes("Reconnecting"),
  );
  assert.equal(
    await panel.locator("#toggle").getAttribute("aria-pressed"),
    "true",
  );
  await panel.click("#toggle");
});

test("voice: allowing the microphone closes the tab, returns, and starts listening", async () => {
  await page.bringToFront();
  const extensionOrigin = `chrome-extension://${new URL(panel.url()).host}`;
  const pageTabId = await panel.evaluate(
    async (url) => (await chrome.tabs.query({ url })).at(0)?.id,
    page.url(),
  );
  assert.equal(
    await panel.locator("#toggle").getAttribute("aria-pressed"),
    "false",
  );

  // What ensurePermission opens when the extension has no microphone grant yet.
  const prompt = await context.newPage();
  const closed = prompt.waitForEvent("close");
  await prompt.goto(
    `${extensionOrigin}/permission.html?kind=audio&return=${pageTabId}`,
  );
  await closed; // closes itself once allowed

  await panel.waitForFunction(
    () =>
      document.getElementById("toggle").getAttribute("aria-pressed") === "true",
  );
  const active = await panel.evaluate(
    async () =>
      (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]
        ?.id,
  );
  assert.equal(active, pageTabId);
  await panel.click("#toggle");
});

test("voice: video volume is lowered while listening and restored after", async () => {
  await page.bringToFront();
  await page.evaluate(() => (document.getElementById("a").volume = 0.8));
  await panel.click("#toggle");
  await page.waitForFunction(
    () => Math.abs(document.getElementById("a").volume - 0.24) < 0.01,
  );
  await panel.click("#toggle");
  await page.waitForFunction(
    () => Math.abs(document.getElementById("a").volume - 0.8) < 0.01,
  );

  // Turned off in the panel: listening leaves the volume alone.
  await panel.uncheck("#duck");
  await panel.click("#toggle");
  await panel.waitForTimeout(1000);
  assert.ok(Math.abs((await audio("a.volume")) - 0.8) < 0.01);
  await panel.click("#toggle");
  await panel.check("#duck");
});

test("voice: a silent on-device engine falls back to online and is remembered", async () => {
  const extensionOrigin = `chrome-extension://${new URL(panel.url()).host}`;
  const silent = await context.newPage();
  // An on-device engine that hears speech but never returns text: what Chrome
  // does in some setups when recognition runs inside an extension page.
  await silent.addInitScript(() => {
    window.SpeechRecognition = window.webkitSpeechRecognition = class {
      static available() {
        return Promise.resolve("available");
      }
      start() {
        setTimeout(() => this.onsoundstart?.(), 100);
      }
      stop() {}
      abort() {}
    };
  });
  await silent.goto(
    `${extensionOrigin}/sidepanel.html?listenerPort=${server.address().port}`,
  );
  await silent.evaluate(() => chrome.storage.local.remove("engine"));
  await silent.click("#toggle");
  await silent.waitForFunction(() =>
    document.getElementById("status").textContent.includes("on this device"),
  );

  // After the watchdog (6 s) it switches to the online listener by itself.
  await silent.waitForFunction(
    () =>
      document.getElementById("status").textContent.includes("online") &&
      document.getElementById("toggle").getAttribute("aria-pressed") === "true",
    null,
    { timeout: 15000 },
  );
  assert.match(
    await silent.locator("#log li").first().textContent(),
    /Switched to online/,
  );
  const listenerFrame = silent
    .frames()
    .find((f) => f.url().includes("/listen"));
  assert.equal(
    (await listenerFrame.evaluate(() => window.__started.at(-1))).action,
    "start",
  );
  assert.equal(
    (await silent.evaluate(() => chrome.storage.local.get("engine"))).engine,
    "online",
  );

  // Next time it goes straight to online.
  await silent.click("#toggle");
  await silent.click("#toggle");
  await silent.waitForFunction(() =>
    document.getElementById("status").textContent.includes("online"),
  );
  await silent.click("#toggle");
  await silent.evaluate(() => chrome.storage.local.remove("engine"));
  await silent.close();
  await page.bringToFront();
});
