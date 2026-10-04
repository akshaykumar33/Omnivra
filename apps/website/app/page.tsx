import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { Integrations } from "@/components/integrations";
import { Gallery } from "@/components/gallery";
import { Pipeline } from "@/components/pipeline";
import { WasmEngineHud } from "@/components/wasm-engine-hud";
import { Accessibility, Privacy } from "@/components/commitments";
import { ClosingCta, SiteFooter } from "@/components/site-footer";

/*
 * Section order is also the layout-family order, deliberately varied so no two
 * adjacent sections share a shape:
 *
 *   Hero          asymmetric split, live demo on the right
 *   Integrations  single hairline-bounded logo row
 *   Gallery       pinned horizontal pan, 5 full-height panels
 *   Pipeline      sticky scroll-scrub sequence
 *   WasmEngineHud collapsible runtime telemetry HUD
 *   Accessibility full-width statement
 *   Privacy       split with technical schematic
 *   ClosingCta    horizontal CTA band
 */
export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <Hero />
        <Integrations />
        <Gallery />
        <Pipeline />
        <WasmEngineHud />
        <Accessibility />
        <Privacy />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
