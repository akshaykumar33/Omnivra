import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy · Omnivra",
  description:
    "What the Omnivra browser extension does with your microphone, camera and browsing data.",
};

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "The short version",
    body: [
      "Omnivra has no servers, no accounts, no analytics and no advertising. It does not collect, store, sell or share any personal data.",
    ],
  },
  {
    heading: "Microphone",
    body: [
      "Only after you click “Start listening”, Omnivra uses Chrome’s built-in speech recognition (the Web Speech API) to turn what you say into text. Chrome may send that audio to Google’s speech service to do this; that processing is covered by Google’s privacy policy. Omnivra receives only the text, uses it to pick a command, and does not keep it.",
      "Listening stops when you click “Stop listening” or close the side panel.",
    ],
  },
  {
    heading: "Camera",
    body: [
      "Only after you click “Start gestures”, Omnivra reads frames from your camera and recognises hand gestures with a model that ships inside the extension. Video is processed entirely on your device and is never recorded, stored or transmitted.",
      "The camera turns off when you click “Stop gestures” or close the side panel.",
    ],
  },
  {
    heading: "Tabs and pages",
    body: [
      "To carry out a command, Omnivra uses Chrome’s tab APIs (switch, close, open, back, forward, reload) and briefly runs a small script in the current page to play, pause, seek or scroll. It does not read page content, track your browsing history or record which sites you visit.",
      "“Search for …” sends your query to your browser’s default search engine, exactly as typing it into the address bar would.",
    ],
  },
  {
    heading: "Permissions",
    body: [
      "tabs, scripting and host access: to control the current tab and page. search: to run spoken searches. sidePanel: to show the controls. Microphone and camera access are requested by Chrome only when you start voice or gestures.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "If this policy changes, the new version will be published on this page with a new date. Questions can be raised on the project’s GitHub repository.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main
      id="main"
      style={{
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "clamp(3rem, 8vw, 6rem) 1rem",
        color: "var(--text-primary)",
        lineHeight: 1.65,
      }}
    >
      <Link href="/" style={{ color: "var(--text-muted)" }}>
        ← Omnivra
      </Link>
      <h1
        style={{ fontSize: "var(--text-headline)", margin: "1.5rem 0 0.5rem" }}
      >
        Privacy policy
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}>
        Omnivra browser extension · Last updated 4 October 2026
      </p>
      {sections.map(({ heading, body }) => (
        <section key={heading} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
            {heading}
          </h2>
          {body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} style={{ marginBottom: "0.75rem" }}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </main>
  );
}
