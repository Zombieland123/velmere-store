import LuxurySection from "@/components/layout/LuxurySection";

type LegalSection = {
  title: string;
  body: string;
};

type LegalDraftPageProps = {
  kicker: string;
  title: string;
  updated: string;
  draftNotice: string;
  intro: string;
  sections: LegalSection[];
};

function MultilineBody({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < text.split("\n").length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export default function LegalDraftPage({
  kicker,
  title,
  updated,
  draftNotice,
  intro,
  sections,
}: LegalDraftPageProps) {
  return (
    <main className="min-h-[100dvh] bg-velmere-black text-velmere-ivory">
      <LuxurySection className="pt-28 pb-24 md:pt-36 md:pb-32">
        <article className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-white/[0.10] bg-[#0B0B0D] p-6 shadow-velmere-card md:p-10">
            <p className="velmere-label text-velmere-gold">{kicker}</p>
            <h1 className="mt-6 font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.86] tracking-[-0.06em] text-white">{title}</h1>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/[0.42]">{updated}</p>
            <div className="mt-8 rounded-2xl border border-velmere-gold/[0.20] bg-velmere-gold/[0.06] p-5 text-sm leading-7 text-white/[0.70]">
              {draftNotice}
            </div>
            <p className="mt-8 max-w-3xl text-base leading-8 text-white/[0.62]">{intro}</p>
          </div>

          <div className="mt-5 grid gap-4">
            {sections.map((section) => (
              <section key={section.title} className="rounded-[2rem] border border-white/[0.10] bg-[#111113] p-6 shadow-velmere-card md:p-8">
                <h2 className="font-serif text-3xl tracking-[-0.04em] text-white md:text-4xl">{section.title}</h2>
                <p className="mt-4 text-sm leading-8 text-white/[0.62]">
                  <MultilineBody text={section.body} />
                </p>
              </section>
            ))}
          </div>
        </article>
      </LuxurySection>
    </main>
  );
}
