"use client";

import { DemoScriptBoard } from "@/components/submission/demo-script-board";
import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionDemoScriptPage() {
  const { demoScripts, loading, error, lastAction, refresh } = useSubmission();
  const wowMoments = demoScripts.scripts.reduce((sum, script) => sum + script.wow_moments.length, 0);

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Demo Script Engine"
        title="Timed talking tracks for every high-stakes room"
        subtitle="Two-minute pitch, five-minute judge demo, investor deep dive, and enterprise walkthrough with objections and recovery lines."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Script score", value: `${demoScripts.script_score}/100`, tone: "cyan" },
            { label: "Demo modes", value: demoScripts.scripts.length, tone: "emerald" },
            { label: "Wow moments", value: wowMoments, tone: "blue" },
            { label: "Recovery line", value: "Ready", tone: "amber" },
          ]}
        />
        <DemoScriptBoard demoScripts={demoScripts} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
