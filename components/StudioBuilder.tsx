"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import InstructionGuide from "@/components/InstructionGuide";
import BrickCanvas from "@/components/BrickCanvas";
import Sidebar from "@/components/Sidebar";
import { useSceneHistory, type SceneSnapshot } from "@/hooks/useSceneHistory";
import { generateBuildSteps, visibleIdsThrough, type BuildStep } from "@/lib/instructions";
import { copySharedBlocks, findSharedSet } from "@/lib/showcase";
import {
  DEFAULT_CUSTOM_SPEC,
  DEFAULT_GRID_SIZE,
  BRICK_COLORS,
  blocksFitGrid,
  buildHeightMap,
  computePlacement,
  createBlockId,
  getActiveSpec,
  isRotatable,
  normalizeGridSize,
} from "@/lib/bricks";
import type { BlockType, BlockTypeSpec, BuilderMode, GridPosition, BrickColor, Rotation } from "@/types/bricks";

export default function StudioBuilder() {
  const setSlug = useSearchParams().get("set") ?? undefined;
  const shared = findSharedSet(setSlug);
  const [bootScene] = useState<SceneSnapshot>(() => ({
    blocks: shared ? copySharedBlocks(shared.blocks) : [],
    selectedId: null,
    gridSize: DEFAULT_GRID_SIZE,
  }));
  const { scene, commit, replace, undo, redo, canUndo, canRedo } = useSceneHistory(bootScene);
  const loadedSlug = useRef(setSlug);
  const { blocks, selectedId, gridSize } = scene;

  const [mode, setMode] = useState<BuilderMode>("build");
  const [activeColor, setActiveColor] = useState<BrickColor>("red");
  const [activeType, setActiveType] = useState<BlockType>("brick-2x4");
  const [customSpec, setCustomSpec] = useState<BlockTypeSpec>(DEFAULT_CUSTOM_SPEC);
  const [activeRotation, setActiveRotation] = useState<Rotation>(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [panelOpen, setPanelOpen] = useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 768px)").matches,
  );
  const [guide, setGuide] = useState<{ steps: BuildStep[]; index: number } | null>(null);

  useEffect(() => {
    if (setSlug === loadedSlug.current) return;
    loadedSlug.current = setSlug;
    const next = findSharedSet(setSlug);
    if (!next) return;
    setGuide(null);
    setConfirmReset(false);
    commit({
      blocks: copySharedBlocks(next.blocks),
      selectedId: null,
      gridSize: DEFAULT_GRID_SIZE,
    });
  }, [setSlug, commit]);

  const selectedBlock = blocks.find((block) => block.id === selectedId) ?? null;
  const inGuide = guide !== null;

  const visibleBlocks = useMemo(() => {
    if (!guide) return blocks;
    const ids = visibleIdsThrough(guide.steps, guide.index);
    return blocks.filter((block) => ids.has(block.id));
  }, [blocks, guide]);

  const highlightIds = useMemo(
    () => (guide ? new Set(guide.steps[guide.index]?.blockIds ?? []) : undefined),
    [guide],
  );

  const goPrevStep = useCallback(() => {
    setGuide((current) => (current && current.index > 0 ? { ...current, index: current.index - 1 } : current));
  }, []);

  const goNextStep = useCallback(() => {
    setGuide((current) =>
      current && current.index < current.steps.length - 1 ? { ...current, index: current.index + 1 } : current,
    );
  }, []);

  const exitGuide = useCallback(() => setGuide(null), []);

  const generateGuide = () => {
    if (blocks.length === 0) return;
    setGuide({ steps: generateBuildSteps(blocks), index: 0 });
    setPanelOpen(true);
    replace((prev) => ({ ...prev, selectedId: null }));
  };

  const placeBlock = useCallback(
    (position: GridPosition) => {
      commit((prev) => ({
        ...prev,
        selectedId: null,
        blocks: [
          ...prev.blocks,
          {
            id: createBlockId(),
            position,
            color: activeColor,
            type: activeType,
            rotation: isRotatable(activeType, customSpec) ? activeRotation : 0,
            custom: activeType === "custom" ? { ...customSpec } : undefined,
          },
        ],
      }));
    },
    [activeColor, activeType, activeRotation, customSpec, commit],
  );

  const addBlockAtCenter = () => {
    placeBlock(computePlacement(buildHeightMap(blocks), activeType, activeRotation, gridSize, 0, 0, customSpec));
  };

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    commit((prev) => ({
      ...prev,
      selectedId: null,
      blocks: prev.blocks.filter((block) => block.id !== prev.selectedId),
    }));
  }, [selectedId, commit]);

  const clearAll = () => {
    if (blocks.length === 0) return;
    setConfirmReset(true);
  };

  const confirmClear = () => {
    setConfirmReset(false);
    commit((prev) => ({ ...prev, selectedId: null, blocks: [] }));
  };

  const changeColor = (color: BrickColor) => {
    setActiveColor(color);
    if (!selectedId) return;
    commit((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === prev.selectedId ? { ...block, color } : block)),
    }));
  };

  const changeGridSize = (size: number) => {
    const next = normalizeGridSize(size);
    if (next === gridSize || !blocksFitGrid(blocks, next)) return;
    commit((prev) => ({ ...prev, gridSize: next }));
  };

  const changeMode = (next: BuilderMode) => {
    setMode(next);
    if (next === "build") replace((prev) => ({ ...prev, selectedId: null }));
  };

  const selectBlock = useCallback(
    (id: string | null) => {
      replace((prev) => ({ ...prev, selectedId: id }));
    },
    [replace],
  );

  const rotate = useCallback(() => setActiveRotation((r) => (r === 0 ? 90 : 0)), []);

  useEffect(() => {
    let ctrlAlone = false;

    const onKeyDown = (event: KeyboardEvent) => {
      if (confirmReset) {
        if (event.key === "Escape") setConfirmReset(false);
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      if (inGuide) {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          goNextStep();
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          goPrevStep();
        } else if (event.key === "Escape") {
          exitGuide();
        } else if (event.key.toLowerCase() === "p") {
          setPanelOpen((open) => !open);
        }
        return;
      }

      if (event.key === "Control") {
        if (!event.repeat) ctrlAlone = true;
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        ctrlAlone = false;
        const key = event.key.toLowerCase();
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
        } else if (key === "y") {
          event.preventDefault();
          redo();
        }
        return;
      }

      ctrlAlone = false;
      switch (event.key.toLowerCase()) {
        case "delete":
        case "backspace":
          deleteSelected();
          break;
        case "escape":
          selectBlock(null);
          break;
        case "b":
          setMode("build");
          selectBlock(null);
          break;
        case "v":
          setMode("select");
          break;
        case "p":
          setPanelOpen((open) => !open);
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Control" && ctrlAlone) rotate();
      ctrlAlone = false;
    };

    const cancelCtrl = () => {
      ctrlAlone = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", cancelCtrl);
    window.addEventListener("wheel", cancelCtrl);
    window.addEventListener("blur", cancelCtrl);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerdown", cancelCtrl);
      window.removeEventListener("wheel", cancelCtrl);
      window.removeEventListener("blur", cancelCtrl);
    };
  }, [confirmReset, deleteSelected, rotate, undo, redo, selectBlock, inGuide, goNextStep, goPrevStep, exitGuide]);

  return (
    <main className="relative h-dvh overflow-hidden bg-zinc-950">
      <section className="absolute inset-0">
        <BrickCanvas
          blocks={visibleBlocks}
          selectedId={inGuide ? null : selectedId}
          mode={mode}
          gridSize={gridSize}
          activeColor={activeColor}
          activeType={activeType}
          activeRotation={activeRotation}
          customSpec={customSpec}
          readOnly={inGuide}
          realistic={inGuide}
          highlightIds={highlightIds}
          onPlace={placeBlock}
          onSelect={selectBlock}
        />

        {guide && (
          <InstructionGuide
            steps={guide.steps}
            index={guide.index}
            onPrev={goPrevStep}
            onNext={goNextStep}
            onExit={exitGuide}
          />
        )}

        <div className="pointer-events-none absolute top-3 left-3 flex max-w-[calc(100%-8.5rem)] flex-col items-start gap-2 text-xs text-zinc-950 sm:top-4 sm:left-4 sm:max-w-md">
          <Link href="/" className="book-btn book-btn-ghost pointer-events-auto">
            ← Portal
          </Link>
          {shared && (
            <div className="max-w-full bg-[#ffd000] px-3 py-2 font-black text-zinc-950 shadow-[2px_2px_0_rgb(0_0_0_/_0.25)]">
              Set {shared.title} · {shared.author}. Susunannya sudah di papan.
            </div>
          )}
          <div className="max-w-full bg-white px-3 py-2 leading-snug font-bold shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]">
            {inGuide ? (
              <>
                <span className="sm:hidden">Instruksi · panah pindah langkah</span>
                <span className="hidden sm:inline">Mode Instruksi: ← → pindah langkah · Esc kembali ke desain</span>
              </>
            ) : mode === "build" ? (
              <>
                <span className="sm:hidden">Bangun · ketuk papan · Ctrl putar</span>
                <span className="hidden sm:inline">Mode Bangun: klik landasan atau blok untuk memasang · Ctrl: putar</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">Pilih · ketuk blok · Delete hapus</span>
                <span className="hidden sm:inline">Mode Pilih: klik blok untuk memilih, Delete untuk menghapus</span>
              </>
            )}
          </div>
          <div className="flex max-w-full flex-wrap items-center gap-2 bg-white px-3 py-2 font-black shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]">
            <span
              className="inline-block size-3 ring-1 ring-black/25"
              style={{ backgroundColor: BRICK_COLORS[activeColor].hex }}
            />
            {getActiveSpec(activeType, customSpec).label}
            {isRotatable(activeType, customSpec) && <span>· {activeRotation}°</span>}
            <span>
              · {blocks.length} blok · {gridSize}×{gridSize}
            </span>
          </div>
        </div>

        {!panelOpen && (
          <button type="button" onClick={() => setPanelOpen(true)} className="book-btn book-btn-next absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="sm:hidden">Panel</span>
            <span className="hidden sm:inline">Buka Panel (P)</span>
          </button>
        )}
      </section>

      <div
        className={`absolute z-30 w-full overflow-hidden shadow-2xl transition-transform duration-300 inset-x-0 bottom-0 h-[min(72dvh,34rem)] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[min(360px,90vw)] ${
          panelOpen ? "translate-x-0 translate-y-0" : "translate-y-full sm:translate-x-full sm:translate-y-0"
        }`}
      >
        <div className="h-full w-full">
          <Sidebar
            blocks={blocks}
            selectedBlock={selectedBlock}
            mode={mode}
            gridSize={gridSize}
            activeColor={activeColor}
            activeType={activeType}
            customSpec={customSpec}
            activeRotation={activeRotation}
            canUndo={canUndo}
            canRedo={canRedo}
            canUseGridSize={(size) => blocksFitGrid(blocks, size)}
            onModeChange={changeMode}
            onGridSizeChange={changeGridSize}
            onColorChange={changeColor}
            onTypeChange={setActiveType}
            onCustomSpecChange={setCustomSpec}
            onRotate={rotate}
            onAddBlock={addBlockAtCenter}
            onDeleteSelected={deleteSelected}
            onClearAll={clearAll}
            onUndo={undo}
            onRedo={redo}
            onClose={() => setPanelOpen(false)}
            onGenerate={generateGuide}
            guide={
              guide
                ? {
                    steps: guide.steps,
                    index: guide.index,
                    onPrev: goPrevStep,
                    onNext: goNextStep,
                    onJump: (index) => setGuide((current) => (current ? { ...current, index } : current)),
                    onExit: exitGuide,
                  }
                : null
            }
          />
        </div>
      </div>

      {confirmReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1612]/55 p-4"
          onClick={() => setConfirmReset(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="w-full max-w-sm bg-[#f3ead6] shadow-[6px_6px_0_#1c1612]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-1.5 bg-[linear-gradient(90deg,#d01012_0%_20%,#f2cd37_20%_40%,#0055bf_40%_60%,#237841_60%_80%,#fe8a18_80%_100%)]" />
            <div className="flex items-start gap-3 px-4 py-4">
              <span className="grid size-12 shrink-0 place-items-center bg-[#ffd000] text-xl font-black text-zinc-950">!</span>
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-zinc-950/55 uppercase">Reset</p>
                <h2 id="reset-title" className="text-lg font-black tracking-tight text-zinc-950">
                  Hapus semua blok?
                </h2>
                <p className="mt-1 text-sm font-semibold leading-snug text-zinc-800">
                  Seluruh susunan di papan ini akan dikosongkan.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              <button type="button" autoFocus onClick={() => setConfirmReset(false)} className="book-btn book-btn-ghost">
                Batal
              </button>
              <button type="button" onClick={confirmClear} className="book-btn book-btn-next">
                Hapus semua
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
