"use client";

import type { CommandPaletteSection } from "./command-palette";

type PremiumCommandSidebarProps = {
  onOpenPalette: () => void;
  sections: CommandPaletteSection[];
};

function scrollToSection(sectionId: string) {
  document
    .querySelector<HTMLElement>(`[data-section-id="${sectionId}"]`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PremiumCommandSidebar({ onOpenPalette, sections }: PremiumCommandSidebarProps) {
  const visibleSections = sections.filter((section) => section.visible);
  const favoriteSections = visibleSections.slice(0, 4);

  return (
    <>
      <nav
        aria-label="Sentra dashboard sections"
        className="fixed left-5 top-24 z-30 hidden w-64 rounded-[30px] border border-white/10 bg-[#050a14]/76 p-4 shadow-[var(--sentra-shadow-command)] backdrop-blur-xl 2xl:block"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">Sentra</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Command nav</h2>
          </div>
          <button
            aria-label="Open command palette"
            className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
            onClick={onOpenPalette}
            type="button"
          >
            Ctrl K
          </button>
        </div>

        <div className="mt-5 space-y-2" role="list">
          {visibleSections.map((section) => (
            <button
              className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-white/58 transition hover:bg-white/8 hover:text-white focus:bg-white/8 focus:text-white focus:outline-none"
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              role="listitem"
              type="button"
            >
              <span>{section.eyebrow}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-200/70" />
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-cyan-200/10 bg-cyan-200/8 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">Pinned</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {favoriteSections.map((section) => (
              <button
                className="rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs font-medium text-white/62 transition hover:text-white"
                key={`favorite-${section.id}`}
                onClick={() => scrollToSection(section.id)}
                type="button"
              >
                {section.title.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <button
        aria-label="Open Sentra command palette"
        className="fixed bottom-5 left-5 z-40 rounded-full border border-white/12 bg-[#07101d]/86 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:bg-[#0b1728] focus:outline-none focus:ring-2 focus:ring-cyan-200/50 2xl:hidden"
        onClick={onOpenPalette}
        type="button"
      >
        Search command
      </button>
    </>
  );
}
