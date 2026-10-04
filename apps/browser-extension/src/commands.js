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
  // Common mishearings of spoken numbers.
  won: 1,
  to: 2,
  too: 2,
  for: 4,
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
    re: /^(?:(?:go|switch|move) to )?(?:the )?(?:next|right) tab$/,
    intent: () => ({ type: "switchTab", offset: 1 }),
  },
  {
    re: /^(?:(?:go|switch|move) (?:to|back to) )?(?:the )?(?:previous|prev|last|left) tab$/,
    intent: () => ({ type: "switchTab", offset: -1 }),
  },
  {
    re: /^(?:(?:go|switch|move) to )?tab (?:number )?(\w+)$/,
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
  // An amount with an explicit direction: "10 seconds back", "30 seconds ahead".
  // A bare "30 seconds" is ignored: it is usually a clipped "rewind 30
  // seconds", and guessing forward would seek the wrong way.
  {
    re: /^(\w+) seconds? (back(?:ward)?|forward|ahead)$/,
    intent: (m) =>
      toNumber(m[1]) && {
        type: "media",
        action: "seek",
        seconds: m[2].startsWith("back") ? -toNumber(m[1]) : toNumber(m[1]),
      },
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

// Words speech recognition commonly returns in place of a command word.
const SOUNDALIKES = [
  [/\b(?:paws|pours|pose)\b/g, "pause"],
  [/\bplays\b/g, "play"],
  [/\bun mute\b/g, "unmute"],
  [/\b(?:tap|tabs|tub)\b/g, "tab"],
  [/\bscroll (?:dawn|done)\b/g, "scroll down"],
  [/\b(?:re wind|rewinds|rewine)\b/g, "rewind"],
  [/\bsecs?\b/g, "seconds"],
  [/\bfor ward\b/g, "forward"],
  // The first syllable is often clipped: "rewind 10 seconds" arrives as
  // "find/wind/line 10 seconds". Only mapped when an amount follows.
  [
    /^(?:find|wind|line|lined|we wind|re find|rewound)(?= \w+ seconds?\b)/g,
    "rewind",
  ],
];

// Politeness and filler that people add around a command, stripped one phrase
// at a time. (A single repeated regex alternation here can backtrack
// exponentially on long input.)
const LEADING = [
  "hey",
  "ok",
  "okay",
  "omnivra",
  "please",
  "can you",
  "could you",
  "would you",
  "will you",
  "just",
  "now",
  "and",
  "so",
  "then",
  "go ahead and",
  "i want to",
  "lets",
];
// Includes a dangling "the"/"a": interim speech often stops mid-phrase ("pause the").
const TRAILING = [
  "please",
  "now",
  "for me",
  "thanks",
  "thank you",
  "it",
  "this",
  "video",
  "song",
  "music",
  "page",
  "again",
  "the",
  "a",
];

function stripLeading(text) {
  for (let changed = true; changed;) {
    changed = false;
    for (const phrase of LEADING) {
      if (text.startsWith(phrase + " ")) {
        text = text.slice(phrase.length + 1);
        changed = true;
      }
    }
  }
  return text;
}

function stripTrailing(text) {
  for (let changed = true; changed;) {
    changed = false;
    for (const phrase of TRAILING) {
      if (text.endsWith(" " + phrase)) {
        text = text.slice(0, -(phrase.length + 1));
        changed = true;
      }
    }
  }
  return text;
}

function normalize(transcript) {
  let text = transcript
    .toLowerCase()
    .replace(/[.,!?'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  for (const [re, word] of SOUNDALIKES) text = text.replace(re, word);
  text = stripLeading(text);
  // Search queries keep their wording; only strip filler in front of them.
  if (!/^(?:search|google|look up)\b/.test(text)) text = stripTrailing(text);
  return text.replace(/^the /, "").trim();
}

export function parseCommand(transcript) {
  const text = normalize(transcript);
  for (const rule of RULES) {
    const match = text.match(rule.re);
    // An intent that comes back empty (e.g. "lots seconds") lets later rules try.
    const intent = match && rule.intent(match);
    if (intent) return intent;
  }
  return undefined;
}

// Speech recognition offers several guesses; act on the first that is a command.
export function parseBest(alternatives) {
  for (const transcript of alternatives) {
    const intent = parseCommand(transcript);
    if (intent) return { intent, transcript };
  }
  return undefined;
}

const WAIT_FOR_FINAL = new Set([
  "search",
  "gotoTab",
  "historyBack",
  "historyForward",
]);

// Commands safe to run before the speaker has finished: nothing they could
// still say would change them. "go back" may become "go back 10 seconds" and
// "tab" needs its number, so those wait for the final transcript.
export function isInstant(intent) {
  if (WAIT_FOR_FINAL.has(intent.type)) return false;
  return !(intent.type === "media" && intent.action === "seek");
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
