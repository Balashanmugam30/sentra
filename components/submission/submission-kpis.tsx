export function SubmissionKpis({ items }: { items: { label: string; value: number | string; tone?: "cyan" | "emerald" | "amber" | "blue" }[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur" key={item.label}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{item.label}</p>
          <p className={`mt-3 font-mono text-3xl ${toneClass(item.tone)}`}>{item.value}</p>
        </article>
      ))}
    </section>
  );
}

function toneClass(tone: "cyan" | "emerald" | "amber" | "blue" = "cyan") {
  if (tone === "emerald") {
    return "text-emerald-100";
  }
  if (tone === "amber") {
    return "text-amber-100";
  }
  if (tone === "blue") {
    return "text-blue-100";
  }
  return "text-cyan-100";
}
