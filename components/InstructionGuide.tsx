"use client";

import { BRICK_COLORS } from "@/lib/bricks";
import type { BuildStep } from "@/lib/instructions";

interface InstructionGuideProps {
  steps: BuildStep[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

export default function InstructionGuide({ steps, index, onPrev, onNext, onExit }: InstructionGuideProps) {
  const step = steps[index];
  if (!step) return null;
  const isFirst = index <= 0;
  const isLast = index >= steps.length - 1;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex justify-center md:right-[calc(min(360px,90vw)+1rem)] md:left-4">
      <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-2 border border-black/10 bg-[#f6f1e4] p-2 text-zinc-900 shadow-[4px_6px_0_rgb(0_0_0_/_.28)] sm:gap-3 sm:p-2.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="grid size-11 shrink-0 place-items-center bg-white text-sm font-black shadow-[2px_2px_0_rgb(0_0_0_/_.15)] disabled:opacity-35"
        >
          ←
        </button>

        <div className="grid size-12 shrink-0 place-items-center bg-[#ffd000] text-xl font-black tabular-nums shadow-[2px_2px_0_rgb(0_0_0_/_.18)]">
          {step.number}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-zinc-500">
            Halaman {index + 1} dari {steps.length}
            {isLast ? " · selesai" : ""}
          </p>
          <p className="truncate text-sm font-black">{step.title}</p>
          {step.parts.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {step.parts.map((part) => (
                <span
                  key={`${part.label}-${part.color}`}
                  className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-black/8"
                >
                  <span className="grid size-4 place-items-center rounded-full bg-zinc-950 text-[9px] font-black text-white">
                    {part.count}
                  </span>
                  <span className="size-2.5 rounded-[1px]" style={{ backgroundColor: BRICK_COLORS[part.color].hex }} />
                  {part.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className="shrink-0 bg-zinc-950 px-4 py-3 text-sm font-black text-[#ffd000] shadow-[2px_2px_0_rgb(0_0_0_/_.25)] disabled:opacity-35"
        >
          Lanjut
        </button>
        <button
          type="button"
          onClick={onExit}
          className="hidden shrink-0 px-2 py-3 text-xs font-bold text-zinc-500 underline decoration-dotted underline-offset-4 hover:text-zinc-900 sm:block"
        >
          Meja
        </button>
      </div>
    </div>
  );
}
