"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { writeUser } from "@/lib/dummySession";

export default function LoginForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Isi nama dulu.");
      return;
    }
    writeUser({ name: trimmed, email: email.trim() });
    router.push("/dashboard");
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      <p className="font-scribble -rotate-2 text-3xl text-[#9a3412]">meja kamu</p>
      <h1 className="mt-1 text-4xl font-extrabold tracking-tight">Masuk</h1>
      <p className="mt-3 font-sans text-sm leading-relaxed text-[#1c1612]/70">
        Panel ini masih percobaan. Nama tersimpan di browser ini, kata sandi tidak dicek.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3 bg-[#fffaf2] p-4 shadow-[4px_5px_0_rgb(20_16_12_/_0.12)] ring-1 ring-black/10">
        <label className="block font-sans text-xs font-bold text-[#1c1612]/70">
          Nama
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full bg-white px-3 py-2 text-sm font-semibold text-[#1c1612] ring-1 ring-black/10 outline-none"
            autoComplete="name"
          />
        </label>
        <label className="block font-sans text-xs font-bold text-[#1c1612]/70">
          Surel
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full bg-white px-3 py-2 text-sm font-semibold text-[#1c1612] ring-1 ring-black/10 outline-none"
            autoComplete="email"
          />
        </label>
        <label className="block font-sans text-xs font-bold text-[#1c1612]/70">
          Kata sandi
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full bg-white px-3 py-2 text-sm font-semibold text-[#1c1612] ring-1 ring-black/10 outline-none"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="font-sans text-xs font-bold text-[#9a3412]">{error}</p>}
        <button type="submit" className="w-full bg-[#ffd000] px-4 py-3 text-sm font-extrabold text-[#1c1612] shadow-[3px_3px_0_#1c1612]">
          Masuk ke dashboard
        </button>
      </form>
    </main>
  );
}
