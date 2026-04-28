import type { DataMonetizationProduct } from "@/lib/data/types";

export function DataMonetization({ products, monetizationArr }: { products: DataMonetizationProduct[]; monetizationArr: number }) {
  return (
    <section className="rounded-[30px] border border-emerald-200/10 bg-emerald-200/[0.045] p-5 backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/55">Data Monetization Moat</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">${monetizationArr.toLocaleString()} intelligence ARR potential</h3>
      <div className="mt-5 space-y-3">
        {products.map((product) => (
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4" key={product.product_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-white">{product.name}</p>
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{product.status}</span>
            </div>
            <p className="mt-2 text-sm text-white/55">{product.buyer} | {product.privacy} | ${product.annual_value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
