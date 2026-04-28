export function ExplainPanel({ explanations }: { explanations: string[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Explainability</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Why the AI chose this</h2>
      <div className="mt-5 grid gap-3">
        {explanations.map((explanation) => (
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-cyan-50/75" key={explanation}>
            {explanation}
          </div>
        ))}
      </div>
    </section>
  );
}
