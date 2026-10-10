"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { rememberSet } from "@/lib/dummySession";
import { MODEL_VIEWS } from "@/lib/modelFrame";
import { SHARED_SETS, type SharedSet } from "@/lib/showcase";

const SetStage = dynamic(() => import("@/components/SetStage"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#efe6d4]" />,
});

function SetCard({ item }: { item: SharedSet }) {
  const router = useRouter();
  const [view, setView] = useState(0);
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (open || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setView((current) => (current + 1) % MODEL_VIEWS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [open, paused]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const useSet = () => {
    rememberSet(item.slug);
    router.push(`/studio?set=${item.slug}`);
  };

  const step = (delta: number) => {
    setView((current) => (current + delta + MODEL_VIEWS.length) % MODEL_VIEWS.length);
  };

  return (
    <article
      className="flex flex-col bg-[#fffaf2] p-3 shadow-[4px_5px_0_rgb(20_16_12_/_0.12)] ring-1 ring-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-52 overflow-hidden bg-[#efe6d4]">
        <SetStage blocks={item.blocks} view={view} />
        <button
          type="button"
          aria-label="Sudut sebelumnya"
          onClick={() => step(-1)}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-[#fffaf2]/90 px-2 py-1 text-sm font-extrabold shadow-[2px_2px_0_#1c1612]"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Sudut berikutnya"
          onClick={() => step(1)}
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-[#fffaf2]/90 px-2 py-1 text-sm font-extrabold shadow-[2px_2px_0_#1c1612]"
        >
          ›
        </button>
        <div className="absolute inset-x-2 bottom-2 z-10 flex items-center justify-between gap-2">
          <span className="bg-[#1c1612] px-2 py-0.5 font-sans text-[10px] font-bold text-[#ffd000]">
            {MODEL_VIEWS[view].label}
          </span>
          <span className="flex gap-1">
            {MODEL_VIEWS.map((angle, index) => (
              <button
                key={angle.id}
                type="button"
                aria-label={angle.label}
                onClick={() => setView(index)}
                className={`h-2 w-2 ${index === view ? "bg-[#1c1612]" : "bg-[#1c1612]/30"}`}
              />
            ))}
          </span>
        </div>
      </div>
      <h3 className="mt-3 text-base font-extrabold">{item.title}</h3>
      <p className="font-scribble text-xl text-[#9a3412]">{item.author}</p>
      <p className="mt-1 font-sans text-[12px] leading-snug text-[#1c1612]/65">{item.note}</p>
      <p className="mt-2 font-sans text-[11px] font-bold text-[#1c1612]/45">{item.pieces} part</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-[#ffd000] px-3 py-2 text-xs font-extrabold shadow-[2px_2px_0_#1c1612]"
        >
          Lihat
        </button>
        <button type="button" onClick={useSet} className="bg-[#1c1612] px-3 py-2 text-xs font-extrabold text-[#ffd000]">
          Pakai set ini
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1612]/55 p-3 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            className="flex h-[min(88vh,760px)] w-full max-w-4xl flex-col bg-[#f4efe4] shadow-[8px_8px_0_#1c1612]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-scribble text-2xl text-[#9a3412]">{item.author}</p>
                <h2 className="text-2xl font-extrabold tracking-tight">{item.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-white px-3 py-2 font-sans text-xs font-bold ring-1 ring-black/10"
              >
                Tutup
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <SetStage blocks={item.blocks} view={view} interactive />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {MODEL_VIEWS.map((angle, index) => (
                  <button
                    key={angle.id}
                    type="button"
                    onClick={() => setView(index)}
                    className={`px-3 py-2 text-xs font-extrabold ${
                      index === view ? "bg-[#1c1612] text-[#ffd000]" : "bg-white ring-1 ring-black/10"
                    }`}
                  >
                    {angle.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={useSet} className="bg-[#ffd000] px-3 py-2 text-xs font-extrabold shadow-[2px_2px_0_#1c1612]">
                Pakai set ini
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function ShowcaseShelf({ compact = false }: { compact?: boolean }) {
  const items = compact ? SHARED_SETS.slice(0, 4) : SHARED_SETS;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <SetCard key={item.slug} item={item} />
      ))}
    </div>
  );
}
