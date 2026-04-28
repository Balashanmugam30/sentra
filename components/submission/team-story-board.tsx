import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionTeamState } from "@/lib/submission/types";

export function TeamStoryBoard({ team }: { team: SubmissionTeamState }) {
  return (
    <SubmissionPanel eyebrow="Team Story Engine" title="Founder narrative for interviews, judges, and grant panels" subtitle={team.positioning}>
      <div className="grid gap-4 md:grid-cols-2">
        {team.story.map((story) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={story.story_id}>
            <h3 className="text-xl font-semibold text-white">{story.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/58">{story.body}</p>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}
