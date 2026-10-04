import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand, EXAMPLES } from "../src/commands.js";

test("every listed example parses", () => {
  for (const example of EXAMPLES) assert.ok(parseCommand(example), example);
});

test("media controls", () => {
  assert.deepEqual(parseCommand("Pause."), { type: "media", action: "pause" });
  assert.deepEqual(parseCommand("resume video"), {
    type: "media",
    action: "play",
  });
  assert.deepEqual(parseCommand("skip 30 seconds"), {
    type: "media",
    action: "seek",
    seconds: 30,
  });
  assert.deepEqual(parseCommand("fast forward"), {
    type: "media",
    action: "seek",
    seconds: 10,
  });
  assert.deepEqual(parseCommand("skip back"), {
    type: "media",
    action: "seek",
    seconds: -10,
  });
  assert.deepEqual(parseCommand("rewind twenty"), {
    type: "media",
    action: "seek",
    seconds: -20,
  });
});

test("navigation and tabs", () => {
  assert.deepEqual(parseCommand("go back"), { type: "historyBack" });
  assert.deepEqual(parseCommand("forward"), { type: "historyForward" });
  assert.deepEqual(parseCommand("next tab"), { type: "switchTab", offset: 1 });
  assert.deepEqual(parseCommand("tab three"), { type: "gotoTab", index: 3 });
  assert.deepEqual(parseCommand("close this tab"), { type: "closeTab" });
});

test("search keeps the query", () => {
  assert.deepEqual(parseCommand("Search for best pizza near me"), {
    type: "search",
    query: "best pizza near me",
  });
});

test("unknown phrases return undefined", () => {
  assert.equal(parseCommand("make me a sandwich"), undefined);
});
