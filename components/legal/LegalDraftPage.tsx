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
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <article className="mx-auto max-w-3xl">
          <p className="luxury-kicker text-velmere-gold/80">{kicker}</p>
          <h1 className="mt-6 font-serif text-5xl leading-tight text-white md:text-6xl">{title}</h1>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/42">{updated}</p>
          <div className="mt-8 rounded-lg border border-velmere-gold/20 bg-velmere-gold/[0.07] p-5 text-sm leading-7 text-white/70">
            {draftNotice}
          </div>
          <p className="mt-8 text-base leading-8 text-white/62">{intro}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-white/10 pt-8">
                <h2 className="font-serif text-3xl text-white">{section.title}</h2>
                <p className="mt-4 text-sm leading-8 text-white/60">
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
