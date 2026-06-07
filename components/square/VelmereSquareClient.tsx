"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
import {
  createSquarePostRequest,
  useSquarePosts,
} from "@/lib/hooks/useSquarePosts";
import { useVelmereAuth } from "@/components/auth/AuthGate";
import { Link } from "@/navigation";

const seedPostKeys = ["official", "lookbook", "vlm", "community"] as const;

function BrowserPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

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
    intro:
      "A restrained public signal board. Read freely; publishing requires an account and moderation.",
    walletGate:
      "Log in to publish, comment and unlock member rooms. Guests can read the public feed.",
    guest: "Guest mode",
    guestBody:
      "Read public posts. Publishing, replies and member rooms unlock after login.",
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
    hotTitle: "Hot signals",
    postsToday: "Posts today",
    hotSignals: "Hot signals",
    commentsToday: "Comments today",
    trending: "Trending now",
    locked: "Locked until wallet connection",
    loginRequired: "Login required before publishing to Square.",
    commentLocked: "Comments unlock after login.",
    modalKicker: "VELMÈRE / SIGNAL THREAD",
    modesKicker: "Square operating lanes",
    modesTitle: "Community without chaos.",
    modesBody: "Square should feel like a curated signal room: readable public posts, protected publishing and calm moderation before anything becomes public.",
    modes: [
      { label: "Read", value: "public", body: "Guests can read public posts, drops and archive notes without wallet pressure." },
      { label: "Publish", value: "guarded", body: "Posting is account-gated and remains moderation-first so Square does not become spam." },
      { label: "Member rooms", value: "locked", body: "Private rooms, rewards and deeper community signals unlock only through verified access rails." },
    ],
    trustKicker: "trust and moderation",
    trustTitle: "Square needs signal, not noise.",
    trustBody: "Every public interaction should feel curated: no wallet pressure, no spam mechanics, no financial hype and no unsafe private-message funnels.",
    trustRails: [
      "Guest reading stays public and low-friction.",
      "Publishing stays account-gated and moderation-first.",
      "Member rooms stay access-gated and never ask for seed phrases.",
      "Market or token talk is routed to Shield language: anomaly, review, uncertainty.",
    ],
    rooms: {
      drop: "Drop quest",
      style: "Style arena",
      archive: "Archive riddle",
      chat: "Member chat",
    },
  },
  pl: {
    os: "COMMUNITY OS",
    map: "Mapa Square",
    intro:
      "Spokojna tablica publicznych sygnałów. Czytanie jest otwarte; publikacja wymaga konta i moderacji.",
    walletGate:
      "Zaloguj się, aby publikować, komentować i odblokować pokoje memberów. Goście mogą czytać feed.",
    guest: "Tryb gościa",
    guestBody:
      "Czytaj publiczne posty. Publikowanie, odpowiedzi i pokoje memberów odblokujesz po logowaniu.",
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
    pending:
      "Lokalny sygnał utworzony. Później wymagana będzie ręczna moderacja.",
    openComposer: "Utwórz sygnał Square",
    rightTitle: "Live board",
    rightOne: "Sygnały dropów",
    rightTwo: "Zagadki archiwum",
    rightThree: "Nagrody po dostępie wallet",
    hotTitle: "Gorące sygnały",
    postsToday: "Posty dzisiaj",
    hotSignals: "Gorące sygnały",
    commentsToday: "Komentarze dzisiaj",
    trending: "Popularne teraz",
    locked: "Zablokowane do połączenia portfela",
    loginRequired: "Logowanie jest wymagane przed publikacją w Square.",
    commentLocked: "Komentarze odblokujesz po logowaniu.",
    modalKicker: "VELMÈRE / WĄTEK SYGNAŁU",
    modesKicker: "tryby działania Square",
    modesTitle: "Społeczność bez chaosu.",
    modesBody: "Square ma działać jak kontrolowany pokój sygnałów: czytelne publiczne posty, chronione publikowanie i spokojna moderacja zanim coś stanie się publiczne.",
    modes: [
      { label: "Czytaj", value: "publiczne", body: "Goście mogą czytać publiczne posty, dropy i notatki archiwum bez presji podłączania portfela." },
      { label: "Publikuj", value: "kontrolowane", body: "Publikowanie wymaga konta i zostaje moderation-first, żeby Square nie zamieniło się w spam." },
      { label: "Pokoje memberów", value: "zablokowane", body: "Prywatne pokoje, nagrody i głębsze sygnały społeczności odblokowują się tylko przez zweryfikowany dostęp." },
    ],
    trustKicker: "zaufanie i moderacja",
    trustTitle: "Square potrzebuje sygnału, nie szumu.",
    trustBody: "Każda publiczna interakcja ma być kontrolowana: bez presji portfela, bez spamu, bez finansowego hype’u i bez niebezpiecznych przejść do prywatnych wiadomości.",
    trustRails: [
      "Czytanie dla gości zostaje publiczne i proste.",
      "Publikowanie zostaje account-gated i moderation-first.",
      "Pokoje memberów są access-gated i nigdy nie proszą o seed phrase.",
      "Rozmowy o rynku albo tokenach idą językiem Shield: anomalia, review, niepewność.",
    ],
    rooms: {
      drop: "Misja dropu",
      style: "Arena stylu",
      archive: "Zagadka archiwum",
      chat: "Czat memberów",
    },
  },
  de: {
    os: "COMMUNITY OS",
    map: "Square-Karte",
    intro:
      "Ein ruhiges öffentliches Signalboard. Lesen ist offen; Posten braucht Account und Moderation.",
    walletGate:
      "Einloggen, um zu posten, zu kommentieren und Member-Räume freizuschalten. Gäste können den öffentlichen Feed lesen.",
    guest: "Gastmodus",
    guestBody:
      "Öffentliche Posts lesen. Posting, Antworten und Räume werden nach Login freigeschaltet.",
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
    pending:
      "Lokales Signal erstellt. Manuelle Moderation wird später benötigt.",
    openComposer: "Square-Signal erstellen",
    rightTitle: "Live board",
    rightOne: "Drop-Signale",
    rightTwo: "Archiv-Rätsel",
    rightThree: "Rewards nach Wallet Access",
    hotTitle: "Heiße Signale",
    postsToday: "Posts heute",
    hotSignals: "Hot Signals",
    commentsToday: "Kommentare heute",
    trending: "Jetzt beliebt",
    locked: "Bis zur Wallet-Verbindung gesperrt",
    loginRequired: "Login erforderlich, bevor du in Square postest.",
    commentLocked: "Kommentare werden nach Login freigeschaltet.",
    modalKicker: "VELMÈRE / SIGNAL-THREAD",
    modesKicker: "Square Betriebsmodi",
    modesTitle: "Community ohne Chaos.",
    modesBody: "Square soll wie ein kuratierter Signalraum wirken: lesbare öffentliche Posts, geschütztes Publishing und ruhige Moderation, bevor etwas öffentlich wird.",
    modes: [
      { label: "Lesen", value: "öffentlich", body: "Gäste können öffentliche Posts, Drops und Archiv-Notizen ohne Wallet-Druck lesen." },
      { label: "Posten", value: "geschützt", body: "Publishing ist Account-gated und moderation-first, damit Square nicht zu Spam wird." },
      { label: "Member-Räume", value: "gesperrt", body: "Private Räume, Rewards und tiefere Community-Signale öffnen nur über verifizierte Access-Rails." },
    ],
    trustKicker: "Vertrauen und Moderation",
    trustTitle: "Square braucht Signal, nicht Lärm.",
    trustBody: "Jede öffentliche Interaktion soll kuratiert wirken: kein Wallet-Druck, keine Spam-Mechanik, kein Finanz-Hype und keine unsicheren DM-Funnels.",
    trustRails: [
      "Lesen für Gäste bleibt öffentlich und reibungslos.",
      "Publishing bleibt Account-gated und moderation-first.",
      "Member-Räume bleiben access-gated und fragen nie nach Seed Phrases.",
      "Markt- oder Token-Talk wird in Shield-Sprache geroutet: Anomalie, Review, Unsicherheit.",
    ],
    rooms: {
      drop: "Drop-Quest",
      style: "Style-Arena",
      archive: "Archiv-Rätsel",
      chat: "Member-Chat",
    },
  },
} as const;

const squareLaunchCopy = {
  en: {
    kicker: "Square launch routing",
    title: "Every post needs a lane before it becomes noise.",
    body: "The public feed stays readable, member access stays protected and token/market talk is routed into Shield language before it can create hype.",
    steps: [
      { label: "Public feed", value: "readable", body: "Approved posts, drops and archive notes stay visible without forcing a wallet connection." },
      { label: "Moderation queue", value: "manual", body: "New posts and comments can remain pending until rules, reports and rate limits are production wired." },
      { label: "Member rooms", value: "access gated", body: "Private rewards and deeper threads require verified account access, never seed phrases." },
      { label: "Shield routing", value: "safe language", body: "Risk or token claims are converted into anomaly/review/missing-source wording." },
    ],
    checklistTitle: "Square release checklist",
    checklist: [
      { label: "Guest reading", value: "ready" },
      { label: "Account publishing", value: "guarded" },
      { label: "Spam/rate limits", value: "next" },
      { label: "Member rooms", value: "locked" },
    ],
  },
  pl: {
    kicker: "routing startowy Square",
    title: "Każdy post musi mieć tor, zanim zrobi się szum.",
    body: "Feed publiczny zostaje czytelny, dostęp memberów jest chroniony, a rozmowy o tokenach/rynku przechodzą przez język Shield zanim stworzą hype.",
    steps: [
      { label: "Feed publiczny", value: "czytelny", body: "Zatwierdzone posty, dropy i notatki archiwum są widoczne bez wymuszania portfela." },
      { label: "Kolejka moderacji", value: "manualna", body: "Nowe posty i komentarze mogą zostać pending, dopóki reguły, zgłoszenia i limity nie są produkcyjnie podłączone." },
      { label: "Pokoje memberów", value: "access gated", body: "Prywatne nagrody i głębsze wątki wymagają zweryfikowanego konta, nigdy seed phrase." },
      { label: "Routing Shield", value: "bezpieczny język", body: "Ryzykowne lub tokenowe claimy są zmieniane w język: anomalia, review, brak źródła." },
    ],
    checklistTitle: "Checklist startu Square",
    checklist: [
      { label: "Czytanie gościa", value: "gotowe" },
      { label: "Publikacja konta", value: "chronione" },
      { label: "Spam/rate limit", value: "następne" },
      { label: "Pokoje memberów", value: "locked" },
    ],
  },
  de: {
    kicker: "Square Launch Routing",
    title: "Jeder Post braucht eine Spur, bevor er Lärm wird.",
    body: "Der öffentliche Feed bleibt lesbar, Member Access bleibt geschützt und Markt-/Token-Talk wird in Shield-Sprache geroutet, bevor Hype entsteht.",
    steps: [
      { label: "Public Feed", value: "lesbar", body: "Genehmigte Posts, Drops und Archiv-Notizen bleiben sichtbar, ohne Wallet-Verbindung zu erzwingen." },
      { label: "Moderationsqueue", value: "manuell", body: "Neue Posts und Kommentare können pending bleiben, bis Regeln, Reports und Rate Limits produktiv angebunden sind." },
      { label: "Member-Räume", value: "access gated", body: "Private Rewards und tiefere Threads brauchen verifizierten Account-Zugang, nie Seed Phrases." },
      { label: "Shield Routing", value: "sichere Sprache", body: "Riskante oder tokenbezogene Claims werden in Anomalie-, Review- und Missing-Source-Sprache übersetzt." },
    ],
    checklistTitle: "Square Release Checklist",
    checklist: [
      { label: "Gast-Lesen", value: "ready" },
      { label: "Account-Posting", value: "guarded" },
      { label: "Spam/Rate Limits", value: "next" },
      { label: "Member-Räume", value: "locked" },
    ],
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

export default function VelmereSquareClient({ publicTrim = "" }: { publicTrim?: string } = {}) {
  const t = useTranslations("Square");
  const locale = useLocale() as "pl" | "en" | "de";
  const text = copy[locale] ?? copy.en;
  const launchText = squareLaunchCopy[locale] ?? squareLaunchCopy.en;
  const walletUi = useWalletUiStore();
  const { authenticated } = useVelmereAuth();

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [viewBoosts, setViewBoosts] = useState<Record<string, number>>({});
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, SquareComment[]>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [composer, setComposer] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);

  const seedPosts = useMemo<SquarePost[]>(
    () =>
      seedPostKeys.map((key, index) => ({
        id: key,
        slug: key,
        authorName: t(`posts.${key}.authorName`),
        authorHandle: t(`posts.${key}.authorHandle`),
        authorType: t(`posts.${key}.authorType`) as SquarePost["authorType"],
        locale,
        title: t(`posts.${key}.title`),
        body: t(`posts.${key}.body`),
        imageUrl:
          index === 1
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
      })),
    [locale, t],
  );

  const { data, mutate, isLoading } = useSquarePosts(locale, seedPosts);
  const posts = data?.posts ?? seedPosts;
  const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null;
  const selectedComments = selectedPost
    ? [
        ...(selectedPost.comments ?? []),
        ...(commentsByPost[selectedPost.id] ?? []),
      ]
    : [];
  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount + (commentsByPost[post.id]?.length ?? 0), 0);
  const boostedViews = posts.reduce((sum, post) => sum + post.views + (viewBoosts[post.id] ?? 0), 0);
  const hotPosts = [...posts]
    .sort((a, b) => (b.likes + b.views + b.commentsCount * 12) - (a.likes + a.views + a.commentsCount * 12))
    .slice(0, 3);
  const squareStats = [
    { label: text.postsToday, value: posts.length, icon: MessageSquare },
    { label: text.hotSignals, value: boostedViews.toLocaleString(locale), icon: Eye },
    { label: text.commentsToday, value: totalComments, icon: MessageCircle },
  ];

  useEffect(() => {
    const closePanels = () => {
      setComposerOpen(false);
      setSelectedPostId(null);
    };
    window.addEventListener("velmere:close-square-panels", closePanels);
    return () => {
      window.removeEventListener("velmere:close-square-panels", closePanels);
    };
  }, []);

  useEffect(() => {
    if (!selectedPostId && !composerOpen) return;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
    };
  }, [selectedPostId, composerOpen]);


  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("velmere:angel-visibility", {
        detail: { hidden: Boolean(selectedPostId || composerOpen) },
      }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("velmere:angel-visibility", {
          detail: { hidden: false },
        }),
      );
    };
  }, [selectedPostId, composerOpen]);

  useEffect(() => {
    if (!selectedPostId && !composerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPostId(null);
        setComposerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
      }).then((result) => ({
        posts: [result.post, ...posts],
        source: result.source,
      })),
      {
        optimisticData: {
          posts: [optimisticPost, ...posts],
          source: data?.source ?? "mock",
        },
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
    setViewBoosts((current) => ({
      ...current,
      [post.id]: (current[post.id] ?? 0) + 1,
    }));
  }

  async function addComment(postId: string) {
    if (!authenticated) {
      showToast(text.commentLocked);
      return;
    }
    const body = (commentDrafts[postId] ?? "").trim();
    if (!body) return;
    navigator.vibrate?.(35);
    const optimisticComment: SquareComment = {
      id: `comment-${Date.now()}`,
      authorName: t("composer.localAuthor"),
      body,
      createdAt: t("composer.justNow"),
      moderationStatus: "pending",
    };
    setCommentsByPost((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), optimisticComment],
    }));
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));

    try {
      const response = await fetch("/api/square/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(window.localStorage.getItem("velmere:account-session") ===
          "active"
            ? { "x-velmere-preview-session": "active" }
            : {}),
        },
        body: JSON.stringify({ postId, body }),
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
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#0A0A0C] pb-28 pt-24 text-[#FFFFF0]" data-pass315-square-trim={publicTrim} data-pass318-public-storefront-focus="square">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_8%_18%,rgba(212,175,55,0.065),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.04),transparent_25%)]" />
      <div className="relative z-[1] mx-auto grid w-full max-w-none gap-5 px-4 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)_20rem] xl:px-10 2xl:px-16">
        <aside className="space-y-4 lg:self-start">
          <section className="rounded-[1.25rem] border border-[#d4af37]/[0.20] bg-[#1A1A1C] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.28em] text-[#d4af37]">
              {text.os}
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white">
              Velmère Square
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/[0.60]">{text.intro}</p>
          </section>
          <section className="rounded-[1.25rem] border border-white/[0.10] bg-[#1A1A1C] p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#d4af37]" />
              <p className="text-xs font-semibold leading-6 text-white/[0.70]">
                {text.walletGate}
              </p>
            </div>
            {!authenticated ? (
              <a
                href={`/${locale || "pl"}/login`}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d4af37]/[0.30] bg-[#d4af37]/[0.10] px-4 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#d4af37] transition hover:bg-[#d4af37]/[0.20] active:scale-95"
              >
                <Wallet className="h-4 w-4" /> {text.connect}
              </a>
            ) : null}
          </section>
          <section className="rounded-[1.25rem] border border-white/[0.10] bg-[#1A1A1C] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-white/[0.40]">
              {text.map}
            </p>
            <div className="mt-5 space-y-4">
              {roomItems.map(({ key, icon: Icon, progress }) => (
                <div
                  key={key}
                  className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/[0.20] bg-[#d4af37]/[0.08] text-[#d4af37]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white/[0.56]">
                      {text.rooms[key]}
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <span
                        className="block h-full rounded-full bg-[#d4af37]/[0.55]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white/[0.22]">⌁</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="rounded-[1.5rem] border border-white/[0.10] bg-[#1A1A1C] p-5 md:p-8"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-sans text-[10px] font-black uppercase tracking-[0.28em] text-[#d4af37]">
                  Community
                </p>
                <h1 className="mt-4 font-serif text-5xl leading-none text-white md:text-6xl">
                  Velmère Square
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.70]">
                  {text.intro}
                </p>
              </div>
              <button
                type="button"
                onClick={openComposer}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#d4af37]/[0.30] bg-[#d4af37]/[0.10] px-5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#d4af37] transition hover:bg-[#d4af37]/[0.16] active:scale-95"
              >
                <Plus className="h-4 w-4" /> {text.openComposer}
              </button>
            </div>
          </motion.div>

          <div className="pass315-square-feed-brief rounded-[1.35rem] border border-[#d4af37]/[0.14] bg-[#d4af37]/[0.045] p-4 md:p-5" data-pass315-square-public-brief="true">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[#d4af37]">Public Square</p>
            <p className="mt-2 text-sm leading-7 text-white/[0.62]">Czytaj spokojny feed dropów i notatek. Publikacja oraz pokoje memberów zostają zablokowane do czasu konta, moderacji i bezpiecznych reguł.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {squareStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-[1.25rem] border border-white/[0.10] bg-[#1A1A1C] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.26)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white/[0.36]">{label}</p>
                  <Icon className="h-4 w-4 text-[#d4af37]" />
                </div>
                <p className="mt-3 font-serif text-3xl leading-none text-white">{value}</p>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-xl border border-white/[0.08] bg-white/[0.035]"
                />
              ))}
            </div>
          ) : null}

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="space-y-4"
          >
            {posts.map((post) => {
              const comments = [
                ...(post.comments ?? []),
                ...(commentsByPost[post.id] ?? []),
              ];
              const views = post.views + (viewBoosts[post.id] ?? 0);
              return (
                <motion.article
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  id={`square-${post.id}`}
                  className="group overflow-hidden rounded-xl border border-white/[0.05] bg-[#1A1A1C] shadow-[0_26px_90px_rgba(0,0,0,0.34)] transition-colors hover:border-white/[0.10]"
                >
                  <button
                    type="button"
                    onClick={() => openPost(post)}
                    className="block w-full p-5 text-left transition hover:bg-white/[0.018] active:scale-[0.995] md:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] font-serif text-xl text-white">
                        {post.authorName.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/[0.85]">
                            {post.authorName}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/[0.40]">
                            {post.authorHandle}
                          </span>
                          <span className="rounded-full border border-[#d4af37]/[0.25] bg-[#d4af37]/[0.10] px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[#d4af37]">
                            {post.moderationStatus}
                          </span>
                          <LiveTimestamp
                            seed={`${post.id}-${post.createdAt}`}
                            className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.30]"
                          />
                        </div>
                        <h3 className="mt-4 font-serif text-2xl leading-tight text-white md:text-[2rem]">
                          {post.title}
                        </h3>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/[0.60]">
                          {post.body}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/[0.10] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/[0.40]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                  {post.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => openPost(post)}
                      className="relative mx-5 mb-5 block aspect-[16/6] w-[calc(100%-2.5rem)] overflow-hidden rounded-[1rem] border border-white/[0.10] md:mx-6 md:w-[calc(100%-3rem)]"
                    >
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 760px, 100vw"
                        className="object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
                      />
                    </button>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.10] px-5 py-3 text-xs text-white/[0.45] md:px-6">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {views}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.vibrate?.(40);
                        setLiked((current) => ({
                          ...current,
                          [post.id]: !current[post.id],
                        }));
                      }}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 transition hover:bg-white/[0.04] active:scale-95"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${liked[post.id] ? "fill-[#d4af37] text-[#d4af37]" : ""}`}
                      />
                      {post.likes + (liked[post.id] ? 1 : 0)}
                    </button>
                    <button
                      type="button"
                      onClick={() => openPost(post)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 transition hover:bg-white/[0.04] active:scale-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.commentsCount + comments.length}
                    </button>
                    <button
                      type="button"
                      onClick={() => void sharePost(post)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 transition hover:bg-white/[0.04] active:scale-95"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {t("share")}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </section>

        <aside className="space-y-4 lg:self-start">
          <section className="rounded-[1.25rem] border border-white/[0.10] bg-[#1A1A1C] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#d4af37]">
              {text.guest}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/[0.56]">
              {authenticated
                ? walletUi.connected
                  ? `${shortAddress(walletUi.fullAddress)} · ${walletUi.tokenBalanceLabel || "EVM"}`
                  : "Signed in · wallet optional"
                : text.guestBody}
            </p>
          </section>
          <section className="rounded-[1.25rem] border border-[#d4af37]/[0.18] bg-[linear-gradient(145deg,rgba(212,175,55,0.08),rgba(26,26,28,0.96))] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#d4af37]">
              {text.hotTitle}
            </p>
            <div className="mt-4 space-y-3">
              {hotPosts.map((post, index) => (
                <button key={post.id} type="button" onClick={() => openPost(post)} className="group w-full rounded-2xl border border-white/[0.10] bg-black/[0.22] p-3 text-left transition hover:border-[#d4af37]/[0.30] hover:bg-black/[0.34] active:scale-[0.99]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d4af37]">0{index + 1}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/[0.35]"><Heart className="h-3 w-3" />{post.likes}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-white/[0.72] group-hover:text-white">{post.title}</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.30]">{text.trending}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-white/[0.10] bg-[#1A1A1C] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-white/[0.40]">
              {text.rightTitle}
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/[0.60]">
              <p className="flex gap-3">
                <Bell className="mt-1 h-4 w-4 text-[#d4af37]" />
                {text.rightOne}
              </p>
              <p className="flex gap-3">
                <Users className="mt-1 h-4 w-4 text-[#d4af37]" />
                {text.rightTwo}
              </p>
              <p className="flex gap-3">
                <Award className="mt-1 h-4 w-4 text-[#d4af37]" />
                {text.rightThree}
              </p>
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-[#d4af37]/[0.16] bg-[#d4af37]/[0.035] p-5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#d4af37]">
              {launchText.checklistTitle}
            </p>
            <div className="mt-4 space-y-3">
              {launchText.checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.22] px-3 py-3">
                  <span className="text-xs font-semibold text-white/[0.58]">{item.label}</span>
                  <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.42]">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {!selectedPost && !composerOpen ? (
        <button
          type="button"
          onClick={openComposer}
          aria-label={text.openComposer}
          className="fixed right-3 top-1/2 z-[190] inline-flex h-14 -translate-y-1/2 items-center justify-center gap-2 rounded-l-full rounded-r-md border border-r-0 border-white/[0.10] bg-[#1A1A1C]/[0.95] px-4 text-[#d4af37] shadow-[0_18px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl luxury-hover hover:scale-[1.02] hover:border-[#d4af37]/[0.40] active:scale-95 md:right-0 md:h-16 md:px-5"
        >
          <Plus className="h-5 w-5" />
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.16em]">
            Square
          </span>
        </button>
      ) : null}

      <BrowserPortal>
      <AnimatePresence>
        {selectedPost ? (
          <motion.div
            className="fixed inset-0 z-[220] overflow-y-auto bg-black/[0.80] p-0 backdrop-blur-xl overscroll-contain sm:grid sm:place-items-center sm:p-3 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPostId(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.section
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="relative flex min-h-[100dvh] w-full flex-col overflow-visible rounded-none border border-white/[0.10] bg-[#19191B] shadow-[0_42px_160px_rgba(0,0,0,0.88)] sm:min-h-[calc(100dvh-1.5rem)] sm:max-w-[82rem] sm:rounded-[1.5rem] lg:grid lg:h-[min(86dvh,52rem)] lg:min-h-0 lg:overflow-hidden lg:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.72fr)]"
            >
              <button
                type="button"
                onClick={() => setSelectedPostId(null)}
                className="absolute right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-30 grid h-11 w-11 place-items-center rounded-full border border-white/[0.12] bg-[#19191B]/[0.88] text-white/[0.70] shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition hover:text-white active:scale-95 sm:right-4 sm:top-4"
                aria-label={text.close}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="border-white/[0.10] p-5 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:min-h-0 sm:overflow-y-auto sm:pt-7 md:p-7 lg:border-r">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#d4af37]">
                  {text.modalKicker}
                </p>
                <div className="mt-5 flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] font-serif text-2xl text-white">
                    {selectedPost.authorName.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/[0.86]">
                      {selectedPost.authorName}{" "}
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.40]">
                        {selectedPost.authorHandle}
                      </span>
                    </p>
                    <LiveTimestamp
                      seed={`modal-${selectedPost.id}-${selectedPost.createdAt}`}
                      className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.30]"
                    />
                  </div>
                </div>
                <h2 className="mt-8 font-serif text-4xl leading-tight text-white md:text-6xl">
                  {selectedPost.title}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/[0.70]">
                  {selectedPost.body}
                </p>
                {selectedPost.imageUrl ? (
                  <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-[1.25rem] border border-white/[0.10]">
                    <Image
                      src={selectedPost.imageUrl}
                      alt={selectedPost.title}
                      fill
                      sizes="(min-width: 1024px) 820px, 100vw"
                      className="object-cover grayscale contrast-125"
                    />
                  </div>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.10] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.40]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex min-h-[58dvh] flex-col border-t border-white/[0.10] lg:min-h-0 lg:border-t-0">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.10] p-5">
                  <div>
                    <p className="font-serif text-2xl text-white">
                      {text.comment}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.30]">
                      {selectedComments.length + selectedPost.commentsCount}{" "}
                      signals
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPostId(null)}
                    className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/[0.55] transition hover:text-white active:scale-95 sm:flex"
                    aria-label={text.close}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] luxury-scrollbar">
                  <CommentThread
                    comments={selectedComments}
                    draft={commentDrafts[selectedPost.id] ?? ""}
                    onDraftChange={(value) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [selectedPost.id]: value,
                      }))
                    }
                    onSubmit={() => void addComment(selectedPost.id)}
                    labels={{
                      title: text.comment,
                      placeholder: authenticated
                        ? text.commentPlaceholderAuthed
                        : text.commentPlaceholder,
                      post: text.postComment,
                      reply: text.reply,
                      replies: text.replies,
                      empty: text.noComments,
                    }}
                  />
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {composerOpen ? (
          <motion.aside
            initial={{ x: "105%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "105%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-3 top-24 z-[230] flex max-h-[calc(100dvh-7rem)] flex-col overflow-y-auto rounded-[1.35rem] border border-white/[0.10] bg-[#1A1A1C] p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-[0_32px_120px_rgba(0,0,0,0.88)] overscroll-contain md:bottom-4 md:left-auto md:right-4 md:w-[min(34rem,calc(100vw-2rem))]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.10] pb-4">
              <p className="font-serif text-2xl text-white">{text.composer}</p>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-full border border-white/[0.10] p-2 text-white/[0.60] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              placeholder={text.placeholder}
              className="mt-5 min-h-44 resize-none rounded-[1.25rem] border border-white/[0.10] bg-white/[0.035] p-4 text-sm leading-7 text-white outline-none placeholder:text-white/[0.25] focus:border-[#d4af37]/[0.30]"
            />
            {imagePreview ? (
              <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-white/[0.10]">
                <Image
                  src={imagePreview}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/[0.10] px-5 text-[10px] font-black uppercase tracking-[0.16em] text-white/[0.60] hover:text-white">
                <ImagePlus className="h-4 w-4" /> {text.addImage}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleImage(event.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => void submitLocalPost()}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#F5F0E8] px-5 text-[10px] font-black uppercase tracking-[0.16em] text-black transition-transform hover:bg-white active:scale-95"
              >
                <Send className="h-4 w-4" /> {text.publish}
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <div className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+5.75rem)] z-[260] w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto rounded-full border border-red-500/[0.30] bg-[#241111]/[0.95] px-5 py-3 text-center font-mono text-[10px] font-black uppercase tracking-[0.12em] text-red-200 shadow-[0_22px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            >
              {toast}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      </BrowserPortal>
    </main>
  );
}
