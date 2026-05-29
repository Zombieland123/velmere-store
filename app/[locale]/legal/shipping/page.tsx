import LuxurySection from "@/components/layout/LuxurySection";

export default function LegalShippingPage() {
  return (
    <main className="min-h-[100dvh] bg-[#080809] pt-28 text-white">
      <LuxurySection className="py-20">
        <article className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#1A1A1C] p-8 md:p-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a96a]">Legal / Shipping</p>
          <h1 className="mt-5 font-serif text-5xl">European / German Delivery Standards</h1>
          <div className="mt-8 space-y-5 text-sm leading-8 text-white/58">
            <p>Orders are prepared after payment confirmation and routed through the configured production partner where applicable.</p>
            <p>Estimated delivery windows should be displayed per region before checkout. Germany and EU shipments require transparent shipping costs and taxes before payment.</p>
            <p>Tracking information is provided once the fulfilment provider creates a shipment record.</p>
          </div>
        </article>
      </LuxurySection>
    </main>
  );
}
