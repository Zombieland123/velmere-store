"use client";

import { motion } from "framer-motion";
import {
  Archive,
  BadgeCheck,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  Route,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import BajakProtocolLab from "@/components/vlm/BajakProtocolLab";
import BajakProtocolMini from "@/components/vlm/BajakProtocolMini";
import VlmLaunchScenario from "@/components/vlm/VlmLaunchScenario";
import VlmBasicProShowcase from "@/components/vlm/VlmBasicProShowcase";
import VlmProVisual from "@/components/vlm/VlmProVisual";
import VlmWalletPreviewPanel from "@/components/vlm/VlmWalletPreviewPanel";
import VlmModeTransitionOverlay from "@/components/vlm/VlmModeTransitionOverlay";
import MobileModePill from "@/components/mobile/MobileModePill";
import VlmModeChoicePrompt from "@/components/vlm/VlmModeChoicePrompt";

const modelCards = ["supply", "network", "minting", "price", "tax", "status"] as const;
const utilityCards = [
  { key: "drops", icon: KeyRound },
  { key: "archive", icon: Archive },
  { key: "privileges", icon: BadgeCheck },
] as const;
const securityCards = ["contract", "audit", "wallet", "treasury"] as const;
const howToBuySteps = ["wallet", "network", "officialPage", "verify", "dex", "confirm", "seed"] as const;
const contractRows = [
  "openzeppelin",
  "fixedSupply",
  "noMint",
  "buyTax",
  "sellTax",
  "transferTax",
  "taxCap",
  "noBlacklist",
  "noSellLock",
  "noHoneypot",
  "noCustomCrypto",
  "multisig",
  "testnet",
  "staticAnalysis",
  "audit",
] as const;

const entrance = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
} as const;

function ModelCards() {
  const t = useTranslations("VlmClean");

  return (
    <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {modelCards.map((key) => (
        <article key={key} className="flex min-h-[118px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:p-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-white/42">
            {t(`model.${key}.label`)}
          </p>
          <p className="mt-4 max-w-full break-words font-serif text-lg leading-[1.08] tracking-[-0.02em] text-[#F5F0E8] md:text-[1.25rem] xl:text-[1.38rem]">
            {t(`model.${key}.value`)}
          </p>
        </article>
      ))}
    </div>
  );
}

function UtilitySection() {
  const t = useTranslations("VlmClean");

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
      <motion.div {...entrance}>
        <p className="luxury-kicker text-velmere-gold/80">{t("utility.kicker")}</p>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-white md:text-5xl">
          {t("utility.title")}
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-white/58">{t("utility.body")}</p>
      </motion.div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {utilityCards.map(({ key, icon: Icon }) => (
          <motion.article
            key={key}
            {...entrance}
            className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 md:p-8"
          >
            <Icon className="h-5 w-5 text-velmere-gold" aria-hidden="true" />
            <h3 className="mt-5 font-serif text-3xl leading-tight text-white">{t(`utility.cards.${key}.title`)}</h3>
            <p className="mt-4 font-sans text-sm leading-7 text-white/60">{t(`utility.cards.${key}.body`)}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function HowToBuySection() {
  const t = useTranslations("VlmClean");

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:px-12 md:py-24 lg:grid-cols-[0.72fr_1.28fr]">
      <motion.div {...entrance}>
        <p className="luxury-kicker text-velmere-gold/80">{t("howToBuy.kicker")}</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">{t("howToBuy.title")}</h2>
        <p className="mt-5 max-w-xl font-sans text-sm leading-7 text-white/62">{t("howToBuy.body")}</p>
      </motion.div>
      <div className="grid gap-3">
        {howToBuySteps.map((key, index) => (
          <motion.article
            key={key}
            {...entrance}
            className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[auto_1fr]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-velmere-gold/30 font-sans text-xs font-semibold text-velmere-gold">
              {index + 1}
            </span>
            <p className="font-sans text-sm leading-7 text-white/68">{t(`howToBuy.steps.${key}`)}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function SecuritySection() {
  const t = useTranslations("VlmClean");

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
      <div className="rounded-[2rem] border border-white/10 bg-[#111] p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <motion.div {...entrance}>
            <p className="luxury-kicker text-velmere-gold/80">{t("security.kicker")}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">{t("security.title")}</h2>
            <p className="mt-5 font-sans text-sm leading-7 text-white/62">{t("security.body")}</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            {securityCards.map((key) => (
              <motion.article key={key} {...entrance} className="rounded-2xl border border-white/10 bg-black/24 p-5">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
                  {t(`security.cards.${key}.label`)}
                </p>
                <p className="mt-3 font-sans text-sm font-semibold leading-6 text-[#F5F0E8]">
                  {t(`security.cards.${key}.value`)}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContractPlanSection() {
  const t = useTranslations("VlmClean");

  return (
    <section id="contract-plan" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-16 md:px-12 md:py-24">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <motion.div {...entrance}>
            <p className="luxury-kicker text-velmere-gold/80">{t("contract.kicker")}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">{t("contract.title")}</h2>
            <p className="mt-5 font-sans text-sm leading-7 text-white/62">{t("contract.body")}</p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {contractRows.map((key) => (
              <motion.div key={key} {...entrance} className="flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-black/24 px-4">
                <span className="h-2 w-2 rounded-full bg-velmere-gold" aria-hidden="true" />
                <p className="font-sans text-sm leading-6 text-white/66">{t(`contract.rows.${key}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex gap-4 rounded-2xl border border-velmere-gold/20 bg-velmere-gold/[0.06] p-5">
          <Route className="mt-1 h-5 w-5 shrink-0 text-velmere-gold" aria-hidden="true" />
          <p className="font-sans text-sm leading-7 text-white/68">{t("feeWarning")}</p>
        </div>
      </div>
    </section>
  );
}

function ScientificProtocolSection() {
  const rows = [
    { label: "MÖBIUS BOOK", value: "continuous access path", body: "A visual metaphor for a route that returns to the wearer: archive, garment, signal, repeat." },
    { label: "GOLDEN RATIO", value: "1.618 layout bias", body: "Used as a design-grid reference for card proportions, calm whitespace and the VLM orbital interface." },
    { label: "PRIME LATTICE", value: "2 / 3 / 5 / 7 rhythm", body: "Prime-number spacing drives the terminal tick marks, staggered reveals and controlled asymmetry." },
    { label: "ANTI-GRAVITY STUDY", value: "weight without noise", body: "A cinematic language for heavy garments that visually float without losing structural mass." },
  ];

  return (
    <section className="mx-auto max-w-none px-4 py-16 sm:px-6 lg:px-8 md:py-24 2xl:px-12">
      <motion.div {...entrance} className="rounded-[2rem] border border-[#d4af37]/16 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(255,255,255,0.025)_38%,rgba(0,0,0,0.18))] p-5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="luxury-kicker text-velmere-gold/80">VLM / SCIENTIFIC LORE</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight text-white md:text-6xl">Geometry as a brand interface.</h2>
            <p className="mt-5 max-w-xl font-sans text-sm leading-7 text-white/62">Möbius, AMU, prime rhythm and golden-ratio spacing are used here as visual systems for the platform — design logic, not financial or scientific promises.</p>
          </div>
          <div className="grid gap-[1px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/10 sm:grid-cols-2">
            {rows.map((row) => (
              <article key={row.label} className="bg-[#121214] p-5">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37]">{row.label}</p>
                <p className="mt-3 font-serif text-2xl leading-tight text-white">{row.value}</p>
                <p className="mt-3 text-xs leading-6 text-white/48">{row.body}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function RiskSection() {
  const t = useTranslations("VlmClean");

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-24">
      <div className="rounded-[2rem] border border-black/10 bg-[#F5F0E8] p-6 text-black md:p-10">
        <p className="font-sans text-[10px] font-black uppercase tracking-[0.28em] text-black/45">{t("risk.kicker")}</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{t("risk.title")}</h2>
        <p className="mt-5 font-sans text-sm leading-7 text-black/70">{t("risk.body")}</p>
        <Link
          href="/token-agreement"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-black/15 px-5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-black/70 transition-colors hover:border-black/30 hover:text-black"
        >
          {t("risk.cta")}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export default function VlmAccessGatePage() {
  const t = useTranslations("VlmClean");
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "pro" ? "pro" : "basic";

  return (
    <main className="min-h-[100dvh] overflow-x-clip bg-black pb-24 text-[#FFFFF0] md:pb-0">
      <VlmModeTransitionOverlay mode={mode} />
      <VlmModeChoicePrompt mode={mode} />
      <MobileModePill />
      <section className="w-full max-w-none overflow-x-clip px-4 py-24 sm:px-6 lg:px-8 lg:py-32 2xl:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10 xl:gap-14">
          <motion.div {...entrance} className="min-w-0 space-y-8 text-center lg:text-left">
            <div>
              <p className="luxury-kicker text-velmere-gold/80">{t("hero.kicker")}</p>
              <h1 className="mx-auto mt-5 max-w-[10ch] font-serif text-5xl leading-[0.9] text-white md:text-6xl xl:text-[4.9rem] lg:mx-0">
                {t("hero.title")}
              </h1>
              <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-8 text-white/70 lg:mx-0">{t("hero.body")}</p>
            </div>
            <ModelCards />
            <div className="grid gap-3 rounded-3xl border border-velmere-gold/20 bg-velmere-gold/[0.045] p-5 md:grid-cols-3 md:p-6">
              {["wallet", "registry", "access"].map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-velmere-gold" aria-hidden="true" />
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">{t(`hero.rails.${key}`)}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...entrance} className="min-w-0 lg:sticky lg:top-28 lg:scale-[1.06] xl:scale-[1.12] lg:origin-center">
            <VlmProVisual />
          </motion.div>
        </div>
      </section>

      <VlmBasicProShowcase />

      <section id="wallet-preview" className="mx-auto grid w-full max-w-none scroll-mt-28 gap-8 overflow-x-clip px-4 py-16 sm:px-6 lg:px-8 md:py-24 lg:grid-cols-[0.95fr_1.05fr] 2xl:px-12">
        <motion.div {...entrance}>
          <p className="luxury-kicker text-velmere-gold/80">{t("wallet.kicker")}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">{t("wallet.title")}</h2>
          <p className="mt-5 max-w-xl font-sans text-sm leading-7 text-white/62">{t("wallet.body")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[WalletCards, LockKeyhole, ShieldCheck].map((Icon, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Icon className="h-5 w-5 text-velmere-gold" aria-hidden="true" />
                <p className="mt-4 font-sans text-xs leading-6 text-white/62">{t(`wallet.points.${index}`)}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <VlmWalletPreviewPanel compact />
      </section>

      {mode === "basic" ? (
        <>
          <UtilitySection />
          <BajakProtocolMini />
        </>
      ) : (
        <>
          <UtilitySection />
          <HowToBuySection />
          <VlmLaunchScenario />
          <ScientificProtocolSection />
          <ContractPlanSection />
          <SecuritySection />
          <BajakProtocolLab />
        </>
      )}
    </main>
  );
}
