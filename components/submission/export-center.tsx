import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionSummary } from "@/lib/submission/types";

export function ExportCenter({
  summary,
  busyAction,
  onGenerate,
  onExport,
}: {
  summary: SubmissionSummary;
  busyAction: string | null;
  onGenerate: () => void;
  onExport: () => void;
}) {
  return (
    <SubmissionPanel
      eyebrow="One Click Export Center"
      title="Generate competition, investor, grant, and procurement packs"
      subtitle="Every outward-facing artifact is tracked with deterministic export status, missing asset pressure, and next-step guidance."
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.055] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/45">Selected mode</p>
              <h3 className="mt-2 text-2xl font-semibold capitalize text-white">{summary.selected_mode.replaceAll("_", " ")}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60"
                disabled={busyAction !== null}
                onClick={onGenerate}
                type="button"
              >
                {busyAction === "generate" ? "Generating" : "Generate pack"}
              </button>
              <button
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
                disabled={busyAction !== null}
                onClick={onExport}
                type="button"
              >
                {busyAction === "export" ? "Exporting" : "Export board PDF"}
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {summary.exports.map((item) => (
              <article className="rounded-2xl border border-white/10 bg-black/25 p-4" key={item.export_id}>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-2 text-xs text-white/45">
                  {item.format} | {item.status}
                </p>
                <p className="mt-2 text-xs text-cyan-100/55">{item.last_exported ?? "Not exported yet"}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Recommended next steps</p>
          <div className="mt-4 space-y-3">
            {summary.recommended_next_steps.map((step) => (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/58" key={step}>
                {step}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-amber-200/15 bg-amber-200/[0.045] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-100/45">Pending missing assets</p>
          <div className="mt-4 space-y-3">
            {summary.pending_missing_assets.map((asset) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3" key={asset.asset_id}>
                <div>
                  <p className="text-sm font-semibold text-white">{asset.title}</p>
                  <p className="mt-1 text-xs text-white/45">Owner: {asset.owner}</p>
                </div>
                <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs text-amber-100">{asset.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200/15 bg-emerald-200/[0.045] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/45">Generated packs</p>
          <div className="mt-4 space-y-3">
            {summary.generated_packs.map((pack, index) => (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" key={`${stringValue(pack.artifact)}-${index}`}>
                <p className="text-sm font-semibold text-white">{stringValue(pack.artifact)}</p>
                <p className="mt-1 text-xs text-white/45">
                  {stringValue(pack.mode)} | {stringValue(pack.generated_at)}
                </p>
              </div>
            ))}
            {summary.generated_packs.length === 0 && <p className="text-sm text-white/50">No packs generated yet. The default one-click pack is ready.</p>}
          </div>
        </div>
      </div>
    </SubmissionPanel>
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "submission_pack";
}
