"use client";

import { SubmissionKpis } from "@/components/submission/submission-kpis";
import { SubmissionShell } from "@/components/submission/submission-shell";
import { TeamStoryBoard } from "@/components/submission/team-story-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSubmission } from "@/lib/submission/use-submission";

export default function SubmissionTeamPage() {
  const { team, loading, error, lastAction, refresh } = useSubmission();

  return (
    <ProtectedWorkspaceShell>
      <SubmissionShell
        eyebrow="Team Story Engine"
        title="Founder narrative for interviews, judges, and accelerators"
        subtitle="A polished story that connects personal conviction, student innovation, technical depth, speed of execution, and future roadmap."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <SubmissionKpis
          items={[
            { label: "Interview score", value: `${team.interview_score}/100`, tone: "cyan" },
            { label: "Story blocks", value: team.story.length, tone: "emerald" },
            { label: "Positioning", value: "Founder-led", tone: "blue" },
            { label: "Roadmap clarity", value: "Strong", tone: "amber" },
          ]}
        />
        <TeamStoryBoard team={team} />
      </SubmissionShell>
    </ProtectedWorkspaceShell>
  );
}
