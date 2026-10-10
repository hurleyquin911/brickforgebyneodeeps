"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const StudioBuilder = dynamic(() => import("@/components/StudioBuilder"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-[#f4efe4] text-zinc-700">
      <div className="h-8 w-24 rounded-md bg-[#d01012] shadow-[3px_4px_0_rgb(0_0_0_/_.2)]" />
      <p className="text-sm font-semibold">Menyiapkan meja kerja…</p>
    </div>
  ),
});

export default function StudioLoader() {
  return (
    <Suspense fallback={null}>
      <StudioBuilder />
    </Suspense>
  );
}
