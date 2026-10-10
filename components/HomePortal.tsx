import Link from "next/link";
import HeroStillLoader from "@/components/HeroStillLoader";
import ShowcaseShelf from "@/components/ShowcaseShelf";

function PlateMark() {
  return (
    <span
      aria-hidden
      className="block h-11 w-[4.6rem] bg-[#c5d0da] shadow-[inset_0_0_0_3px_#a7b7c5,inset_0_0_0_4px_#7f93a6]"
      style={{
        backgroundImage: "radial-gradient(circle at 7px 7px, #f7fafc 2.6px, #8ea2b3 3.2px, transparent 3.7px)",
        backgroundSize: "13px 13px",
        backgroundPosition: "4px 4px",
      }}
    />
  );
}

function BrickMark() {
  return (
    <span aria-hidden className="relative block h-10 w-16">
      <span className="absolute inset-x-0 bottom-0 h-[22px] rounded-[2px] bg-[linear-gradient(180deg,#ef3d36,#d01012_42%,#8d0b0d)] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.4),0_2px_0_#6e080a]" />
      <span className="absolute inset-x-1.5 bottom-[17px] flex justify-between">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className="size-[9px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff9a94,#d01012_58%,#7c090b)] shadow-[inset_0_-1px_1px_rgb(0_0_0_/_0.35)]"
          />
        ))}
      </span>
    </span>
  );
}

function BookMark() {
  return (
    <span aria-hidden className="relative block h-12 w-10 bg-[#fffaf2] shadow-[3px_3px_0_rgb(20_16_12_/_0.14)] ring-1 ring-black/10">
      <span className="absolute top-1 left-1 grid size-4 place-items-center bg-[#ffd000] text-[9px] leading-none font-black text-[#1c1612]">
        1
      </span>
      <span className="absolute right-1.5 bottom-2 left-1.5 flex flex-col gap-1">
        <span className="h-[2px] bg-[#1c1612]/25" />
        <span className="h-[2px] w-4/5 bg-[#1c1612]/15" />
        <span className="h-[2px] w-3/5 bg-[#1c1612]/15" />
      </span>
    </span>
  );
}

const TRAY = [
  { n: "2", title: "Papan", body: "Landasan stud, ukurannya bisa digeser.", mark: <PlateMark /> },
  { n: "3", title: "Blok", body: "Katalog, atau ukuran yang kamu ukir sendiri.", mark: <BrickMark /> },
  { n: "4", title: "Buku", body: "Halaman langkah, dari bawah ke atas.", mark: <BookMark /> },
];

function House() {
  return (
    <div id="meja" className="relative h-full min-h-[320px] overflow-hidden bg-[#c5d0da] sm:min-h-[420px]">
      <div className="absolute inset-x-0 top-0 bottom-[4.75rem]">
        <HeroStillLoader />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_0_10px_#b7c5d1]" />

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center gap-3 border border-black/10 bg-[#f6f1e4] p-2.5 text-zinc-900 shadow-[4px_6px_0_rgb(0_0_0_/_0.28)]">
          <div className="grid size-12 shrink-0 place-items-center bg-[#ffd000] text-xl font-black tabular-nums shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]">
            1
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-zinc-500">Contoh di papan · berputar</p>
            <p className="truncate text-sm font-black">Rumah jendela</p>
          </div>
          <Link
            href="/studio"
            className="shrink-0 bg-zinc-950 px-4 py-3 text-sm font-black text-[#ffd000] shadow-[2px_2px_0_rgb(0_0_0_/_0.25)]"
          >
            Studio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePortal() {
  return (
    <>
      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-5 sm:gap-5 sm:px-8 sm:py-6 lg:grid-cols-2 lg:items-stretch">
        <section className="flex flex-col bg-[#f6f1e4] p-5 text-zinc-900 sm:p-8">
          <header>
            <div className="flex items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center bg-[#ffd000] text-xl font-black tabular-nums shadow-[2px_2px_0_rgb(0_0_0_/_0.18)]">
                1
              </div>
              <p className="text-[11px] font-medium text-zinc-500">Halaman awal</p>
            </div>
            <h1 className="mt-5 text-4xl leading-none font-black tracking-tight sm:mt-6 sm:text-5xl">Susun di sini.</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600">
              Rakit sendiri di studio, atau pakai set yang orang lain bagi. Buku langkahnya dicetak dari bawah ke atas.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                href="/studio"
                className="bg-zinc-950 px-4 py-3 text-sm font-black text-[#ffd000] shadow-[2px_2px_0_rgb(0_0_0_/_0.25)]"
              >
                Masuk studio
              </Link>
              <Link
                href="/showcase"
                className="bg-white px-4 py-3 text-sm font-black text-zinc-900 shadow-[2px_2px_0_rgb(0_0_0_/_0.15)]"
              >
                Galeri
              </Link>
            </div>
          </header>

          <section className="mt-8">
            <h2 className="text-[11px] font-medium text-zinc-500">Ketentuan</h2>
            <ul className="mt-2">
              {TRAY.map((item) => (
                <li key={item.title} className="flex items-center gap-3 border-t border-black/10 py-3">
                  <span className="grid size-8 shrink-0 place-items-center bg-white text-sm font-black shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]">
                    {item.n}
                  </span>
                  <span className="flex h-12 w-16 shrink-0 items-end">{item.mark}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black">{item.title}</span>
                    <span className="block text-[11px] leading-snug text-zinc-500">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <House />
      </main>

      <section className="border-t border-[#1c1612]/10 bg-[#fffaf2]/70 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-zinc-500">Halaman galeri</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">Dari meja orang lain</h2>
            </div>
            <Link href="/showcase" className="font-sans text-xs font-bold underline decoration-dotted underline-offset-4">
              Semua galeri
            </Link>
          </div>
          <ShowcaseShelf compact />
        </div>
      </section>
    </>
  );
}
