"use client";

import type { MarketplaceReviewsState } from "@/lib/marketplace/types";

export function ReviewFeed({ reviews }: { reviews: MarketplaceReviewsState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Reviews</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Enterprise trust signals</h3>
      <div className="mt-5 space-y-3">
        {reviews.reviews.map((review) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={review.review_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{review.title}</p>
                <p className="mt-1 text-xs text-white/45">{review.author} / {review.app_id}</p>
              </div>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 font-mono text-xs text-amber-100">{review.rating}.0</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{review.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

