import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { Integrations } from "@/components/integrations";
import { Inputs } from "@/components/inputs";
import { Pipeline } from "@/components/pipeline";
import { Accessibility, Privacy } from "@/components/commitments";
import { ClosingCta, SiteFooter } from "@/components/site-footer";

/*
 * Section order is also the layout-family order, deliberately varied so no two
 * adjacent sections share a shape:
 *
 *   Hero          asymmetric split, live demo on the right
 *   Integrations  single hairline-bounded logo row
 *   Inputs        asymmetric bento, 5 cells for 5 modalities
 *   Pipeline      sticky scroll-scrub sequence
 *   Accessibility full-width statement
 *   Privacy       split with photography
 *   ClosingCta    horizontal CTA band
 */
export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <Hero />
        <Integrations />
        <Inputs />
        <Pipeline />
        <Accessibility />
        <Privacy />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
