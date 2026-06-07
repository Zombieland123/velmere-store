"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CircleAlert, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  UnifiedAuditEvidence,
  UnifiedAuditLocale,
  UnifiedAuditMode,
} from "@/lib/market-integrity/unified-audit";

const durationByMode: Record<UnifiedAuditMode, number> = {
  basic: 5200,
  pro: 7000,
  advanced: 9000,
};

const paletteByMode = {
  basic: {
    core: 0xd4af55,
    nodes: 0xffe2a0,
    lines: 0xb8862f,
    css: "#d4af55",
    glow: "rgba(212,175,85,0.32)",
  },
  pro: {
    core: 0xb16cff,
    nodes: 0xe2bfff,
    lines: 0x7b43c8,
    css: "#b16cff",
    glow: "rgba(177,108,255,0.32)",
  },
  advanced: {
    core: 0x62d9ff,
    nodes: 0xa8efff,
    lines: 0x168fff,
    css: "#62d9ff",
    glow: "rgba(35,190,255,0.32)",
  },
} as const;

const copy = {
  pl: {
    title: "Velmère Neural Audit",
    collecting: "Porządkowanie źródeł i sygnałów",
    resolving: "Budowanie pola dowodowego",
    complete: "Pole audytu",
    close: "Zamknij",
    remaining: "Szacowany czas",
    seconds: "s",
    evidence: "sygnałów",
    sourceBound: "wynik oparty na przekazanych źródłach",
    confidence: "skalibrowana pewność",
    coverage: "pokrycie dowodów",
    verified: "potwierdzone",
    review: "do weryfikacji",
    missing: "brak źródła",
    stages: ["Tożsamość", "Cena i świece", "Luki i źródła", "Pole audytu"],
    modePromise: {
      basic: "10 najważniejszych pól: cena, kapitalizacja, 24h, wolumen, źródło i pewność.",
      pro: "14 pól z dynamiką 1h/7d, FDV, świecami, drugim źródłem i lukami dowodowymi.",
      advanced: "20 pól pełnego audytu: płynność, slippage, podaż, koncentracja, venue health, lineage i nietypowe anomalie.",
    },
  },
  de: {
    title: "Velmère Neural Audit",
    collecting: "Quellen und Signale werden geordnet",
    resolving: "Evidenzfeld wird aufgebaut",
    complete: "Audit-Feld",
    close: "Schließen",
    remaining: "Geschätzte Zeit",
    seconds: "s",
    evidence: "Signale",
    sourceBound: "Ergebnis aus den übergebenen Quellen",
    confidence: "kalibrierte Konfidenz",
    coverage: "Evidenzabdeckung",
    verified: "bestätigt",
    review: "zu prüfen",
    missing: "Quelle fehlt",
    stages: ["Identität", "Preis und Kerzen", "Lücken und Quellen", "Audit-Feld"],
    modePromise: {
      basic: "10 Kernfelder: Preis, Market Cap, 24h, Volumen, Quelle und Konfidenz.",
      pro: "14 Felder mit 1h/7d-Dynamik, FDV, Kerzen, Zweitquelle und Evidenzlücken.",
      advanced: "20 Felder im Voll-Audit: Liquidität, Slippage, Angebot, Konzentration, Venue Health, Lineage und ungewöhnliche Anomalien.",
    },
  },
  en: {
    title: "Velmère Neural Audit",
    collecting: "Organizing sources and signals",
    resolving: "Building the evidence field",
    complete: "Audit field",
    close: "Close",
    remaining: "Estimated time",
    seconds: "s",
    evidence: "signals",
    sourceBound: "result bound to supplied sources",
    confidence: "calibrated confidence",
    coverage: "evidence coverage",
    verified: "verified",
    review: "review",
    missing: "source missing",
    stages: ["Identity", "Price and candles", "Gaps and sources", "Audit field"],
    modePromise: {
      basic: "10 essential fields: price, market cap, 24h move, volume, source and confidence.",
      pro: "14 fields with 1h/7d dynamics, FDV, candles, second source and evidence gaps.",
      advanced: "20 full-audit fields: liquidity, slippage, supply, concentration, venue health, lineage and unusual anomalies.",
    },
  },
} as const;

function NeuralScene({
  symbol,
  mode,
  progress,
}: {
  symbol: string;
  mode: UnifiedAuditMode;
  progress: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const palette = paletteByMode[mode];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let frame = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let observer: ResizeObserver | null = null;
    let disposeScene = () => {};

    void import("three").then((THREE) => {
      if (disposed || !host) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 5.8;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      const root = new THREE.Group();
      scene.add(root);
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.02, 2),
        new THREE.MeshBasicMaterial({
          color: palette.core,
          wireframe: true,
          transparent: true,
          opacity: 0.32,
        }),
      );
      root.add(core);

      const nodeCount = mode === "advanced" ? 92 : mode === "pro" ? 68 : 48;
      const positions = new Float32Array(nodeCount * 3);
      const points: import("three").Vector3[] = [];
      for (let index = 0; index < nodeCount; index += 1) {
        const side = index % 2 === 0 ? -1 : 1;
        const theta = (index / nodeCount) * Math.PI * 9.5;
        const radius = 0.72 + ((index * 17) % 23) / 50;
        const point = new THREE.Vector3(
          side * (0.26 + Math.abs(Math.cos(theta)) * radius),
          Math.sin(theta * 0.72) * 0.94,
          Math.cos(theta * 0.43) * 0.72,
        );
        points.push(point);
        positions[index * 3] = point.x;
        positions[index * 3 + 1] = point.y;
        positions[index * 3 + 2] = point.z;
      }
      const pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pointCloud = new THREE.Points(
        pointGeometry,
        new THREE.PointsMaterial({
          color: palette.nodes,
          size: 0.045,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        }),
      );
      root.add(pointCloud);

      const segments: number[] = [];
      points.forEach((point, index) => {
        const next = points[(index * 7 + 11) % points.length];
        if (point.distanceTo(next) > 1.7) return;
        segments.push(point.x, point.y, point.z, next.x, next.y, next.z);
      });
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(segments, 3));
      const lines = new THREE.LineSegments(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: palette.lines,
          transparent: true,
          opacity: 0.26,
          blending: THREE.AdditiveBlending,
        }),
      );
      root.add(lines);

      const packetCount = mode === "advanced" ? 16 : mode === "pro" ? 11 : 8;
      const packetGeometry = new THREE.SphereGeometry(0.035, 8, 8);
      const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const packets = Array.from({ length: packetCount }, (_, index) => {
        const mesh = new THREE.Mesh(packetGeometry, packetMaterial);
        root.add(mesh);
        return { mesh, from: points[(index * 9) % points.length], phase: index / packetCount };
      });

      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer?.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(host);
      disposeScene = () => {
        core.geometry.dispose();
        core.material.dispose();
        pointGeometry.dispose();
        pointCloud.material.dispose();
        lineGeometry.dispose();
        lines.material.dispose();
        packetGeometry.dispose();
        packetMaterial.dispose();
      };
      const started = performance.now();
      const animate = (time: number) => {
        if (disposed || !renderer) return;
        const elapsed = (time - started) / 1000;
        if (!reducedMotion) {
          root.rotation.y = elapsed * 0.12;
          root.rotation.x = Math.sin(elapsed * 0.22) * 0.08;
          core.rotation.x = elapsed * 0.16;
          core.rotation.z = -elapsed * 0.11;
        }
        packets.forEach((packet) => {
          const local = (elapsed * 0.22 + packet.phase) % 1;
          packet.mesh.position.copy(packet.from).multiplyScalar(1 - local);
          packet.mesh.scale.setScalar(0.55 + Math.sin(local * Math.PI) * 0.8);
        });
        renderer.render(scene, camera);
        frame = window.requestAnimationFrame(animate);
      };
      frame = window.requestAnimationFrame(animate);

    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      disposeScene();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [mode, palette, reducedMotion, symbol]);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[620px]"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div
          className="grid h-28 w-28 place-items-center rounded-full border bg-black/[0.72]"
          style={{ borderColor: `${palette.css}66`, boxShadow: `0 0 80px ${palette.glow}` }}
        >
          <span className="font-mono text-2xl font-semibold tracking-[0.14em] text-white">VLM</span>
          <span className="-mt-8 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: palette.css }}>{symbol}</span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-[12%] bottom-[7%] h-px bg-white/[0.08]">
        <span className="block h-full transition-[width] duration-300" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${palette.css}, #ffffff)` }} />
      </div>
    </div>
  );
}

export default function VlmNeuralAuditExperience({
  locale,
  mode,
  symbol,
  name,
  evidence,
  onClose,
}: {
  locale: UnifiedAuditLocale;
  mode: UnifiedAuditMode;
  symbol: string;
  name: string;
  evidence: UnifiedAuditEvidence[];
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const c = copy[locale];
  const duration = reducedMotion ? 600 : durationByMode[mode];
  const [elapsed, setElapsed] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const started = performance.now();
    const timer = window.setInterval(() => {
      const next = performance.now() - started;
      setElapsed(Math.min(duration, next));
      if (next >= duration) {
        window.clearInterval(timer);
        window.setTimeout(() => setComplete(true), reducedMotion ? 0 : 420);
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [duration, reducedMotion]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const progress = Math.min(100, Math.round((elapsed / duration) * 100));
  const activeStage = Math.min(c.stages.length - 1, Math.floor((progress / 100) * c.stages.length));
  const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
  const visibleEvidence = useMemo(() => evidence, [evidence]);
  const auditSummary = useMemo(() => {
    const verified = visibleEvidence.filter((item) => item.status === "verified").length;
    const review = visibleEvidence.filter((item) => item.status === "review").length;
    const missing = visibleEvidence.filter((item) => item.status === "missing").length;
    const coverage = visibleEvidence.length
      ? Math.round(((verified + review * 0.55) / visibleEvidence.length) * 100)
      : 0;
    const confidenceItem = visibleEvidence.find((item) => item.id === "confidence");
    const coverageItem = visibleEvidence.find((item) => item.id === "coverage");
    const confidence = confidenceItem?.value.match(/\d+/)?.[0] ?? "—";
    const calibratedCoverage = coverageItem?.value.match(/\d+/)?.[0] ?? String(coverage);
    return { verified, review, missing, coverage: calibratedCoverage, confidence };
  }, [visibleEvidence]);

  return (
    <div
      className="fixed inset-0 overflow-y-auto overscroll-contain bg-[#020708]/[0.97] text-white backdrop-blur-2xl" data-pass447-neural-scroll-lock="true" data-pass450-tiered-human-field="true"
      style={{ zIndex: 2_000_010 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,148,255,0.16),transparent_31%),linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:auto,48px_48px,48px_48px]" />
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.08] bg-[#020708]/[0.82] px-5 py-4 backdrop-blur-xl md:px-8">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200">{c.title} · {mode}</p>
          <h2 className="mt-1 text-lg font-semibold">{symbol} · {name}</h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/[0.68]" aria-label={c.close}>
          <X className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence mode="wait">
        {!complete ? (
          <motion.main
            key="collect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(14px)" }}
            transition={{ duration: reducedMotion ? 0 : 0.55 }}
            className="relative mx-auto flex min-h-[calc(100vh-78px)] max-w-7xl flex-col items-center justify-center px-5 py-8"
          >
            <NeuralScene symbol={symbol} mode={mode} progress={progress} />
            <div className="relative -mt-8 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/[0.78]">{progress < 88 ? c.collecting : c.resolving}</p>
              <p className="mt-3 text-sm text-white/[0.46]">{visibleEvidence.length} {c.evidence} · {c.sourceBound}</p>
              <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-white/[0.38]">{c.modePromise[mode]}</p>
            </div>
            <div className="relative mt-7 flex items-center gap-3 rounded-full border border-cyan-200/[0.13] bg-cyan-300/[0.045] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-100/[0.72]">
              {c.remaining}: {remaining} {c.seconds}
            </div>
            <div className="relative mt-4 grid w-full max-w-3xl gap-2 sm:grid-cols-4">
              {c.stages.map((stage, index) => (
                <span key={stage} className={`rounded-2xl border px-3 py-2 text-center font-mono text-[8px] uppercase tracking-[0.13em] transition ${index <= activeStage ? "border-cyan-200/[0.30] bg-cyan-300/[0.08] text-cyan-100" : "border-white/[0.08] bg-white/[0.025] text-white/[0.32]"}`}>
                  {String(index + 1).padStart(2, "0")} · {stage}
                </span>
              ))}
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="field"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.6 }}
            className="relative mx-auto max-w-7xl px-5 py-8 md:px-8"
          >
            <div className="mb-7 flex flex-col gap-4 border-b border-cyan-200/[0.13] pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200">{c.complete}</p>
                <h3 className="mt-2 font-serif text-4xl tracking-[-0.045em] md:text-6xl">{symbol} · {c.complete}</h3>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/[0.48]">{c.modePromise[mode]} {c.sourceBound}. {visibleEvidence.length} {c.evidence}.</p>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [c.confidence, auditSummary.confidence === "—" ? "—" : `${auditSummary.confidence}%`],
                [c.coverage, `${auditSummary.coverage}%`],
                [c.verified, String(auditSummary.verified)],
                [`${c.review} / ${c.missing}`, `${auditSummary.review} / ${auditSummary.missing}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.2rem] border border-white/[0.08] bg-white/[0.025] p-4">
                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/[0.34]">{label}</span>
                  <strong className="mt-2 block text-xl text-white/[0.88]">{value}</strong>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-black/[0.28]">
              {visibleEvidence.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reducedMotion ? 0 : Math.min(index * 0.035, 0.5) }}
                  className="grid gap-3 border-b border-white/[0.07] px-5 py-4 last:border-b-0 md:grid-cols-[3rem_minmax(10rem,.72fr)_minmax(9rem,.55fr)_minmax(0,1.3fr)] md:items-center"
                >
                  <span className="font-mono text-[9px] text-white/[0.28]">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="text-sm text-white/[0.82]">{item.label}</strong>
                  <span className="break-words font-mono text-xs leading-5 text-cyan-100/[0.78]">{String(item.value)}</span>
                  <span className="flex items-start gap-2 text-xs leading-6 text-white/[0.43]">
                    {item.status === "verified" ? <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" /> : <CircleAlert className={`mt-1 h-3.5 w-3.5 shrink-0 ${item.status === "missing" ? "text-rose-300" : "text-amber-300"}`} />}
                    {String(item.note)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
