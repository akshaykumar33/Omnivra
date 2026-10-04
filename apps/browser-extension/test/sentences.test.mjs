import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand, isInstant } from "../src/commands.js";

const PAUSE = { type: "media", action: "pause" };
const PLAY = { type: "media", action: "play" };
const seek = (seconds) => ({ type: "media", action: "seek", seconds });

test("pause, however it is said or heard", () => {
  for (const said of [
    "pause",
    "Pause.",
    "paws",
    "pauze",
    "pose",
    "pours",
    "could you just pause this thing",
    "okay now pause it for a second",
    "hey pause the music please",
    "stop the video",
    "can you stop it",
  ]) {
    assert.deepEqual(parseCommand(said), PAUSE, said);
  }
});

test("commands inside sentences", () => {
  assert.deepEqual(parseCommand("alright let's play it again"), PLAY);
  assert.deepEqual(parseCommand("okay now go to the next tab"), {
    type: "switchTab",
    offset: 1,
  });
  assert.deepEqual(parseCommand("take me back to the previous tab"), {
    type: "switchTab",
    offset: -1,
  });
  assert.deepEqual(parseCommand("please close this tab now"), {
    type: "closeTab",
  });
  assert.deepEqual(parseCommand("could you scroll a bit down"), {
    type: "scroll",
    direction: "down",
  });
  assert.deepEqual(parseCommand("take me to the top of the page"), undefined);
  assert.deepEqual(parseCommand("scroll all the way to the top"), {
    type: "scroll",
    to: "top",
  });
  assert.deepEqual(parseCommand("can you skip ahead thirty seconds"), seek(30));
  assert.deepEqual(parseCommand("go back like ten seconds"), seek(-10));
  assert.deepEqual(parseCommand("rewind a bit"), seek(-10));
  assert.deepEqual(parseCommand("turn the sound off and mute it"), {
    type: "media",
    action: "mute",
  });
  assert.deepEqual(parseCommand("please refresh the page"), { type: "reload" });
});

test("when a sentence holds play and pause, the last one wins", () => {
  assert.deepEqual(parseCommand("play no wait pause"), PAUSE);
  assert.deepEqual(parseCommand("pause then play again"), PLAY);
});

test("near-miss words, without correcting everyday words", () => {
  assert.deepEqual(parseCommand("next tap"), { type: "switchTab", offset: 1 });
  assert.deepEqual(parseCommand("scrol dawn"), {
    type: "scroll",
    direction: "down",
  });
  // "now" must not become "new", "top" must stay "top".
  assert.equal(parseCommand("now what"), undefined);
});

test("ordinary speech does not trigger commands", () => {
  for (const said of [
    "what's the weather like",
    "hello how are you",
    "I think this is a nice video",
    "make me a sandwich",
    "the post office is closed",
  ]) {
    assert.equal(parseCommand(said), undefined, said);
  }
});

test("a seek runs as soon as its amount is said", () => {
  assert.equal(isInstant(seek(30), "skip thirty seconds"), true);
  assert.equal(isInstant(seek(30), "skip thirty"), false);
  assert.equal(isInstant(PAUSE, "pause"), true);
});
