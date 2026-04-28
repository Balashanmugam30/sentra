import type { ProductPillar } from "@/lib/site/types";

export function PillarGrid({ items }: { items: ProductPillar[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur" key={item.title}>
          <p className="text-lg font-semibold text-white">{item.title}</p>
          <p className="mt-3 text-sm leading-6 text-white/52">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
