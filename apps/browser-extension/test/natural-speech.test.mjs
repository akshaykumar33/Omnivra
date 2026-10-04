import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand, parseBest, isInstant } from "../src/commands.js";

const PAUSE = { type: "media", action: "pause" };

test("politeness and filler around a command", () => {
  for (const said of [
    "please pause",
    "Pause the video please.",
    "can you pause it",
    "hey omnivra pause the music",
    "okay just pause now",
    "pause it",
    "pause the",
  ]) {
    assert.deepEqual(parseCommand(said), PAUSE, said);
  }
  assert.deepEqual(parseCommand("could you scroll down the page please"), {
    type: "scroll",
    direction: "down",
  });
  assert.deepEqual(parseCommand("go to the next tab please"), {
    type: "switchTab",
    offset: 1,
  });
  assert.deepEqual(parseCommand("switch to tab number three"), {
    type: "gotoTab",
    index: 3,
  });
  assert.deepEqual(parseCommand("next tab please"), {
    type: "switchTab",
    offset: 1,
  });
  assert.deepEqual(parseCommand("play the song again"), {
    type: "media",
    action: "play",
  });
});

test("common mishearings", () => {
  assert.deepEqual(parseCommand("paws"), PAUSE);
  assert.deepEqual(parseCommand("next tap"), { type: "switchTab", offset: 1 });
  assert.deepEqual(parseCommand("close the tabs"), { type: "closeTab" });
  assert.deepEqual(parseCommand("un mute"), {
    type: "media",
    action: "unmute",
  });
  assert.deepEqual(parseCommand("scroll dawn"), {
    type: "scroll",
    direction: "down",
  });
  assert.deepEqual(parseCommand("tab to"), { type: "gotoTab", index: 2 });
  assert.deepEqual(parseCommand("skip 30 secs"), {
    type: "media",
    action: "seek",
    seconds: 30,
  });
});

test("search keeps the user's words, including filler-looking ones", () => {
  assert.deepEqual(parseCommand("please search for songs to play now"), {
    type: "search",
    query: "songs to play now",
  });
});

test("the first alternative that is a command wins", () => {
  assert.deepEqual(parseBest(["pose the radio", "paws", "pause"]), {
    intent: PAUSE,
    transcript: "paws",
  });
  assert.equal(parseBest(["hello there", "how are you"]), undefined);
});

test("only commands that can't still change run before speech ends", () => {
  assert.equal(isInstant(PAUSE), true);
  assert.equal(isInstant({ type: "scroll", direction: "down" }), true);
  assert.equal(isInstant({ type: "switchTab", offset: 1 }), true);
  // "go back" may become "go back 10 seconds"; "skip" may gain a number.
  assert.equal(isInstant({ type: "historyBack" }), false);
  assert.equal(isInstant({ type: "historyForward" }), false);
  assert.equal(
    isInstant({ type: "media", action: "seek", seconds: 10 }),
    false,
  );
  assert.equal(isInstant({ type: "search", query: "x" }), false);
  assert.equal(isInstant({ type: "gotoTab", index: 1 }), false);
});
