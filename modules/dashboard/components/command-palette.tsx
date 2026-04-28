"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CommandPaletteSection = {
  action?: () => void;
  description: string;
  eyebrow: string;
  id: string;
  title: string;
  visible: boolean;
};

type CommandPaletteProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  sections: CommandPaletteSection[];
};

function activateSection(sectionId: string) {
  const target = document.querySelector<HTMLElement>(`[data-section-id="${sectionId}"]`);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CommandPalette({ onOpenChange, open, sections }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const availableSections = useMemo(() => sections.filter((section) => section.visible), [sections]);
  const filteredSections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return availableSections;
    }

    return availableSections.filter((section) =>
      `${section.eyebrow} ${section.title} ${section.description}`.toLowerCase().includes(needle),
    );
  }, [availableSections, query]);
  const closePalette = useCallback(() => {
    setQuery("");
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          closePalette();
        } else {
          onOpenChange(true);
        }
      }

      if (event.key === "Escape") {
        closePalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePalette, onOpenChange, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] bg-black/58 p-4 backdrop-blur-xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={closePalette}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-label="Sentra command palette"
            aria-modal="true"
            className="mx-auto mt-24 max-w-2xl overflow-hidden rounded-[32px] border border-white/12 bg-[#060b16]/96 shadow-[var(--sentra-shadow-modal)]"
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="border-b border-white/10 p-4">
              <label className="sr-only" htmlFor="sentra-command-search">
                Search Sentra modules
              </label>
              <input
                className="sentra-command-input w-full rounded-2xl px-4 py-3 text-base outline-none placeholder:text-white/35"
                id="sentra-command-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search modules, reports, command surfaces..."
                ref={inputRef}
                value={query}
              />
            </div>
            <nav aria-label="Available command sections" className="max-h-[52vh] overflow-y-auto p-3">
              {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                  <button
                    className="group flex w-full items-start gap-4 rounded-3xl px-4 py-4 text-left transition hover:bg-white/8 focus:bg-white/8 focus:outline-none"
                    key={section.id}
                    onClick={() => {
                      if (section.action) {
                        section.action();
                      } else {
                        activateSection(section.id);
                      }
                      closePalette();
                    }}
                    type="button"
                  >
                    <span className="mt-1 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.5)]" />
                    <span>
                      <span className="block text-xs uppercase tracking-[0.22em] text-cyan-100/45">
                        {section.eyebrow}
                      </span>
                      <span className="mt-1 block text-base font-semibold text-white group-hover:text-cyan-50">
                        {section.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-white/50">
                        {section.description}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-3xl border border-white/8 bg-white/5 p-6 text-sm text-white/50">
                  No matching command surfaces are available for your current role.
                </div>
              )}
            </nav>
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-white/42">
              <span>Press Ctrl+K to reopen anytime</span>
              <span>{availableSections.length} accessible modules</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
