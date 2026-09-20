import { definePlugin } from "@omnivra/plugin-sdk";

export default definePlugin({
  manifest: {
    id: "omnivra-plugin-spotify",
    version: "0.1.0",
    name: "SPOTIFY Multimodal Integration",
    description: "Enables multimodal gesture and voice control for spotify",
    permissions: ["media:playback.control", "browser:dom.interact"],
  },
  setup: (ctx) => {
    ctx.logger.info("SPOTIFY plugin registered successfully");
  },
});
