// Maps MediaPipe gesture names to intents, and filters noisy per-frame results.
// Kept free of chrome.* and DOM so it can be unit-tested in Node.

export const GESTURES = {
  Open_Palm: {
    label: "✋ Open palm",
    intent: { type: "media", action: "pause" },
  },
  Closed_Fist: { label: "✊ Fist", intent: { type: "media", action: "play" } },
  Thumb_Up: {
    label: "👍 Thumb up",
    intent: { type: "scroll", direction: "up" },
  },
  Thumb_Down: {
    label: "👎 Thumb down",
    intent: { type: "scroll", direction: "down" },
  },
  Pointing_Up: {
    label: "☝️ Point up",
    intent: { type: "media", action: "seek", seconds: 10 },
  },
  ILoveYou: {
    label: "🤟 Rock on",
    intent: { type: "media", action: "seek", seconds: -10 },
  },
  Victory: { label: "✌️ Victory", intent: { type: "switchTab", offset: 1 } },
};

// A gesture fires once it has been held for `holdMs`, then nothing fires for `cooldownMs`.
export class GestureFilter {
  constructor({ holdMs = 500, cooldownMs = 1500, minScore = 0.6 } = {}) {
    Object.assign(this, { holdMs, cooldownMs, minScore });
    this.current = undefined;
    this.since = 0;
    this.blockedUntil = 0;
  }

  // Returns the gesture name to act on, or undefined.
  push(name, score, now) {
    if (!name || !GESTURES[name] || score < this.minScore) {
      this.current = undefined;
      return undefined;
    }
    if (name !== this.current) {
      this.current = name;
      this.since = now;
      return undefined;
    }
    if (now < this.blockedUntil || now - this.since < this.holdMs)
      return undefined;
    this.blockedUntil = now + this.cooldownMs;
    return name;
  }
}
