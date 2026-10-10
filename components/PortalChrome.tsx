"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { readUser, type DummyUser } from "@/lib/dummySession";

const STRIPE = ["#d01012", "#ffd000", "#0055bf", "#237841", "#fe8a18"];

const PAGES = [
  { href: "/showcase", label: "Galeri" },
  { href: "/about", label: "Tentang" },
];

export default function PortalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<DummyUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(readUser());
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const accountHref = user ? "/dashboard" : "/login";
  const accountLabel = user ? user.name.split(" ")[0] : "Masuk";

  return (
    <div className="font-display portal-stage flex min-h-dvh flex-col">
      <div className="flex h-2 shrink-0">
        {STRIPE.map((color) => (
          <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />
        ))}
      </div>

      <header className="z-20 border-b border-[#1c1612]/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/Logo.png"
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 object-cover shadow-[3px_3px_0_#1c1612]"
              priority
            />
            <span className="min-w-0 leading-none">
              <span className="block truncate text-base font-extrabold tracking-tight">BrickForge</span>
              <span className="mt-1 block truncate font-sans text-[11px] font-semibold text-[#1c1612]/55">by NeoDeeps</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {PAGES.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(pathname === item.href)}>
                {item.label}
              </Link>
            ))}
            <Link href={accountHref} className={linkClass(pathname === accountHref)}>
              {accountLabel}
            </Link>
            <Link href="/studio" className="ml-1 rounded-[4px] bg-[#1c1612] px-3 py-2 text-xs font-extrabold text-[#ffd000] shadow-[3px_3px_0_rgb(20_16_12_/_0.25)]">
              Studio
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:hidden">
            <Link href="/studio" className="rounded-[4px] bg-[#1c1612] px-3 py-2 text-xs font-extrabold text-[#ffd000] shadow-[2px_2px_0_#1c1612]">
              Studio
            </Link>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="portal-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="bg-white px-3 py-2 text-xs font-black text-[#1c1612] shadow-[2px_2px_0_#1c1612]"
            >
              {menuOpen ? "Tutup" : "Menu"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="portal-menu" className="mx-auto grid w-full max-w-6xl gap-2 px-4 pb-4 sm:hidden">
            {PAGES.map((item) => (
              <Link key={item.href} href={item.href} className={mobileLinkClass(pathname === item.href)}>
                {item.label}
              </Link>
            ))}
            <Link href={accountHref} className={mobileLinkClass(pathname === accountHref)}>
              {accountLabel}
            </Link>
          </nav>
        )}
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="mt-auto border-t border-[#1c1612]/10 bg-[#fffaf2]">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:grid-cols-[minmax(0,1.4fr)_auto] sm:px-8">
          <div>
            <p className="text-sm font-black">BrickForge</p>
            <p className="mt-1 font-sans text-[11px] font-bold text-[#1c1612]/55">by NeoDeeps</p>
            <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-[#1c1612]/70">
              Studio rakit 3D di browser. Susun blok di papan stud, ambil set dari galeri, lalu cetak buku langkah dari bawah ke atas.
            </p>
          </div>
          <nav className="flex flex-wrap content-start gap-x-4 gap-y-2 font-sans text-xs font-bold">
            <Link href="/" className="underline decoration-dotted underline-offset-4">
              Portal
            </Link>
            <Link href="/showcase" className="underline decoration-dotted underline-offset-4">
              Galeri
            </Link>
            <Link href="/about" className="underline decoration-dotted underline-offset-4">
              Tentang
            </Link>
            <Link href="/studio" className="underline decoration-dotted underline-offset-4">
              Studio
            </Link>
            <Link href={accountHref} className="underline decoration-dotted underline-offset-4">
              {accountLabel}
            </Link>
          </nav>
        </div>
        <p className="border-t border-[#1c1612]/10 px-4 py-3 text-center font-sans text-[11px] font-semibold text-[#1c1612]/45 sm:px-8">
          BrickForge by NeoDeeps
        </p>
      </footer>
    </div>
  );
}

function linkClass(active: boolean) {
  return active
    ? "bg-[#ffd000] px-2 py-2 font-sans text-xs font-black text-[#1c1612] shadow-[2px_2px_0_#1c1612]"
    : "px-2 py-2 font-sans text-xs font-bold text-[#1c1612]/70 hover:text-[#1c1612]";
}

function mobileLinkClass(active: boolean) {
  return active
    ? "bg-[#ffd000] px-3 py-3 text-sm font-black text-[#1c1612] shadow-[2px_2px_0_#1c1612]"
    : "bg-white px-3 py-3 text-sm font-black text-[#1c1612] shadow-[2px_2px_0_rgb(0_0_0_/_0.12)]";
}
