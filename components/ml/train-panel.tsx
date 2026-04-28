type TrainPanelProps = {
  busy?: boolean;
  onTrain: () => void;
  onUpload?: () => void;
};

export function TrainPanel({ busy = false, onTrain, onUpload }: TrainPanelProps) {
  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">Training control</p>
      <h2 className="mt-2 text-2xl font-black text-white">Next recommended run</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">Launch a LightGBM panic probability job using behavior outcomes, communication responses, and crowd-density features.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onTrain} disabled={busy} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60">
          {busy ? "Queueing..." : "Queue training job"}
        </button>
        {onUpload ? (
          <button type="button" onClick={onUpload} disabled={busy} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60">
            Upload dataset
          </button>
        ) : null}
      </div>
    </section>
  );
}
