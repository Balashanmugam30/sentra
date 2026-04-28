import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionDocs } from "@/lib/submission/types";

export function DocsBoard({ docs, busyAction, onExport }: { docs: SubmissionDocs; busyAction: string | null; onExport: () => void }) {
  return (
    <SubmissionPanel eyebrow="Document Engine" title="Export-ready written materials" subtitle={docs.case_study_pack}>
      <div className="mb-5 flex flex-wrap gap-3">
        <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onExport} type="button">
          Export document pack
        </button>
        <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-2 text-sm text-emerald-100">Procurement ready: {docs.procurement_ready ? "yes" : "no"}</span>
        <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-2 text-sm text-emerald-100">Security packet: {docs.security_packet_ready ? "ready" : "draft"}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {docs.documents.map((doc) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={doc.doc_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{doc.status}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{doc.summary}</p>
            <p className="mt-3 font-mono text-sm text-white/45">{doc.format} | {doc.pages} pages</p>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}
