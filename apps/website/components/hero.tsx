import { HeroIntro } from "./hero-intro";
import { VoiceDemo } from "./voice-demo";

/**
 * Asymmetric split hero: message left, live product right.
 *
 * A server component that composes two independent client islands, so GSAP
 * (the text column) and Motion (inside the demo) never share a tree.
 *
 * The aurora sits behind both. It is three blurred colour fields drifting on
 * transform only, which keeps it on the compositor instead of repainting, and
 * it carries the modality hues so the page opens on the same palette the
 * inputs section uses.
 */
export function Hero() {
  return (
    <section className="relative isolate">
      <div className="aurora" aria-hidden="true">
        <div className="aurora__blob aurora__blob--one" />
        <div className="aurora__blob aurora__blob--two" />
        <div className="aurora__blob aurora__blob--three" />
      </div>

      <div className="mx-auto grid max-w-[1400px] items-center lg:items-start gap-10 px-6 pt-8 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-12 lg:pb-16">
        <HeroIntro />
        <VoiceDemo />
      </div>
    </section>
  );
}
