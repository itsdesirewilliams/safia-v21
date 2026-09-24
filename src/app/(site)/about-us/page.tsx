import { AboutBio } from "@/components/about-us/about-bio";
import { AboutBusinessProfile } from "@/components/about-us/about-business-profile";
import { AboutTeam } from "@/components/about-us/about-team";

export const metadata = {
  title: "About Us",
  description:
    "Safeway Tyre is the tyre brand of DEE RON Automotives LLP, a family-run manufacturer headquartered in Punjab, India, exporting durable tyres worldwide.",
};

/**
 * The About Us page (spec #4 / Ticket #20): a developer-owned, static page with
 * three fixed sections in order — the company bio, the Team section, and the
 * Business Profile slider. The bio and Team copy live in `src/lib/about-us.ts`;
 * the slider discovers its artwork from the `business-profile` asset folders.
 * No admin surface, no database content model.
 */
export default function AboutUsPage() {
  return (
    <>
      <AboutBio />
      <AboutTeam />
      <AboutBusinessProfile />
    </>
  );
}
