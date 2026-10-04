// Maps a spoken transcript to an intent the background worker can run.
// Kept free of chrome.* so it can be unit-tested in Node.

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  sixty: 60,
};

function toNumber(word) {
  if (word === undefined) return undefined;
  const n = Number(word);
  return Number.isFinite(n) ? n : NUMBER_WORDS[word];
}

const RULES = [
  {
    re: /^(?:search(?: for)?|google|look up) (.+)$/,
    intent: (m) => ({ type: "search", query: m[1] }),
  },
  { re: /^(?:open|new) tab$/, intent: () => ({ type: "newTab" }) },
  { re: /^close (?:this |the )?tab$/, intent: () => ({ type: "closeTab" }) },
  {
    re: /^(?:next|right) tab$/,
    intent: () => ({ type: "switchTab", offset: 1 }),
  },
  {
    re: /^(?:previous|prev|last|left) tab$/,
    intent: () => ({ type: "switchTab", offset: -1 }),
  },
  {
    re: /^(?:go to |switch to )?tab (\w+)$/,
    intent: (m) => ({ type: "gotoTab", index: toNumber(m[1]) }),
  },
  { re: /^(?:go )?back$/, intent: () => ({ type: "historyBack" }) },
  { re: /^(?:go )?forward$/, intent: () => ({ type: "historyForward" }) },
  { re: /^(?:reload|refresh)(?: page)?$/, intent: () => ({ type: "reload" }) },
  {
    re: /^(?:pause|stop)(?: video)?$/,
    intent: () => ({ type: "media", action: "pause" }),
  },
  {
    re: /^(?:play|resume)(?: video)?$/,
    intent: () => ({ type: "media", action: "play" }),
  },
  { re: /^(?:mute)$/, intent: () => ({ type: "media", action: "mute" }) },
  { re: /^(?:unmute)$/, intent: () => ({ type: "media", action: "unmute" }) },
  {
    re: /^(?:rewind|skip back(?:ward)?|go back) ?(\w+)?(?: seconds?)?$/,
    intent: (m) => ({
      type: "media",
      action: "seek",
      seconds: -(toNumber(m[1]) ?? 10),
    }),
  },
  {
    re: /^(?:fast forward|skip(?: forward)?|forward) ?(\w+)?(?: seconds?)?$/,
    intent: (m) => ({
      type: "media",
      action: "seek",
      seconds: toNumber(m[1]) ?? 10,
    }),
  },
  {
    re: /^scroll (?:to )?(?:the )?top$/,
    intent: () => ({ type: "scroll", to: "top" }),
  },
  {
    re: /^scroll (?:to )?(?:the )?bottom$/,
    intent: () => ({ type: "scroll", to: "bottom" }),
  },
  {
    re: /^scroll (up|down)$/,
    intent: (m) => ({ type: "scroll", direction: m[1] }),
  },
];

export function parseCommand(transcript) {
  const text = transcript
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  for (const rule of RULES) {
    const match = text.match(rule.re);
    if (match) return rule.intent(match);
  }
  return undefined;
}

export const EXAMPLES = [
  "pause",
  "resume",
  "skip 30 seconds",
  "rewind 10",
  "scroll down",
  "scroll to top",
  "back",
  "forward",
  "reload",
  "next tab",
  "previous tab",
  "tab 2",
  "new tab",
  "close tab",
  "search for weather in pune",
  "mute",
];
