import type { Metadata } from "next";
import PortalChrome from "@/components/PortalChrome";
import ShowcaseShelf from "@/components/ShowcaseShelf";

export const metadata: Metadata = {
  title: "Galeri",
};

export default function ShowcasePage() {
  return (
    <PortalChrome>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        <p className="font-scribble text-2xl text-[#9a3412] sm:text-3xl">dari meja orang lain</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">Galeri</h1>
        <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-[#1c1612]/70">
          Set yang dibagikan, dalam bentuk bloknya. Putar sudutnya, buka tampilan besar, atau bawa susunannya ke studio.
        </p>
        <div className="mt-8">
          <ShowcaseShelf />
        </div>
      </main>
    </PortalChrome>
  );
}
