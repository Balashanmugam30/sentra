import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionDeck } from "@/lib/submission/types";

export function DeckBoard({ deck, busyAction, onExport }: { deck: SubmissionDeck; busyAction: string | null; onExport: () => void }) {
  return (
    <SubmissionPanel eyebrow="Auto Pitch Deck Engine" title={`${deck.template} deck content generator`} subtitle={`Deck quality score ${deck.deck_quality_score}/100. Export formats: ${deck.export_formats.join(", ")}.`}>
      <div className="mb-5">
        <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onExport} type="button">
          Export deck
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {deck.slides.map((slide) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={slide.slide_id}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Slide {slide.order} | {slide.title}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{slide.headline}</h3>
            <ul className="mt-4 space-y-2">
              {slide.bullets.map((bullet) => (
                <li className="text-sm leading-6 text-white/58" key={`${slide.slide_id}-${bullet}`}>{bullet}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.05] px-4 py-3 text-sm text-cyan-100/70">Visual: {slide.visual}</p>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}
