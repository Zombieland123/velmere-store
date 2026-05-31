"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Database,
  LogOut,
  PackageCheck,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import { setVelmereLocalSession } from "@/components/auth/AuthGate";
import WalletConnectOptions from "@/components/wallet/WalletConnectOptions";

const copy = {
  en: {
    sidebar: "Velmère Account",
    tabs: {
      overview: "Overview",
      orders: "Orders",
      addresses: "Addresses",
      security: "Security",
      wallet: "Wallet",
      profile: "Profile",
    },
    logout: "Log out",
    kicker: "Private member console",
    title: "Account layer.",
    body: "Manage profile, orders, security and optional wallet binding. Commerce first. Web3 access remains secondary.",
    cards: [
      [
        "Member state",
        "Private preview",
        "Replace with real account role once auth is connected.",
      ],
      [
        "Orders",
        "No orders yet",
        "Order history appears after checkout is active.",
      ],
      ["VLM", "Access concept", "VLM remains separate from clothing checkout."],
    ],
    walletOptional: "Optional",
    walletConnected: "Connected",
    walletBody: "Connect only for access checks.",
    ordersTitle: "No orders yet.",
    ordersBody:
      "Orders will appear here after checkout, payment confirmation and fulfilment tracking are connected.",
    addressesTitle: "Address book.",
    addressesBody:
      "Shipping and billing fields should be collected only when required for purchase or account support.",
    dataVaultTitle: "Data vault",
    dataVaultBody:
      "Production profile data should live in Supabase Postgres with Row Level Security, server-side validation and encrypted transport. Do not store seed phrases or private keys.",
    walletTitle: "Optional wallet binding.",
    walletBodyLong:
      "Wallets are used only for access checks when enabled. Velmère never asks for seed phrases or private keys.",
    status: "Wallet status",
    noWallet: "No wallet connected.",
    readOnly: "Read-only unless a wallet transaction is explicitly confirmed.",
  },
  pl: {
    sidebar: "Konto Velmère",
    tabs: {
      overview: "Podgląd",
      orders: "Zamówienia",
      addresses: "Adresy",
      security: "Bezpieczeństwo",
      wallet: "Portfel",
      profile: "Profil",
    },
    logout: "Wyloguj",
    kicker: "Prywatna konsola membera",
    title: "Warstwa konta.",
    body: "Zarządzaj profilem, zamówieniami, bezpieczeństwem i opcjonalnym portfelem. Najpierw commerce; Web3 zostaje warstwą dodatkową.",
    cards: [
      [
        "Status membera",
        "Prywatny podgląd",
        "Rola konta zostanie podpięta po wdrożeniu prawdziwego auth.",
      ],
      [
        "Zamówienia",
        "Brak zamówień",
        "Historia pojawi się po aktywacji checkoutu i potwierdzeniu płatności.",
      ],
      [
        "VLM",
        "Warstwa dostępu",
        "VLM pozostaje oddzielony od checkoutu odzieży.",
      ],
    ],
    walletOptional: "Opcjonalny",
    walletConnected: "Połączony",
    walletBody: "Łącz tylko do sprawdzania dostępu.",
    ordersTitle: "Brak zamówień.",
    ordersBody:
      "Zamówienia pojawią się tutaj po checkoutcie, potwierdzeniu płatności i podpięciu fulfilmentu.",
    addressesTitle: "Książka adresowa.",
    addressesBody:
      "Adres dostawy i faktury zbieramy tylko wtedy, gdy jest potrzebny do zakupu albo obsługi konta.",
    dataVaultTitle: "Sejf danych",
    dataVaultBody:
      "Produkcyjne dane profilu powinny trafić do Supabase Postgres z Row Level Security, walidacją po stronie serwera i szyfrowanym połączeniem. Nie zapisujemy seed phrase ani kluczy prywatnych.",
    walletTitle: "Opcjonalne powiązanie portfela.",
    walletBodyLong:
      "Portfele służą tylko do sprawdzania dostępu, gdy funkcja zostanie włączona. Velmère nigdy nie prosi o seed phrase ani klucze prywatne.",
    status: "Status portfela",
    noWallet: "Portfel nie jest połączony.",
    readOnly:
      "Tryb read-only, dopóki transakcja nie zostanie wyraźnie potwierdzona w portfelu.",
  },
  de: {
    sidebar: "Velmère Konto",
    tabs: {
      overview: "Übersicht",
      orders: "Bestellungen",
      addresses: "Adressen",
      security: "Sicherheit",
      wallet: "Wallet",
      profile: "Profile",
    },
    logout: "Ausloggen",
    kicker: "Private Member-Konsole",
    title: "Account-Ebene.",
    body: "Verwalte Profil, Bestellungen, Sicherheit und optionale Wallet-Bindung. Commerce zuerst; Web3 bleibt sekundär.",
    cards: [
      [
        "Member-Status",
        "Private Vorschau",
        "Die Account-Rolle wird nach echtem Auth verbunden.",
      ],
      [
        "Bestellungen",
        "Noch keine Bestellungen",
        "Historie erscheint nach Checkout und Zahlungsbestätigung.",
      ],
      ["VLM", "Access-Konzept", "VLM bleibt vom Kleidung-Checkout getrennt."],
    ],
    walletOptional: "Optional",
    walletConnected: "Verbunden",
    walletBody: "Nur für Access-Checks verbinden.",
    ordersTitle: "Noch keine Bestellungen.",
    ordersBody:
      "Bestellungen erscheinen nach Checkout, Zahlungsbestätigung und Fulfilment-Tracking.",
    addressesTitle: "Adressbuch.",
    addressesBody:
      "Versand- und Rechnungsdaten nur erfassen, wenn sie für Kauf oder Support nötig sind.",
    dataVaultTitle: "Daten-Tresor",
    dataVaultBody:
      "Produktive Profildaten sollten in Supabase Postgres mit Row Level Security, Servervalidierung und verschlüsselter Verbindung liegen. Keine Seed Phrases oder Private Keys speichern.",
    walletTitle: "Optionale Wallet-Bindung.",
    walletBodyLong:
      "Wallets werden nur für Access-Checks genutzt, wenn aktiviert. Velmère fragt nie nach Seed Phrase oder Private Keys.",
    status: "Wallet-Status",
    noWallet: "Kein Wallet verbunden.",
    readOnly:
      "Read-only, solange keine Wallet-Transaktion ausdrücklich bestätigt wird.",
  },
} as const;

type TabKey = "overview" | "orders" | "addresses" | "security" | "wallet" | "profile";
const tabKeys: TabKey[] = [
  "overview",
  "orders",
  "addresses",
  "security",
  "wallet",
  "profile",
];

function InfoCard({
  title,
  value,
  body,
  accent = false,
}: {
  title: string;
  value: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${accent ? "border-velmere-gold/[0.25] bg-velmere-gold/[0.055]" : "border-white/[0.10] bg-black/[0.20]"}`}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/[0.42]">
        {title}
      </p>
      <p className="mt-3 text-lg text-velmere-ivory">{value}</p>
      <p className="mt-2 text-xs leading-6 text-velmere-muted">{body}</p>
    </div>
  );
}

function AccountFormBlock({ title, body, fields, action }: { title: string; body: string; fields: string[]; action: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.10] bg-black/[0.20] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-velmere-gold">{title}</p>
      <p className="mt-3 text-sm leading-7 text-velmere-muted">{body}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.36]">{field}</span>
            <input
              disabled
              placeholder="Preview only"
              className="mt-2 h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.025] px-4 text-sm text-white/[0.55] outline-none placeholder:text-white/[0.20]"
            />
          </label>
        ))}
      </div>
      <button type="button" disabled className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.10] px-5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.34]">
        {action}
      </button>
    </div>
  );
}

export default function DashboardClient() {
  const locale = useLocale() as keyof typeof copy;
  const t = copy[locale] ?? copy.en;
  const [active, setActive] = useState<TabKey>("overview");
  const walletUi = useWalletUiStore();

  const cards = useMemo(
    () => [
      ...t.cards.map(([title, value, body], index) => ({
        title,
        value,
        body,
        accent: index === 0,
      })),
      {
        title: t.tabs.wallet,
        value: walletUi.connected ? t.walletConnected : t.walletOptional,
        body: walletUi.connected ? walletUi.shortAddress : t.walletBody,
      },
    ],
    [t, walletUi.connected, walletUi.shortAddress],
  );

  return (
    <main className="min-h-[100dvh] bg-velmere-black pt-28 text-velmere-ivory md:pt-32">
      <div className="luxury-section grid gap-5 pb-24 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/[0.10] bg-[#111113] p-3 shadow-velmere-card lg:sticky lg:top-28 lg:self-start">
          <p className="px-3 py-3 velmere-label text-velmere-gold">
            {t.sidebar}
          </p>
          <nav className="grid gap-1">
            {tabKeys.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                className={`rounded-xl px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition active:scale-[0.985] ${active === tab ? "bg-velmere-ivory text-black" : "text-white/[0.50] hover:bg-white/[0.05] hover:text-white"}`}
              >
                {t.tabs[tab]}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setVelmereLocalSession(false)}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-black/[0.20] font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.45] transition hover:text-red-200 active:scale-[0.985]"
          >
            <LogOut className="h-4 w-4" /> {t.logout}
          </button>
        </aside>

        <section className="min-w-0 rounded-[2rem] border border-white/[0.10] bg-[#111113] p-5 shadow-velmere-card md:p-8">
          <div className="border-b border-white/[0.10] pb-7">
            <p className="velmere-label text-velmere-gold">{t.kicker}</p>
            <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.86] tracking-[-0.06em]">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-velmere-grey-soft">
              {t.body}
            </p>
          </div>

          {active === "overview" ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <InfoCard key={card.title} {...card} />
              ))}
            </div>
          ) : null}

          {active === "orders" ? (
            <div className="mt-7 grid gap-4 md:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-white/[0.10] bg-black/[0.20] p-6">
                <PackageCheck className="h-5 w-5 text-velmere-gold" />
                <h2 className="mt-5 text-2xl">{t.ordersTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-velmere-muted">{t.ordersBody}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.10] bg-black/[0.20] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-velmere-gold">Receipt rules</p>
                <div className="mt-5 space-y-3 text-sm leading-7 text-white/[0.58]">
                  <p>VAT / MwSt summary will appear after Stripe session completion.</p>
                  <p>Returns, withdrawal and shipping status must be visible before commercial launch.</p>
                  <p>Fulfilment tracking should expose carrier, parcel ID and support contact.</p>
                </div>
              </div>
            </div>
          ) : null}

          {active === "addresses" ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <AccountFormBlock title={t.addressesTitle} body={t.addressesBody} fields={["Full name", "Street and number", "Apartment / optional", "Postal code", "City", "Country", "Phone / optional"]} action="Save address after auth" />
              <AccountFormBlock title="Billing / Invoice" body="Invoice data should stay separated from shipping data and only be collected when required." fields={["Legal name", "Company / optional", "VAT ID / optional", "Billing country"]} action="Save billing after auth" />
              <div className="rounded-2xl border border-velmere-gold/[0.20] bg-velmere-gold/[0.055] p-5 md:col-span-2">
                <Database className="h-5 w-5 text-velmere-gold" />
                <h2 className="mt-4 text-2xl">{t.dataVaultTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-velmere-muted">{t.dataVaultBody}</p>
              </div>
            </div>
          ) : null}

          {active === "security" ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <AccountFormBlock title="Password change" body="Password changes require current password, complexity validation and session refresh." fields={["Current password", "New password", "Repeat new password"]} action="Change password after auth" />
              <AccountFormBlock title="Email change" body="Email change requires confirmation on the old and new email address." fields={["Current email", "New email"]} action="Request email change" />
              <InfoCard title="2FA / Authenticator" value="Recommended" body="Authenticator app, passkey or six-digit TOTP code should be enabled before private rooms go live." accent />
              <InfoCard title="Data rights" value="GDPR" body="Export account data, request deletion and see retention periods in the privacy center." />
            </div>
          ) : null}


          {active === "profile" ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <AccountFormBlock title="Public profile" body="Username changes can be limited to once per 30 days to prevent impersonation and abuse in Square." fields={["Display name", "Username", "Bio"]} action="Save profile after auth" />
              <AccountFormBlock title="Avatar / preferences" body="Avatar, language and marketing preferences belong in account settings, not in checkout." fields={["Avatar URL", "Preferred language", "Newsletter consent"]} action="Save preferences" />
            </div>
          ) : null}

          {active === "wallet" ? (
            <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-white/[0.10] bg-black/[0.20] p-6">
                <WalletCards className="h-5 w-5 text-velmere-gold" />
                <h2 className="mt-5 text-2xl">{t.walletTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-velmere-muted">
                  {t.walletBodyLong}
                </p>
                <div className="mt-5">
                  <WalletConnectOptions showStatus={false} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.10] bg-black/[0.20] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/[0.42]">
                  {t.status}
                </p>
                <p className="mt-4 break-all text-sm leading-7 text-white/[0.68]">
                  {walletUi.connected ? walletUi.fullAddress : t.noWallet}
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs text-white/[0.45]">
                  <BadgeCheck className="h-4 w-4 text-velmere-gold" />
                  {t.readOnly}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
