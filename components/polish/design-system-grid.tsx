"use client";

export function DesignSystemGrid({ modules }: { modules: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <div className="rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-200/30 hover:bg-cyan-200/5" key={module}>
          <p className="font-semibold text-white">{module}</p>
          <p className="mt-2 text-sm text-white/45">Reusable premium surface, keyboard-safe interactions, and consistent command styling.</p>
        </div>
      ))}
    </div>
  );
}

