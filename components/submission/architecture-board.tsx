import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionArchitecture } from "@/lib/submission/types";

export function ArchitectureBoard({ architecture }: { architecture: SubmissionArchitecture }) {
  return (
    <SubmissionPanel eyebrow="Architecture Showcase" title="Exportable diagrams for technical credibility" subtitle={architecture.narrative}>
      <div className="grid gap-4 lg:grid-cols-2">
        {architecture.diagrams.map((diagram) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={diagram.diagram_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{diagram.title}</h3>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{diagram.export}</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {diagram.layers.map((layer, index) => (
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/60" key={`${diagram.diagram_id}-${layer}`}>
                  {index + 1}. {layer}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}
