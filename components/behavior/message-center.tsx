import type { MessageSnapshot } from "@/lib/behavior/decision";

type MessageCenterProps = {
  messages: MessageSnapshot;
};

export function MessageCenter({ messages }: MessageCenterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Zone messaging orders</p>
      <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/80">{messages.recommended_tone}</p>
        <p className="mt-3 text-lg font-black leading-7 text-white">{messages.announcement}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="font-black text-white">Strict variant</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{messages.strict_tone}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="font-black text-white">Multilingual ready</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{messages.multilingual.join(", ")}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-400">{messages.why}</p>
    </section>
  );
}
