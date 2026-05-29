import LuxurySection from "@/components/layout/LuxurySection";

export default function TermsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#080809] pt-28 text-white">
      <LuxurySection className="py-20">
        <article className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#1A1A1C] p-8 md:p-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a96a]">Legal / Terms</p>
          <h1 className="mt-5 font-serif text-5xl">Terms of Service</h1>
          <div className="mt-8 space-y-5 text-sm leading-8 text-white/58">
            <p>Purchases are processed through Stripe Checkout. Product availability, delivery times and fulfilment mode may depend on production partner status.</p>
            <p>VLM access features are utility-gated interface states only. They are not a profit promise, security, dividend or investment offer.</p>
            <p>Refund and withdrawal information must be finalized with the German/EU Widerrufsbelehrung before commercial production.</p>
          </div>
        </article>
      </LuxurySection>
    </main>
  );
}
