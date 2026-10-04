import type { Metadata } from "next";
import { SpeechListener } from "@/components/speech-listener";

export const metadata: Metadata = {
  title: "Voice · Omnivra",
  description: "Speech recognition helper for the Omnivra browser extension.",
  robots: { index: false },
};

export default function ListenPage() {
  return <SpeechListener />;
}
