import type { Metadata } from "next";
import Link from "next/link";
import PortalChrome from "@/components/PortalChrome";

export const metadata: Metadata = {
  title: "Tentang",
};

const POINTS = [
  {
    n: "1",
    title: "Papan stud",
    body: "Landasan bisa diperbesar atau diperkecil. Blok menempel di stud, lalu bisa diputar dengan Ctrl.",
  },
  {
    n: "2",
    title: "Katalog blok",
    body: "Brick, plate, tile, slope, bulat, dan lengkung. Ukuran yang tidak ada di katalog bisa diukir sendiri.",
  },
  {
    n: "3",
    title: "Buku langkah",
    body: "Generate instruksi menyusun halaman dari bawah ke atas, supaya rakitan bisa diikuti satu tahap demi tahap.",
  },
  {
    n: "4",
    title: "Galeri",
    body: "Set yang dibagikan bisa diputar, dilihat besar, lalu dibawa utuh ke papan studio.",
  },
];

export default function AboutPage() {
  return (
    <PortalChrome>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
        <p className="text-[11px] font-medium text-zinc-500">Tentang</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">BrickForge</h1>
        <p className="mt-2 font-sans text-sm font-bold text-[#1c1612]/55">by NeoDeeps</p>
        <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[#1c1612]/75">
          BrickForge by NeoDeeps adalah meja rakit tiga dimensi di browser. Kamu menyusun blok di atas papan, memilih warna, lalu menyimpan urutan pasangnya sebagai buku instruksi.
        </p>

        <ul className="mt-8 bg-[#f6f1e4]">
          {POINTS.map((item) => (
            <li key={item.n} className="flex gap-3 border-t border-black/10 px-4 py-4 first:border-t-0 sm:px-5">
              <span className="grid size-10 shrink-0 place-items-center bg-[#ffd000] text-sm font-black shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]">
                {item.n}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black">{item.title}</span>
                <span className="mt-1 block font-sans text-sm leading-relaxed text-[#1c1612]/70">{item.body}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 font-sans text-sm leading-relaxed text-[#1c1612]/70">
          Masuk ke dashboard masih percobaan: nama tersimpan di browser ini, dan kata sandi tidak dicek.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/studio" className="bg-zinc-950 px-4 py-3 text-sm font-black text-[#ffd000] shadow-[2px_2px_0_rgb(0_0_0_/_0.25)]">
            Masuk studio
          </Link>
          <Link href="/showcase" className="bg-white px-4 py-3 text-sm font-black text-zinc-900 shadow-[2px_2px_0_rgb(0_0_0_/_0.15)]">
            Lihat galeri
          </Link>
        </div>
      </main>
    </PortalChrome>
  );
}
