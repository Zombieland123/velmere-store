"use client";

import { AlertTriangle, Archive, ArrowRight, BadgeCheck, HelpCircle, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import Reveal from "@/components/ui/Reveal";
import VlmAccessVisual from "@/components/vlm/VlmAccessVisual";
import VlmBasicProShowcase from "@/components/vlm/VlmBasicProShowcase";
import VlmModeChoicePrompt from "@/components/vlm/VlmModeChoicePrompt";
import VlmModeSwitch from "@/components/vlm/VlmModeSwitch";
import VlmBuyAccessPanel from "@/components/vlm/VlmBuyAccessPanel";
import WalletSafetyExplainer from "@/components/vlm/WalletSafetyExplainer";
import VlmSelectedSystems from "@/components/vlm/VlmSelectedSystems";
import VlmAppLayerSection from "@/components/vlm/VlmAppLayerSection";
import VlmBasicPolkadotLanding from "@/components/vlm/VlmBasicPolkadotLanding";
import { useModeStore, type InterfaceMode } from "@/store/useModeStore";

const utilityFlow = ["Access", "Drops", "Square", "Rewards", "Future Governance"];

const utilityCards = [
  { icon: KeyRound, title: "Private access", body: "VLM is planned to help identify eligibility for selected drops, archive previews and member-only Square areas." },
  { icon: Archive, title: "Archive layer", body: "Members may receive earlier visibility into archive requests, restocks or editorial notes when the layer is active." },
  { icon: ShieldCheck, title: "Safety first", body: "Wallet connection must never request a seed phrase. Velmère does not take custody of user assets." },
];

const tokenomics = [
  ["Purpose", "Utility and access concept"],
  ["Sale status", "No public sale enabled in this build"],
  ["Checkout", "Separated from clothing commerce"],
  ["Fees", "Protocol or transfer fees only if technically accurate and legally reviewed"],
  ["Custody", "Non-custodial wallet preview only"],
  ["Value", "No promise of price, liquidity, listing or future value"],
];

const roadmap = [
  { step: "01", title: "Concept", body: "Define access rules, account separation and legal boundaries." },
  { step: "02", title: "Review", body: "Complete contract audit, wallet safety copy and qualified legal review." },
  { step: "03", title: "Private beta", body: "Enable read-only eligibility checks for invited accounts." },
  { step: "04", title: "Activation", body: "Launch only if technical, legal and operational requirements are verified." },
];


const proHeroCopy = {
  en: {
    eyebrow: "VLM / PROTOCOL ROOM",
    title: "Protocol room, not promises.",
    body: "Pro exposes the operating layer: wallet safety, archive routing, AMU baseline and Möbius path visuals — still read-only until contract, audit and legal review are complete.",
    learn: "Learn About VLM",
    utility: "Read Utility",
    waitlist: "Join Waitlist",
    status: "Contract status",
    checks: ["No custody", "No seed phrases", "No price claim"],
  },
  pl: {
    eyebrow: "VLM / POKÓJ PROTOKOŁU",
    title: "Pokój protokołu, nie obietnice.",
    body: "Pro pokazuje warstwę operacyjną: bezpieczeństwo portfela, routing archiwum, AMU baseline i ścieżkę Möbiusa — nadal read-only do czasu kontraktu, audytu i review prawnego.",
    learn: "Poznaj VLM",
    utility: "Czytaj utility",
    waitlist: "Dołącz do listy",
    status: "Status kontraktu",
    checks: ["Bez custody", "Bez seed phrase", "Bez obietnicy ceny"],
  },
  de: {
    eyebrow: "VLM / PROTOKOLLRAUM",
    title: "Protokollraum, keine Versprechen.",
    body: "Pro zeigt die operative Ebene: Wallet-Sicherheit, Archiv-Routing, AMU-Baseline und Möbius-Pfad — read-only bis Contract, Audit und Legal Review abgeschlossen sind.",
    learn: "VLM verstehen",
    utility: "Utility lesen",
    waitlist: "Warteliste",
    status: "Contract Status",
    checks: ["Keine Custody", "Keine Seed Phrase", "Kein Preisversprechen"],
  },
} as const;

const faqs = [
  ["Is VLM an investment?", "No. VLM is presented only as a utility/access concept. It should not be treated as financial advice, a security, a public offer or a price claim."],
  ["Do I need VLM to buy clothing?", "No. Clothing commerce must remain separate. Public browsing and standard checkout should not require a token."],
  ["Will Velmère ask for my seed phrase?", "Never. Wallet connection must be read-only unless your wallet clearly shows a transaction confirmation."],
  ["Is the contract deployed?", "Use the status section on this page as the source of truth. If contract, chain or audit data is missing, it must remain pending until verified."],
];

function UtilityDiagram() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="rounded-[2rem] border border-white/[0.10] bg-[#0B0B0D] p-4 shadow-velmere-card md:p-6">
      <div className="grid gap-3 md:grid-cols-5">
        {utilityFlow.map((item, index) => (
          <motion.div
            key={item}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-velmere-gold">0{index + 1}</p>
            <p className="mt-4 text-lg text-velmere-ivory">{item}</p>
            {index < utilityFlow.length - 1 ? (
              <ArrowRight className="absolute -right-6 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-white/[0.20] md:block" />
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function VlmAccessGatePage() {
  const searchParams = useSearchParams();
  const locale = useLocale() as keyof typeof proHeroCopy;
  const proText = proHeroCopy[locale] ?? proHeroCopy.en;
  const { mode, setMode } = useModeStore();

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "pro" || urlMode === "basic") {
      setMode(urlMode as InterfaceMode);
      window.localStorage.setItem("vlm-mode-choice-seen", "1");
    }
  }, [searchParams, setMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [mode]);

  return (
    <main className="bg-velmere-black text-velmere-ivory">
      <VlmModeChoicePrompt mode={mode} />
      <Suspense fallback={null}>
        <VlmModeSwitch />
      </Suspense>
      <VlmBuyAccessPanel />
      {mode === "basic" ? (
        <VlmBasicPolkadotLanding />
      ) : (
        <section className="luxury-section pt-28 md:pt-32">
          <div className="grid gap-6 pb-16 lg:grid-cols-[0.95fr_0.75fr] lg:items-stretch">
            <Reveal className="relative overflow-hidden rounded-[2rem] border border-velmere-gold/[0.18] bg-[#09090A] p-6 text-velmere-ivory shadow-velmere-card md:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_24%,rgba(212,175,55,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_42%)]" />
              <div className="relative z-[1]">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-velmere-gold">{proText.eyebrow}</p>
                <h1 className="mt-6 max-w-5xl font-serif text-[clamp(2.75rem,6.5vw,6.4rem)] leading-[0.92] tracking-[-0.045em]">
                  {proText.title}
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-velmere-grey-soft">
                  {proText.body}
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a href="#what-is-vlm" className="velmere-button-primary">{proText.learn}</a>
                  <a href="#utility" className="velmere-button-secondary">{proText.utility}</a>
                  <Link href="/contact" className="velmere-button-ghost">{proText.waitlist}</Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="rounded-[2rem] border border-white/[0.10] bg-[linear-gradient(150deg,#111113,#080809)] p-4 shadow-velmere-card md:p-6">
              <div className="mb-4 flex items-center justify-between gap-4 px-1">
                <span className="velmere-label text-velmere-gold">{proText.status}</span>
                <LockKeyhole className="h-5 w-5 text-velmere-gold" />
              </div>
              <VlmAccessVisual />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {proText.checks.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.10] bg-white/[0.025] px-4 py-3">
                    <BadgeCheck className="h-4 w-4 text-velmere-gold" />
                    <span className="text-sm text-white/[0.70]">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {mode === "pro" ? (
        <>
          <section className="luxury-section pb-20">
            <WalletSafetyExplainer variant="full" />
          </section>

          <Suspense fallback={null}>
            <VlmBasicProShowcase />
          </Suspense>
        </>
      ) : null}

      <VlmSelectedSystems mode={mode} />

      <VlmAppLayerSection />

      <section id="what-is-vlm" className="luxury-section pb-20">
        <Reveal className="luxury-card">
          <p className="velmere-label text-velmere-gold">What is VLM?</p>
          <div className="mt-5 grid gap-8 md:grid-cols-[0.75fr_1.25fr] md:items-end">
            <h2 className="font-serif text-4xl leading-[0.94] tracking-[-0.045em] md:text-6xl">A private layer for access.</h2>
            <p className="text-sm leading-7 text-velmere-grey-soft">
              VLM is planned as a member access mechanism around drops, Square and archive features. It must not be marketed as a financial product, price claim, security, dividend, yield stream or certain future benefit.
            </p>
          </div>
        </Reveal>
      </section>

      <section id="utility" className="luxury-section pb-20">
        <Reveal>
          <p className="velmere-label text-velmere-gold">Utility diagram</p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] md:text-6xl">From access to participation.</h2>
        </Reveal>
        <Reveal delay={0.06} className="mt-6">
          <UtilityDiagram />
        </Reveal>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {utilityCards.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 0.04} className="luxury-card transition duration-500 hover:-translate-y-1 hover:border-velmere-gold/[0.25]">
              <Icon className="h-5 w-5 text-velmere-gold" />
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-velmere-muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="luxury-section grid gap-4 pb-20 lg:grid-cols-2">
        <Reveal className="luxury-card">
          <p className="velmere-label text-velmere-gold">Tokenomics</p>
          <h2 className="mt-5 font-serif text-[clamp(2.35rem,5vw,4.75rem)] leading-[0.98] tracking-[-0.035em]">Plain status only.</h2>
          <div className="mt-7 divide-y divide-white/[0.10] overflow-hidden rounded-2xl border border-white/[0.10]">
            {tokenomics.map(([label, value]) => (
              <div key={label} className="grid gap-2 p-4 sm:grid-cols-[10rem_1fr]">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/[0.38]">{label}</p>
                <p className="text-sm leading-6 text-white/[0.70]">{value}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08} className="luxury-card">
          <p className="velmere-label text-velmere-gold">Contract / Chain / Audit Status</p>
          <h2 className="mt-5 font-serif text-[clamp(2.35rem,5vw,4.75rem)] leading-[0.98] tracking-[-0.035em]">Must be verified.</h2>
          <div className="mt-7 grid gap-3">
            {[
              ["Contract address", "Not published — deployment, verification and audit required"],
              ["Chain", "Not published — network will be shown after verification"],
              ["Audit", "Required before activation"],
              ["Legal review", "Required before any public token functionality"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/[0.10] bg-black/[0.24] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-velmere-gold">{label}</p>
                <p className="mt-2 text-sm leading-6 text-white/[0.68]">{value}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="luxury-section pb-20">
        <Reveal>
          <p className="velmere-label text-velmere-gold">Roadmap</p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] md:text-6xl">Launch only when ready.</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {roadmap.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.04} className="luxury-card">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-velmere-gold">{item.step}</p>
              <h3 className="mt-5 text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-velmere-muted">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="luxury-section pb-20">
        <Reveal className="rounded-[2rem] border border-velmere-gold/[0.25] bg-velmere-gold/[0.055] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <AlertTriangle className="h-6 w-6 shrink-0 text-velmere-gold" />
            <div>
              <p className="velmere-label text-velmere-gold">Risk Notice</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-0.04em] md:text-5xl">VLM is a utility/access concept.</h2>
              <p className="mt-5 max-w-4xl text-sm leading-7 text-velmere-grey-soft">
                VLM should not be treated as financial advice, a security, a public offer, a price claim, a resale-value claim, a listing claim or a certainty of future access. Features may change, be delayed or never launch. A qualified legal review and technical audit are required before activation.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="luxury-section pb-24 md:pb-32">
        <Reveal>
          <p className="velmere-label text-velmere-gold">FAQ</p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] md:text-6xl">Clear answers. No hype.</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer], index) => (
            <Reveal key={question} delay={index * 0.04} className="luxury-card">
              <HelpCircle className="h-5 w-5 text-velmere-gold" />
              <h3 className="mt-5 text-xl">{question}</h3>
              <p className="mt-3 text-sm leading-7 text-velmere-muted">{answer}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
