import { test } from "node:test";
import assert from "node:assert/strict";
import { GestureFilter } from "../src/gesture-map.js";

test("fires only after the gesture is held", () => {
  const f = new GestureFilter({ holdMs: 500, cooldownMs: 1500 });
  assert.equal(f.push("Open_Palm", 0.9, 0), undefined);
  assert.equal(f.push("Open_Palm", 0.9, 300), undefined);
  assert.equal(f.push("Open_Palm", 0.9, 600), "Open_Palm");
});

test("cooldown blocks repeats, then allows them", () => {
  const f = new GestureFilter({ holdMs: 500, cooldownMs: 1500 });
  f.push("Thumb_Down", 0.9, 0);
  assert.equal(f.push("Thumb_Down", 0.9, 500), "Thumb_Down");
  assert.equal(f.push("Thumb_Down", 0.9, 1200), undefined);
  assert.equal(f.push("Thumb_Down", 0.9, 2100), "Thumb_Down");
});

test("low scores, unknown gestures and changes reset the hold", () => {
  const f = new GestureFilter({ holdMs: 500 });
  f.push("Victory", 0.9, 0);
  assert.equal(f.push("Victory", 0.3, 600), undefined);
  assert.equal(f.push("Victory", 0.9, 700), undefined);
  assert.equal(f.push("None", 0.9, 800), undefined);
  assert.equal(f.push("Closed_Fist", 0.9, 900), undefined);
  assert.equal(f.push("Closed_Fist", 0.9, 1500), "Closed_Fist");
});
