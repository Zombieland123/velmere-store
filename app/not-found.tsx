import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="pl" className="bg-black text-white">
      <body className="min-h-screen bg-black text-white">
        <main className="flex min-h-screen items-center justify-center px-6 text-center">
          <section className="max-w-xl rounded-[2rem] border border-white/[0.12] bg-white/[0.035] p-8 shadow-2xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#b89a6a]">404</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-white md:text-6xl">Strona nie została znaleziona.</h1>
            <p className="mt-4 text-sm leading-7 text-white/[0.62]">
              Wróć do głównego wejścia Velmère. Strona główna działa przez wersję językową.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link className="rounded-full bg-white px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black" href="/pl">
                Wejdź na Velmère
              </Link>
              <Link className="rounded-full border border-white/[0.16] px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white" href="/en">
                English
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
