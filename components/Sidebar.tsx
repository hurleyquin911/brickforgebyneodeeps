"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  BLOCK_CATEGORIES,
  BLOCK_CATEGORY_KEYS,
  BLOCK_TYPES,
  BLOCK_TYPE_KEYS,
  CUSTOM_HEIGHT_MAX,
  CUSTOM_SHAPE_PRESETS,
  CUSTOM_WIDTH_MAX,
  GRID_SIZE_OPTIONS,
  BRICK_COLORS,
  BRICK_COLOR_KEYS,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
  getBlockSpec,
  getStudCount,
  isRotatable,
  normalizeCustomSpec,
  normalizeGridSize,
  specFingerprint,
} from "@/lib/bricks";
import type { StudLayout } from "@/types/bricks";
import { groupStepsByLayer, type BuildPart, type BuildStep } from "@/lib/instructions";
import type {
  BlockCategory,
  BlockType,
  BlockTypeSpec,
  BuilderMode,
  BrickData,
  BrickColor,
  Rotation,
} from "@/types/bricks";

interface SidebarProps {
  blocks: BrickData[];
  selectedBlock: BrickData | null;
  mode: BuilderMode;
  gridSize: number;
  activeColor: BrickColor;
  activeType: BlockType;
  customSpec: BlockTypeSpec;
  activeRotation: Rotation;
  canUndo: boolean;
  canRedo: boolean;
  canUseGridSize: (size: number) => boolean;
  onModeChange: (mode: BuilderMode) => void;
  onGridSizeChange: (size: number) => void;
  onColorChange: (color: BrickColor) => void;
  onTypeChange: (type: BlockType) => void;
  onCustomSpecChange: (spec: BlockTypeSpec) => void;
  onRotate: () => void;
  onAddBlock: () => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onGenerate: () => void;
  guide: {
    steps: BuildStep[];
    index: number;
    onPrev: () => void;
    onNext: () => void;
    onJump: (index: number) => void;
    onExit: () => void;
  } | null;
}

interface BomRow {
  key: string;
  label: string;
  total: number;
  studs: number;
  byColor: { color: BrickColor; count: number }[];
}

function useBillOfMaterials(blocks: BrickData[]) {
  return useMemo(() => {
    const groups = new Map<string, { spec: BlockTypeSpec; byColor: Map<BrickColor, number> }>();
    for (const block of blocks) {
      const spec = getBlockSpec(block);
      const key = specFingerprint(spec);
      const group = groups.get(key) ?? { spec, byColor: new Map<BrickColor, number>() };
      group.byColor.set(block.color, (group.byColor.get(block.color) ?? 0) + 1);
      groups.set(key, group);
    }

    const rows: BomRow[] = [...groups.entries()].map(([key, group]) => {
      const byColor = BRICK_COLOR_KEYS.filter((color) => group.byColor.has(color)).map((color) => ({
        color,
        count: group.byColor.get(color)!,
      }));
      const total = byColor.reduce((sum, row) => sum + row.count, 0);
      return { key, label: group.spec.label, total, studs: total * getStudCount(group.spec), byColor };
    });

    const colorTotals = BRICK_COLOR_KEYS.map((color) => ({
      color,
      count: blocks.filter((block) => block.color === color).length,
    })).filter((row) => row.count > 0);

    return {
      rows,
      colorTotals,
      totalBlocks: blocks.length,
      totalStuds: rows.reduce((sum, row) => sum + row.studs, 0),
    };
  }, [blocks]);
}

export default function Sidebar({
  blocks,
  selectedBlock,
  mode,
  gridSize,
  activeColor,
  activeType,
  customSpec,
  activeRotation,
  canUndo,
  canRedo,
  canUseGridSize,
  onModeChange,
  onGridSizeChange,
  onColorChange,
  onTypeChange,
  onCustomSpecChange,
  onRotate,
  onAddBlock,
  onDeleteSelected,
  onClearAll,
  onUndo,
  onRedo,
  onClose,
  onGenerate,
  guide,
}: SidebarProps) {
  const bom = useBillOfMaterials(blocks);
  const [category, setCategory] = useState<BlockCategory>(
    activeType === "custom" ? "custom" : BLOCK_TYPES[activeType].category,
  );
  const [gridEdit, setGridEdit] = useState<{ source: number; value: string } | null>(null);
  const typesInCategory = BLOCK_TYPE_KEYS.filter((type) => BLOCK_TYPES[type].category === category);
  const rotatable = isRotatable(activeType, customSpec);
  const gridDraft = gridEdit?.source === gridSize ? gridEdit.value : String(gridSize);
  const parsedGrid = Number(gridDraft);
  const nextGridSize = Number.isFinite(parsedGrid) ? normalizeGridSize(parsedGrid) : null;
  const gridFits = nextGridSize !== null && canUseGridSize(nextGridSize);
  const gridUnchanged = nextGridSize === gridSize;

  const applyCustomGrid = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (nextGridSize === null || !gridFits) return;
    onGridSizeChange(nextGridSize);
    setGridEdit(null);
  };

  if (guide) {
    const current = guide.steps[guide.index];
    const grouped = groupStepsByLayer(guide.steps);
    const isLast = guide.index >= guide.steps.length - 1;
    return (
      <aside className="book-panel flex h-full w-full flex-col overflow-hidden border-l border-black/15">
        <div className="h-1.5 w-full shrink-0 bg-[linear-gradient(90deg,#d01012_0%_20%,#f2cd37_20%_40%,#0055bf_40%_60%,#237841_60%_80%,#fe8a18_80%_100%)]" />
        <header className="flex shrink-0 items-start justify-between gap-3 bg-[#ffd000] px-4 py-3 [background-image:radial-gradient(circle_at_12px_14px,rgb(255_255_255_/_0.38)_5px,transparent_6px)] [background-size:24px_28px]">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] text-zinc-950/60 uppercase">Buku rakit</p>
            <h1 className="text-lg font-black tracking-tight text-zinc-950">
              {current ? `Halaman ${current.number}` : "Instruksi"}
            </h1>
            <p className="text-[11px] font-semibold text-zinc-800/75">
              {guide.index + 1} dari {guide.steps.length}
              {isLast ? " · selesai" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Sembunyikan panel (P)"
            aria-label="Sembunyikan panel"
            className="grid size-8 shrink-0 place-items-center rounded-sm bg-zinc-950 text-[#ffd000]"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
              <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>
        </header>

        <div className="shrink-0 space-y-2 px-3 pt-2">
          <button
            type="button"
            onClick={guide.onExit}
            className="w-fit text-left text-xs font-bold text-zinc-700 underline decoration-dotted underline-offset-4 hover:text-zinc-950"
          >
            ← Kembali ke meja
          </button>

          {current && (
            <div className="flex items-center gap-2 bg-white px-2 py-2 shadow-[2px_3px_0_rgb(0_0_0_/_.12)] ring-1 ring-black/10">
              <div className="grid size-10 shrink-0 place-items-center bg-[#ffd000] text-lg font-black tabular-nums text-zinc-950">
                {current.number}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-black text-zinc-950">{current.title}</p>
                <p className="truncate text-[10px] text-zinc-500">{current.description}</p>
              </div>
              {current.parts[0] && <PartCallout part={current.parts[0]} />}
            </div>
          )}
        </div>

        <section className="studio-scroll min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <h2 className="mb-2 text-[10px] font-black tracking-[0.18em] text-zinc-500 uppercase">Daftar isi</h2>
          <div className="space-y-3">
            {grouped.map((group) => (
              <div key={group.layer}>
                <p className="mb-1 border-b border-zinc-400/40 pb-0.5 text-[11px] font-bold text-zinc-600">
                  {group.heading}
                </p>
                <ol className="space-y-0.5">
                  {group.steps.map((step) => {
                    const stepIndex = guide.steps.indexOf(step);
                    const active = stepIndex === guide.index;
                    const done = stepIndex < guide.index;
                    return (
                      <li key={step.number}>
                        <button
                          type="button"
                          onClick={() => guide.onJump(stepIndex)}
                          className={`flex w-full items-center gap-2 px-1 py-1.5 text-left ${
                            active ? "bg-[#ffd000]" : "hover:bg-white/70"
                          }`}
                        >
                          <span
                            className={`grid size-6 shrink-0 place-items-center text-[11px] font-black tabular-nums ${
                              active
                                ? "bg-zinc-950 text-[#ffd000]"
                                : done
                                  ? "bg-white text-zinc-400 ring-1 ring-zinc-300"
                                  : "bg-white text-zinc-800 ring-1 ring-zinc-400"
                            }`}
                          >
                            {step.number}
                          </span>
                          {step.parts[0] ? (
                            <MiniBrick color={step.parts[0].color} />
                          ) : (
                            <span className="inline-block h-4 w-6 rounded-[3px] bg-zinc-300" />
                          )}
                          <span className={`min-w-0 flex-1 truncate text-[13px] ${active ? "font-black" : "font-semibold text-zinc-800"}`}>
                            {step.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-black/10 bg-[#efe6cf] px-4 py-3">
          <button
            type="button"
            onClick={guide.onPrev}
            disabled={guide.index <= 0}
            className="book-btn book-btn-ghost"
          >
            ← Mundur
          </button>
          <button type="button" onClick={guide.onNext} disabled={isLast} className="book-btn book-btn-next">
            Lanjut →
          </button>
        </div>
      </aside>
    );
  }

  return (
    <PanelShell
      kicker="Studio"
      title="BrickForge"
      subtitle="by NeoDeeps · rakit, susun, lalu generate instruksi pemasangan."
      onClose={onClose}
      meta={`${blocks.length} blok · ${gridSize}×${gridSize}`}
    >
      <Section title="Mode">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "build", label: "Bangun", hint: "B" },
              { value: "select", label: "Pilih", hint: "V" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              className={`px-3 py-2 text-sm font-black ${
                mode === option.value
                  ? "bg-zinc-950 text-[#ffd000] shadow-[2px_2px_0_rgb(0_0_0_/_0.25)]"
                  : "bg-white text-zinc-900 shadow-[2px_2px_0_rgb(0_0_0_/_0.15)]"
              }`}
            >
              {option.label}
              <span className="ml-1.5 text-[10px] opacity-50">{option.hint}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Komponen" hint={BLOCK_CATEGORIES[category].description}>
        <div className="flex flex-wrap gap-1">
          {BLOCK_CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setCategory(key);
                if (key === "custom") {
                  onTypeChange("custom");
                  return;
                }
                if (activeType === "custom") {
                  const first = BLOCK_TYPE_KEYS.find((type) => BLOCK_TYPES[type].category === key);
                  if (first) onTypeChange(first);
                }
              }}
              className={`px-2.5 py-1 text-[11px] font-black tracking-wide ${
                category === key
                  ? "bg-[#ffd000] text-zinc-950 shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]"
                  : "bg-white text-zinc-800 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]"
              }`}
            >
              {BLOCK_CATEGORIES[key].label}
            </button>
          ))}
        </div>
        {category === "custom" ? (
          <CustomPartEditor spec={customSpec} color={activeColor} onChange={onCustomSpecChange} />
        ) : (
          <div className="mt-3 grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto pr-0.5">
            {typesInCategory.map((type) => {
              const spec = BLOCK_TYPES[type];
              const active = activeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  title={spec.label}
                  onClick={() => onTypeChange(type)}
                  className={`flex flex-col items-center gap-1.5 px-1 py-2.5 text-[11px] font-black ${
                    active
                      ? "bg-[#ffd000] text-zinc-950 shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]"
                      : "bg-white text-zinc-800 shadow-[2px_2px_0_rgb(0_0_0_/_0.1)]"
                  }`}
                >
                  <span style={{ color: BRICK_COLORS[activeColor].hex }}>
                    <FootprintIcon spec={spec} />
                  </span>
                  {spec.pickerLabel ?? `${spec.width}×${spec.depth}`}
                </button>
              );
            })}
          </div>
        )}
        <button type="button" onClick={onRotate} disabled={!rotatable} className="book-btn book-btn-ghost mt-2 w-full text-xs disabled:opacity-35">
          {rotatable ? `Putar 90° · Ctrl · sekarang ${activeRotation}°` : "Simetris — tidak perlu diputar"}
        </button>
      </Section>

      <Section title="Warna" hint={`Dipilih: ${BRICK_COLORS[activeColor].label}${selectedBlock ? " · diterapkan ke blok terpilih" : ""}`}>
        <div className="grid grid-cols-8 gap-1.5">
          {BRICK_COLOR_KEYS.map((color) => (
            <button
              key={color}
              type="button"
              title={BRICK_COLORS[color].label}
              aria-label={BRICK_COLORS[color].label}
              onClick={() => onColorChange(color)}
              className={`aspect-square rounded-full transition ${
                activeColor === color
                  ? "scale-110 ring-2 ring-zinc-950 ring-offset-2 ring-offset-[#f3ead6]"
                  : "ring-1 ring-black/20 hover:scale-105"
              }`}
              style={{ backgroundColor: BRICK_COLORS[color].hex }}
            />
          ))}
        </div>
      </Section>

      <Section title="Aksi">
        <div className="space-y-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={blocks.length === 0}
            className="book-btn book-btn-next w-full disabled:opacity-35"
          >
            Generate Instruksi
          </button>
          <button type="button" onClick={onAddBlock} className="book-btn book-btn-ghost w-full">
            + Tambah blok
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onUndo} disabled={!canUndo} className="book-btn book-btn-ghost disabled:opacity-35">
              Undo
            </button>
            <button type="button" onClick={onRedo} disabled={!canRedo} className="book-btn book-btn-ghost disabled:opacity-35">
              Redo
            </button>
            <button type="button" onClick={onDeleteSelected} disabled={!selectedBlock} className="book-btn book-btn-ghost text-rose-700 disabled:opacity-35">
              Hapus
            </button>
            <button type="button" onClick={onClearAll} disabled={blocks.length === 0} className="book-btn book-btn-ghost disabled:opacity-35">
              Reset
            </button>
          </div>
        </div>
        {selectedBlock && (
          <div className="mt-3 flex items-center gap-2 bg-white px-3 py-2 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]">
            <ColorDot color={selectedBlock.color} />
            <p className="text-xs font-bold text-zinc-800">
              {getBlockSpec(selectedBlock).label} · grid ({selectedBlock.position.join(", ")})
            </p>
          </div>
        )}
      </Section>

      <Section title="Landasan" hint={`Custom genap ${MIN_GRID_SIZE}–${MAX_GRID_SIZE}`}>
        <div className="grid grid-cols-4 gap-1.5">
          {GRID_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onGridSizeChange(size)}
              disabled={!canUseGridSize(size)}
              title={canUseGridSize(size) ? undefined : "Ada blok di luar area ukuran ini"}
              className={`py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40 ${
                gridSize === size
                  ? "bg-zinc-950 text-[#ffd000] shadow-[2px_2px_0_rgb(0_0_0_/_0.25)]"
                  : "bg-white text-zinc-900 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <form className="mt-2 flex gap-2" onSubmit={applyCustomGrid}>
          <label className="sr-only" htmlFor="custom-grid-size">
            Ukuran landasan custom
          </label>
          <input
            id="custom-grid-size"
            type="number"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            step={2}
            value={gridDraft}
            onChange={(event) => setGridEdit({ source: gridSize, value: event.target.value })}
            className="min-w-0 flex-1 border-0 bg-white px-3 py-2 text-sm font-bold text-zinc-950 ring-1 ring-black/15 outline-none"
          />
          <button
            type="submit"
            disabled={nextGridSize === null || gridUnchanged || !gridFits}
            className="book-btn book-btn-next px-3 disabled:opacity-35"
          >
            OK
          </button>
        </form>
        {nextGridSize !== null && !gridFits && (
          <p className="mt-2 text-xs font-bold text-rose-700">
            Ada blok di luar {nextGridSize}×{nextGridSize}. Perbesar landasan dulu.
          </p>
        )}
        {nextGridSize !== null && gridFits && nextGridSize !== parsedGrid && Number.isFinite(parsedGrid) && (
          <p className="mt-2 text-xs text-zinc-500">
            Akan dibulatkan ke {nextGridSize}×{nextGridSize}.
          </p>
        )}
      </Section>

      <Section title="Bill of Materials">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Blok" value={bom.totalBlocks} />
          <Stat label="Studs" value={bom.totalStuds} />
        </div>
        {bom.rows.length === 0 ? (
          <p className="mt-3 border border-dashed border-black/15 bg-white/50 px-4 py-6 text-center text-sm text-zinc-600">
            Belum ada blok. Klik landasan atau Tambah blok.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {bom.rows.map((row) => (
              <li key={row.key} className="bg-white p-3 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]">
                <div className="flex items-center justify-between text-sm font-black">
                  <span>{row.label}</span>
                  <span className="tabular-nums">{row.total}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {row.byColor.map(({ color, count }) => (
                    <li key={color} className="flex items-center justify-between text-xs font-semibold text-zinc-600">
                      <span className="flex items-center gap-2">
                        <ColorDot color={color} />
                        {BRICK_COLORS[color].label}
                      </span>
                      <span className="tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {bom.colorTotals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bom.colorTotals.map(({ color, count }) => (
              <span key={color} className="chip">
                <ColorDot color={color} />
                {BRICK_COLORS[color].label} {count}
              </span>
            ))}
          </div>
        )}
      </Section>
    </PanelShell>
  );
}

function PanelShell({
  kicker,
  title,
  subtitle,
  meta,
  onClose,
  children,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  meta?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <aside className="book-panel studio-scroll flex h-full w-full flex-col overflow-y-auto border-l border-black/15 text-zinc-950">
      <div className="h-1.5 w-full shrink-0 bg-[linear-gradient(90deg,#d01012_0%_20%,#f2cd37_20%_40%,#0055bf_40%_60%,#237841_60%_80%,#fe8a18_80%_100%)]" />
      <header className="flex items-start justify-between gap-3 bg-[#ffd000] px-4 py-3 [background-image:radial-gradient(circle_at_12px_14px,rgb(255_255_255_/_0.38)_5px,transparent_6px)] [background-size:24px_28px]">
        <div>
          <p className="text-[10px] font-black tracking-[0.22em] text-zinc-950/60 uppercase">{kicker}</p>
          <h1 className="text-lg font-black tracking-tight text-zinc-950">{title}</h1>
          <p className="text-[11px] font-semibold text-zinc-800/75">{subtitle}</p>
          {meta && <p className="text-[11px] font-semibold text-zinc-800/70">{meta}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Sembunyikan panel (P)"
          aria-label="Sembunyikan panel"
          className="grid size-8 shrink-0 place-items-center bg-zinc-950 text-[#ffd000]"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
            <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
      </header>
      <div className="flex flex-1 flex-col gap-5 px-4 py-4">{children}</div>
    </aside>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[10px] font-black tracking-[0.18em] text-zinc-500 uppercase">{title}</h2>
      {hint && <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">{hint}</p>}
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white px-3 py-3 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]">
      <div className="text-2xl font-black tracking-tight tabular-nums text-zinc-950">{value}</div>
      <div className="mt-0.5 text-[11px] text-zinc-500">{label}</div>
    </div>
  );
}

function ColorDot({ color }: { color: BrickColor }) {
  return (
    <span
      className="inline-block size-2.5 rounded-full ring-1 ring-black/20"
      style={{ backgroundColor: BRICK_COLORS[color].hex }}
    />
  );
}

function MiniBrick({ color }: { color: BrickColor }) {
  const hex = BRICK_COLORS[color].hex;
  return (
    <span className="relative inline-block h-4 w-6 shrink-0 rounded-[3px]" style={{ backgroundColor: hex }} aria-hidden>
      <span className="absolute top-0.5 left-1 size-1.5 rounded-full bg-white/35" />
      <span className="absolute top-0.5 right-1 size-1.5 rounded-full bg-white/35" />
    </span>
  );
}

function PartCallout({ part }: { part: BuildPart }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#f6f1e4] px-1.5 py-1 ring-1 ring-black/10">
      <span className="grid size-5 place-items-center rounded-full bg-zinc-950 text-[10px] font-black text-white">
        {part.count}
      </span>
      <MiniBrick color={part.color} />
      <span className="text-[11px] font-bold">{part.label}</span>
    </span>
  );
}

function CustomPartEditor({
  spec,
  color,
  onChange,
}: {
  spec: BlockTypeSpec;
  color: BrickColor;
  onChange: (spec: BlockTypeSpec) => void;
}) {
  const square = spec.shape === "round" || spec.shape === "cone" || spec.shape === "dish";
  const update = (patch: Partial<BlockTypeSpec>) =>
    onChange(normalizeCustomSpec({ ...spec, ...patch, shape: patch.shape ?? spec.shape }));

  const presetActive = (id: string, shape: BlockTypeSpec["shape"]) => {
    if (id === "brick") return spec.shape === "box" && spec.studs && spec.height !== 1;
    if (id === "plate") return spec.shape === "box" && spec.studs && spec.height === 1;
    if (id === "tile") return spec.shape === "box" && !spec.studs;
    return spec.shape === shape;
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-3 bg-white px-3 py-2 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]">
        <span style={{ color: BRICK_COLORS[color].hex }}>
          <FootprintIcon spec={spec} />
        </span>
        <p className="text-xs font-black text-zinc-900">{spec.label}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {CUSTOM_SHAPE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() =>
              update({
                shape: preset.shape,
                height: preset.height,
                studs: preset.studs,
                studLayout: preset.studLayout,
              })
            }
            className={`px-2.5 py-1 text-[11px] font-black ${
              presetActive(preset.id, preset.shape)
                ? "bg-[#ffd000] text-zinc-950 shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]"
                : "bg-white text-zinc-800 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className={`grid gap-2 ${square ? "grid-cols-2" : "grid-cols-3"}`}>
        <DimStepper
          label={square ? "Ukuran" : "Lebar"}
          value={spec.width}
          min={1}
          max={spec.shape === "arch" ? 4 : CUSTOM_WIDTH_MAX}
          onChange={(width) => update({ width, depth: square ? width : spec.depth })}
        />
        {!square && (
          <DimStepper
            label="Panjang"
            value={spec.depth}
            min={spec.shape === "arch" ? 3 : 1}
            max={CUSTOM_WIDTH_MAX}
            onChange={(depth) => update({ depth })}
          />
        )}
        <DimStepper
          label="Tinggi (p)"
          value={spec.height}
          min={1}
          max={CUSTOM_HEIGHT_MAX}
          onChange={(height) => update({ height })}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {([1, 2, 3, 6] as const).map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => update({ height: h })}
            className={`px-2 py-1 text-[11px] font-black ${
              spec.height === h
                ? "bg-zinc-950 text-[#ffd000] shadow-[2px_2px_0_rgb(0_0_0_/_0.25)]"
                : "bg-white text-zinc-800 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]"
            }`}
          >
            {h === 1 ? "Plate" : h === 3 ? "Brick" : h === 6 ? "2× brick" : `${h}p`}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between bg-white px-3 py-2 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]">
        <span className="text-xs font-black text-zinc-800">Studs</span>
        <button
          type="button"
          onClick={() => update({ studs: !spec.studs })}
          className={`px-2.5 py-1 text-[11px] font-black ${
            spec.studs ? "bg-zinc-950 text-[#ffd000]" : "bg-[#f6f1e4] text-zinc-700"
          }`}
        >
          {spec.studs ? "Ya" : "Tidak"}
        </button>
      </div>
      {spec.studs && (
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["full", "Penuh"],
              ["back", "Belakang"],
              ["center", "Tengah"],
            ] as const
          ).map(([layout, label]) => (
            <button
              key={layout}
              type="button"
              onClick={() => update({ studLayout: layout as StudLayout })}
              className={`px-2.5 py-1 text-[11px] font-black ${
                (spec.studLayout ?? "full") === layout
                  ? "bg-[#ffd000] text-zinc-950 shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]"
                  : "bg-white text-zinc-800 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DimStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">{label}</span>
      <div className="mt-1 flex items-center gap-1 bg-white p-1 shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid size-7 place-items-center font-black text-zinc-900 hover:bg-[#f6f1e4] disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-6 flex-1 text-center text-sm font-black tabular-nums text-zinc-950">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="grid size-7 place-items-center font-black text-zinc-900 hover:bg-[#f6f1e4] disabled:opacity-30"
        >
          +
        </button>
      </div>
    </label>
  );
}

function FootprintIcon({ spec }: { spec: BlockTypeSpec }) {
  const { width, depth, shape, studs } = spec;
  const cell = 5;
  const w = depth * cell;
  const h = width * cell;
  const round = shape === "round" || shape === "cone" || shape === "dish";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-5 w-auto max-w-full drop-shadow-sm" aria-hidden>
      {round ? (
        <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2 - 0.4} fill="currentColor" opacity={0.9} />
      ) : shape === "slope" ? (
        <polygon points={`${0.4},${h - 0.4} ${w - 0.4},${h - 0.4} ${w - 0.4},0.4`} fill="currentColor" opacity={0.9} />
      ) : shape === "slope-inv" ? (
        <polygon points={`${0.4},0.4 ${w - 0.4},0.4 ${w - 0.4},${h - 0.4}`} fill="currentColor" opacity={0.9} />
      ) : shape === "arch" ? (
        <>
          <rect x={0.4} y={0.4} width={w - 0.8} height={h - 0.8} rx={1.1} fill="currentColor" opacity={0.9} />
          <path
            d={`M ${w * 0.22} ${h - 0.4} A ${w * 0.28} ${h * 0.7} 0 0 1 ${w * 0.78} ${h - 0.4}`}
            fill="#101217"
            opacity={0.55}
          />
        </>
      ) : shape === "grill" ? (
        <>
          <rect x={0.4} y={0.4} width={w - 0.8} height={h - 0.8} rx={1.1} fill="currentColor" opacity={0.9} />
          {[0.28, 0.44, 0.6, 0.76].map((t) => (
            <rect key={t} x={w * t - 0.45} y={1} width={0.9} height={h - 2} fill="#fff" opacity={0.35} />
          ))}
        </>
      ) : (
        <rect x={0.4} y={0.4} width={w - 0.8} height={h - 0.8} rx={1.1} fill="currentColor" opacity={0.9} />
      )}
      {studs
        ? Array.from({ length: width * depth }, (_, i) => (
            <circle
              key={i}
              cx={(i % depth) * cell + cell / 2}
              cy={Math.floor(i / depth) * cell + cell / 2}
              r={1.35}
              fill="#fff"
              opacity={0.55}
            />
          ))
        : null}
    </svg>
  );
}
