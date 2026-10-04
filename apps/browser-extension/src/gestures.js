// Runs MediaPipe's gesture recognizer on the webcam inside the side panel.
import { FilesetResolver, GestureRecognizer } from "./vendor/vision_bundle.mjs";
import { GESTURES, GestureFilter } from "./gesture-map.js";

export async function startGestures(video, onGesture) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 320, height: 240 },
  });
  video.srcObject = stream;
  await video.play();

  const fileset = await FilesetResolver.forVisionTasks(
    chrome.runtime.getURL("vendor/wasm"),
  );
  const recognizer = await GestureRecognizer.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: chrome.runtime.getURL("vendor/gesture_recognizer.task"),
    },
    runningMode: "VIDEO",
    numHands: 1,
  });

  const filter = new GestureFilter();
  let running = true;
  let lastTime = -1;

  function frame() {
    if (!running) return;
    if (video.currentTime !== lastTime) {
      lastTime = video.currentTime;
      const now = performance.now();
      const top = recognizer.recognizeForVideo(video, now).gestures[0]?.[0];
      const fired = filter.push(top?.categoryName, top?.score ?? 0, now);
      if (fired) onGesture(GESTURES[fired]);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return () => {
    running = false;
    recognizer.close();
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  };
}
