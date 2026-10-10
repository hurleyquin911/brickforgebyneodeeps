"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearUser, readSaved, readUser, type DummyUser } from "@/lib/dummySession";
import { findSharedSet } from "@/lib/showcase";

const MY_BUILDS = [
  { title: "Meja makan", pieces: 12, state: "Draf" },
  { title: "Sketsa pohon", pieces: 7, state: "Draf" },
];

export default function DashboardView() {
  const router = useRouter();
  const [user, setUser] = useState<DummyUser | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = readUser();
    if (!current) {
      router.replace("/login");
      return;
    }
    setUser(current);
    setSaved(readSaved());
    setReady(true);
  }, [router]);

  if (!ready || !user) {
    return <main className="flex-1 px-5 py-16 font-sans text-sm text-[#1c1612]/60">Membuka meja…</main>;
  }

  const sets = saved.map((slug) => findSharedSet(slug)).filter((item) => item !== null);

  const logout = () => {
    clearUser();
    router.push("/");
    router.refresh();
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-scribble text-3xl text-[#9a3412]">halo</p>
          <h1 className="text-3xl font-extrabold tracking-tight break-words sm:text-4xl">{user.name}</h1>
          {user.email && <p className="mt-1 font-sans text-sm text-[#1c1612]/55">{user.email}</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/studio" className="bg-[#1c1612] px-3 py-2 text-xs font-extrabold text-[#ffd000]">
            Buka studio
          </Link>
          <button type="button" onClick={logout} className="bg-white px-3 py-2 font-sans text-xs font-bold ring-1 ring-black/10">
            Keluar
          </button>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-extrabold">Karya saya</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {MY_BUILDS.map((build) => (
            <li key={build.title} className="bg-[#fffaf2] p-4 ring-1 ring-black/10">
              <p className="text-lg font-extrabold">{build.title}</p>
              <p className="mt-1 font-sans text-xs text-[#1c1612]/55">
                {build.pieces} part · {build.state}
              </p>
              <Link href="/studio" className="mt-3 inline-block font-sans text-xs font-bold underline decoration-dotted underline-offset-4">
                Lanjut di studio
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-extrabold">Set yang dipakai</h2>
        {sets.length === 0 ? (
          <p className="mt-3 font-sans text-sm text-[#1c1612]/65">
            Belum ada. Ambil dari <Link href="/showcase" className="font-bold underline decoration-dotted underline-offset-4">galeri</Link>.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {sets.map((item) => (
              <li key={item.slug} className="flex items-center justify-between gap-3 bg-[#fffaf2] p-4 ring-1 ring-black/10">
                <div>
                  <p className="font-extrabold">{item.title}</p>
                  <p className="font-scribble text-xl text-[#9a3412]">{item.author}</p>
                </div>
                <Link
                  href={`/studio?set=${item.slug}`}
                  className="shrink-0 bg-[#ffd000] px-3 py-2 text-xs font-extrabold shadow-[2px_2px_0_#1c1612]"
                >
                  Pakai
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
