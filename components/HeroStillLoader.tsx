"use client";

import dynamic from "next/dynamic";

const HeroStill = dynamic(() => import("@/components/HeroStill"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#c5d0da]" />,
});

export default function HeroStillLoader() {
  return <HeroStill />;
}
