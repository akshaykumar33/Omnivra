// Copies the extension sources and MediaPipe runtime into dist/, ready for "Load unpacked" or zipping.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const cache = join(root, "vendor");
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";
const model = join(cache, "gesture_recognizer.task");

// The model is ~8 MB, so it's downloaded once and cached rather than committed.
if (!existsSync(model)) {
  mkdirSync(cache, { recursive: true });
  const response = await fetch(MODEL_URL);
  if (!response.ok)
    throw new Error(`Model download failed: ${response.status}`);
  writeFileSync(model, Buffer.from(await response.arrayBuffer()));
}

const visionDir = dirname(
  createRequire(import.meta.url).resolve("@mediapipe/tasks-vision"),
);

rmSync(dist, { recursive: true, force: true });
cpSync(join(root, "src"), dist, { recursive: true });
cpSync(
  join(visionDir, "vision_bundle.mjs"),
  join(dist, "vendor", "vision_bundle.mjs"),
);
// Only the SIMD build is used: every Chromium the manifest allows (116+) has
// WebAssembly SIMD. Skipping the nosimd and module variants saves ~22 MB.
for (const file of ["vision_wasm_internal.js", "vision_wasm_internal.wasm"]) {
  cpSync(join(visionDir, "wasm", file), join(dist, "vendor", "wasm", file));
}
cpSync(model, join(dist, "vendor", "gesture_recognizer.task"));
console.log("Built extension into", dist);
