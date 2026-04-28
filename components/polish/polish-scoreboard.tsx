"use client";

import { polishTone } from "@/lib/polish/runtime";

export type PolishArea = {
  area_id: string;
  name: string;
  score: number;
  items: string[];
};

export function PolishScoreboard({ areas }: { areas: PolishArea[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-4">
      {areas.map((area) => (
        <article className="rounded-[28px] border border-white/10 bg-black/25 p-5" key={area.area_id}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-white">{area.name}</h3>
            <span className={`font-mono text-2xl ${polishTone(area.score)}`}>{area.score}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {area.items.map((item) => (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/50" key={item}>{item}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

