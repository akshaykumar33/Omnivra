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
  // A clipped "scroll" often arrives as "roll".
  [/^roll (?=up\b|down\b|to\b)/g, "scroll "],
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

// Words commands are made of. A heard word close to one of these (one or two
// letters off, same first letter) is read as it: "pauze", "paws" → "pause".
const VOCABULARY = [
  "pause",
  "play",
  "resume",
  "stop",
  "mute",
  "unmute",
  "skip",
  "rewind",
  "forward",
  "back",
  "scroll",
  "down",
  "top",
  "bottom",
  "next",
  "previous",
  "tab",
  "close",
  "open",
  "reload",
  "refresh",
  "seconds",
  "search",
];
// Everyday words never "corrected" into a command word.
const KEEP = new Set([
  "now",
  "know",
  "not",
  "nut",
  "post",
  "pose it",
  "plan",
  "slay",
]);

function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = temp;
    }
  }
  return row[b.length];
}

function correctWord(word) {
  if (word.length < 3 || KEEP.has(word) || VOCABULARY.includes(word))
    return word;
  if (Number.isFinite(Number(word))) return word;
  let best = word;
  let bestDistance = Infinity;
  for (const target of VOCABULARY) {
    if (target[0] !== word[0]) continue;
    // One letter off for short words, two only for long ones: "page" and
    // "past" must not become "pause". Known mishearings are in SOUNDALIKES.
    const allowed = target.length >= 6 ? 2 : 1;
    const distance = editDistance(word, target);
    if (distance <= allowed && distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
}

// Finds a command anywhere in a sentence ("could you just pause this thing").
// Patterns are tried in order; for play/pause the last one said wins.
const SPOTTERS = [
  [
    /\b(?:search(?: for)?|google|look up) (.+)$/,
    (m) => ({ type: "search", query: m[1] }),
  ],
  [/\bclose\b.*\btab\b/, () => ({ type: "closeTab" })],
  [/\b(?:new|open)\b.*\btab\b/, () => ({ type: "newTab" })],
  [/\b(?:next|right)\b.*\btab\b/, () => ({ type: "switchTab", offset: 1 })],
  [
    /\b(?:previous|prev|last|left)\b.*\btab\b/,
    () => ({ type: "switchTab", offset: -1 }),
  ],
  [
    /\btab (?:number )?(\w+)\b/,
    (m) => toNumber(m[1]) && { type: "gotoTab", index: toNumber(m[1]) },
  ],
  [/\bunmute\b/, () => ({ type: "media", action: "unmute" })],
  [/\bmute\b/, () => ({ type: "media", action: "mute" })],
  [
    /\b(?:rewind|back)\b(?: \w+)*? (\w+) seconds?\b/,
    (m) => toNumber(m[1]) && seek(-toNumber(m[1])),
  ],
  [
    /\b(?:skip|forward|ahead)\b(?: \w+)*? (\w+) seconds?\b/,
    (m) => toNumber(m[1]) && seek(toNumber(m[1])),
  ],
  [/\brewind\b/, () => seek(-10)],
  [/\b(?:skip|fast forward)\b/, () => seek(10)],
  [
    /\b(?:pause|stop|play|resume)\b/,
    (m, text) => {
      const said = [...text.matchAll(/\b(pause|stop|play|resume)\b/g)];
      const last = said.at(-1)[1];
      return {
        type: "media",
        action: last === "pause" || last === "stop" ? "pause" : "play",
      };
    },
  ],
  [/\bscroll\b.*\btop\b/, () => ({ type: "scroll", to: "top" })],
  [/\bscroll\b.*\bbottom\b/, () => ({ type: "scroll", to: "bottom" })],
  [/\bscroll\b.*\b(up|down)\b/, (m) => ({ type: "scroll", direction: m[1] })],
  [/\b(?:reload|refresh)\b/, () => ({ type: "reload" })],
  [/\bgo back\b/, () => ({ type: "historyBack" })],
  [/\bgo forward\b/, () => ({ type: "historyForward" })],
];

function seek(seconds) {
  return { type: "media", action: "seek", seconds };
}

function spot(text) {
  const words = text.split(" ").map(correctWord).join(" ");
  for (const [re, intent] of SPOTTERS) {
    const match = words.match(re);
    const result = match && intent(match, words);
    if (result) return result;
  }
  return undefined;
}

export function parseCommand(transcript) {
  const text = normalize(transcript);
  for (const rule of RULES) {
    const match = text.match(rule.re);
    // An intent that comes back empty (e.g. "lots seconds") lets later rules try.
    const intent = match && rule.intent(match);
    if (intent) return intent;
  }
  // Not an exact command: look for one inside the sentence.
  return spot(text);
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
// "tab" needs its number, so those wait for the final transcript. A seek is
// complete once its amount has been said ("skip 30 seconds").
export function isInstant(intent, transcript = "") {
  if (WAIT_FOR_FINAL.has(intent.type)) return false;
  if (intent.type === "media" && intent.action === "seek") {
    return /\bsec(?:ond)?s?\b/i.test(transcript);
  }
  return true;
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
