"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll, driven by GSAP's ticker.
 *
 * Two scroll systems running their own RAF loops fight each other and produce
 * exactly the stutter this direction cannot afford, so Lenis is advanced from
 * the GSAP ticker and ScrollTrigger is updated from Lenis. One loop, one source
 * of truth.
 *
 * Reduced motion skips Lenis entirely. Hijacking the scroll of someone who has
 * asked the OS for less motion is the most hostile thing this page could do,
 * and native scrolling is the correct fallback.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Exponential ease-out: fast hand-off, long settle.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Images and fonts settle after mount and change every pinned measurement.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
