import { AdvertizePlacement } from "@/components/advertize-placement";
import { InsightsPreview } from "@/components/insights/insights-preview";

/**
 * Reusable conclusion for Vedoy Studio services and product pages.
 * The ad is delivered by Vedoy Monetize / Advertize via its existing
 * campaign-controlled, sandboxed /api/advertize/frame endpoint.
 */
export function MonetizedInsightsSection() {
  return (
    <>
      <section
        aria-label="Annonse fra Vedoy Advertize via Vedoy Monetize"
        style={{ background: "#101813", padding: "24px 18px" }}
      >
        <AdvertizePlacement
          slot="studio-home"
          title="Vedoy Advertize – annonse"
          height={168}
          style={{ margin: "0 auto" }}
        />
      </section>
      <InsightsPreview />
    </>
  );
}
