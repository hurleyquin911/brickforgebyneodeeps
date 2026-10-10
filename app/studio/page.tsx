import type { Metadata } from "next";
import StudioLoader from "@/components/StudioLoader";

export const metadata: Metadata = {
  title: "Studio",
};

export default function StudioPage() {
  return <StudioLoader />;
}
