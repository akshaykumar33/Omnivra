import { definePlugin } from "@omnivra/plugin-sdk";

export default definePlugin({
  manifest: {
    id: "omnivra-plugin-github",
    version: "0.1.0",
    name: "GITHUB Multimodal Integration",
    description: "Enables multimodal gesture and voice control for github",
    permissions: ["media:playback.control", "browser:dom.interact"],
  },
  setup: (ctx) => {
    ctx.logger.info("GITHUB plugin registered successfully");
  },
});
