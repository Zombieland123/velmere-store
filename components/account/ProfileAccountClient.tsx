"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Edit3, FileClock, MessageSquareOff, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";
import LuxuryEmptyState from "@/components/ui/LuxuryEmptyState";

type ProfileDraft = {
  displayName: string;
  handle: string;
  bio: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_LAST_NAME_CHANGE = new Date("2026-05-01T00:00:00.000Z");

export default function ProfileAccountClient() {
  const t = useTranslations("Account.profileEditor");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<ProfileDraft>({
    displayName: "Velmère Member",
    handle: "velmere.member",
    bio: t("defaultBio"),
  });
  const [draft, setDraft] = useState(saved);
  const [lastNameChange, setLastNameChange] = useState(DEFAULT_LAST_NAME_CHANGE);

  const nextNameChangeDate = useMemo(() => new Date(lastNameChange.getTime() + 30 * MS_PER_DAY), [lastNameChange]);
  const canChangeName = Date.now() >= nextNameChangeDate.getTime();

  function saveProfile() {
    const changedName = draft.displayName.trim() !== saved.displayName || draft.handle.trim() !== saved.handle;
    setSaved({
      displayName: draft.displayName.trim() || saved.displayName,
      handle: draft.handle.trim().replace(/^@/, "") || saved.handle,
      bio: draft.bio.trim() || saved.bio,
    });
    if (changedName && canChangeName) setLastNameChange(new Date());
    setEditing(false);
  }

  return (
    <section className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/28">
      <div className="grid gap-6 border-b border-white/10 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-velmere-gold/30 bg-velmere-gold/10 font-serif text-3xl text-velmere-gold">
          {saved.displayName.slice(0, 1)}
        </div>
        <div>
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-velmere-gold/80">{t("kicker")}</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-white">{saved.displayName}</h2>
          <p className="mt-1 font-mono text-xs text-white/42">@{saved.handle}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">{saved.bio}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDraft(saved);
            setEditing((value) => !value);
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-5 font-sans text-[10px] font-black uppercase tracking-[0.18em] text-white/62 luxury-hover hover:border-white/25 hover:text-white"
        >
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          {editing ? t("cancel") : t("edit")}
        </button>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-3 md:p-7">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <WalletCards className="h-4 w-4 text-velmere-gold" aria-hidden="true" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{t("wallet.label")}</p>
          <p className="mt-2 text-sm leading-6 text-white/64">{t("wallet.value")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <ShieldCheck className="h-4 w-4 text-velmere-gold" aria-hidden="true" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{t("rank.label")}</p>
          <p className="mt-2 text-sm leading-6 text-white/64">{t("rank.value")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <CalendarClock className="h-4 w-4 text-velmere-gold" aria-hidden="true" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{t("cooldown.label")}</p>
          <p className="mt-2 text-sm leading-6 text-white/64">
            {canChangeName ? t("cooldown.ready") : t("cooldown.wait", { date: nextNameChangeDate.toLocaleDateString() })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 border-t border-white/10 p-6 md:grid-cols-2 md:p-7">
        <LuxuryEmptyState
          title={t("emptyPosts.title")}
          body={t("emptyPosts.body")}
          icon={<MessageSquareOff className="h-6 w-6" aria-hidden="true" />}
          className="h-full"
        />
        <LuxuryEmptyState
          title={t("emptyOrders.title")}
          body={t("emptyOrders.body")}
          icon={<FileClock className="h-6 w-6" aria-hidden="true" />}
          className="h-full"
        />
      </div>

      {editing ? (
        <div className="border-t border-white/10 p-6 md:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">{t("fields.displayName")}</span>
              <input
                value={draft.displayName}
                onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))}
                disabled={!canChangeName}
                className="mt-3 min-h-12 w-full rounded-full border border-white/10 bg-black/40 px-5 text-sm text-white outline-none placeholder:text-white/24 disabled:opacity-45"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">{t("fields.handle")}</span>
              <input
                value={draft.handle}
                onChange={(event) => setDraft((current) => ({ ...current, handle: event.target.value }))}
                disabled={!canChangeName}
                className="mt-3 min-h-12 w-full rounded-full border border-white/10 bg-black/40 px-5 font-mono text-sm text-white outline-none placeholder:text-white/24 disabled:opacity-45"
              />
            </label>
          </div>
          {!canChangeName ? <p className="mt-3 text-xs leading-6 text-velmere-gold/80">{t("cooldown.rule")}</p> : null}
          <label className="mt-5 block">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">{t("fields.bio")}</span>
            <textarea
              value={draft.bio}
              onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
              className="mt-3 min-h-28 w-full resize-none rounded-[1.5rem] border border-white/10 bg-black/40 p-4 text-sm leading-7 text-white outline-none placeholder:text-white/24"
            />
          </label>
          <button
            type="button"
            onClick={saveProfile}
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F5F0E8] px-6 text-[11px] font-black uppercase tracking-[0.18em] text-black luxury-hover hover:bg-white"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t("save")}
          </button>
          <p className="mt-4 text-xs leading-6 text-white/42">{t("persistenceNote")}</p>
        </div>
      ) : null}
    </section>
  );
}
