export type VelmereProjectProgressItem = {
  id: string;
  label: string;
  progress: number;
  status: "blocked" | "partial" | "solid" | "launch_control";
  next: string;
};

export const velmereProjectProgress: VelmereProjectProgressItem[] = [
  { id: "home", label: "Home / brand landing", progress: 61, status: "partial", next: "Tighten hero copy, mobile rhythm, launch CTA hierarchy and route-to-product clarity." },
  { id: "collection", label: "Clothing collection page", progress: 68, status: "solid", next: "Confirm final product media, provider mapping, stock states and checkout-disabled copy." },
  { id: "product-cards", label: "Product card system", progress: 73, status: "solid", next: "Replace snapshot placeholders with real provider source snapshots per SKU." },
  { id: "product-detail", label: "Product detail pages", progress: 73, status: "partial", next: "Wire real provider source snapshots and shipping-region proof per SKU." },
  { id: "checkout", label: "Checkout / fulfilment", progress: 50, status: "launch_control", next: "Keep checkout blocked until event ledger is persistent and payment/tax/order/refund flows are production wired." },
  { id: "payment-order-state", label: "Payment / order state", progress: 28, status: "blocked", next: "Persist order event ledger, idempotency keys, signed webhooks, tax calculation and transactional emails." },
  { id: "order-event-ledger", label: "Order event ledger", progress: 21, status: "blocked", next: "Persist event envelopes, idempotency keys, signed webhook verification and support timeline." },
  { id: "admin-route-gate", label: "Admin route gate", progress: 49, status: "blocked", next: "Choose real auth provider and enforce role/session/publish permissions server-side." },
  { id: "admin-server-auth", label: "Admin server auth contract", progress: 36, status: "blocked", next: "Choose auth provider and replace env previews with server session reader plus reauth policy." },
  { id: "admin-auth-session-guard", label: "Admin auth session guard", progress: 34, status: "blocked", next: "Implement real server session reader, role/scope map and fresh-session reauth checks." },
  { id: "admin-idempotency-store", label: "Admin idempotency store", progress: 31, status: "blocked", next: "Create persistent idempotency key storage, duplicate response policy and TTL cleanup." },
  { id: "publish-permission-gate", label: "Publish permission gate", progress: 39, status: "blocked", next: "Persist publish event envelope, rollback context and hard server-side checklist enforcement." },
  { id: "secret-redaction-policy", label: "Secret redaction policy", progress: 45, status: "blocked", next: "Apply redacted logger to admin/provider/payment logs and add provider response allowlist." },
  { id: "admin-mutation-audit", label: "Admin mutation audit", progress: 52, status: "blocked", next: "Implement server audit storage, auth-bound operator id and support-safe timeline persistence." },
  { id: "admin-audit-persistence", label: "Admin audit persistence", progress: 35, status: "blocked", next: "Connect locked audit write API route to durable database storage and auth-bound operator context." },
  { id: "admin-audit-write-api", label: "Admin audit write API", progress: 48, status: "blocked", next: "Wire route to real session middleware, persistent idempotency store and durable storage adapter." },
  { id: "customer-safe-export-boundary", label: "Customer-safe export boundary", progress: 41, status: "blocked", next: "Add approval workflow, customer-safe copy templates and export renderer." },
  { id: "publish-rollback-context", label: "Publish rollback context", progress: 28, status: "blocked", next: "Persist before/after product diff, rollback id and checklist snapshot for publish actions." },
  { id: "support-safe-timeline", label: "Support-safe timeline", progress: 43, status: "blocked", next: "Wire support timeline storage plus customer-safe export approval and renderer." },
  { id: "legal", label: "Shipping / returns / legal pages", progress: 72, status: "launch_control", next: "Finalize shipping regions, return exceptions, refund flow and merchant/legal review." },
  { id: "vlm-access", label: "VLM token / access layer", progress: 57, status: "launch_control", next: "Keep utility-only wording, add session gating, contract/audit status and no price-promise language." },
  { id: "square", label: "Velmère Square / community", progress: 48, status: "partial", next: "Define moderation, public/private room split, abuse controls and member access boundaries." },
  { id: "shield-table", label: "Shield market table", progress: 64, status: "partial", next: "Improve ranking, anomaly filters, mobile table, live source labels and route audit coverage." },
  { id: "search-suggestions-ux", label: "Search suggestions UX", progress: 80, status: "partial", next: "Confirm token logos, local/live/merged source badges and high z-index dropdown on Vercel." },
  { id: "shield-modal", label: "Shield token modal / chart", progress: 75, status: "partial", next: "Confirm Vercel build, Basic/Pro static mode, Advanced runtime governor and selected tile explainer in real browser." },
  { id: "vlm-visual-brain", label: "VLM visual brain", progress: 77, status: "partial", next: "Validate Performance/Cinematic runtime governor and browser FPS before deciding WebGL/Three.js." },
  { id: "vlm-brain-orbit-cleanup", label: "VLM brain orbit cleanup", progress: 85, status: "partial", next: "User-test adaptive orbit runtime, compositor transitions and auto-downgrade from Cinematic to Performance." },
  { id: "vlm-brain-performance-runtime", label: "VLM brain performance runtime", progress: 71, status: "partial", next: "Measure real browser frame behavior; if still stutters, build WebGL/Three.js brain prototype." },
  { id: "vlm-brain-explainer", label: "VLM brain tile explainer", progress: 68, status: "partial", next: "Keep expanding driver/score/evidence/next-action copy with live OSINT and evidence ledger." },
  { id: "ai-risk-brain", label: "VLM AI risk brain", progress: 58, status: "partial", next: "Connect stronger tile-specific explanations to live OSINT/source scoring and scenario calibration." },
  { id: "operator-casefile", label: "Operator AI Case File", progress: 58, status: "partial", next: "Expose only concise next action in UI, keep deeper case data behind export." },
  { id: "evidence-export", label: "Evidence report / JSON preview", progress: 49, status: "partial", next: "Add persistent audit storage and production renderer." },
  { id: "data-spine", label: "Data / API spine", progress: 40, status: "blocked", next: "Wire holder, orderbook, contract, unlock, source-ledger APIs and Vercel-safe server boundaries." },
  { id: "mobile", label: "Mobile performance", progress: 49, status: "partial", next: "More real-device QA, adaptive motion downgrade and compact brain layout pass." },
  { id: "translations", label: "PL / EN / DE translations", progress: 53, status: "partial", next: "Finish tile explainer copy and search suggestion labels across PL/EN/DE." },
  { id: "launch-safety", label: "Launch safety / RegTech copy", progress: 70, status: "launch_control", next: "Review all claims, disclaimers, evidence language, route audit and utility-only VLM text." },
];

export const velmereProjectOverallProgress = Math.round(
  velmereProjectProgress.reduce((sum, item) => sum + item.progress, 0) / velmereProjectProgress.length,
);
