import type { Metadata } from "next";

import { SiteShell } from "@/components/site/site-shell";
import { ViralCard } from "@/components/site/viral-card";

export const metadata: Metadata = {
  title: "Sentra Demo | Watch the Crisis OS",
  description: "A viral one-screen route into the Sentra guided demo.",
};

export default function SiteDemoPage() {
  return (
    <SiteShell>
      <ViralCard title="Watch Sentra detect, decide, execute, and recover." metric="+61%" body="The guided demo turns a fire scenario into AI prediction, crowd intelligence, operations dispatch, communications, twin replay, and executive closure." cta="Launch demo request" />
    </SiteShell>
  );
}
