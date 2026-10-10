"use client";

import { useCallback, useState } from "react";
import type { GridPosition, BrickData } from "@/types/bricks";

const MAX_HISTORY = 80;

export interface SceneSnapshot {
  blocks: BrickData[];
  selectedId: string | null;
  gridSize: number;
}

interface HistoryState {
  past: SceneSnapshot[];
  present: SceneSnapshot;
  future: SceneSnapshot[];
}

function cloneScene(scene: SceneSnapshot): SceneSnapshot {
  return {
    selectedId: scene.selectedId,
    gridSize: scene.gridSize,
    blocks: scene.blocks.map((block) => ({
      ...block,
      position: [...block.position] as GridPosition,
      custom: block.custom ? { ...block.custom } : undefined,
    })),
  };
}

export function useSceneHistory(initial: SceneSnapshot) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: cloneScene(initial),
    future: [],
  });

  const commit = useCallback((next: SceneSnapshot | ((prev: SceneSnapshot) => SceneSnapshot)) => {
    setHistory((current) => {
      const resolved = typeof next === "function" ? next(current.present) : next;
      return {
        past: [...current.past, cloneScene(current.present)].slice(-MAX_HISTORY),
        present: cloneScene(resolved),
        future: [],
      };
    });
  }, []);

  const replace = useCallback((next: SceneSnapshot | ((prev: SceneSnapshot) => SceneSnapshot)) => {
    setHistory((current) => ({
      ...current,
      present: cloneScene(typeof next === "function" ? next(current.present) : next),
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [...current.future, cloneScene(current.present)],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;
      const upcoming = current.future[current.future.length - 1];
      return {
        past: [...current.past, cloneScene(current.present)],
        present: upcoming,
        future: current.future.slice(0, -1),
      };
    });
  }, []);

  return {
    scene: history.present,
    commit,
    replace,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
