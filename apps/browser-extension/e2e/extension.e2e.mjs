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
  window.__started = [];
  const onCommand = (data) => {
    if (data?.type !== "omnivra-listen") return;
    window.__started.push(data);
    post({ kind: "state", listening: data.action === "start" });
  };
  // Like the real page: a pinned tab opened with ?ext= talks over an extension
  // port (unless the test blocks it); an embedded copy uses postMessage.
  const ext = new URLSearchParams(location.search).get("ext");
  let post;
  if (top === self && ext && !__BLOCK_TAB__) {
    const port = chrome.runtime.connect(ext, { name: "omnivra-voice" });
    post = (m) => port.postMessage({ source: "omnivra-listener", ...m });
    port.onMessage.addListener(onCommand);
  } else {
    post = (m) => parent.postMessage({ source: "omnivra-listener", ...m }, "*");
    addEventListener("message", (e) => onCommand(e.data));
  }
  window.__emit = (id, alternatives, isFinal) => post({ kind: "result", id, alternatives, isFinal });
  window.__error = (error, fatal = true) => post({ kind: "error", error, fatal });
  post({ kind: "ready" });
</script>`;

let server, context, panel, page, origin;
// When true, the stand-in listener refuses to connect from a tab, so the
// panel's in-panel fallback can be tested.
let blockTab = false;

// The stand-in listener: the pinned tab, or the iframe in the panel.
function listenerFrame() {
  const tab = context.pages().find((p) => p.url().includes("/listen?ext="));
  return tab ?? panel.frames().find((f) => f.url().includes("/listen"));
}

before(async () => {
  server = createServer((req, res) =>
    res.end(
      req.url.startsWith("/listen")
        ? FAKE_LISTENER.replace("__BLOCK_TAB__", String(blockTab))
        : PAGE,
    ),
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

// Starts listening and returns the stand-in listener once it got "start".
async function startVoice() {
  await page.bringToFront();
  await panel.click("#toggle");
  await panel.waitForFunction(
    () =>
      document.getElementById("toggle").getAttribute("aria-pressed") === "true",
  );
  for (let i = 0; i < 50; i++) {
    const frame = listenerFrame();
    const started = await frame
      ?.evaluate(() => window.__started?.at(-1)?.action)
      .catch(() => undefined);
    if (started === "start") return frame;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("listener never started");
}

async function stopVoice() {
  if (
    (await panel.locator("#toggle").getAttribute("aria-pressed")) === "true"
  ) {
    await panel.click("#toggle");
  }
}

test("voice: listens in a pinned background tab that never takes focus", async () => {
  const pageTabId = await panel.evaluate(
    async (url) => (await chrome.tabs.query({ url })).at(0)?.id,
    page.url(),
  );
  await startVoice();
  const tabs = await panel.evaluate(async () =>
    (await chrome.tabs.query({})).map((t) => ({
      url: t.url,
      pinned: t.pinned,
      active: t.active,
      id: t.id,
    })),
  );
  const voiceTab = tabs.find((t) => t.url.includes("/listen?ext="));
  assert.equal(voiceTab.pinned, true);
  assert.equal(voiceTab.active, false);
  const active = await panel.evaluate(
    async () =>
      (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]
        ?.id,
  );
  assert.equal(active, pageTabId);

  // Stop listening closes the tab.
  await stopVoice();
  await panel.waitForFunction(
    async () =>
      !(await chrome.tabs.query({})).some((t) =>
        t.url.includes("/listen?ext="),
      ),
  );
});

test("voice: acts on interim speech once, picks the right alternative", async () => {
  await page.evaluate(() => document.getElementById("a").play());
  const listener = await startVoice();
  const emit = (i, alts, final) =>
    listener.evaluate(
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
  assert.ok(Math.abs((await audio("a.currentTime")) - 30) < 1);
  assert.equal(page.url(), url);

  // Unrecognised final speech is reported.
  await emit(2, ["what's the weather like"], true);
  assert.match(
    await panel.locator("#log li").first().textContent(),
    /Didn't understand/,
  );
  await stopVoice();
});

test("voice: closing the voice tab stops listening cleanly", async () => {
  const listener = await startVoice();
  await listener.close();
  await panel.waitForFunction(
    () =>
      document.getElementById("toggle").getAttribute("aria-pressed") ===
      "false",
  );
  assert.match(
    await panel.locator("#log li").first().textContent(),
    /voice tab was closed|stopped/,
  );
  await page.bringToFront();
});

test("voice: a refused microphone stops listening without opening tabs", async () => {
  const listener = await startVoice();
  const pagesBefore = context.pages().length;
  // Even repeated refusals must not open more tabs (each would steal focus).
  await listener.evaluate(() => {
    window.__error("not-allowed");
    window.__error("not-allowed");
    window.__error("not-allowed");
  });
  await panel.waitForFunction(
    () =>
      document.getElementById("toggle").getAttribute("aria-pressed") ===
      "false",
  );
  await panel.waitForTimeout(500);
  assert.ok(context.pages().length <= pagesBefore);
  assert.match(
    await panel.locator("#log li").first().textContent(),
    /Microphone access for Omnivra is off/,
  );
  await page.bringToFront();
});

test("voice: a transient error keeps listening and shows reconnecting", async () => {
  const listener = await startVoice();
  await listener.evaluate(() => window.__error("network", false));
  await panel.waitForFunction(() =>
    document.getElementById("status").textContent.includes("Reconnecting"),
  );
  assert.equal(
    await panel.locator("#toggle").getAttribute("aria-pressed"),
    "true",
  );
  await stopVoice();
});

test("voice: falls back to listening inside the panel if the tab can't connect", async () => {
  blockTab = true;
  try {
    await page.bringToFront();
    await panel.click("#toggle");
    // The tab is given up on after the connect timeout (15 s).
    await panel.waitForFunction(
      () =>
        document.querySelector('iframe[title="Omnivra speech recognition"]'),
      null,
      { timeout: 25000 },
    );
    await panel.waitForFunction(
      () =>
        document.getElementById("toggle").getAttribute("aria-pressed") ===
        "true",
    );
    const tabs = await panel.evaluate(async () =>
      (await chrome.tabs.query({})).filter((t) =>
        t.url.includes("/listen?ext="),
      ),
    );
    assert.equal(tabs.length, 0, "the unconnected tab is closed");
    await stopVoice();
  } finally {
    blockTab = false;
  }
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
