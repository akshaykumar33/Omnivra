// Service worker: receives intents from the side panel and drives Chrome.

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

async function activeTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab;
}

// Runs inside the page. Must be self-contained: it is serialized by chrome.scripting.
function pageAction(intent) {
  if (intent.type === "scroll") {
    if (intent.to === "top")
      return window.scrollTo({ top: 0, behavior: "smooth" });
    if (intent.to === "bottom")
      return window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    const delta =
      window.innerHeight * 0.8 * (intent.direction === "up" ? -1 : 1);
    return window.scrollBy({ top: delta, behavior: "smooth" });
  }
  const media = [...document.querySelectorAll("video, audio")];
  const target = media.find((m) => !m.paused) ?? media[0];
  if (!target) return "No video or audio on this page";
  if (intent.action === "pause") target.pause();
  if (intent.action === "play") target.play();
  if (intent.action === "mute") target.muted = true;
  if (intent.action === "unmute") target.muted = false;
  if (intent.action === "seek")
    target.currentTime = Math.max(0, target.currentTime + intent.seconds);
  return undefined;
}

async function runInPage(intent) {
  const tab = await activeTab();
  if (!tab?.id || /^(chrome|edge|about):/.test(tab.url ?? "")) {
    return "Page actions don't work on browser pages";
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: pageAction,
    args: [intent],
  });
  return result?.result;
}

async function switchTab(offset) {
  const tab = await activeTab();
  const tabs = await chrome.tabs.query({ windowId: tab.windowId });
  const next = tabs[(tab.index + offset + tabs.length) % tabs.length];
  await chrome.tabs.update(next.id, { active: true });
}

async function run(intent) {
  switch (intent.type) {
    case "scroll":
    case "media":
      return runInPage(intent);
    case "historyBack":
      return chrome.tabs.goBack((await activeTab()).id);
    case "historyForward":
      return chrome.tabs.goForward((await activeTab()).id);
    case "reload":
      return chrome.tabs.reload((await activeTab()).id);
    case "newTab":
      return chrome.tabs.create({});
    case "closeTab":
      return chrome.tabs.remove((await activeTab()).id);
    case "switchTab":
      return switchTab(intent.offset);
    case "gotoTab": {
      const tab = await activeTab();
      const tabs = await chrome.tabs.query({ windowId: tab.windowId });
      const target = tabs[(intent.index ?? 0) - 1];
      if (!target) return `There is no tab ${intent.index}`;
      return chrome.tabs.update(target.id, { active: true });
    }
    case "search":
      return chrome.search.query({
        text: intent.query,
        disposition: "NEW_TAB",
      });
    default:
      return `Unknown command: ${intent.type}`;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.kind !== "intent") return false;
  run(message.intent)
    .then((note) =>
      sendResponse({
        ok: true,
        note: typeof note === "string" ? note : undefined,
      }),
    )
    .catch((error) =>
      sendResponse({ ok: false, note: String(error?.message ?? error) }),
    );
  return true;
});
