import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";

/*
 * Display face: Bricolage Grotesque.
 *
 * The obvious move for a warm, expensive-looking page is a high-contrast
 * display serif, and it is the wrong one: it is the single most recognisable
 * tell in machine-designed work, and it would make a developer tool look like
 * a restaurant. Bricolage is a grotesque with an optical-size axis, so the
 * headline weight tightens as it scales up and the same family still sets a
 * 15px label without looking like a shrunken poster.
 *
 * Body face: Instrument Sans, which is quieter than the display face on
 * purpose. Mono stays JetBrains per docs/design/typography.md.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  axes: ["opsz"],
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Omnivra - control anything, with any input",
  description:
    "Omnivra turns voice, hand gestures, eye movement and keyboard into one programmable control layer for your browser, editor and desktop. Local-first and accessible by design.",
  openGraph: {
    title: "Omnivra - control anything, with any input",
    description:
      "One programmable control layer for voice, gesture and gaze. Local-first, accessible, extensible.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090e" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${display.variable} ${body.variable} ${jetbrains.variable}`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-md focus:bg-raised focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
