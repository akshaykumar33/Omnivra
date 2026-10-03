import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/*
 * docs/design/typography.md specifies Inter + JetBrains Mono. Inter Tight is
 * added for display sizes only: the documented 32px `display` step is an
 * in-product size, and at marketing scale Inter's default cut reads loose.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["500", "600", "700"],
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
    { media: "(prefers-color-scheme: dark)", color: "#0a0d14" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrains.variable}`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-md focus:bg-raised focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
