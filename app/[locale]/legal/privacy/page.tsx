import LuxurySection from "@/components/layout/LuxurySection";

export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-[#080809] pt-28 text-white">
      <LuxurySection className="py-20">
        <article className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#1A1A1C] p-8 md:p-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a96a]">Legal / Privacy</p>
          <h1 className="mt-5 font-serif text-5xl">Privacy Policy</h1>
          <div className="mt-8 space-y-5 text-sm leading-8 text-white/58">
            <p>Velmère processes only the minimum account, checkout, wallet-preview and support data required to operate the store and access layer.</p>
            <p>Payment data is handled by Stripe. Wallet addresses are public blockchain identifiers and may be used only for access verification and order metadata.</p>
            <p>Production deployment must connect this page to the final legal text reviewed for Germany/EU operations before paid launch.</p>
          </div>
        </article>
      </LuxurySection>
    </main>
  );
}
