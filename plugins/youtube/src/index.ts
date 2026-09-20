import { definePlugin } from "@omnivra/plugin-sdk";

export default definePlugin({
  manifest: {
    id: "omnivra-plugin-youtube",
    version: "0.1.0",
    name: "YOUTUBE Multimodal Integration",
    description: "Enables multimodal gesture and voice control for youtube",
    permissions: ["media:playback.control", "browser:dom.interact"],
  },
  setup: (ctx) => {
    ctx.logger.info("YOUTUBE plugin registered successfully");
  },
});
