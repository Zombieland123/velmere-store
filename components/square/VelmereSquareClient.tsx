"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Bell,
  Eye,
  Heart,
  ImagePlus,
  MessageCircle,
  MessageSquare,
  Plus,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { SquareComment, SquarePost } from "@/lib/square/types";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import CommentThread from "@/components/community/CommentThread";
import LiveTimestamp from "@/components/ui/LiveTimestamp";
import { createSquarePostRequest, useSquarePosts } from "@/lib/hooks/useSquarePosts";
import { useVelmereAuth } from "@/components/auth/AuthGate";
import { Link } from "@/navigation";

const seedPostKeys = ["official", "lookbook", "vlm", "community"] as const;

const roomItems = [
  { key: "drop", icon: Trophy, progress: 72 },
  { key: "style", icon: Sparkles, progress: 54 },
  { key: "archive", icon: Award, progress: 41 },
  { key: "chat", icon: MessageSquare, progress: 63 },
] as const;

const copy = {
  en: {
    os: "COMMUNITY OS",
    map: "Square map",
    intro: "A restrained public signal board. Read freely; publishing requires an account and moderation.",
    walletGate: "Log in to publish, comment and unlock member rooms. Guests can read the public feed.",
    guest: "Guest mode",
    guestBody: "Read public posts. Publishing, replies and member rooms unlock after login.",
    connect: "Log in / register",
    balance: "Wallet preview",
    composer: "Write a post. It stays local until moderation is active.",
    placeholder: "Share a drop signal, fit note or archive clue…",
    addImage: "Add image",
    publish: "Publish local preview",
    close: "Close",
    comment: "Comments",
    commentPlaceholder: "Log in to comment…",
    commentPlaceholderAuthed: "Add a quiet comment…",
    noComments: "No visible comments yet.",
    reply: "Reply",
    replies: "replies",
    postComment: "Post comment",
    copied: "Encrypted signal copied.",
    pending: "Local signal created. Manual moderation will be required later.",
    openComposer: "Create Square signal",
    rightTitle: "Live board",
    rightOne: "Drop signals",
    rightTwo: "Archive riddles",
    rightThree: "Rewards after wallet access",
    locked: "Locked until wallet connection",
    loginRequired: "Login required before publishing to Square.",
    commentLocked: "Comments unlock after login.",
    modalKicker: "VELMÈRE / SIGNAL THREAD",
    rooms: { drop: "Drop quest", style: "Style arena", archive: "Archive riddle", chat: "Member chat" },
  },
  pl: {
    os: "COMMUNITY OS",
    map: "Mapa Square",
    intro: "Spokojna tablica publicznych sygnałów. Czytanie jest otwarte; publikacja wymaga konta i moderacji.",
    walletGate: "Zaloguj się, aby publikować, komentować i odblokować pokoje memberów. Goście mogą czytać feed.",
    guest: "Tryb gościa",
    guestBody: "Czytaj publiczne posty. Publikowanie, odpowiedzi i pokoje memberów odblokujesz po logowaniu.",
    connect: "Zaloguj / zarejestruj",
    balance: "Podgląd portfela",
    composer: "Napisz post. Zostaje lokalny do czasu moderacji.",
    placeholder: "Dodaj sygnał dropu, notatkę stylu albo wskazówkę archiwum…",
    addImage: "Dodaj obraz",
    publish: "Publikuj podgląd",
    close: "Zamknij",
    comment: "Komentarze",
    commentPlaceholder: "Zaloguj się, aby komentować…",
    commentPlaceholderAuthed: "Dodaj cichy komentarz…",
    noComments: "Brak widocznych komentarzy.",
    reply: "Odpowiedz",
    replies: "odpowiedzi",
    postComment: "Dodaj komentarz",
    copied: "Zaszyfrowany sygnał skopiowany.",
    pending: "Lokalny sygnał utworzony. Później wymagana będzie ręczna moderacja.",
    openComposer: "Utwórz sygnał Square",
    rightTitle: "Live board",
    rightOne: "Sygnały dropów",
    rightTwo: "Zagadki archiwum",
    rightThree: "Nagrody po dostępie wallet",
    locked: "Zablokowane do połączenia portfela",
    loginRequired: "Logowanie jest wymagane przed publikacją w Square.",
    commentLocked: "Komentarze odblokujesz po logowaniu.",
    modalKicker: "VELMÈRE / WĄTEK SYGNAŁU",
    rooms: { drop: "Misja dropu", style: "Arena stylu", archive: "Zagadka archiwum", chat: "Czat memberów" },
  },
  de: {
    os: "COMMUNITY OS",
    map: "Square-Karte",
    intro: "Ein ruhiges öffentliches Signalboard. Lesen ist offen; Posten braucht Account und Moderation.",
    walletGate: "Einloggen, um zu posten, zu kommentieren und Member-Räume freizuschalten. Gäste können den öffentlichen Feed lesen.",
    guest: "Gastmodus",
    guestBody: "Öffentliche Posts lesen. Posting, Antworten und Räume werden nach Login freigeschaltet.",
    connect: "Login / registrieren",
    balance: "Wallet-Vorschau",
    composer: "Post schreiben. Bleibt lokal bis Moderation aktiv ist.",
    placeholder: "Drop-Signal, Fit-Notiz oder Archiv-Hinweis teilen…",
    addImage: "Bild hinzufügen",
    publish: "Lokale Vorschau veröffentlichen",
    close: "Schließen",
    comment: "Kommentare",
    commentPlaceholder: "Einloggen, um zu kommentieren…",
    commentPlaceholderAuthed: "Leisen Kommentar hinzufügen…",
    noComments: "Noch keine sichtbaren Kommentare.",
    reply: "Antworten",
    replies: "Antworten",
    postComment: "Kommentar posten",
    copied: "Verschlüsseltes Signal kopiert.",
    pending: "Lokales Signal erstellt. Manuelle Moderation wird später benötigt.",
    openComposer: "Square-Signal erstellen",
    rightTitle: "Live board",
    rightOne: "Drop-Signale",
    rightTwo: "Archiv-Rätsel",
    rightThree: "Rewards nach Wallet Access",
    locked: "Bis zur Wallet-Verbindung gesperrt",
    loginRequired: "Login erforderlich, bevor du in Square postest.",
    commentLocked: "Kommentare werden nach Login freigeschaltet.",
    modalKicker: "VELMÈRE / SIGNAL-THREAD",
    rooms: { drop: "Drop-Quest", style: "Style-Arena", archive: "Archiv-Rätsel", chat: "Member-Chat" },
  },
} as const;

function postLink(locale: string, post: SquarePost) {
  if (typeof window === "undefined") return `/${locale}/square#${post.slug}`;
  return `${window.location.origin}/${locale}/square#${post.slug}`;
}

function shortAddress(address?: string) {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function VelmereSquareClient() {
  const t = useTranslations("Square");
  const locale = useLocale() as "pl" | "en" | "de";
  const text = copy[locale] ?? copy.en;
  const walletUi = useWalletUiStore();
  const { authenticated } = useVelmereAuth();

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [viewBoosts, setViewBoosts] = useState<Record<string, number>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, SquareComment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [composer, setComposer] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);

  const seedPosts = useMemo<SquarePost[]>(() => seedPostKeys.map((key, index) => ({
    id: key,
    slug: key,
    authorName: t(`posts.${key}.authorName`),
    authorHandle: t(`posts.${key}.authorHandle`),
    authorType: t(`posts.${key}.authorType`) as SquarePost["authorType"],
    locale,
    title: t(`posts.${key}.title`),
    body: t(`posts.${key}.body`),
    imageUrl: index === 1
      ? "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80"
      : index === 3
        ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80"
        : undefined,
    tags: t.raw(`posts.${key}.tags`) as string[],
    views: Number(t(`posts.${key}.views`)),
    likes: Number(t(`posts.${key}.likes`)),
    commentsCount: Number(t(`posts.${key}.commentsCount`)),
    createdAt: t(`posts.${key}.createdAt`),
    moderationStatus: "approved",
    comments: [],
  })), [locale, t]);

  const { data, mutate, isLoading } = useSquarePosts(locale, seedPosts);
  const posts = data?.posts ?? seedPosts;
  const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null;
  const selectedComments = selectedPost ? [...(selectedPost.comments ?? []), ...(commentsByPost[selectedPost.id] ?? [])] : [];

  useEffect(() => {
    const closePanels = () => {
      setComposerOpen(false);
      setSelectedPostId(null);
    };
    window.addEventListener("velmere:close-square-panels", closePanels);
    return () => window.removeEventListener("velmere:close-square-panels", closePanels);
  }, []);

  useEffect(() => {
    if (!selectedPostId && !composerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedPostId, composerOpen]);

  function showToast(message: string, duration = 2600) {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), duration);
  }

  function openComposer() {
    navigator.vibrate?.(30);
    if (!authenticated) {
      showToast(text.loginRequired);
      return;
    }
    window.dispatchEvent(new Event("velmere:close-angel"));
    setSelectedPostId(null);
    setComposerOpen(true);
  }

  async function submitLocalPost() {
    const body = composer.trim();
    if (!body) return;
    navigator.vibrate?.(40);
    const optimisticPost: SquarePost = {
      id: `local-${Date.now()}`,
      slug: `local-${Date.now()}`,
      authorName: t("composer.localAuthor"),
      authorHandle: "@local-preview",
      authorType: "community",
      locale,
      title: t("composer.localTitle"),
      body,
      imageUrl: imagePreview || undefined,
      tags: [t("tags.community"), t("tags.pending")],
      views: 1,
      likes: 0,
      commentsCount: 0,
      createdAt: t("composer.justNow"),
      moderationStatus: "pending",
      comments: [],
    };

    setComposer("");
    setImagePreview("");
    setComposerOpen(false);
    showToast(text.pending);

    await mutate(
      createSquarePostRequest({
        locale,
        title: optimisticPost.title,
        body,
        authorName: optimisticPost.authorName,
        authorHandle: optimisticPost.authorHandle,
        imageUrl: optimisticPost.imageUrl,
        tags: optimisticPost.tags,
      }).then((result) => ({ posts: [result.post, ...posts], source: result.source })),
      {
        optimisticData: { posts: [optimisticPost, ...posts], source: data?.source ?? "mock" },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      },
    );
  }

  function handleImage(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function openPost(post: SquarePost) {
    navigator.vibrate?.(30);
    window.dispatchEvent(new Event("velmere:close-angel"));
    setComposerOpen(false);
    setSelectedPostId(post.id);
    setViewBoosts((current) => ({ ...current, [post.id]: (current[post.id] ?? 0) + 1 }));
  }

  async function addComment(postId: string) {
    if (!authenticated) {
      showToast(text.commentLocked);
      return;
    }
    const body = (commentDrafts[postId] ?? "").trim();
    if (!body) return;
    navigator.vibrate?.(35);
    const optimisticComment: SquareComment = { id: `comment-${Date.now()}`, authorName: t("composer.localAuthor"), body, createdAt: t("composer.justNow"), moderationStatus: "pending" };
    setCommentsByPost((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), optimisticComment],
    }));
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));

    try {
      const response = await fetch("/api/square/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body, authorName: optimisticComment.authorName }),
      });
      if (!response.ok) throw new Error("comment failed");
    } catch {
      showToast(text.pending, 1800);
    }
  }

  async function sharePost(post: SquarePost) {
    try {
      await navigator.clipboard.writeText(postLink(locale, post));
      showToast(text.copied, 1800);
    } catch {
      showToast(postLink(locale, post), 2600);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#0A0A0C] pb-28 pt-24 text-[#FFFFF0]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_8%_18%,rgba(212,175,55,0.065),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.04),transparent_25%)]" />
      <div className="relative z-[1] mx-auto grid w-full max-w-none gap-5 px-4 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)_20rem] xl:px-10 2xl:px-16">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[1.25rem] border border-[#d4af37]/20 bg-[#1A1A1C] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.28em] text-[#d4af37]">{text.os}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white">Velmère Square</h2>
            <p className="mt-4 text-sm leading-7 text-white/62">{text.intro}</p>
          </section>
          <section className="rounded-[1.25rem] border border-white/10 bg-[#1A1A1C] p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#d4af37]" />
              <p className="text-xs font-semibold leading-6 text-white/68">{text.walletGate}</p>
            </div>
            {!authenticated ? (
              <Link href="/login" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/12 px-4 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#d4af37] transition hover:bg-[#d4af37]/18 active:scale-95">
                <Wallet className="h-4 w-4" /> {text.connect}
              </Link>
            ) : null}
          </section>
          <section className="rounded-[1.25rem] border border-white/10 bg-[#1A1A1C] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-white/38">{text.map}</p>
            <div className="mt-5 space-y-4">
              {roomItems.map(({ key, icon: Icon, progress }) => (
                <div key={key} className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/18 bg-[#d4af37]/8 text-[#d4af37]"><Icon className="h-4 w-4" /></span>
                  <div>
                    <p className="text-xs font-semibold text-white/56">{text.rooms[key]}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8"><span className="block h-full rounded-full bg-[#d4af37]/55" style={{ width: `${progress}%` }} /></div>
                  </div>
                  <span className="text-white/22">⌁</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0 space-y-4 lg:pt-4">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 30 }} className="rounded-[1.5rem] border border-white/10 bg-[#1A1A1C] p-5 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-sans text-[10px] font-black uppercase tracking-[0.28em] text-[#d4af37]">Community</p>
                <h1 className="mt-4 font-serif text-5xl leading-none text-white md:text-6xl">Velmère Square</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66">{text.intro}</p>
              </div>
              <button type="button" onClick={openComposer} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#d4af37]/28 bg-[#d4af37]/10 px-5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#d4af37] transition hover:bg-[#d4af37]/16 active:scale-95">
                <Plus className="h-4 w-4" /> {text.openComposer}
              </button>
            </div>
          </motion.div>

          {isLoading ? <div className="grid gap-4">{[0, 1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-xl border border-white/8 bg-white/[0.035]" />)}</div> : null}

          <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="space-y-4">
            {posts.map((post) => {
              const comments = [...(post.comments ?? []), ...(commentsByPost[post.id] ?? [])];
              const views = post.views + (viewBoosts[post.id] ?? 0);
              return (
                <motion.article key={post.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ type: "spring", stiffness: 300, damping: 30 }} id={`square-${post.id}`} className="group overflow-hidden rounded-xl border border-white/5 bg-[#1A1A1C] shadow-[0_26px_90px_rgba(0,0,0,0.34)] transition-colors hover:border-white/10">
                  <button type="button" onClick={() => openPost(post)} className="block w-full p-5 text-left transition hover:bg-white/[0.018] active:scale-[0.995] md:p-6">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] font-serif text-xl text-white">{post.authorName.slice(0, 1)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/85">{post.authorName}</span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{post.authorHandle}</span>
                          <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[#d4af37]">{post.moderationStatus}</span>
                          <LiveTimestamp seed={`${post.id}-${post.createdAt}`} className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30" />
                        </div>
                        <h3 className="mt-4 font-serif text-2xl leading-tight text-white md:text-[2rem]">{post.title}</h3>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">{post.body}</p>
                        <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/42">{tag}</span>)}</div>
                      </div>
                    </div>
                  </button>
                  {post.imageUrl ? <button type="button" onClick={() => openPost(post)} className="relative mx-5 mb-5 block aspect-[16/6] w-[calc(100%-2.5rem)] overflow-hidden rounded-[1rem] border border-white/10 md:mx-6 md:w-[calc(100%-3rem)]"><Image src={post.imageUrl} alt={post.title} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105" /></button> : null}
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/45 md:px-6">
                    <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{views}</span>
                    <button type="button" onClick={() => { navigator.vibrate?.(40); setLiked((current) => ({ ...current, [post.id]: !current[post.id] })); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 transition hover:bg-white/[0.04] active:scale-95"><Heart className={`h-3.5 w-3.5 ${liked[post.id] ? "fill-[#d4af37] text-[#d4af37]" : ""}`} />{post.likes + (liked[post.id] ? 1 : 0)}</button>
                    <button type="button" onClick={() => openPost(post)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 transition hover:bg-white/[0.04] active:scale-95"><MessageCircle className="h-3.5 w-3.5" />{post.commentsCount + comments.length}</button>
                    <button type="button" onClick={() => void sharePost(post)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 transition hover:bg-white/[0.04] active:scale-95"><Share2 className="h-3.5 w-3.5" />{t("share")}</button>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[1.25rem] border border-white/10 bg-[#1A1A1C] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#d4af37]">{text.guest}</p>
            <p className="mt-3 text-sm leading-7 text-white/56">{authenticated ? (walletUi.connected ? `${shortAddress(walletUi.fullAddress)} · ${walletUi.tokenBalanceLabel || "EVM"}` : "Signed in · wallet optional") : text.guestBody}</p>
          </section>
          <section className="rounded-[1.25rem] border border-white/10 bg-[#1A1A1C] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-white/38">{text.rightTitle}</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/58">
              <p className="flex gap-3"><Bell className="mt-1 h-4 w-4 text-[#d4af37]" />{text.rightOne}</p>
              <p className="flex gap-3"><Users className="mt-1 h-4 w-4 text-[#d4af37]" />{text.rightTwo}</p>
              <p className="flex gap-3"><Award className="mt-1 h-4 w-4 text-[#d4af37]" />{text.rightThree}</p>
            </div>
          </section>
        </aside>
      </div>

      <button type="button" onClick={openComposer} aria-label={text.openComposer} className="fixed right-3 top-1/2 z-[140] flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-[1.35rem] border border-[#d4af37]/35 bg-black/90 text-[#d4af37] shadow-[0_0_70px_rgba(212,175,55,0.26)] backdrop-blur-2xl luxury-hover hover:scale-[1.02] active:scale-95 md:right-6">
        <Plus className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {selectedPost ? (
          <motion.div className="fixed inset-0 z-[150] bg-black/72 p-3 pt-24 backdrop-blur-xl md:p-6 md:pt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPostId(null)} role="dialog" aria-modal="true">
            <motion.section initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ type: "spring", stiffness: 260, damping: 30 }} onClick={(event) => event.stopPropagation()} className="mx-auto grid h-[calc(100dvh-7rem)] w-full max-w-[86rem] overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#19191B] shadow-[0_42px_160px_rgba(0,0,0,0.88)] lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.72fr)]">
              <div className="min-h-0 overflow-y-auto border-white/10 p-5 md:p-7 lg:border-r">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#d4af37]">{text.modalKicker}</p>
                <div className="mt-5 flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] font-serif text-2xl text-white">{selectedPost.authorName.slice(0, 1)}</span>
                  <div>
                    <p className="text-sm font-semibold text-white/86">{selectedPost.authorName} <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{selectedPost.authorHandle}</span></p>
                    <LiveTimestamp seed={`modal-${selectedPost.id}-${selectedPost.createdAt}`} className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/30" />
                  </div>
                </div>
                <h2 className="mt-8 font-serif text-4xl leading-tight text-white md:text-6xl">{selectedPost.title}</h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/66">{selectedPost.body}</p>
                {selectedPost.imageUrl ? <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-[1.25rem] border border-white/10"><Image src={selectedPost.imageUrl} alt={selectedPost.title} fill sizes="(min-width: 1024px) 820px, 100vw" className="object-cover grayscale contrast-125" /></div> : null}
                <div className="mt-6 flex flex-wrap gap-2">{selectedPost.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/42">{tag}</span>)}</div>
              </div>
              <div className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
                  <div>
                    <p className="font-serif text-2xl text-white">{text.comment}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/34">{selectedComments.length + selectedPost.commentsCount} signals</p>
                  </div>
                  <button type="button" onClick={() => setSelectedPostId(null)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55 transition hover:text-white active:scale-95" aria-label={text.close}><X className="h-4 w-4" /></button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
                  <CommentThread
                    comments={selectedComments}
                    draft={commentDrafts[selectedPost.id] ?? ""}
                    onDraftChange={(value) => setCommentDrafts((current) => ({ ...current, [selectedPost.id]: value }))}
                    onSubmit={() => void addComment(selectedPost.id)}
                    labels={{ title: text.comment, placeholder: authenticated ? text.commentPlaceholderAuthed : text.commentPlaceholder, post: text.postComment, reply: text.reply, replies: text.replies, empty: text.noComments }}
                  />
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {composerOpen ? (
          <motion.aside initial={{ x: "105%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "105%", opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-x-3 top-24 z-[160] flex max-h-[calc(100dvh-7rem)] flex-col rounded-[1.35rem] border border-white/12 bg-[#1A1A1C] p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-[0_32px_120px_rgba(0,0,0,0.88)] overscroll-contain md:bottom-4 md:left-auto md:right-4 md:w-[min(34rem,calc(100vw-2rem))]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <p className="font-serif text-2xl text-white">{text.composer}</p>
              <button type="button" onClick={() => setComposerOpen(false)} className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <textarea value={composer} onChange={(event) => setComposer(event.target.value)} placeholder={text.placeholder} className="mt-5 min-h-44 resize-none rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 text-sm leading-7 text-white outline-none placeholder:text-white/26 focus:border-[#d4af37]/30" />
            {imagePreview ? <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-white/10"><Image src={imagePreview} alt="" fill className="object-cover" /></div> : null}
            <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-[10px] font-black uppercase tracking-[0.16em] text-white/58 hover:text-white">
                <ImagePlus className="h-4 w-4" /> {text.addImage}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImage(event.target.files?.[0])} />
              </label>
              <button type="button" onClick={() => void submitLocalPost()} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#F5F0E8] px-5 text-[10px] font-black uppercase tracking-[0.16em] text-black transition-transform hover:bg-white active:scale-95">
                <Send className="h-4 w-4" /> {text.publish}
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>{toast ? <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+5.75rem)] z-[260] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-red-500/30 bg-[#241111]/95 px-5 py-3 text-center font-mono text-[10px] font-black uppercase tracking-[0.12em] text-red-200 shadow-[0_22px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">{toast}</motion.div> : null}</AnimatePresence>
    </main>
  );
}
