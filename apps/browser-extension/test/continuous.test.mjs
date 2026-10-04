// Replays what continuous recognition sends for one phrase (interim updates
// that grow and get rewritten, then a final) through the panel's decide().
import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../src/commands.js";

// Feeds updates in order; returns the actions that ran.
function replay(updates) {
  let actedOn = 0;
  const ran = [];
  for (const [text, isFinal = false] of updates) {
    const outcome = decide([text], isFinal, actedOn);
    actedOn = outcome.actedOn;
    if (outcome.run) ran.push(outcome.run.action ?? outcome.run.type);
  }
  return ran;
}

test("pause right after play, in one phrase", () => {
  assert.deepEqual(replay([["play"], ["play pause"], ["play pause", true]]), [
    "play",
    "pause",
  ]);
});

test("a rewrite that drops words doesn't swallow the next command", () => {
  // The case that made voice ignore commands: "please" disappears in a
  // rewrite, then "play" is said.
  assert.deepEqual(
    replay([
      ["please pause the video"],
      ["pause the video"],
      ["pause the video play"],
    ]),
    ["pause", "play"],
  );
});

test("a rewrite that drops a command word still lets the next one run", () => {
  assert.deepEqual(
    replay([
      ["play pause"], // runs pause (last wins)
      ["pause"], // rewrite removes "play"
      ["pause play"], // a new command is said
    ]),
    ["pause", "play"],
  );
});

test("each command runs once, interim or final", () => {
  assert.deepEqual(
    replay([
      ["pause"],
      ["pause the"],
      ["pause the video"],
      ["Pause the video.", true],
    ]),
    ["pause"],
  );
});

test("a skip waits for its amount, then runs once", () => {
  assert.deepEqual(
    replay([
      ["skip"],
      ["skip thirty"],
      ["skip thirty seconds"],
      ["Skip 30 seconds.", true],
    ]),
    ["seek"],
  );
});

test("chatter between commands is ignored", () => {
  assert.deepEqual(
    replay([
      ["okay so"],
      ["okay so this video is nice"],
      ["okay so this video is nice pause it"],
      ["okay so this video is nice pause it", true],
    ]),
    ["pause"],
  );
});
