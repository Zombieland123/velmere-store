import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function walk(dir, exts, files = []) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return files;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "dist", "out"].includes(entry.name)) continue;
    const p = path.join(full, entry.name);
    if (entry.isDirectory()) walk(path.relative(root, p), exts, files);
    else if (exts.some((ext) => entry.name.endsWith(ext))) files.push(path.relative(root, p));
  }
  return files;
}

if (!pkg.dependencies?.next && !pkg.devDependencies?.next) {
  errors.push("Next.js dependency is missing from package.json. Check Vercel Root Directory.");
}


try {
  const rootArtifacts = fs.readdirSync(root).filter((name) => /^CODEX_.*\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name));
  for (const artifact of rootArtifacts) {
    errors.push(`${artifact}: Codex handoff/source artifact is in the project root and will be compiled by Next/TypeScript. Move it to docs/codex-handoff as .txt or keep it outside the deployment ZIP.`);
  }
  const codexSourceArtifacts = walk(".", [".ts", ".tsx", ".js", ".jsx"]).filter((file) => /^CODEX_/.test(path.basename(file)));
  for (const artifact of codexSourceArtifacts) {
    errors.push(`${artifact}: Codex handoff files must not use source-code extensions inside the deployable project.`);
  }
} catch (error) {
  errors.push(`Codex artifact guard failed: ${error instanceof Error ? error.message : String(error)}`);
}







// Product truth production guard
try {
  const typeSource = read("lib/products/types.ts");
  const catalogSource = read("lib/products/catalog.generated.ts");
  const detailSource = read("components/shop/ProductDetailClient.tsx");
  const readinessSource = read("lib/products/launch-readiness.ts");
  for (const needle of ["ProductTruthProfile", "truth?: ProductTruthProfile"]) {
    if (!typeSource.includes(needle)) errors.push(`lib/products/types.ts: missing product truth type ${needle}.`);
  }
  for (const needle of ["material:", "composition:", "sizeGuide:", "deliveryNote:", "returnNote:"]) {
    const count = catalogSource.split(needle).length - 1;
    if (count < 4) errors.push(`lib/products/catalog.generated.ts: product truth field ${needle} should exist for preview products; found ${count}.`);
  }
  for (const needle of ["productTruthIssues(product)", "product_truth_missing", "size_guide_missing"]) {
    if (!readinessSource.includes(needle)) errors.push(`lib/products/launch-readiness.ts: missing product truth readiness guard ${needle}.`);
  }
  for (const needle of ["const truth = selectedProduct.truth", "productMeasurements", "productSpecs"]) {
    if (!detailSource.includes(needle)) errors.push(`components/shop/ProductDetailClient.tsx: missing dynamic product truth surface ${needle}.`);
  }
} catch (error) {
  errors.push(`Product truth production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Commerce launch safety production guard
try {
  const launchSource = read("lib/products/launch-readiness.ts");
  const shopSource = read("components/shop/ShopPageClient.tsx");
  const catalogSource = read("lib/products/catalog.generated.ts");
  for (const needle of ["buildCommerceLaunchAudit", "checkout_disabled", "automatic_mapping_missing", "localized_copy_missing"]) {
    if (!launchSource.includes(needle)) errors.push(`lib/products/launch-readiness.ts: missing commerce launch guard ${needle}.`);
  }
  for (const needle of ["launchAudit.averageScore", "commerce.readinessKicker", "commerce.issueTitle"]) {
    if (!shopSource.includes(needle)) errors.push(`components/shop/ShopPageClient.tsx: missing commerce launch UI ${needle}.`);
  }
  if (catalogSource.includes('status: "active"') && catalogSource.includes('fulfilmentMode: "disabled"')) {
    errors.push("lib/products/catalog.generated.ts: active products cannot use disabled fulfilment.");
  }
} catch (error) {
  errors.push(`Commerce launch safety production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}









// Operator copy progress production guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const casefileSource = read("lib/market-integrity/operator-casefile.ts");
  const progressSource = read("lib/launch/project-progress.ts");
  const cssSource = read("app/globals.css");
  for (const needle of ["controlBody", "basicHint", "advancedHint"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing operator copy marker ${needle}.`);
  }
  if (!cssSource.includes(".shield-token-action-panel .shield-mode-guide")) errors.push("app/globals.css: missing PASS148 hidden mode guide marker.");
  for (const needle of ["low-risk pre-screen", "Missing sources still keep the case in review mode"]) {
    if (!casefileSource.includes(needle)) errors.push(`lib/market-integrity/operator-casefile.ts: missing clear verdict marker ${needle}.`);
  }
  for (const needle of ["velmereProjectProgress", "velmereProjectOverallProgress", "evidence-export", "launch-safety"]) {
    if (!progressSource.includes(needle)) errors.push(`lib/launch/project-progress.ts: missing progress matrix marker ${needle}.`);
  }
  if (!cssSource.includes("PASS132 — operator copy clarity")) {
    errors.push("app/globals.css: missing PASS132 operator copy CSS.");
  }
} catch (error) {
  errors.push(`Operator copy progress production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Site page audit production guard
try {
  const auditSource = read("lib/launch/site-page-audit.ts");
  for (const needle of ["velmereSitePageAudit", "Velmère Square", "VLM token / access layer", "Shield market table", "Admin import products", "vercelRisk", "launchBlockers"]) {
    if (!auditSource.includes(needle)) errors.push(`lib/launch/site-page-audit.ts: missing site audit marker ${needle}.`);
  }
  const requiredRoutes = [
    "app/[locale]/page.tsx",
    "app/[locale]/clothing/page.tsx",
    "app/[locale]/shop/page.tsx",
    "app/[locale]/shop/[id]/page.tsx",
    "app/[locale]/vlm-token/page.tsx",
    "app/[locale]/square/page.tsx",
    "app/[locale]/market-integrity/page.tsx",
    "app/[locale]/market-integrity/shield-map/page.tsx",
    "app/[locale]/account/page.tsx",
    "app/[locale]/login/page.tsx",
    "app/[locale]/member/page.tsx",
    "app/[locale]/legal/terms/page.tsx",
    "app/[locale]/admin/import-products/page.tsx",
  ];
  for (const route of requiredRoutes) {
    if (!fs.existsSync(path.join(root, route))) errors.push(`Missing route required by site audit: ${route}.`);
  }
} catch (error) {
  errors.push(`Site page audit production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Broad Vercel static production guard
try {
  const sourceFiles = walk(".", [".ts", ".tsx", ".js", ".jsx", ".mjs"]);
  const runtimeFiles = sourceFiles.filter((file) => !file.startsWith("scripts/") && !file.startsWith("docs/"));
  for (const file of sourceFiles) {
    if (/^CODEX_/.test(path.basename(file))) errors.push(`${file}: Codex source artifact must not be deployable.`);
  }
  for (const file of runtimeFiles) {
    const source = read(file);
    if (file.endsWith(".tsx") && /<img\b/.test(source)) errors.push(`${file}: raw <img> is blocked.`);
    if (/\[\s*\.\.\.\s*[^\n;]*(\.values\(\)|\.keys\(\)|\.entries\(\))/.test(source)) errors.push(`${file}: direct iterator spread is blocked for Vercel target.`);
    if ((file.includes("TokenRiskModal") || file.includes("market-integrity/risk-engine")) && source.includes("result.limitations")) errors.push(`${file}: stale result.limitations access is blocked.`);
    if ((file.includes("TokenRiskModal") || file.includes("market-integrity/risk-engine")) && source.includes("safeTileIndex")) errors.push(`${file}: old safeTileIndex workaround must not return.`);
    if ((file.startsWith("app/api/") || file.startsWith("app/actions/")) && ["window.", "document.", "localStorage", "navigator."].some((needle) => source.includes(needle))) {
      errors.push(`${file}: browser API is used in server route/action code.`);
    }
  }
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  for (const marker of ["downloadEvidenceManifest", "copyEvidenceManifest", "motionPreset", "shield-token-review-tools-hidden"]) {
    if (!modalSource.includes(marker)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing runtime safety marker ${marker}.`);
  }
} catch (error) {
  errors.push(`Broad Vercel static production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Orbit layout cleanup production guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["requestAnimationFrame(tick)", "targetFrameMs", "shield-vlm-static-board", "shield-vlm-detail-panel-side", "shield-token-review-tools-hidden"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing orbit cleanup marker ${needle}.`);
  }
  for (const needle of ["PASS131 — orbit layout cleanup", ".shield-vlm-static-board", ".shield-vlm-detail-panel-side"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing orbit cleanup CSS marker ${needle}.`);
  }
} catch (error) {
  errors.push(`Orbit layout cleanup production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Evidence export manifest production guard
try {
  const evidenceSource = read("lib/market-integrity/evidence-report.ts");
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["ShieldEvidenceExportManifest", "buildShieldEvidenceExportManifest", "serializeShieldEvidenceExportManifest", "json_preview_only"]) {
    if (!evidenceSource.includes(needle)) errors.push(`lib/market-integrity/evidence-report.ts: missing evidence export manifest marker ${needle}.`);
  }
  for (const needle of ["downloadEvidenceManifest", "copyEvidenceManifest", "shield-evidence-export-manifest"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing evidence export UI marker ${needle}.`);
  }
  if (!cssSource.includes("PASS130 — evidence JSON manifest preview")) {
    errors.push("app/globals.css: missing PASS130 evidence export manifest CSS.");
  }
} catch (error) {
  errors.push(`Evidence export manifest production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// PASS194 Orbit 360 modal cleanup + Lens descriptive cards guard
try {
  const tokenRiskModalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const marketClientSource = read("components/market-integrity/MarketIntegrityClient.tsx");
  const lensRouterSource = read("components/search/VelmereLensCommandRouter.tsx");
  const cssSource = read("app/globals.css");
  const matrixSource = read("VELMERE_PASS194_FULL_MASTER_PROGRESS_MATRIX.md");
  for (const needle of ["Math.round(deltaX / 10)", "Evidence Board hidden for now", "setActiveCommand(\"deck\")", "shield-vlm-detail-panel-popup", "shield-mode-guide-popup", "shield-source-spine-panel hidden"]) {
    if (!tokenRiskModalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS194 modal marker ${needle}.`);
  }
  for (const needle of ["PASS194 · full-screen Orbit 360 hotfix", ".shield-vlm-detail-panel-popup", ".shield-mode-guide-popup", ".shield-vlm-motion-toggle-mini button:not(.is-active)", ".vlcr-action-row"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS194 CSS marker ${needle}.`);
  }
  for (const needle of ["id?: string", "name?: string", "knownTokenLogo(symbol, id, name)", "<TokenAvatar image={item.image} symbol={item.symbol} id={item.id} name={item.name} />"]) {
    if (!marketClientSource.includes(needle)) errors.push(`components/market-integrity/MarketIntegrityClient.tsx: missing PASS194 logo marker ${needle}.`);
  }
  for (const needle of ["Lens cards are descriptive only", "Wyszukiwarka Velmère zbiera token", "Kapsuła raportu Velmère"]) {
    if (!lensRouterSource.includes(needle)) errors.push(`components/search/VelmereLensCommandRouter.tsx: missing PASS194 Lens marker ${needle}.`);
  }
  if (lensRouterSource.includes("<Link href={route.href}") || lensRouterSource.includes("<a href={route.reportHref}")) errors.push("components/search/VelmereLensCommandRouter.tsx: PASS194 Lens cards still render action buttons.");
  for (const needle of ["Token chart drag UX", "Token modal mode info popup", "VLM mode return-to-chart", "Selected tile popup readability", "Lens card clutter", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS194_FULL_MASTER_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS194 Orbit360/modal/Lens polish guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass194-orbit360-modal-lens-polish-safety.mjs
// PASS194

// PASS193 VLM/Lens/security runtime hotfix guard
try {
  const securityTrustPageSource = read("components/security/SecurityTrustPage.tsx");
  const tokenRiskModalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const marketClientSource = read("components/market-integrity/MarketIntegrityClient.tsx");
  const lensRouterSource = read("components/search/VelmereLensCommandRouter.tsx");
  const lensRouteMapSource = read("lib/search/velmere-lens-route-map.ts");
  const lensReportRouteSource = read("app/api/search/lens-report/route.ts");
  const cssSource = read("app/globals.css");
  const matrixSource = read("VELMERE_PASS193_FULL_MASTER_PROGRESS_MATRIX.md");
  for (const needle of ["import SecurityOperationsChecklistPanel", "<SecurityOperationsChecklistPanel locale={safeLocale} />"]) {
    if (!securityTrustPageSource.includes(needle)) errors.push(`components/security/SecurityTrustPage.tsx: missing PASS193 runtime import marker ${needle}.`);
  }
  for (const needle of ["orbitZoom", "handleOrbitWheel", "shield-vlm-zoom-controls", "--vlm-static-transform", "translate(-8%, -50%)", "translate(-92%, -50%)"]) {
    if (!tokenRiskModalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS193 VLM marker ${needle}.`);
  }
  for (const needle of ["PASS193 · VLM Brain viewport expansion", ".shield-vlm-zoom-controls", ".shield-vlm-static-stage", ".vlcr-report-preview", ".shield-token-search-suggest-panel"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS193 CSS marker ${needle}.`);
  }
  for (const needle of ["solana", "bonk", "shield-suggestion-token-avatar", "token suggestions · logo aware"]) {
    if (!marketClientSource.includes(needle)) errors.push(`components/market-integrity/MarketIntegrityClient.tsx: missing PASS193 logo marker ${needle}.`);
  }
  for (const needle of ["reportHref", "reportTitle", "mode=shield", "mode=contract", "source_ledger"]) {
    if (!lensRouteMapSource.includes(needle)) errors.push(`lib/search/velmere-lens-route-map.ts: missing PASS193 route/report marker ${needle}.`);
  }
  for (const needle of ["vlcr-action-row", "vlcr-report-preview", "c.previewBody", "route.reportHref"]) {
    if (!lensRouterSource.includes(needle)) errors.push(`components/search/VelmereLensCommandRouter.tsx: missing PASS193 report UI marker ${needle}.`);
  }
  for (const needle of ["velmere-lens", "PDF-ready evidence note", "content-disposition", "not a safety certificate", "escapeHtml"]) {
    if (!lensReportRouteSource.includes(needle)) errors.push(`app/api/search/lens-report/route.ts: missing PASS193 report route marker ${needle}.`);
  }
  for (const needle of ["SecurityOperationsChecklistPanel runtime hotfix", "VLM Brain window containment", "Evidence Board split lanes", "Velmère Lens report preview", "Search suggestions logo fallback", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS193_FULL_MASTER_PROGRESS_MATRIX.md: missing PASS193 full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS193 VLM/Lens/security hotfix guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass193-vlm-lens-security-hotfix-safety.mjs
// PASS193

// PASS192 payment runtime evidence capture + Stripe webhook replay QA ledger guard
try {
  const paymentEvidenceSource = read("lib/security/payment-runtime-evidence.ts");
  const stripeReplaySource = read("lib/security/stripe-webhook-replay-qa.ts");
  const evidenceRouteSource = read("app/api/security/payment-runtime-evidence/route.ts");
  const replayRouteSource = read("app/api/security/stripe-webhook-replay-qa/route.ts");
  const paymentReviewSource = read("lib/security/payment-webhook-security.ts");
  const releaseGateSource = read("lib/security/security-release-gate.ts");
  const runtimeQaSource = read("lib/security/security-runtime-qa.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const exportRouteSource = read("app/api/security/export/route.ts");
  const operationsRouteSource = read("app/api/security/operations-checklist/route.ts");
  const abuseRouteSource = read("app/api/security/abuse-shield/route.ts");
  const securityConsoleSource = read("components/admin/SecurityConsolePanel.tsx");
  const evidenceDocSource = read("docs/security/PAYMENT_RUNTIME_EVIDENCE_CAPTURE.md");
  const replayDocSource = read("docs/security/STRIPE_WEBHOOK_REPLAY_QA_LEDGER.md");
  const matrixSource = read("VELMERE_PASS192_FULL_MASTER_PROGRESS_MATRIX.md");
  for (const needle of ["PaymentRuntimeEvidenceRecord", "recordPaymentRuntimeEvidence", "buildPaymentRuntimeEvidenceSnapshot", "cleanText", "redacted-card-like"]) {
    if (!paymentEvidenceSource.includes(needle)) errors.push(`lib/security/payment-runtime-evidence.ts: missing PASS192 evidence marker ${needle}.`);
  }
  for (const needle of ["stripeWebhookReplayScenarios", "recordStripeWebhookReplayEvidence", "buildStripeWebhookReplayQaSnapshot", "duplicate-replay", "unsupported-signed-event"]) {
    if (!stripeReplaySource.includes(needle)) errors.push(`lib/security/stripe-webhook-replay-qa.ts: missing PASS192 replay marker ${needle}.`);
  }
  for (const source of [evidenceRouteSource, replayRouteSource]) {
    for (const needle of ["applyApiAbuseShield", "verifySecurityAdminToken", "security:events", "payloadTooLarge", "POST", "GET"]) {
      if (!source.includes(needle)) errors.push(`PASS192 admin-gated payment evidence/replay route missing ${needle}.`);
    }
  }
  for (const needle of ["buildPaymentRuntimeEvidenceSnapshot", "buildStripeWebhookReplayQaSnapshot", "runtimeEvidence", "replayQa"]) {
    if (!paymentReviewSource.includes(needle)) errors.push(`lib/security/payment-webhook-security.ts: missing PASS192 marker ${needle}.`);
  }
  for (const needle of ["buildPaymentRuntimeEvidenceSnapshot", "buildStripeWebhookReplayQaSnapshot", "paymentRuntimeEvidence", "stripeWebhookReplayQa", "paymentEvidenceProgress"]) {
    if (!releaseGateSource.includes(needle)) errors.push(`lib/security/security-release-gate.ts: missing PASS192 marker ${needle}.`);
  }
  for (const needle of ["payment-runtime-evidence-api", "stripe-webhook-replay-qa-ledger", "paymentRuntimeEvidence", "stripeWebhookReplayQa"]) {
    if (!runtimeQaSource.includes(needle)) errors.push(`lib/security/security-runtime-qa.ts: missing PASS192 marker ${needle}.`);
  }
  for (const needle of ["paymentRuntimeEvidence", "stripeWebhookReplayQa", "buildPaymentRuntimeEvidenceSnapshot", "buildStripeWebhookReplayQaSnapshot"]) {
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS192 marker ${needle}.`);
    if (!exportRouteSource.includes(needle)) errors.push(`app/api/security/export/route.ts: missing PASS192 marker ${needle}.`);
    if (!operationsRouteSource.includes(needle)) errors.push(`app/api/security/operations-checklist/route.ts: missing PASS192 marker ${needle}.`);
    if (!abuseRouteSource.includes(needle)) errors.push(`app/api/security/abuse-shield/route.ts: missing PASS192 marker ${needle}.`);
  }
  for (const needle of ["buildPaymentRuntimeEvidenceSnapshot", "buildStripeWebhookReplayQaSnapshot", "/api/security/payment-runtime-evidence", "/api/security/stripe-webhook-replay-qa"]) {
    if (!securityConsoleSource.includes(needle)) errors.push(`components/admin/SecurityConsolePanel.tsx: missing PASS192 console marker ${needle}.`);
  }
  for (const needle of ["Payment Runtime Evidence Capture", "No raw", "safe POST payload"]) {
    if (!evidenceDocSource.includes(needle)) errors.push(`docs/security/PAYMENT_RUNTIME_EVIDENCE_CAPTURE.md: missing marker ${needle}.`);
  }
  for (const needle of ["Stripe Webhook Replay QA Ledger", "Duplicate webhook replay", "Unsupported signed event"]) {
    if (!replayDocSource.includes(needle)) errors.push(`docs/security/STRIPE_WEBHOOK_REPLAY_QA_LEDGER.md: missing marker ${needle}.`);
  }
  for (const needle of ["Payment runtime evidence capture", "Stripe webhook replay QA ledger", "Payment/webhook security", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS192_FULL_MASTER_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS192 payment runtime evidence/replay QA guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass192-payment-runtime-evidence-replay-qa-safety.mjs
// PASS192

// PASS191 payment/webhook security review + commerce release gate integration guard
try {
  const paymentGuardSource = read("lib/security/payment-webhook-guard.ts");
  const paymentReviewSource = read("lib/security/payment-webhook-security.ts");
  const checkoutRouteSource = read("app/api/checkout/route.ts");
  const stripeWebhookRouteSource = read("app/api/stripe/webhook/route.ts");
  const paymentReviewRouteSource = read("app/api/security/payment-webhook-review/route.ts");
  const releaseGateSource = read("lib/security/security-release-gate.ts");
  const runtimeQaSource = read("lib/security/security-runtime-qa.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const exportRouteSource = read("app/api/security/export/route.ts");
  const operationsRouteSource = read("app/api/security/operations-checklist/route.ts");
  const abuseRouteSource = read("app/api/security/abuse-shield/route.ts");
  const securityConsoleSource = read("components/admin/SecurityConsolePanel.tsx");
  const paymentDocSource = read("docs/security/PAYMENT_WEBHOOK_SECURITY_REVIEW.md");
  const matrixSource = read("VELMERE_PASS191_FULL_MASTER_PROGRESS_MATRIX.md");
  for (const needle of ["validateCheckoutRequestBoundary", "validateStripeWebhookBoundary", "paymentWebhookGuardReadiness", "Checkout expects application/json", "Webhook payload is too large"]) {
    if (!paymentGuardSource.includes(needle)) errors.push(`lib/security/payment-webhook-guard.ts: missing PASS191 guard marker ${needle}.`);
  }
  for (const needle of ["buildPaymentWebhookSecuritySnapshot", "signed-webhook", "webhook-idempotency", "order-persistence", "refund-support"]) {
    if (!paymentReviewSource.includes(needle)) errors.push(`lib/security/payment-webhook-security.ts: missing PASS191 review marker ${needle}.`);
  }
  for (const needle of ["validateCheckoutRequestBoundary", "paymentGuard"]) {
    if (!checkoutRouteSource.includes(needle)) errors.push(`app/api/checkout/route.ts: missing PASS191 checkout marker ${needle}.`);
  }
  for (const needle of ["validateStripeWebhookBoundary", "SUPPORTED_STRIPE_WEBHOOK_EVENTS", "unsupported: true", "constructEvent"]) {
    if (!stripeWebhookRouteSource.includes(needle)) errors.push(`app/api/stripe/webhook/route.ts: missing PASS191 webhook marker ${needle}.`);
  }
  for (const needle of ["applyApiAbuseShield", "verifySecurityAdminToken", "buildPaymentWebhookSecuritySnapshot", "security:events"]) {
    if (!paymentReviewRouteSource.includes(needle)) errors.push(`app/api/security/payment-webhook-review/route.ts: missing PASS191 route marker ${needle}.`);
  }
  for (const needle of ["buildPaymentWebhookSecuritySnapshot", "paymentWebhookSecurity", "payment-webhook-review"]) {
    if (!releaseGateSource.includes(needle)) errors.push(`lib/security/security-release-gate.ts: missing PASS191 release marker ${needle}.`);
  }
  for (const needle of ["buildPaymentWebhookSecuritySnapshot", "payment-webhook-review-api", "stripe-webhook-guard", "paymentWebhookSecurity"]) {
    if (!runtimeQaSource.includes(needle)) errors.push(`lib/security/security-runtime-qa.ts: missing PASS191 runtime QA marker ${needle}.`);
  }
  for (const needle of ["paymentWebhookSecurity", "buildPaymentWebhookSecuritySnapshot"]) {
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS191 payment marker ${needle}.`);
    if (!exportRouteSource.includes(needle)) errors.push(`app/api/security/export/route.ts: missing PASS191 payment marker ${needle}.`);
    if (!operationsRouteSource.includes(needle)) errors.push(`app/api/security/operations-checklist/route.ts: missing PASS191 payment marker ${needle}.`);
    if (!abuseRouteSource.includes(needle)) errors.push(`app/api/security/abuse-shield/route.ts: missing PASS191 payment marker ${needle}.`);
  }
  for (const needle of ["buildPaymentWebhookSecuritySnapshot", "/api/security/payment-webhook-review", "paymentWebhook.averageProgress"]) {
    if (!securityConsoleSource.includes(needle)) errors.push(`components/admin/SecurityConsolePanel.tsx: missing PASS191 console marker ${needle}.`);
  }
  for (const needle of ["Checkout payload", "Stripe webhook", "Duplicate webhook event", "Do not export card data"]) {
    if (!paymentDocSource.includes(needle)) errors.push(`docs/security/PAYMENT_WEBHOOK_SECURITY_REVIEW.md: missing marker ${needle}.`);
  }
  for (const needle of ["Payment/webhook security", "Payment checkout request boundary", "Stripe webhook request boundary", "Commerce/order/payment readiness", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS191_FULL_MASTER_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS191 payment/webhook security guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass191-payment-webhook-security-safety.mjs
// PASS191

// PASS190 runtime QA result capture + security release gate dashboard guard
try {
  const runtimeQaSource = read("lib/security/security-runtime-qa.ts");
  const releaseGateSource = read("lib/security/security-release-gate.ts");
  const runtimeQaRouteSource = read("app/api/security/runtime-qa/route.ts");
  const releaseGateRouteSource = read("app/api/security/release-gate/route.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const exportRouteSource = read("app/api/security/export/route.ts");
  const operationsRouteSource = read("app/api/security/operations-checklist/route.ts");
  const securityConsoleSource = read("components/admin/SecurityConsolePanel.tsx");
  const qaDocSource = read("docs/security/SECURITY_RUNTIME_QA_RESULT_CAPTURE.md");
  const releaseDocSource = read("docs/security/SECURITY_RELEASE_GATE_DASHBOARD.md");
  const matrixSource = read("VELMERE_PASS190_FULL_MASTER_PROGRESS_MATRIX.md");
  for (const needle of ["RuntimeQaCheck", "runtimeQaChecks", "buildSecurityRuntimeQaSnapshot", "admin-api-deny-by-default", "export-redaction", "release-gate-signoff"]) {
    if (!runtimeQaSource.includes(needle)) errors.push(`lib/security/security-runtime-qa.ts: missing PASS190 runtime QA marker ${needle}.`);
  }
  for (const needle of ["SecurityReleaseGateItem", "buildSecurityReleaseGateSnapshot", "payment-webhook-review", "security_release_gate_dashboard"]) {
    if (!releaseGateSource.includes(needle)) errors.push(`lib/security/security-release-gate.ts: missing PASS190 release gate marker ${needle}.`);
  }
  for (const source of [runtimeQaRouteSource, releaseGateRouteSource]) {
    for (const needle of ["applyApiAbuseShield", "verifySecurityAdminToken", "security:events", "securityAdminGate", "operator"]) {
      if (!source.includes(needle)) errors.push(`PASS190 gated security route missing ${needle}.`);
    }
  }
  for (const needle of ["runtimeQa", "releaseGate", "buildSecurityRuntimeQaSnapshot", "buildSecurityReleaseGateSnapshot"]) {
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS190 marker ${needle}.`);
    if (!exportRouteSource.includes(needle)) errors.push(`app/api/security/export/route.ts: missing PASS190 marker ${needle}.`);
    if (!operationsRouteSource.includes(needle)) errors.push(`app/api/security/operations-checklist/route.ts: missing PASS190 marker ${needle}.`);
  }
  for (const needle of ["buildSecurityRuntimeQaSnapshot", "buildSecurityReleaseGateSnapshot", "/api/security/runtime-qa", "/api/security/release-gate", "releaseItems.map"]) {
    if (!securityConsoleSource.includes(needle)) errors.push(`components/admin/SecurityConsolePanel.tsx: missing PASS190 console marker ${needle}.`);
  }
  for (const needle of ["/api/security/export", "No raw IP", "Vercel firewall logs", "npm run verify:shield-all"]) {
    if (!qaDocSource.includes(needle)) errors.push(`docs/security/SECURITY_RUNTIME_QA_RESULT_CAPTURE.md: missing marker ${needle}.`);
  }
  for (const needle of ["Security Release Gate Dashboard", "Payment/webhook", "Vercel envs", "WAF"]) {
    if (!releaseDocSource.includes(needle)) errors.push(`docs/security/SECURITY_RELEASE_GATE_DASHBOARD.md: missing marker ${needle}.`);
  }
  for (const needle of ["Security release gate dashboard", "Security runtime QA result capture", "Payment/webhook security", "Source adapters / live feeds", "VLM AI risk brain", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS190_FULL_MASTER_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS190 runtime QA/release gate guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass190-runtime-qa-release-gate-safety.mjs
// PASS190

// PASS189 security nav/footer integration + Vercel env/WAF/runtime QA checklist guard
try {
  const operationsChecklistSource = read("lib/security/security-operations-checklist.ts");
  const operationsPanelSource = read("components/security/SecurityOperationsChecklistPanel.tsx");
  const securityPageSource = read("components/security/SecurityTrustPage.tsx");
  const operationsApiSource = read("app/api/security/operations-checklist/route.ts");
  const navbarSource = read("components/Navbar.tsx");
  const footerSource = read("components/Footer.tsx");
  const cssSource = read("app/globals.css");
  const envDocSource = read("docs/security/VERCEL_ENV_SECURITY_CHECKLIST.md");
  const wafDocSource = read("docs/security/VERCEL_WAF_RULES_DRAFT.md");
  const qaDocSource = read("docs/security/SECURITY_RUNTIME_QA_CHECKLIST.md");
  const matrixSource = read("VELMERE_PASS189_FULL_PROGRESS_MATRIX.md");
  for (const needle of ["securityChecklistItems", "wafRuleDrafts", "buildSecurityOperationsChecklistSnapshot", "VELMERE_SECURITY_ADMIN_TOKEN_SHA256", "runtime_qa"]) {
    if (!operationsChecklistSource.includes(needle)) errors.push(`lib/security/security-operations-checklist.ts: missing PASS189 checklist marker ${needle}.`);
  }
  for (const needle of ["SecurityOperationsChecklistPanel", "buildSecurityOperationsChecklistSnapshot", "WAF drafts"]) {
    if (!operationsPanelSource.includes(needle)) errors.push(`components/security/SecurityOperationsChecklistPanel.tsx: missing PASS189 panel marker ${needle}.`);
  }
  for (const needle of ["SecurityOperationsChecklistPanel", "<SecurityOperationsChecklistPanel locale={safeLocale} />"]) {
    if (!securityPageSource.includes(needle)) errors.push(`components/security/SecurityTrustPage.tsx: missing PASS189 page marker ${needle}.`);
  }
  for (const needle of ["applyApiAbuseShield", "buildSecurityOperationsChecklistSnapshot", "buildSecurityReadinessSnapshot"]) {
    if (!operationsApiSource.includes(needle)) errors.push(`app/api/security/operations-checklist/route.ts: missing PASS189 API marker ${needle}.`);
  }
  for (const needle of ["security: \"Security\"", "security: \"Sicherheit\"", "labels.security", "href: \"/security\""]) {
    if (!navbarSource.includes(needle)) errors.push(`components/Navbar.tsx: missing PASS189 security nav marker ${needle}.`);
  }
  for (const needle of ["{ href: \"/security\", label: \"Security\" }", "Velmère Security means layered protection", "Security Velmère to warstwy ochrony", "Velmère Security bedeutet Schutzschichten"]) {
    if (!footerSource.includes(needle)) errors.push(`components/Footer.tsx: missing PASS189 footer marker ${needle}.`);
  }
  for (const needle of ["PASS189 · Security operations checklist", ".vso-shell", ".vso-card", ".vso-status"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS189 CSS marker ${needle}.`);
  }
  for (const needle of ["UPSTASH_REDIS_REST_URL", "VELMERE_SECURITY_ADMIN_TOKEN_SHA256", "GET /api/security/readiness"]) {
    if (!envDocSource.includes(needle)) errors.push(`docs/security/VERCEL_ENV_SECURITY_CHECKLIST.md: missing marker ${needle}.`);
  }
  for (const needle of ["Block scanner paths", "Rate-limit public API", "Protect admin/security exports"]) {
    if (!wafDocSource.includes(needle)) errors.push(`docs/security/VERCEL_WAF_RULES_DRAFT.md: missing marker ${needle}.`);
  }
  for (const needle of ["/security", "/admin/security", "/api/security/export", "No raw IP"]) {
    if (!qaDocSource.includes(needle)) errors.push(`docs/security/SECURITY_RUNTIME_QA_CHECKLIST.md: missing marker ${needle}.`);
  }
  for (const needle of ["Security operations checklist", "Vercel env checklist", "Vercel WAF rules draft", "Security nav/footer integration", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS189_FULL_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS189 security nav/footer/Vercel WAF checklist guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass189-security-nav-footer-vercel-waf-checklist-safety.mjs
// PASS189

// PASS188 security trust copy + public security page overclaim guard
try {
  const securityTrustCopySource = read("lib/security/security-trust-copy.ts");
  const securityTrustPageSource = read("components/security/SecurityTrustPage.tsx");
  const securityRouteSource = read("app/[locale]/security/page.tsx");
  const securityTrustApiSource = read("app/api/security/trust/route.ts");
  const cssSource = read("app/globals.css");
  const matrixSource = read("VELMERE_PASS188_FULL_PROGRESS_MATRIX.md");
  for (const needle of ["securityTrustForbiddenClaims", "securityTrustPillars", "securityTrustRoadmap", "buildSecurityTrustSnapshot", "security-first"]) {
    if (!securityTrustCopySource.includes(needle)) errors.push(`lib/security/security-trust-copy.ts: missing PASS188 marker ${needle}.`);
  }
  for (const needle of ["SecurityTrustPage", "buildSecurityTrustSnapshot", "securityTrustPillars", "Production boundary"]) {
    if (!securityTrustPageSource.includes(needle)) errors.push(`components/security/SecurityTrustPage.tsx: missing PASS188 page marker ${needle}.`);
  }
  for (const needle of ["Velmère Security", "SecurityTrustPage", "metadata"]) {
    if (!securityRouteSource.includes(needle)) errors.push(`app/[locale]/security/page.tsx: missing PASS188 route marker ${needle}.`);
  }
  for (const needle of ["applyApiAbuseShield", "buildSecurityTrustSnapshot", "buildSecurityReadinessSnapshot", "security-trust"]) {
    if (!securityTrustApiSource.includes(needle)) errors.push(`app/api/security/trust/route.ts: missing PASS188 API marker ${needle}.`);
  }
  for (const needle of ["PASS188 · Velmère Security Trust public surface", ".vst-hero", ".vst-card", ".vst-roadmap"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS188 CSS marker ${needle}.`);
  }
  for (const needle of ["Security public trust page", "Security overclaim safety", "Brand trust / credibility", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS188_FULL_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
  const publicSecuritySurface = `${securityTrustPageSource}\n${securityRouteSource}\n${securityTrustApiSource}`.toLowerCase();
  for (const forbidden of ["najlepsze zabezpieczenia świata", "nie do zhakowania", "gwarantowane bezpieczeństwo", "100% secure", "unhackable", "hack proof", "world's best security", "best security in the world", "military-grade security", "bank-level guaranteed"]) {
    if (publicSecuritySurface.includes(forbidden)) errors.push(`PASS188 public security overclaim remains: ${forbidden}.`);
  }
} catch (error) {
  errors.push(`PASS188 security trust copy/public page guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass188-security-trust-copy-public-page-safety.mjs
// PASS188

// PASS187 durable security event append + admin read audit guard
try {
  const eventAppendSource = read("lib/security/security-event-append-adapter.ts");
  const adminAuditSource = read("lib/security/security-admin-audit.ts");
  const eventLedgerSource = read("lib/security/security-event-ledger.ts");
  const adminAuthSource = read("lib/security/security-admin-auth.ts");
  const eventStoreSource = read("lib/security/security-event-store-contract.ts");
  const adminAuditRouteSource = read("app/api/security/admin-audit/route.ts");
  const eventStoreRouteSource = read("app/api/security/event-store/route.ts");
  const exportRouteSource = read("app/api/security/export/route.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const abuseRouteSource = read("app/api/security/abuse-shield/route.ts");
  const securityConsoleSource = read("components/admin/SecurityConsolePanel.tsx");
  const matrixSource = read("VELMERE_PASS187_FULL_PROGRESS_MATRIX.md");
  for (const needle of ["appendSecurityEventBestEffort", "buildSecurityEventAppendReadiness", "VELMERE_SECURITY_EVENT_UPSTASH_KEY", "LPUSH", "LTRIM", "safeRecord"]) {
    if (!eventAppendSource.includes(needle)) errors.push(`lib/security/security-event-append-adapter.ts: missing PASS187 append marker ${needle}.`);
  }
  for (const needle of ["SecurityAdminAuditRecord", "recordSecurityAdminAudit", "buildSecurityAdminAuditSnapshot", "security_export_read", "security_event_read"]) {
    if (!adminAuditSource.includes(needle)) errors.push(`lib/security/security-admin-audit.ts: missing PASS187 admin audit marker ${needle}.`);
  }
  for (const needle of ["appendSecurityEventBestEffort", "appendAdapter", "durableStorageReady"]) {
    if (!eventLedgerSource.includes(needle)) errors.push(`lib/security/security-event-ledger.ts: missing PASS187 ledger append marker ${needle}.`);
  }
  for (const needle of ["recordSecurityAdminAudit", "not_configured", "denied", "allowed"]) {
    if (!adminAuthSource.includes(needle)) errors.push(`lib/security/security-admin-auth.ts: missing PASS187 auth audit marker ${needle}.`);
  }
  for (const needle of ["buildSecurityEventAppendReadiness", "appendAdapter"]) {
    if (!eventStoreSource.includes(needle)) errors.push(`lib/security/security-event-store-contract.ts: missing PASS187 store append marker ${needle}.`);
    if (!eventStoreRouteSource.includes(needle)) errors.push(`app/api/security/event-store/route.ts: missing PASS187 store route marker ${needle}.`);
  }
  for (const needle of ["verifySecurityAdminToken", "security:events", "buildSecurityAdminAuditSnapshot", "listSecurityAdminAuditEvents"]) {
    if (!adminAuditRouteSource.includes(needle)) errors.push(`app/api/security/admin-audit/route.ts: missing PASS187 admin-audit route marker ${needle}.`);
  }
  for (const needle of ["eventAppendAdapter", "securityAdminAudit", "buildSecurityEventAppendReadiness", "buildSecurityAdminAuditSnapshot"]) {
    if (!exportRouteSource.includes(needle)) errors.push(`app/api/security/export/route.ts: missing PASS187 export marker ${needle}.`);
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS187 readiness marker ${needle}.`);
    if (!abuseRouteSource.includes(needle)) errors.push(`app/api/security/abuse-shield/route.ts: missing PASS187 abuse marker ${needle}.`);
  }
  for (const needle of ["buildSecurityEventAppendReadiness", "buildSecurityAdminAuditSnapshot", "/api/security/admin-audit"]) {
    if (!securityConsoleSource.includes(needle)) errors.push(`components/admin/SecurityConsolePanel.tsx: missing PASS187 console marker ${needle}.`);
  }
  for (const needle of ["Security event append adapter", "Security admin audit", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS187_FULL_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS187 durable security event append/admin audit guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass187-durable-event-append-admin-audit-safety.mjs
// PASS187

// PASS186 security admin auth gate + event store contract guard
try {
  const securityAdminAuthSource = read("lib/security/security-admin-auth.ts");
  const eventStoreContractSource = read("lib/security/security-event-store-contract.ts");
  const lockedPanelSource = read("components/admin/SecurityConsoleLockedPanel.tsx");
  const securityConsoleSource = read("components/admin/SecurityConsolePanel.tsx");
  const adminSecurityPageSource = read("app/[locale]/admin/security/page.tsx");
  const eventsRouteSource = read("app/api/security/events/route.ts");
  const alertsRouteSource = read("app/api/security/alerts/route.ts");
  const exportRouteSource = read("app/api/security/export/route.ts");
  const eventStoreRouteSource = read("app/api/security/event-store/route.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const abuseRouteSource = read("app/api/security/abuse-shield/route.ts");
  const matrixSource = read("VELMERE_PASS186_FULL_PROGRESS_MATRIX.md");
  for (const needle of ["verifySecurityAdminToken", "VELMERE_SECURITY_ADMIN_TOKEN_SHA256", "x-velmere-security-admin-token", "timingSafeEqual", "security_admin_token_required", "consoleVisible"]) {
    if (!securityAdminAuthSource.includes(needle)) errors.push(`lib/security/security-admin-auth.ts: missing PASS186 admin auth marker ${needle}.`);
  }
  for (const needle of ["securityEventStoreContract", "buildSecurityEventStoreSnapshot", "durable-append-contract", "retention-policy"]) {
    if (!eventStoreContractSource.includes(needle)) errors.push(`lib/security/security-event-store-contract.ts: missing PASS186 store marker ${needle}.`);
  }
  for (const needle of ["SecurityConsoleLockedPanel", "buildSecurityAdminGateReadiness"]) {
    if (!lockedPanelSource.includes(needle)) errors.push(`components/admin/SecurityConsoleLockedPanel.tsx: missing PASS186 locked marker ${needle}.`);
  }
  for (const needle of ["buildSecurityAdminGateReadiness", "buildSecurityEventStoreSnapshot", "/api/security/event-store"]) {
    if (!securityConsoleSource.includes(needle)) errors.push(`components/admin/SecurityConsolePanel.tsx: missing PASS186 console marker ${needle}.`);
  }
  for (const needle of ["SecurityConsoleLockedPanel", "buildSecurityAdminGateReadiness", "!gate.consoleVisible"]) {
    if (!adminSecurityPageSource.includes(needle)) errors.push(`app/[locale]/admin/security/page.tsx: missing PASS186 route gate marker ${needle}.`);
  }
  for (const needle of ["verifySecurityAdminToken", "security:events", "applyApiAbuseShield"]) {
    if (!eventsRouteSource.includes(needle)) errors.push(`app/api/security/events/route.ts: missing PASS186 API gate marker ${needle}.`);
    if (!eventStoreRouteSource.includes(needle)) errors.push(`app/api/security/event-store/route.ts: missing PASS186 event-store gate marker ${needle}.`);
  }
  for (const needle of ["verifySecurityAdminToken", "security:alerts", "applyApiAbuseShield"]) {
    if (!alertsRouteSource.includes(needle)) errors.push(`app/api/security/alerts/route.ts: missing PASS186 alerts gate marker ${needle}.`);
  }
  for (const needle of ["verifySecurityAdminToken", "security:export", "applyApiAbuseShield"]) {
    if (!exportRouteSource.includes(needle)) errors.push(`app/api/security/export/route.ts: missing PASS186 export gate marker ${needle}.`);
  }
  for (const needle of ["securityAdminGate", "buildSecurityAdminGateReadiness", "eventStore", "buildSecurityEventStoreSnapshot"]) {
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS186 marker ${needle}.`);
    if (!abuseRouteSource.includes(needle)) errors.push(`app/api/security/abuse-shield/route.ts: missing PASS186 marker ${needle}.`);
  }
  for (const needle of ["Security admin API gate", "Security event store contract", "Security locked-state UX", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS186_FULL_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS186 security admin auth/event store guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass186-admin-auth-event-store-contract-safety.mjs
// PASS186

// PASS185 admin security console + alert rules + Vercel sweep guard
try {
  const securityAlertRulesSource = read("lib/security/security-alert-rules.ts");
  const securityConsoleSource = read("components/admin/SecurityConsolePanel.tsx");
  const adminSecurityPageSource = read("app/[locale]/admin/security/page.tsx");
  const alertsRouteSource = read("app/api/security/alerts/route.ts");
  const exportRouteSource = read("app/api/security/export/route.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const abuseRouteSource = read("app/api/security/abuse-shield/route.ts");
  const matrixSource = read("VELMERE_PASS185_FULL_PROGRESS_MATRIX.md");
  for (const needle of ["SecurityAlertRule", "evaluateSecurityAlertRules", "buildSecurityAlertSnapshot", "waf_not_configured"]) {
    if (!securityAlertRulesSource.includes(needle)) errors.push(`lib/security/security-alert-rules.ts: missing PASS185 alert marker ${needle}.`);
  }
  for (const needle of ["SecurityConsolePanel", "buildSecurityAlertSnapshot", "buildSecurityEventLedgerSnapshot", "asc-shell"]) {
    if (!securityConsoleSource.includes(needle) && !read("app/globals.css").includes(needle)) errors.push(`components/admin/SecurityConsolePanel.tsx: missing PASS185 console marker ${needle}.`);
  }
  for (const needle of ["Velmère Admin Security Console", "robots", "index: false", "SecurityConsolePanel"]) {
    if (!adminSecurityPageSource.includes(needle)) errors.push(`app/[locale]/admin/security/page.tsx: missing PASS185 admin route marker ${needle}.`);
  }
  for (const needle of ["applyApiAbuseShield", "buildSecurityAlertSnapshot", "securityJson"]) {
    if (!alertsRouteSource.includes(needle)) errors.push(`app/api/security/alerts/route.ts: missing PASS185 alerts marker ${needle}.`);
  }
  for (const needle of ["security_export_safe_preview", "buildSecurityAlertSnapshot", "buildSecurityEventLedgerSnapshot", "no raw IP addresses", "content-disposition"]) {
    if (!exportRouteSource.includes(needle)) errors.push(`app/api/security/export/route.ts: missing PASS185 export marker ${needle}.`);
  }
  for (const needle of ["alertRules", "buildSecurityAlertSnapshot"]) {
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS185 alert marker ${needle}.`);
    if (!abuseRouteSource.includes(needle)) errors.push(`app/api/security/abuse-shield/route.ts: missing PASS185 alert marker ${needle}.`);
  }
  for (const needle of ["Vercel potential error sweep", "Admin security console", "Security alert rules", "Security safe export", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS185_FULL_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS185 admin security console / Vercel sweep guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass185-admin-security-console-vercel-sweep-safety.mjs
// PASS185

// PASS184 Upstash REST adapter + security event ledger guard
try {
  const durableRateLimitSource = read("lib/security/durable-rate-limit.ts");
  const securityEventLedgerSource = read("lib/security/security-event-ledger.ts");
  const apiAbuseShieldSource = read("lib/security/api-abuse-shield.ts");
  const securityEventsRouteSource = read("app/api/security/events/route.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const abuseRouteSource = read("app/api/security/abuse-shield/route.ts");
  const matrixSource = read("VELMERE_PASS184_FULL_PROGRESS_MATRIX.md");
  for (const needle of ["upstash_rest", "upstash_fallback_memory", "/pipeline", "UPSTASH_REDIS_REST_URL", "providerError", "upstashRestAdapter"]) {
    if (!durableRateLimitSource.includes(needle)) errors.push(`lib/security/durable-rate-limit.ts: missing PASS184 Upstash marker ${needle}.`);
  }
  for (const needle of ["SecurityEventRecord", "recordSecurityEvent", "buildSecurityEventLedgerSnapshot", "clientFingerprint", "in_memory_security_event_ledger"]) {
    if (!securityEventLedgerSource.includes(needle)) errors.push(`lib/security/security-event-ledger.ts: missing PASS184 ledger marker ${needle}.`);
  }
  for (const needle of ["recordSecurityEvent", "abuse_blocked", "rate_limited", "suspicious_allowed", "provider_fallback"]) {
    if (!apiAbuseShieldSource.includes(needle)) errors.push(`lib/security/api-abuse-shield.ts: missing PASS184 event marker ${needle}.`);
  }
  for (const needle of ["buildSecurityEventLedgerSnapshot", "listSecurityEvents", "filtered"]) {
    if (!securityEventsRouteSource.includes(needle)) errors.push(`app/api/security/events/route.ts: missing PASS184 events route marker ${needle}.`);
  }
  for (const needle of ["securityEventLedger", "buildSecurityEventLedgerSnapshot"]) {
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS184 ledger marker ${needle}.`);
    if (!abuseRouteSource.includes(needle)) errors.push(`app/api/security/abuse-shield/route.ts: missing PASS184 ledger marker ${needle}.`);
  }
  for (const needle of ["Upstash/Redis adapter", "Security event ledger", "Monitoring / alerting readiness", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS184_FULL_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS184 Upstash/security event ledger guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass184-upstash-security-event-ledger-safety.mjs
// PASS184

// PASS183 durable rate-limit + API abuse shield guard
try {
  const durableRateLimitSource = read("lib/security/durable-rate-limit.ts");
  const apiAbuseShieldSource = read("lib/security/api-abuse-shield.ts");
  const abuseRouteSource = read("app/api/security/abuse-shield/route.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const marketSearchRouteSource = read("app/api/market-integrity/search/route.ts");
  const marketAnalyzeRouteSource = read("app/api/market-integrity/analyze/route.ts");
  const iconRouteSource = read("app/api/market-integrity/icon/route.ts");
  for (const needle of ["applyDurableRateLimit", "buildDurableRateLimitReadiness", "UPSTASH_REDIS_REST_URL", "memoryFallback"]) {
    if (!durableRateLimitSource.includes(needle)) errors.push(`lib/security/durable-rate-limit.ts: missing PASS183 marker ${needle}.`);
  }
  for (const needle of ["applyApiAbuseShield", "evaluateAbuseSignals", "scanner_like_user_agent", "abuse_shield_blocked", "abuseShieldResponseMeta"]) {
    if (!apiAbuseShieldSource.includes(needle)) errors.push(`lib/security/api-abuse-shield.ts: missing PASS183 marker ${needle}.`);
  }
  for (const needle of ["api_abuse_shield_preview", "buildDurableRateLimitReadiness", "distributed rate-limit store"]) {
    if (!abuseRouteSource.includes(needle)) errors.push(`app/api/security/abuse-shield/route.ts: missing PASS183 marker ${needle}.`);
  }
  for (const needle of ["applyApiAbuseShield", "abuseShieldResponseMeta"]) {
    if (!marketSearchRouteSource.includes(needle)) errors.push(`app/api/market-integrity/search/route.ts: missing PASS183 abuse shield marker ${needle}.`);
    if (!marketAnalyzeRouteSource.includes(needle)) errors.push(`app/api/market-integrity/analyze/route.ts: missing PASS183 abuse shield marker ${needle}.`);
  }
  for (const needle of ["applyApiAbuseShield", "token-icon-proxy", "url.protocol !== \"https:\""]) {
    if (!iconRouteSource.includes(needle)) errors.push(`app/api/market-integrity/icon/route.ts: missing PASS183 icon shield marker ${needle}.`);
  }
  for (const needle of ["buildDurableRateLimitReadiness", "abuseShieldResponseMeta"]) {
    if (!readinessRouteSource.includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS183 readiness marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS183 durable rate-limit / API abuse shield guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass183-durable-rate-limit-abuse-shield-safety.mjs
// PASS183

// PASS182 security hardening guard
try {
  const nextConfigSource = read("next.config.mjs");
  const securityHeadersSource = read("lib/security/http-security.mjs");
  const apiGuardSource = read("lib/security/api-guard.ts");
  const readinessRouteSource = read("app/api/security/readiness/route.ts");
  const marketSearchRouteSource = read("app/api/market-integrity/search/route.ts");
  const marketAnalyzeRouteSource = read("app/api/market-integrity/analyze/route.ts");
  const iconRouteSource = read("app/api/market-integrity/icon/route.ts");
  for (const needle of ["buildSecurityHeaders", "Content-Security-Policy", "Strict-Transport-Security", "Cross-Origin-Opener-Policy", "Permissions-Policy"]) {
    if (!securityHeadersSource.includes(needle) && !nextConfigSource.includes(needle)) errors.push(`PASS182 security header marker missing: ${needle}.`);
  }
  if (!nextConfigSource.includes("buildSecurityHeaders({ isDev })")) errors.push("next.config.mjs: PASS182 centralized security headers not wired.");
  for (const needle of ["securityJson", "applySoftRateLimit", "sanitizeBoundedParam", "rejectOversizedUrl"]) {
    if (!apiGuardSource.includes(needle)) errors.push(`lib/security/api-guard.ts: missing PASS182 marker ${needle}.`);
    const wrappedByPass183 = needle !== "securityJson" && marketSearchRouteSource.includes("applyApiAbuseShield") && marketAnalyzeRouteSource.includes("applyApiAbuseShield") && read("lib/security/api-abuse-shield.ts").includes(needle);
    if (!wrappedByPass183) {
      if (!marketSearchRouteSource.includes(needle)) errors.push(`app/api/market-integrity/search/route.ts: missing PASS182 guard ${needle}.`);
      if (!marketAnalyzeRouteSource.includes(needle)) errors.push(`app/api/market-integrity/analyze/route.ts: missing PASS182 guard ${needle}.`);
    }
  }
  for (const needle of ["buildSecurityReadinessSnapshot", "security_headers_api_guard_preview", "no-store"]) {
    if (!readinessRouteSource.includes(needle) && !read("lib/security/security-readiness.ts").includes(needle)) errors.push(`app/api/security/readiness/route.ts: missing PASS182 readiness marker ${needle}.`);
  }
  for (const needle of ["url.protocol !== \"https:\"", "url.username", "url.password", "url.port", "contentType.toLowerCase().startsWith(\"image/\")", "body.byteLength > 600_000"]) {
    if (!iconRouteSource.includes(needle)) errors.push(`app/api/market-integrity/icon/route.ts: missing PASS182 icon proxy hardening marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS182 security hardening guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass182-security-hardening-safety.mjs
// PASS182

// PASS180 Contract Lens + OSINT Queue foundations guard
try {
  const contractLensSource = read("lib/market-integrity/contract-lens-contract.ts");
  const osintQueueSource = read("lib/market-integrity/osint-queue-contract.ts");
  const contractRouteSource = read("app/api/market-integrity/contract-lens/route.ts");
  const osintRouteSource = read("app/api/market-integrity/osint-queue/route.ts");
  const marketPageSource = read("app/[locale]/market-integrity/page.tsx");
  for (const needle of ["ContractLensSignalId", "owner_control", "proxy_upgrade", "createContractLensPreview"]) {
    if (!contractLensSource.includes(needle)) errors.push(`lib/market-integrity/contract-lens-contract.ts: missing PASS180 marker ${needle}.`);
  }
  for (const needle of ["OsintQueueItem", "blockedClaims", "createOsintQueuePreview", "safe paraphrase"]) {
    if (!osintQueueSource.includes(needle)) errors.push(`lib/market-integrity/osint-queue-contract.ts: missing PASS180 marker ${needle}.`);
  }
  for (const needle of ["contract_lens_preview_only", "externalFetchPerformed: false", "server-only analyzer output"]) {
    if (!contractRouteSource.includes(needle)) errors.push(`app/api/market-integrity/contract-lens/route.ts: missing PASS180 route marker ${needle}.`);
  }
  for (const needle of ["osint_queue_preview_only", "externalFetchPerformed: false", "safe paraphrase"]) {
    if (!osintRouteSource.includes(needle)) errors.push(`app/api/market-integrity/osint-queue/route.ts: missing PASS180 route marker ${needle}.`);
  }
  for (const needle of ["ContractLensPanel", "OsintQueuePanel"]) {
    if (!marketPageSource.includes(needle)) errors.push(`app/[locale]/market-integrity/page.tsx: missing PASS180 panel ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS180 Contract Lens / OSINT Queue guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass180-contract-lens-osint-queue-safety.mjs
// PASS180

// PASS179 Velmère Lens router + full matrix guard
try {
  const lensMapSource = read("lib/search/velmere-lens-route-map.ts");
  const lensRouterSource = read("components/search/VelmereLensCommandRouter.tsx");
  const searchClientSource = read("components/search/VelmereIntelligenceSearchClient.tsx");
  const lensRouteSource = read("app/api/search/lens-route/route.ts");
  const matrixSource = read("VELMERE_PASS179_FULL_PROGRESS_MATRIX.md");
  for (const needle of ["velmereLensRoutes", "contract_lens", "osint_queue", "source_ledger"]) {
    if (!lensMapSource.includes(needle)) errors.push(`lib/search/velmere-lens-route-map.ts: missing PASS179 marker ${needle}.`);
  }
  for (const needle of ["VelmereLensCommandRouter", "Lens does not replace Shield", "Lens nie zastępuje Shielda"]) {
    if (!lensRouterSource.includes(needle)) errors.push(`components/search/VelmereLensCommandRouter.tsx: missing PASS179 router marker ${needle}.`);
  }
  for (const needle of ["VelmereLensCommandRouter", "Velmère Lens", "Legacy guard marker: Velmère Intelligence Search"]) {
    if (!searchClientSource.includes(needle)) errors.push(`components/search/VelmereIntelligenceSearchClient.tsx: missing PASS179 Lens marker ${needle}.`);
  }
  for (const needle of ["velmere_lens_route_preview", "does not replace full Shield analysis", "no-store"]) {
    if (!lensRouteSource.includes(needle)) errors.push(`app/api/search/lens-route/route.ts: missing PASS179 route marker ${needle}.`);
  }
  for (const needle of ["Velmère Lens / Search", "Contract lens readiness", "OSINT queue / analyst workflow", "Całość launch-ready"]) {
    if (!matrixSource.includes(needle)) errors.push(`VELMERE_PASS179_FULL_PROGRESS_MATRIX.md: missing full matrix area ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS179 Lens router/full matrix guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass179-lens-router-full-matrix-safety.mjs
// PASS179

// PASS178 token metadata cache/provider readiness guard
try {
  const metadataCacheSource = read("lib/search/token-metadata-cache.ts");
  const metadataRouteSource = read("app/api/search/token-metadata/route.ts");
  const metadataPanelSource = read("components/search/TokenMetadataProviderPanel.tsx");
  const searchPageSource = read("app/[locale]/search/page.tsx");
  for (const needle of ["TokenMetadataProvider", "curatedTokenMetadata", "createTokenMetadataCacheSnapshot", "externalFetchPerformed: false"]) {
    if (!metadataCacheSource.includes(needle)) errors.push(`lib/search/token-metadata-cache.ts: missing PASS178 marker ${needle}.`);
  }
  for (const needle of ["token_metadata_cache_preview", "performs no external provider fetch", "no-store"]) {
    if (!metadataRouteSource.includes(needle)) errors.push(`app/api/search/token-metadata/route.ts: missing PASS178 route marker ${needle}.`);
  }
  for (const needle of ["TokenMetadataProviderPanel", "getTokenMetadataProviderSummary", "tokenMetadataProviders"]) {
    if (!metadataPanelSource.includes(needle)) errors.push(`components/search/TokenMetadataProviderPanel.tsx: missing PASS178 panel marker ${needle}.`);
  }
  if (!searchPageSource.includes("TokenMetadataProviderPanel")) errors.push("app/[locale]/search/page.tsx: missing PASS178 TokenMetadataProviderPanel.");
} catch (error) {
  errors.push(`PASS178 token metadata cache guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass178-token-metadata-cache-safety.mjs
// PASS178

// PASS177 live search adapter + Shield query state guard
try {
  const adapterSource = read("lib/search/live-search-adapter-skeleton.ts");
  const liveRouteSource = read("app/api/search/live-preview/route.ts");
  const searchContractSource = read("lib/search/intelligence-search-contract.ts");
  const searchClientSource = read("components/search/VelmereIntelligenceSearchClient.tsx");
  const shieldClientSource = read("components/market-integrity/MarketIntegrityClient.tsx");
  for (const needle of ["VelmereLiveSearchAdapter", "createLiveSearchAdapterPreview", "externalFetchPerformed: false"]) {
    if (!adapterSource.includes(needle)) errors.push(`lib/search/live-search-adapter-skeleton.ts: missing PASS177 marker ${needle}.`);
  }
  for (const needle of ["live_search_adapter_preview_only", "does not fetch public web or OSINT sources", "no-store"]) {
    if (!liveRouteSource.includes(needle)) errors.push(`app/api/search/live-preview/route.ts: missing PASS177 safety marker ${needle}.`);
  }
  for (const needle of ["avatarImage?: string", "assets.coingecko.com"]) {
    if (!searchContractSource.includes(needle)) errors.push(`lib/search/intelligence-search-contract.ts: missing PASS177 logo marker ${needle}.`);
  }
  for (const needle of ["result.avatarImage", "vis-live-adapter-note"]) {
    if (!searchClientSource.includes(needle)) errors.push(`components/search/VelmereIntelligenceSearchClient.tsx: missing PASS177 UI marker ${needle}.`);
  }
  for (const needle of ["routeParams.get(\"asset\")", "routeParams.get(\"query\")", "velmere-search", "cleanRouteScan"]) {
    if (!shieldClientSource.includes(needle)) errors.push(`components/market-integrity/MarketIntegrityClient.tsx: missing PASS177 query bridge marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS177 live search / Shield query guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass177-live-search-shield-query-safety.mjs
// PASS177

// PASS176 Search bridge + discovery capsules guard
try {
  const searchContractSource = read("lib/search/intelligence-search-contract.ts");
  const searchClientSource = read("components/search/VelmereIntelligenceSearchClient.tsx");
  const bridgeRouteSource = read("app/api/search/bridge/route.ts");
  const discoveryRailSource = read("components/search/VelmereSearchDiscoveryRail.tsx");
  for (const needle of ["VelmereShieldBridge", "buildVelmereShieldBridge", "full_shield_analysis", "avatarLabel"]) {
    if (!searchContractSource.includes(needle)) errors.push(`lib/search/intelligence-search-contract.ts: missing PASS176 marker ${needle}.`);
  }
  for (const needle of ["VelmereSearchDiscoveryRail", "vis-bridge-box", "result.bridge?.href"]) {
    if (!searchClientSource.includes(needle)) errors.push(`components/search/VelmereIntelligenceSearchClient.tsx: missing PASS176 marker ${needle}.`);
  }
  for (const needle of ["search_to_shield_bridge_preview", "storageWritePerformed: false", "does not create a final risk verdict"]) {
    if (!bridgeRouteSource.includes(needle)) errors.push(`app/api/search/bridge/route.ts: missing PASS176 safety marker ${needle}.`);
  }
  for (const needle of ["Velmère discovery layer", "Narrative radar", "Source gap map", "VLM capsule"]) {
    if (!discoveryRailSource.includes(needle)) errors.push(`components/search/VelmereSearchDiscoveryRail.tsx: missing PASS176 discovery marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS176 search bridge/discovery guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass176-search-bridge-discovery-safety.mjs
// PASS176

// PASS175 Velmère Intelligence Search guard
try {
  const searchPageSource = read("app/[locale]/search/page.tsx");
  const searchClientSource = read("components/search/VelmereIntelligenceSearchClient.tsx");
  const searchRouteSource = read("app/api/search/route.ts");
  const searchContractSource = read("lib/search/intelligence-search-contract.ts");
  for (const needle of ["VelmereIntelligenceSearchClient", "Velmère Intelligence Search"]) {
    if (!searchPageSource.includes(needle) && !searchClientSource.includes(needle)) errors.push(`search page/client: missing PASS175 marker ${needle}.`);
  }
  for (const needle of ["VelmereSearchResult", "searchVelmereIntelligence", "shieldHref", "missingData", "nextOperatorStep"]) {
    if (!searchContractSource.includes(needle)) errors.push(`lib/search/intelligence-search-contract.ts: missing PASS175 marker ${needle}.`);
  }
  for (const needle of ["velmere_intelligence_search_preview", "sanitizeSearchInput", "no-store"]) {
    if (!searchRouteSource.includes(needle)) errors.push(`app/api/search/route.ts: missing PASS175 safety marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS175 intelligence search guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass175-intelligence-search-safety.mjs
// PASS175

// PASS174 source cache + snapshot ledger guard
try {
  const runtimeSource = read("lib/market-integrity/source-adapter-runtime.ts");
  const routeSource = read("app/api/market-integrity/source-snapshot/route.ts");
  const pageSource = read("app/[locale]/market-integrity/page.tsx");
  for (const needle of ["SourceAdapterEnvelope", "redactSourcePayload", "getSourceCacheDecision", "createDemoSourceSnapshotBundle"]) {
    if (!runtimeSource.includes(needle)) errors.push(`lib/market-integrity/source-adapter-runtime.ts: missing PASS174 marker ${needle}.`);
  }
  for (const needle of ["source_snapshot_preview_only", "storageWritePerformed: false", "no-store"]) {
    if (!routeSource.includes(needle)) errors.push(`app/api/market-integrity/source-snapshot/route.ts: missing PASS174 safety marker ${needle}.`);
  }
  if (!pageSource.includes("SourceSnapshotLedgerPanel")) errors.push("app/[locale]/market-integrity/page.tsx: missing PASS174 SourceSnapshotLedgerPanel.");
} catch (error) {
  errors.push(`PASS174 source cache/snapshot guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass174-source-cache-snapshot-ledger-safety.mjs
// PASS174

// PASS173 real browser QA + market source readiness guard
try {
  const contractSource = read("lib/market-integrity/live-source-adapter-contract.ts");
  const marketPageSource = read("app/[locale]/market-integrity/page.tsx");
  const routeSource = read("app/api/market-integrity/source-readiness/route.ts");
  for (const needle of ["marketIntegritySourceFreshnessRules", "targetTtlSeconds", "staleAfterSeconds", "mustNeverClaim"]) {
    if (!contractSource.includes(needle)) errors.push(`lib/market-integrity/live-source-adapter-contract.ts: missing PASS173 marker ${needle}.`);
  }
  for (const needle of ["MarketIntegritySourceReadinessPanel", "RealBrowserQaPanel"]) {
    if (!marketPageSource.includes(needle)) errors.push(`app/[locale]/market-integrity/page.tsx: missing PASS173 panel ${needle}.`);
  }
  for (const needle of ["source_readiness_preview_only", "storageWritePerformed", "no-store"]) {
    if (!routeSource.includes(needle)) errors.push(`app/api/market-integrity/source-readiness/route.ts: missing PASS173 safety marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS173 browser/source readiness guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-pass173-browser-source-readiness-safety.mjs
// PASS173

// PASS172 board density + renderer contract guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  const rendererContract = read("lib/launch/vlm-brain-renderer-contract.ts");
  for (const needle of ["boardDensity", "shield-vlm-static-density-${boardDensity}", "sparsePositions"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS172 marker ${needle}.`);
  }
  for (const needle of ["PASS172 · evidence board sparse/focused density polish", ".shield-vlm-static-density-sparse", ".shield-vlm-static-density-focused"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS172 CSS marker ${needle}.`);
  }
  for (const needle of ["dom_orbit_360", "dom_evidence_board", "webgl_prototype", "getVlmBrainRendererSummary"]) {
    if (!rendererContract.includes(needle)) errors.push(`lib/launch/vlm-brain-renderer-contract.ts: missing renderer contract marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS172 board density/renderer guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-vlm-brain-board-density-renderer-contract-safety.mjs

// PASS171 evidence board focus + WebGL prototype lane guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  const webglSource = read("components/market-integrity/VlmBrainWebGLPrototype.tsx");
  for (const needle of ["shield-vlm-board-mode", "staticBoardRingName", "shield-vlm-static-map-rings"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS171 marker ${needle}.`);
  }
  for (const needle of ["PASS171 · evidence board focus polish", ".shield-vlm-board-mode .shield-vlm-dom-core", ".shield-vlm-static-map-ring-a"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS171 CSS marker ${needle}.`);
  }
  for (const needle of ["PASS171 WebGL-ready lane", "canvas.getContext(\"webgl\"", "data-webgl-prototype=\"vlm-brain\""]) {
    if (!webglSource.includes(needle)) errors.push(`components/market-integrity/VlmBrainWebGLPrototype.tsx: missing PASS171 WebGL marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS171 board/WebGL guard failed: ${error instanceof Error ? error.message : String(error)}`);
}
// guard script marker: verify-vlm-brain-board-focus-webgl-lane-safety.mjs

// PASS170 unified orbit/board production guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["const allowedMotionPresets = useMemo<MotionPreset[]>(() => [\"orbit\", \"static\"], []);", "const [motionPreset, setMotionPreset] = useState<MotionPreset>(\"orbit\");", "shield-vlm-static-stage", "staticBoardTileStyle", "supportsOrbit360 = true"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS170 marker ${needle}.`);
  }
  for (const needle of ["PASS170 · unified Orbit 360 + full-screen evidence board", ".shield-vlm-static-stage", ".shield-vlm-static-card"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS170 CSS marker ${needle}.`);
  }
} catch (error) {
  errors.push(`PASS170 unified orbit/board guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Evidence report production guard
try {
  const evidenceSource = read("lib/market-integrity/evidence-report.ts");
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["buildShieldEvidenceReportDraft", "sourceLedger", "missingDataAppendix", "redactionRules", "draft_only"]) {
    if (!evidenceSource.includes(needle)) errors.push(`lib/market-integrity/evidence-report.ts: missing ${needle}.`);
  }
  for (const needle of ["buildShieldEvidenceReportDraft(result, operatorCaseFile)", "evidenceReportDraft.exportStatus", "shield-evidence-draft"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing evidence report UI ${needle}.`);
  }
  if (!cssSource.includes("PASS129 — evidence draft source ledger")) {
    errors.push("app/globals.css: missing PASS129 evidence draft CSS.");
  }
} catch (error) {
  errors.push(`Evidence report production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Operator casefile production guard
try {
  const casefileSource = read("lib/market-integrity/operator-casefile.ts");
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["buildShieldOperatorCaseFile", "ShieldOperatorCaseFile", "osintQueries", "operatorChecklist"]) {
    if (!casefileSource.includes(needle)) errors.push(`lib/market-integrity/operator-casefile.ts: missing ${needle}.`);
  }
  for (const needle of ["buildShieldOperatorCaseFile(result)", "operatorCaseFile.primaryNextAction", "shield-operator-casefile", "shield-vlm-orbital-shell"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS126 marker ${needle}.`);
  }
  for (const needle of ["PASS126 — operator casefile", ".shield-operator-casefile", ".shield-vlm-orbital-shell"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing PASS126 CSS marker ${needle}.`);
  }
} catch (error) {
  errors.push(`Operator casefile production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// VLM motion governor production guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["type MotionPreset", "motionPreset", "renderHeavyCanvas", "shield-vlm-motion-toggle-mini"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing VLM motion governor marker ${needle}.`);
  }
  for (const needle of ["PASS128 — VLM motion governor", "PASS148 — VLM brain cleanup", ".shield-vlm-motion-governor", ".shield-token-search-suggest-panel"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing VLM motion governor CSS marker ${needle}.`);
  }
} catch (error) {
  errors.push(`VLM motion governor production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// VLM organic motion production guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["isInvestigationMode", "advancedOrbitalSlots", "setOrbitTick", "shield-vlm-brain-chip", `runVlmAiSequence("pro")`]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing VLM spherical motion marker ${needle}.`);
  }
  for (const needle of ["PASS125 — real VLM spherical orbit layer", "PASS127 — clean chart surface", "perspective: 2100px"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing VLM spherical motion CSS marker ${needle}.`);
  }
} catch (error) {
  errors.push(`VLM organic motion production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Shield runtime UI production guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const modalBody = modalSource.slice(modalSource.indexOf("export default function TokenRiskModal"));
  const shieldMapSource = read("components/market-integrity/ShieldMapClient.tsx");
  const marketSource = read("components/market-integrity/MarketIntegrityClient.tsx");
  const cssSource = read("app/globals.css");

  if (modalBody.includes("{ui.controlKicker}") && !modalBody.includes("const ui = useMemo(() =>")) {
    errors.push("components/market-integrity/TokenRiskModal.tsx: ui control copy must exist in TokenRiskModal scope.");
  }
  for (const needle of ["investigatorSuggestRef", "closeOnOutsidePointer", "role=\"listbox\""]) {
    if (!shieldMapSource.includes(needle)) errors.push(`components/market-integrity/ShieldMapClient.tsx: missing suggestion outside-click marker ${needle}.`);
  }
  if (shieldMapSource.includes("onBlur={() => window.setTimeout(() => setSuggestionsOpen(false)")) {
    errors.push("components/market-integrity/ShieldMapClient.tsx: suggestions must not rely on blur timeout.");
  }
  if (!marketSource.includes("shield-token-search-suggest-panel") || !marketSource.includes("z-[10000]")) {
    errors.push("components/market-integrity/MarketIntegrityClient.tsx: search suggestions must use high overlay layer.");
  }
  for (const needle of ["overflow: visible", "z-index: 10000", "shield-token-search-suggest-panel"]) {
    if (!cssSource.includes(needle)) errors.push(`app/globals.css: missing Shield suggestion overlay CSS ${needle}.`);
  }
} catch (error) {
  errors.push(`Shield runtime UI production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// AI risk brain scenario guard
try {
  const scenarioSource = read("scripts/verify-ai-risk-brain-scenarios.mjs");
  for (const needle of ["mega_cap_normal_volatility", "stablecoin_depeg", "low_float_parabolic_pump", "contract_trap", "no_data_token"]) {
    if (!scenarioSource.includes(needle)) errors.push(`scripts/verify-ai-risk-brain-scenarios.mjs: missing scenario ${needle}.`);
  }
} catch (error) {
  errors.push(`AI risk brain scenario guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// AI brain import contract production guard
try {
  const riskSource = read("lib/market-integrity/risk-engine.ts");
  const typeSource = read("lib/market-integrity/risk-types.ts");
  const promptSource = read("docs/codex-handoff/CODEX_AI_RISK_BRAIN_ONLY_ONE_FILE_PASS3_PROMPT.md");
  for (const [needle, message] of [
    ["export function analyzeTokenRisk", "analyzeTokenRisk export must remain."],
    ["computeDataConfidence", "computeDataConfidence must remain."],
    ["buildLimitations", "buildLimitations must remain."],
    ["computeFusedRiskScore", "computeFusedRiskScore must remain."],
    ["buildMetaModel", "buildMetaModel must remain."],
    ["OSINT source ledger not attached", "OSINT limitation must remain."],
    ["vesting/unlock schedule not verified", "vesting limitation must remain."],
  ]) {
    if (!riskSource.includes(needle)) errors.push(`lib/market-integrity/risk-engine.ts: ${message}`);
  }
  for (const forbidden of ["fetch(", "window.", "document.", "localStorage", "as any", "safe investment", "scam confirmed", "fraud proven", "buy signal", "sell signal"]) {
    if (riskSource.toLowerCase().includes(forbidden.toLowerCase())) errors.push(`lib/market-integrity/risk-engine.ts: forbidden risk-engine content "${forbidden}".`);
  }
  const unionMatch = typeSource.match(/export type RiskSignalId =([\s\S]*?);/);
  if (unionMatch) {
    const allowed = new Set([...unionMatch[1].matchAll(/\|\s+"([^"]+)"/g)].map((match) => match[1]));
    for (const match of riskSource.matchAll(/addSignal\(signals,\s*\{[\s\S]*?id:\s+"([^"]+)"/g)) {
      if (!allowed.has(match[1])) errors.push(`lib/market-integrity/risk-engine.ts: signal id "${match[1]}" is missing from RiskSignalId union.`);
    }
  }
  if (!promptSource.includes("edytować dokładnie jeden plik") || !promptSource.includes("NIE OTWIERAJ pełnego repo Velmère")) {
    errors.push("docs/codex-handoff/CODEX_AI_RISK_BRAIN_ONLY_ONE_FILE_PASS3_PROMPT.md: prompt must force one-file codex workflow.");
  }
} catch (error) {
  errors.push(`AI brain import contract production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Locale surface production guard
try {
  const footerSource = read("components/Footer.tsx");
  const homeSource = read("components/home/HomePageClient.tsx");
  const shieldMapSource = read("components/market-integrity/ShieldMapClient.tsx");
  if (!footerSource.includes("function footerCopy(locale: string)") || !footerSource.includes("useLocale()")) {
    errors.push("components/Footer.tsx: footer must use locale-aware copy.");
  }
  if (!homeSource.includes("function homeCopy(locale: string)") || !(homeSource.includes("const copy = homeCopy(useLocale())") || homeSource.includes("const copy = homeCopy(locale)"))) {
    errors.push("components/home/HomePageClient.tsx: homepage must use locale-aware copy.");
  }
  for (const needle of ["const pageCopy = useMemo", "const atlasNodes = useMemo", "const commandRoomCards = useMemo", "const brainImportLanes = useMemo"]) {
    if (!shieldMapSource.includes(needle)) errors.push(`components/market-integrity/ShieldMapClient.tsx: missing locale-aware block ${needle}.`);
  }
  if (/"\{pageCopy\./.test(shieldMapSource)) {
    errors.push("components/market-integrity/ShieldMapClient.tsx: pageCopy placeholder found inside a string literal.");
  }
} catch (error) {
  errors.push(`Locale surface production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// VLM brain performance guard
try {
  const modalFile = "components/market-integrity/TokenRiskModal.tsx";
  const modalSource = read(modalFile);
  const vlmForbidden = [
    ["RISK ${riskScore}%", "Duplicated risk score under the VLM orb must not return."],
    ["ctx.fillText(`RISK", "Canvas risk text under the VLM orb must not return."],
    ["Math.random()", "VLM brain graph should use deterministic seeded randomness, not Math.random()."],
    ["((index % 5)", "Old undefined index transform bug must not return."],
    ["(index % 4)", "Old undefined index transform bug must not return."],
  ];
  for (const [needle, message] of vlmForbidden) {
    if (modalSource.includes(needle)) errors.push(`${modalFile}: ${message}`);
  }
  const vlmRequired = [
    ["maxAnimationLife", "Canvas animation should have a hard max lifetime."],
    ["idleFrameBudget", "Canvas animation should slow down after the readout is complete."],
    ["randomFrom", "VLM brain should use deterministic seeded graph generation."],
    ["advancedTileStyle", "Advanced tiles should use the typed 3D cockpit placement helper."],
    ["shield-vlm-tile-anchor", "Advanced tile anchors should be present to control 3D placement and overlap."],
    ["prefers-reduced-motion: reduce", "Reduced-motion mode should be respected."],
  ];
  for (const [needle, message] of vlmRequired) {
    if (!modalSource.includes(needle)) errors.push(`${modalFile}: ${message}`);
  }
} catch (error) {
  errors.push(`VLM brain performance guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Risk engine production guard
try {
  const riskFile = "lib/market-integrity/risk-engine.ts";
  const riskSource = read(riskFile);
  const riskForbidden = [
    ["result.limitations", "Limitations must live in metaModel.limitations, not result.limitations."],
    ["RISK {riskScore}%", "Old duplicated VLM orb risk text must not return."],
    ["odczyt ryzyka", "Old duplicated Polish risk text must not return."],
    ["risk extraction", "Old duplicated English risk text must not return."],
    ["((index % 5)", "Old undefined index transform bug must not return."],
    ["(index % 4)", "Old undefined index transform bug must not return."],
  ];
  for (const [needle, message] of riskForbidden) {
    if (riskSource.includes(needle)) errors.push(`${riskFile}: ${message}`);
  }
  if (/\[\s*\.\.\.\s*[^;\n]*(?:\.values\(\)|\.keys\(\)|\.entries\(\))/.test(riskSource)) {
    errors.push(`${riskFile}: do not spread Map/Set iterators directly; use Array.from(...) for Vercel target safety.`);
  }
  if (!/export function analyzeTokenRisk\s*\(/.test(riskSource)) errors.push(`${riskFile}: analyzeTokenRisk export is missing.`);
  if (!/export function levelFromScore\s*\(/.test(riskSource)) errors.push(`${riskFile}: levelFromScore export is missing.`);
  if (!/export function badgeFromLevel\s*\(/.test(riskSource)) errors.push(`${riskFile}: badgeFromLevel export is missing.`);
  if (/\b(buy now|safe buy|guaranteed profit|scam proven|fraud confirmed|moon|easy money)\b/i.test(riskSource)) {
    errors.push(`${riskFile}: unsafe hype/advice/legal-accusation language found.`);
  }
} catch (error) {
  errors.push(`Risk engine production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

const textFiles = [
  ...walk("app", [".ts", ".tsx", ".css", ".js", ".jsx"]),
  ...walk("components", [".ts", ".tsx", ".css", ".js", ".jsx"]),
  ...walk("lib", [".ts", ".tsx", ".css", ".js", ".jsx"]),
  ...walk("store", [".ts", ".tsx", ".css", ".js", ".jsx"]),
];

for (const file of textFiles) {
  const source = read(file);
  if (/repeat\s*:\s*Infinity/.test(source)) errors.push(`${file}: use repeat: 999999 instead of repeat: Infinity for Vercel/WAAPI safety.`);
  if (/iterationCount/.test(source)) errors.push(`${file}: do not pass iterationCount manually to WAAPI.`);
  if (/\b(?:border|bg|text|ring|from|via|to|shadow|outline|divide|placeholder|stroke|fill)-[^\s"'`{}]+\/(?:1[1-9]|[2-9][1-9])\b/.test(source)) {
    const bad = source.match(/\b(?:border|bg|text|ring|from|via|to|shadow|outline|divide|placeholder|stroke|fill)-[^\s"'`{}]+\/(?:1[1-9]|[2-9][1-9])\b/)?.[0];
    const allowed = /\/(15|20|25|30|40|50|60|70|75|80|90|95|100)$/.test(bad ?? "");
    if (!allowed) errors.push(`${file}: suspicious Tailwind opacity class ${bad}. Use arbitrary syntax like border-white/[0.12].`);
  }
  if (/function\s+previewHeaders\s*\(\s*\)\s*\{/.test(source)) {
    errors.push(`${file}: previewHeaders must be typed as previewHeaders(): HeadersInit and must build a Record<string, string> without undefined header values.`);
  }
  if (/x-velmere-preview-session[\s\S]{0,240}\?\s*undefined/.test(source)) {
    errors.push(`${file}: do not create HeadersInit objects with optional undefined header values; build a Record<string, string> and conditionally assign the header.`);
  }
}


try {
  const cartSource = read("components/CartDrawer.tsx");
  const checkoutSuccess = read("app/[locale]/checkout/success/page.tsx");
  const checkoutCancel = read("app/[locale]/checkout/cancel/page.tsx");
  const commerceSurface = `${cartSource}\n${checkoutSuccess}\n${checkoutCancel}`;
  for (const banned of ["Order book", "ALLOCATED", "PX:", "acceptTokenPrefix"]) {
    if (commerceSurface.includes(banned)) {
      errors.push(`commerce copy guard: remove trading/token-gating copy '${banned}' from clothing cart/checkout surfaces.`);
    }
  }
  if (/agreedToken|setAgreedToken/.test(cartSource)) {
    errors.push("components/CartDrawer.tsx: token agreement checkbox must not block clothing checkout; VLM perks stay optional.");
  }
} catch (error) {
  errors.push(`Commerce copy guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


try {
  const rootPagePath = path.join(root, "app/page.tsx");
  if (!fs.existsSync(rootPagePath)) {
    errors.push("app/page.tsx: root deployment path '/' must exist and redirect to the default locale so Vercel domain preview does not show a 404.");
  } else {
    const rootPage = read("app/page.tsx");
    if (!/redirect\(["']\/pl["']\)/.test(rootPage)) {
      errors.push("app/page.tsx: root page should redirect('/pl') to avoid Vercel root-domain 404.");
    }
  }
} catch (error) {
  errors.push(`Root route guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const navbar = read("components/Navbar.tsx");
  if (!/const\s+closeMenuPanel\s*=/.test(navbar)) {
    errors.push("components/Navbar.tsx: side menu links need a closeMenuPanel() handler so the mobile drawer closes after navigation.");
  }
  const closeHits = [...navbar.matchAll(/onClick=\{closeMenuPanel\}/g)].length;
  if (closeHits < 4) {
    errors.push("components/Navbar.tsx: expected drawer logo, menu links, legal links, and language links to call closeMenuPanel on click.");
  }
} catch (error) {
  errors.push(`Navbar drawer guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


try {
  const square = read("components/square/VelmereSquareClient.tsx");
  if (/addEventListener\("touchmove"[\s\S]{0,220}preventDefault/.test(square) || /addEventListener\("wheel"[\s\S]{0,220}preventDefault/.test(square)) {
    errors.push("components/square/VelmereSquareClient.tsx: do not block touchmove/wheel globally; mobile post modals must remain scrollable.");
  }
  if (!/fixed inset-0 z-\[220\][^"`]*overflow-y-auto/.test(square)) {
    errors.push("components/square/VelmereSquareClient.tsx: post modal overlay should use overflow-y-auto so long posts/comments scroll on mobile.");
  }
  if (!/top-\[calc\(env\(safe-area-inset-top\)\+0\.75rem\)\]/.test(square)) {
    errors.push("components/square/VelmereSquareClient.tsx: mobile post modal needs a visible safe-area close button near the top edge.");
  }
} catch (error) {
  errors.push(`Square mobile guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const vlmSwitch = read("components/vlm/VlmModeSwitch.tsx");
  if (!/fixed inset-x-4 bottom-\[calc\(env\(safe-area-inset-bottom\)\+9\.25rem\)\]/.test(vlmSwitch)) {
    errors.push("components/vlm/VlmModeSwitch.tsx: mobile Basic/Pro switch must be centered above Angel with inset-x-4, not clipped on the right edge.");
  }
  if (!/max-w-\[15\.5rem\]/.test(vlmSwitch)) {
    errors.push("components/vlm/VlmModeSwitch.tsx: mobile Basic/Pro control needs a max width so both labels stay visible.");
  }
} catch (error) {
  errors.push(`VLM mobile switch guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


try {
  const rootPagePath = path.join(root, "app/page.tsx");
  if (!fs.existsSync(rootPagePath)) {
    errors.push("app/page.tsx: root deployment path '/' must exist and redirect to the default locale so Vercel domain preview does not show a 404.");
  } else {
    const rootPage = read("app/page.tsx");
    if (!/redirect\(["']\/pl["']\)/.test(rootPage)) {
      errors.push("app/page.tsx: root page should redirect('/pl') to avoid Vercel root-domain 404.");
    }
  }
} catch (error) {
  errors.push(`Root route guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const navbar = read("components/Navbar.tsx");
  if (!/ShoppingBag/.test(navbar) || !/aria-label="Open cart"/.test(navbar)) {
    errors.push("components/Navbar.tsx: mobile header must always expose the cart button with a ShoppingBag icon and Open cart label.");
  }
} catch (error) {
  errors.push(`Navbar cart guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const walletTypes = read("lib/wallet/types.ts");
  const walletButton = read("components/wallet/WalletConnectButton.tsx");
  const union = walletTypes.match(/export type WalletKind\s*=\s*([^;]+);/s)?.[1] ?? "";
  const kinds = [...union.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const kind of kinds) {
    if (!new RegExp(`${kind}\\s*:`).test(walletButton)) {
      errors.push(`components/wallet/WalletConnectButton.tsx: WALLET_CONFIG is missing WalletKind '${kind}'.`);
    }
  }
  if (!/Record<WalletKind/.test(walletButton)) {
    errors.push("components/wallet/WalletConnectButton.tsx: WALLET_CONFIG should be typed as Record<WalletKind, ...> to prevent union indexing errors.");
  }
} catch (error) {
  errors.push(`Wallet config guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const productCard = read("components/product/ProductCard.tsx");
  const shopPage = read("components/shop/ShopPageClient.tsx");
  if (!/priority\?: boolean/.test(productCard) || !/priority=\{priority\}/.test(productCard)) {
    errors.push("components/product/ProductCard.tsx: ProductCard must accept a priority prop and pass it to the primary next/image for LCP safety.");
  }
  if (!/priority=\{index < 2\}/.test(shopPage)) {
    errors.push("components/shop/ShopPageClient.tsx: first visible product cards should pass priority={index < 2} to optimize above-the-fold mobile LCP.");
  }
} catch (error) {
  errors.push(`Product image optimization guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const cartStore = read("store/useCartStore.ts");
  const cartProvider = read("components/CartProvider.tsx");
  const cartDrawer = read("components/CartDrawer.tsx");
  if (!/skipHydration:\s*true/.test(cartStore) || !/hasHydrated/.test(cartStore)) {
    errors.push("store/useCartStore.ts: persisted cart needs skipHydration and an explicit hasHydrated flag to prevent hydration flicker.");
  }
  if (!/safeItems/.test(cartProvider)) {
    errors.push("components/CartProvider.tsx: expose safeItems only after cart hydration to avoid SSR/client cart mismatch.");
  }
  if (!/!mounted \|\| !hasHydrated/.test(cartDrawer)) {
    errors.push("components/CartDrawer.tsx: drawer should return null until mounted and cart storage has hydrated.");
  }
} catch (error) {
  errors.push(`Cart hydration guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const middleware = read("middleware.ts");
  const hasRequiredExclusions = ["api", "_next", "_vercel"].every((part) => middleware.includes(part)) && (middleware.includes(".*\\\\..*") || middleware.includes(".*\\..*"));
  if (!hasRequiredExclusions) {
    errors.push("middleware.ts: matcher must exclude api, _next, _vercel and static files with extensions to avoid Edge work on images/assets.");
  }
} catch (error) {
  errors.push(`Middleware matcher guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const printful = read("lib/printful/client.ts");
  if (/cache:\s*["']no-store["'][\s\S]{0,80}method\s*===\s*["']GET/.test(printful) || !/revalidate:\s*options\.revalidate \?\? 3600/.test(printful)) {
    errors.push("lib/printful/client.ts: GET requests should use Next revalidate cache by default to avoid Printful rate limiting.");
  }
} catch (error) {
  errors.push(`Printful cache guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const webhook = read("app/api/stripe/webhook/route.ts");
  const orderService = read("lib/db/order-service.ts");
  if (!/stripe\.webhooks\.constructEvent/.test(webhook) || !/stripe-signature/.test(webhook)) {
    errors.push("app/api/stripe/webhook/route.ts: Stripe webhook must verify stripe-signature with constructEvent.");
  }
  if (!/hasProcessedStripeWebhookEvent/.test(webhook) || !/markStripeWebhookEventProcessed/.test(orderService)) {
    errors.push("Stripe webhook needs idempotency storage to prevent replay/double-fulfilment events.");
  }
} catch (error) {
  errors.push(`Stripe webhook guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const provider = read("components/wallet/Web3Provider.tsx");
  if (!/reconnectOnMount=\{false\}/.test(provider)) {
    errors.push("components/wallet/Web3Provider.tsx: set reconnectOnMount={false} to prevent wallet reconnect loops/hydration surprises.");
  }
} catch (error) {
  errors.push(`Web3 provider guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const neural = read("components/home/NeuralBrainVisual.tsx");
  if (!/lowPowerMode/.test(neural) || !/max-width: 767px/.test(neural)) {
    errors.push("components/home/NeuralBrainVisual.tsx: mobile canvas must have lowPowerMode to prevent battery drain and scroll lag.");
  }
} catch (error) {
  errors.push(`Mobile animation guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


try {
  const localeLayout = read("app/[locale]/layout.tsx");
  const localeHome = read("app/[locale]/page.tsx");
  if (!/unstable_setRequestLocale\(locale\)/.test(localeLayout)) {
    errors.push("app/[locale]/layout.tsx: locale layout must call unstable_setRequestLocale(locale) so /pl, /en and /de resolve reliably on Vercel.");
  }
  if (!/export default function HomePage/.test(localeHome) || !/HomePageClient/.test(localeHome)) {
    errors.push("app/[locale]/page.tsx: locale root pages /pl, /en and /de must render the homepage instead of falling to global 404.");
  }
} catch (error) {
  errors.push(`Locale root route guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const requiredLocaleRoutes = [
    "page.tsx",
    "login/page.tsx",
    "account/page.tsx",
    "cart/page.tsx",
    "shop/page.tsx",
    "clothing/page.tsx",
    "square/page.tsx",
    "vlm-token/page.tsx",
    "market-integrity/page.tsx",
    "community/page.tsx",
    "contact/page.tsx",
    "returns/page.tsx",
    "shipping/page.tsx",
    "terms/page.tsx",
    "privacy/page.tsx",
  ];
  for (const route of requiredLocaleRoutes) {
    const routePath = path.join(root, "app/[locale]", route);
    if (!fs.existsSync(routePath)) {
      errors.push(`app/[locale]/${route}: required locale route is missing; Vercel may show a false 404.`);
    }
  }

  const missingFallback = read("app/[locale]/[...missing]/page.tsx");
  if (!/LOGIN_ALIASES/.test(missingFallback) || !/LoginPage/.test(missingFallback)) {
    errors.push("app/[locale]/[...missing]/page.tsx: catch-all route must rescue /login aliases so stale Vercel rewrites cannot show a false 404 for /pl/login.");
  }
} catch (error) {
  errors.push(`Locale route smoke guard failed: ${error instanceof Error ? error.message : String(error)}`);
}



try {
  const authGate = read("components/auth/AuthGate.tsx");
  const localeDeclarations = [...authGate.matchAll(/const\s+locale\s*=\s*useLocale\(/g)].length;
  if (localeDeclarations > 1) {
    errors.push("components/auth/AuthGate.tsx: useLocale() was declared as const locale more than once; keep one rawLocale/useLocale declaration to avoid SWC compile errors.");
  }
  if (/const\s+locale\s*=\s*useLocale\(\);[\s\S]{0,240}const\s+locale\s*=\s*useLocale\(\)/.test(authGate)) {
    errors.push("components/auth/AuthGate.tsx: duplicate locale constant detected near AuthGate; this breaks next dev/build.");
  }
} catch (error) {
  errors.push(`AuthGate duplicate-locale guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const navbar = read("components/Navbar.tsx");
  const middleware = read("middleware.ts");
  const authForm = read("components/auth/AuthFormClient.tsx");
  if (!/localizedLoginHref/.test(navbar) || !/localizedAccountHref/.test(navbar)) {
    errors.push("components/Navbar.tsx: account/header icon must use hard locale-prefixed login/account hrefs to avoid /login or false 404 navigation on Vercel.");
  }
  if (/href=\{isMemberActive \? \"\/account\" : \"\/login\"\}/.test(navbar) || /href=\"\/login\"/.test(navbar)) {
    errors.push("components/Navbar.tsx: do not use raw /login or /account in header/member navigation; use /${locale}/login or /${locale}/account.");
  }
  for (const route of [
    "app/login/page.tsx",
    "app/account/page.tsx",
    "app/logowanie/page.tsx",
    "app/[locale]/login/page.tsx",
    "app/[locale]/account/page.tsx",
    "app/[locale]/logowanie/page.tsx",
    "app/[locale]/sign-in/page.tsx",
    "app/[locale]/signin/page.tsx",
  ]) {
    if (!fs.existsSync(path.join(root, route))) {
      errors.push(`${route}: auth route or alias is missing; login/member clicks may show 404.`);
    }
  }
  if (!/ROOT_AUTH_ALIASES/.test(middleware) || !/LOCALE_AUTH_ALIASES/.test(middleware)) {
    errors.push("middleware.ts: auth aliases must redirect /login, /account and /pl/logowanie-style paths to stable locale routes.");
  }
  if (!/window\.location\.assign\(accountHref\)/.test(authForm)) {
    errors.push("components/auth/AuthFormClient.tsx: after preview login, redirect with a hard locale-prefixed accountHref to avoid router locale confusion.");
  }
} catch (error) {
  errors.push(`Auth route hardening guard failed: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const marketPage = read("app/[locale]/market-integrity/page.tsx");
  const riskEngine = read("lib/market-integrity/risk-engine.ts");
  const apiRoute = read("app/api/market-integrity/analyze/route.ts");
  const client = read("components/market-integrity/MarketIntegrityClient.tsx");
  const riskCard = read("components/market-integrity/TokenRiskCard.tsx");
  const modal = read("components/market-integrity/TokenRiskModal.tsx");
  const klinesRoute = read("app/api/market-integrity/klines/route.ts");
  const sentinelRoute = read("app/api/market-integrity/sentinel/route.ts");
  const alertsLib = read("lib/market-integrity/risk-alerts.ts");
  if (!/MarketIntegrityClient/.test(marketPage)) {
    errors.push("app/[locale]/market-integrity/page.tsx: market integrity route must render the Shield dashboard.");
  }
  if (!/analyzeTokenRisk/.test(riskEngine) || /This is not an accusation/.test(riskEngine)) {
    errors.push("lib/market-integrity/risk-engine.ts: engine should return signal IDs/data only; legal/i18n copy belongs in UI messages.");
  }
  if (!/api\.dexscreener\.com\/latest\/dex\/search/.test(apiRoute) && !/analyzeDexScreenerToken/.test(apiRoute)) {
    errors.push("app/api/market-integrity/analyze/route.ts: live token scan should stay server-side and use the data adapter, not client-side API keys.");
  }
  if (!/legalDisclaimer/.test(riskCard) || !/market-integrity-search/.test(client)) {
    errors.push("components/market-integrity/MarketIntegrityClient.tsx: dashboard must include search input and visible legal disclaimer rendering.");
  }
  if (!/ExchangeCandlesChart/.test(modal) || !/api\/market-integrity\/klines/.test(modal) || !/chartMode === "candles"/.test(modal)) {
    errors.push("components/market-integrity/TokenRiskModal.tsx: token modal must keep exchange-style candles/volume chart modes backed by the klines endpoint.");
  }
  if (!/OrderBookDepthChart/.test(modal) || !/chartMode === "depth"/.test(modal)) {
    errors.push("components/market-integrity/TokenRiskModal.tsx: token modal must keep exchange-style order-book depth chart mode.");
  }
  if (!/fetchBinanceKlines/.test(klinesRoute)) {
    errors.push("app/api/market-integrity/klines/route.ts: missing Binance kline proxy for server-side OHLC chart data.");
  }
  if (!/buildSentinelAlerts/.test(sentinelRoute) || !/ShieldSentinelAlert/.test(alertsLib) || !/sentinelAlerts/.test(client)) {
    errors.push("market-integrity sentinel: dashboard must keep the server-side Sentinel alert agent and compact watch panel.");
  }
  if (!/Shield scenario matrix/.test(modal) || !/Evidence/.test(modal)) {
    errors.push("components/market-integrity/TokenRiskModal.tsx: modal must keep scenario matrix and evidence report export link.");
  }
} catch (error) {
  errors.push(`Market integrity guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Square/VLM launch control production guard
try {
  const squareVlmModel = read("lib/launch/square-vlm-launch-control.ts");
  const squareVlmComponent = read("components/launch/SquareVlmLaunchControl.tsx");
  const squarePage = read("app/[locale]/square/page.tsx");
  const vlmPage = read("app/[locale]/vlm-token/page.tsx");
  const communityPage = read("app/[locale]/community/page.tsx");
  for (const needle of ["squareVlmLaunchControl", "member-cockpit", "No ROI, no price promise"]) {
    if (!squareVlmModel.includes(needle)) errors.push(`lib/launch/square-vlm-launch-control.ts: missing launch-control marker ${needle}.`);
  }
  for (const needle of ["SquareVlmLaunchControl", "utility/access layer", "safety boundary"]) {
    if (!squareVlmComponent.includes(needle)) errors.push(`components/launch/SquareVlmLaunchControl.tsx: missing launch-control UI marker ${needle}.`);
  }
  if (!squarePage.includes("surface=\"square\"")) errors.push("app/[locale]/square/page.tsx: SquareVlmLaunchControl surface=square missing.");
  if (!vlmPage.includes("surface=\"vlm\"")) errors.push("app/[locale]/vlm-token/page.tsx: SquareVlmLaunchControl surface=vlm missing.");
  if (!communityPage.includes("surface=\"community\"")) errors.push("app/[locale]/community/page.tsx: SquareVlmLaunchControl surface=community missing.");
} catch (error) {
  errors.push(`Square/VLM launch control production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Commerce launch control production guard
try {
  const commerceModel = read("lib/launch/commerce-launch-control.ts");
  const commerceComponent = read("components/launch/CommerceLaunchControl.tsx");
  const checkoutPage = read("app/[locale]/checkout/page.tsx");
  const cartPage = read("app/[locale]/cart/page.tsx");
  for (const needle of ["commerceLaunchControl", "No payment flow, card entry", "Fulfillment provider truth"]) {
    if (!commerceModel.includes(needle)) errors.push(`lib/launch/commerce-launch-control.ts: missing commerce launch marker ${needle}.`);
  }
  for (const needle of ["CommerceLaunchControl", "operationally ready", "safety boundary"]) {
    if (!commerceComponent.includes(needle)) errors.push(`components/launch/CommerceLaunchControl.tsx: missing commerce UI marker ${needle}.`);
  }
  if (!checkoutPage.includes("surface=\"checkout\"")) errors.push("app/[locale]/checkout/page.tsx: CommerceLaunchControl surface=checkout missing.");
  if (!cartPage.includes("surface=\"cart\"")) errors.push("app/[locale]/cart/page.tsx: CommerceLaunchControl surface=cart missing.");
} catch (error) {
  errors.push(`Commerce launch control production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Provider truth/admin gate production guard
try {
  const providerLedger = read("lib/launch/provider-truth-ledger.ts");
  const providerPanel = read("components/launch/ProviderTruthLedgerPanel.tsx");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["providerTruthLedger", "All SKU readiness", "buildProductProviderTruthSnapshot"]) {
    if (!providerLedger.includes(needle)) errors.push(`lib/launch/provider-truth-ledger.ts: missing provider truth marker ${needle}.`);
  }
  for (const needle of ["ProviderTruthLedgerPanel", "SKU and shipping need proof", "Provider, SKU i dostawa"]) {
    if (!providerPanel.includes(needle)) errors.push(`components/launch/ProviderTruthLedgerPanel.tsx: missing provider truth UI marker ${needle}.`);
  }
  if (!adminPage.includes("adminGateCopy") || !adminPage.includes("admin gate / launch control")) {
    errors.push("app/[locale]/admin/import-products/page.tsx: admin gate launch-control notice missing.");
  }
} catch (error) {
  errors.push(`Provider truth/admin gate production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Product provider snapshot production guard
try {
  const productCard = read("components/product/ProductCard.tsx");
  const productDetail = read("components/shop/ProductDetailClient.tsx");
  const providerLedger = read("lib/launch/provider-truth-ledger.ts");
  for (const needle of ["buildProductProviderTruthSnapshot(product)", "providerSnapshot.score", "providerSnapshot.sourceMode"]) {
    if (!productCard.includes(needle)) errors.push(`components/product/ProductCard.tsx: missing provider snapshot marker ${needle}.`);
  }
  for (const needle of ["buildProductProviderTruthSnapshot(selectedProduct)", "providerSnapshotTitle", "providerSnapshot.missing.join"]) {
    if (!productDetail.includes(needle)) errors.push(`components/shop/ProductDetailClient.tsx: missing product provider detail marker ${needle}.`);
  }
  if (!providerLedger.includes("SKU truth snapshots now surface on cards/details")) {
    errors.push("lib/launch/provider-truth-ledger.ts: product-level SKU snapshot status missing.");
  }
} catch (error) {
  errors.push(`Product provider snapshot production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Shipping/returns truth production guard
try {
  const shippingReturnsModel = read("lib/launch/shipping-returns-truth.ts");
  const shippingReturnsPanel = read("components/launch/ShippingReturnsTruthPanel.tsx");
  const checkoutPage = read("app/[locale]/checkout/page.tsx");
  const returnsPage = read("app/[locale]/legal/returns/page.tsx");
  for (const needle of ["shippingReturnsTruthMatrix", "Shipping costs", "Refund flow", "Provider exceptions"]) {
    if (!shippingReturnsModel.includes(needle)) errors.push(`lib/launch/shipping-returns-truth.ts: missing shipping/returns marker ${needle}.`);
  }
  for (const needle of ["ShippingReturnsTruthPanel", "Shipping and returns must be clear", "Dostawa i zwroty"]) {
    if (!shippingReturnsPanel.includes(needle)) errors.push(`components/launch/ShippingReturnsTruthPanel.tsx: missing shipping/returns UI marker ${needle}.`);
  }
  if (!checkoutPage.includes("surface=\"checkout\"")) errors.push("app/[locale]/checkout/page.tsx: ShippingReturnsTruthPanel surface=checkout missing.");
  if (!returnsPage.includes("surface=\"legal\"")) errors.push("app/[locale]/legal/returns/page.tsx: ShippingReturnsTruthPanel surface=legal missing.");
} catch (error) {
  errors.push(`Shipping/returns truth production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Payment/order readiness production guard
try {
  const paymentOrderModel = read("lib/launch/payment-order-readiness.ts");
  const paymentOrderPanel = read("components/launch/PaymentOrderReadinessPanel.tsx");
  const checkoutPage = read("app/[locale]/checkout/page.tsx");
  const cartPage = read("app/[locale]/cart/page.tsx");
  for (const needle of ["paymentOrderReadinessMatrix", "Payment provider", "Webhook and audit trail", "Customer emails"]) {
    if (!paymentOrderModel.includes(needle)) errors.push(`lib/launch/payment-order-readiness.ts: missing payment/order marker ${needle}.`);
  }
  for (const needle of ["PaymentOrderReadinessPanel", "Payment and order state must be real", "Płatność i status"]) {
    if (!paymentOrderPanel.includes(needle)) errors.push(`components/launch/PaymentOrderReadinessPanel.tsx: missing payment/order UI marker ${needle}.`);
  }
  if (!checkoutPage.includes("surface=\"checkout\"")) errors.push("app/[locale]/checkout/page.tsx: PaymentOrderReadinessPanel surface=checkout missing.");
  if (!cartPage.includes("surface=\"cart\"")) errors.push("app/[locale]/cart/page.tsx: PaymentOrderReadinessPanel surface=cart missing.");
} catch (error) {
  errors.push(`Payment/order readiness production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Order event ledger production guard
try {
  const orderEventModel = read("lib/launch/order-event-ledger.ts");
  const orderEventPanel = read("components/launch/OrderEventLedgerPanel.tsx");
  const checkoutPage = read("app/[locale]/checkout/page.tsx");
  const cartPage = read("app/[locale]/cart/page.tsx");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["orderEventLedgerMatrix", "Idempotency key", "Signed webhook verification", "Order timeline"]) {
    if (!orderEventModel.includes(needle)) errors.push(`lib/launch/order-event-ledger.ts: missing order event marker ${needle}.`);
  }
  for (const needle of ["OrderEventLedgerPanel", "Every order event needs a trace", "Każde zdarzenie"]) {
    if (!orderEventPanel.includes(needle)) errors.push(`components/launch/OrderEventLedgerPanel.tsx: missing order event UI marker ${needle}.`);
  }
  if (!checkoutPage.includes("surface=\"checkout\"")) errors.push("app/[locale]/checkout/page.tsx: OrderEventLedgerPanel surface=checkout missing.");
  if (!cartPage.includes("surface=\"cart\"")) errors.push("app/[locale]/cart/page.tsx: OrderEventLedgerPanel surface=cart missing.");
  if (!adminPage.includes("surface=\"admin\"")) errors.push("app/[locale]/admin/import-products/page.tsx: OrderEventLedgerPanel surface=admin missing.");
} catch (error) {
  errors.push(`Order event ledger production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Admin route gate production guard
try {
  const adminGateModel = read("lib/launch/admin-route-gate.ts");
  const adminGatePanel = read("components/launch/AdminRouteGatePanel.tsx");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["adminRouteGateMatrix", "Admin authentication", "Environment gate", "Secret redaction"]) {
    if (!adminGateModel.includes(needle)) errors.push(`lib/launch/admin-route-gate.ts: missing admin gate marker ${needle}.`);
  }
  for (const needle of ["AdminRouteGatePanel", "Admin tooling must stay private", "Admin tooling musi być prywatne"]) {
    if (!adminGatePanel.includes(needle)) errors.push(`components/launch/AdminRouteGatePanel.tsx: missing admin gate UI marker ${needle}.`);
  }
  if (!adminPage.includes("AdminRouteGatePanel") || !adminPage.includes("surface=\"admin\"")) {
    errors.push("app/[locale]/admin/import-products/page.tsx: AdminRouteGatePanel surface=admin missing.");
  }
} catch (error) {
  errors.push(`Admin route gate production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Admin environment gate production guard
try {
  const adminEnvGate = read("lib/launch/admin-environment-gate.ts");
  const adminLockedPanel = read("components/launch/AdminToolsLockedPanel.tsx");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["getClientAdminEnvironmentGate", "NEXT_PUBLIC_ADMIN_TOOLS_ENABLED", "public_env_only"]) {
    if (!adminEnvGate.includes(needle)) errors.push(`lib/launch/admin-environment-gate.ts: missing admin env marker ${needle}.`);
  }
  for (const needle of ["AdminToolsLockedPanel", "Product import is hidden behind an environment gate", "Import produktów jest schowany"]) {
    if (!adminLockedPanel.includes(needle)) errors.push(`components/launch/AdminToolsLockedPanel.tsx: missing locked panel marker ${needle}.`);
  }
  for (const needle of ["AdminToolsLockedPanel", "if (!adminEnvironmentGate.isUnlocked)", "disabled={!adminEnvironmentGate.isUnlocked"]) {
    if (!adminPage.includes(needle)) errors.push(`app/[locale]/admin/import-products/page.tsx: missing admin locked surface marker ${needle}.`);
  }
} catch (error) {
  errors.push(`Admin environment gate production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Admin auth/publish/secret production guard
try {
  const adminAuthContract = read("lib/launch/admin-server-auth-contract.ts");
  const publishGate = read("lib/launch/publish-permission-gate.ts");
  const secretPolicy = read("lib/launch/secret-redaction-policy.ts");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["adminServerAuthContract", "Server auth provider", "Server kill switch"]) {
    if (!adminAuthContract.includes(needle)) errors.push(`lib/launch/admin-server-auth-contract.ts: missing admin auth marker ${needle}.`);
  }
  for (const needle of ["publishPermissionGate", "Active publish permission", "Audit before publish"]) {
    if (!publishGate.includes(needle)) errors.push(`lib/launch/publish-permission-gate.ts: missing publish gate marker ${needle}.`);
  }
  for (const needle of ["secretRedactionPolicy", "Browser-visible secret scan", "Raw provider response redaction"]) {
    if (!secretPolicy.includes(needle)) errors.push(`lib/launch/secret-redaction-policy.ts: missing secret redaction marker ${needle}.`);
  }
  for (const needle of ["AdminServerAuthContractPanel", "PublishPermissionGatePanel", "SecretRedactionPolicyPanel"]) {
    if (!adminPage.includes(needle)) errors.push(`app/[locale]/admin/import-products/page.tsx: missing ${needle}.`);
  }
} catch (error) {
  errors.push(`Admin auth/publish/secret production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Admin mutation audit production guard
try {
  const redactedLogger = read("lib/launch/redacted-logger.ts");
  const adminMutationAudit = read("lib/launch/admin-mutation-audit.ts");
  const adminMutationPanel = read("components/launch/AdminMutationAuditPanel.tsx");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["redactOperatorLogValue", "createSafeOperatorLogLine", "redactedLoggerLaunchNote"]) {
    if (!redactedLogger.includes(needle)) errors.push(`lib/launch/redacted-logger.ts: missing redacted logger marker ${needle}.`);
  }
  for (const needle of ["adminMutationAuditMatrix", "createAdminMutationAuditEnvelope", "Rollback context"]) {
    if (!adminMutationAudit.includes(needle)) errors.push(`lib/launch/admin-mutation-audit.ts: missing mutation audit marker ${needle}.`);
  }
  for (const needle of ["AdminMutationAuditPanel", "Every import and publish must leave a safe trail"]) {
    if (!adminMutationPanel.includes(needle)) errors.push(`components/launch/AdminMutationAuditPanel.tsx: missing admin mutation UI marker ${needle}.`);
  }
  if (!adminPage.includes("AdminMutationAuditPanel")) errors.push("app/[locale]/admin/import-products/page.tsx: AdminMutationAuditPanel missing.");
} catch (error) {
  errors.push(`Admin mutation audit production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Admin audit persistence production guard
try {
  const adminAuditPersistence = read("lib/launch/admin-audit-persistence.ts");
  const publishRollbackContext = read("lib/launch/publish-rollback-context.ts");
  const supportSafeTimeline = read("lib/launch/support-safe-timeline.ts");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["adminAuditPersistenceMatrix", "createAdminAuditPersistencePreview", "Persistent storage adapter"]) {
    if (!adminAuditPersistence.includes(needle)) errors.push(`lib/launch/admin-audit-persistence.ts: missing audit persistence marker ${needle}.`);
  }
  for (const needle of ["publishRollbackContextMatrix", "createPublishRollbackDiff", "Rollback id"]) {
    if (!publishRollbackContext.includes(needle)) errors.push(`lib/launch/publish-rollback-context.ts: missing rollback marker ${needle}.`);
  }
  for (const needle of ["supportSafeTimelineMatrix", "createSupportSafeTimelinePreview", "Support-safe copy"]) {
    if (!supportSafeTimeline.includes(needle)) errors.push(`lib/launch/support-safe-timeline.ts: missing support timeline marker ${needle}.`);
  }
  for (const needle of ["AdminAuditPersistencePanel", "PublishRollbackContextPanel", "SupportSafeTimelinePanel"]) {
    if (!adminPage.includes(needle)) errors.push(`app/[locale]/admin/import-products/page.tsx: missing ${needle}.`);
  }
} catch (error) {
  errors.push(`Admin audit persistence production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Admin audit write API production guard
try {
  const adminAuditWriteContract = read("lib/launch/admin-audit-write-contract.ts");
  const customerSafeExportBoundary = read("lib/launch/customer-safe-export-boundary.ts");
  const adminAuditRoute = read("app/api/admin/audit-events/route.ts");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["adminAuditWriteRouteMatrix", "createAdminAuditWritePreview", "ADMIN_AUDIT_WRITE_ENABLED"]) {
    if (!adminAuditWriteContract.includes(needle)) errors.push(`lib/launch/admin-audit-write-contract.ts: missing audit write marker ${needle}.`);
  }
  for (const needle of ["customerSafeExportBoundaryMatrix", "createCustomerSafeExportPreview", "Approval gate"]) {
    if (!customerSafeExportBoundary.includes(needle)) errors.push(`lib/launch/customer-safe-export-boundary.ts: missing customer-safe export marker ${needle}.`);
  }
  for (const needle of ["createAdminAuditWritePreview", "storageWritePerformed: false", "locked-contract-preview"]) {
    if (!adminAuditRoute.includes(needle)) errors.push(`app/api/admin/audit-events/route.ts: missing locked route marker ${needle}.`);
  }
  for (const needle of ["AdminAuditWriteApiPanel", "CustomerSafeExportBoundaryPanel"]) {
    if (!adminPage.includes(needle)) errors.push(`app/[locale]/admin/import-products/page.tsx: missing ${needle}.`);
  }
} catch (error) {
  errors.push(`Admin audit write API production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// Admin auth session/idempotency production guard
try {
  const adminAuthSession = read("lib/launch/admin-auth-session-guard.ts");
  const adminIdempotency = read("lib/launch/admin-idempotency-store.ts");
  const adminAuditWriteContract = read("lib/launch/admin-audit-write-contract.ts");
  const adminAuditRoute = read("app/api/admin/audit-events/route.ts");
  const adminPage = read("app/[locale]/admin/import-products/page.tsx");
  for (const needle of ["adminAuthSessionMatrix", "getAdminSessionPreviewFromEnv", "requireAdminScope", "product:active_publish"]) {
    if (!adminAuthSession.includes(needle)) errors.push(`lib/launch/admin-auth-session-guard.ts: missing auth session marker ${needle}.`);
  }
  for (const needle of ["adminIdempotencyStoreMatrix", "createAdminIdempotencyPreview", "Duplicate response policy"]) {
    if (!adminIdempotency.includes(needle)) errors.push(`lib/launch/admin-idempotency-store.ts: missing idempotency marker ${needle}.`);
  }
  for (const needle of ["sessionPreview", "permissionPreview", "idempotencyPreview"]) {
    if (!adminAuditWriteContract.includes(needle)) errors.push(`lib/launch/admin-audit-write-contract.ts: missing PASS147 audit write marker ${needle}.`);
  }
  if (!adminAuditRoute.includes("sessionPreview")) errors.push("app/api/admin/audit-events/route.ts: sessionPreview missing.");
  for (const needle of ["AdminAuthSessionGuardPanel", "AdminIdempotencyStorePanel"]) {
    if (!adminPage.includes(needle)) errors.push(`app/[locale]/admin/import-products/page.tsx: missing ${needle}.`);
  }
} catch (error) {
  errors.push(`Admin auth session/idempotency production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// VLM brain orbit cleanup production guard
try {
  const modalSource = read("components/market-integrity/TokenRiskModal.tsx");
  const marketClientSource = read("components/market-integrity/MarketIntegrityClient.tsx");
  const cssSource = read("app/globals.css");
  for (const needle of ["PASS149 hard guard: Orbit 360 belongs only to Advanced", 'allowedMotionPresets', "selectedTileEvidenceCopy"]) {
    if (!modalSource.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS148 VLM brain marker ${needle}.`);
  }
  if (modalSource.includes('(["orbit", "lite", "static"]') || modalSource.includes("ui.motionLite")) {
    errors.push("components/market-integrity/TokenRiskModal.tsx: Lite motion UI must stay removed.");
  }
  for (const needle of ["shield-suggestion-token-avatar", "localLookup", "shield-token-search-suggest-row"]) {
    if (!marketClientSource.includes(needle)) errors.push(`components/market-integrity/MarketIntegrityClient.tsx: missing PASS148 search suggestion marker ${needle}.`);
  }
  if (!cssSource.includes("PASS148 — VLM brain cleanup")) errors.push("app/globals.css: missing PASS148 VLM brain cleanup CSS.");
} catch (error) {
  errors.push(`VLM brain orbit cleanup production guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// VLM brain explainer advanced guard
try {
  const tokenRiskModal = read("components/market-integrity/TokenRiskModal.tsx");
  const marketClient = read("components/market-integrity/MarketIntegrityClient.tsx");
  const globalsCss = read("app/globals.css");
  for (const needle of ["allowedMotionPresets", "const renderHeavyCanvas = false", "shield-vlm-detail-panel-solid", "operatorQuestion"]) {
    if (!tokenRiskModal.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS149 marker ${needle}.`);
  }
  if (tokenRiskModal.includes('"lite"') || tokenRiskModal.includes("'lite'") || tokenRiskModal.includes('| "lite"')) {
    errors.push("components/market-integrity/TokenRiskModal.tsx: Lite motion preset must remain removed.");
  }
  for (const needle of ["sourceMode?: \"local\" | \"live\" | \"merged\"", "token suggestions · logo aware", "click to open Shield readout"]) {
    if (!marketClient.includes(needle)) errors.push(`components/market-integrity/MarketIntegrityClient.tsx: missing PASS149 marker ${needle}.`);
  }
  for (const needle of ["PASS149 — Advanced-only orbit guard", ".shield-vlm-detail-panel-solid"]) {
    if (!globalsCss.includes(needle)) errors.push(`app/globals.css: missing PASS149 marker ${needle}.`);
  }
} catch (error) {
  errors.push(`VLM brain explainer advanced guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// VLM brain performance runtime guard
try {
  const tokenRiskModal = read("components/market-integrity/TokenRiskModal.tsx");
  const globalsCss = read("app/globals.css");
  for (const needle of [
    "type BrainRuntimeMode = \"cinematic\" | \"performance\"",
    "performanceRuntime",
    "orbitUpdateFrameMs",
    "advancedOrbitalSlots",
    "PASS150 adaptive runtime governor",
    "shield-vlm-static-evidence-board",
  ]) {
    if (!tokenRiskModal.includes(needle)) errors.push(`components/market-integrity/TokenRiskModal.tsx: missing PASS150 runtime marker ${needle}.`);
  }
  for (const needle of [
    "PASS150 — VLM brain performance runtime governor",
    ".shield-vlm-runtime-performance",
    ".shield-vlm-runtime-governor",
  ]) {
    if (!globalsCss.includes(needle)) errors.push(`app/globals.css: missing PASS150 runtime CSS marker ${needle}.`);
  }
} catch (error) {
  errors.push(`VLM brain performance runtime guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// PASS168 VLM brain static/advanced polish guard
try {
  const tokenRiskModal = read("components/market-integrity/TokenRiskModal.tsx");
  const marketClient = read("components/market-integrity/MarketIntegrityClient.tsx");
  const globalsCss = read("app/globals.css");
  for (const needle of [
    "shield-vlm-topbar-minimal",
    "shield-vlm-brain-chip",
    "useStaticEvidenceBoard",
    "shield-vlm-static-evidence-board",
    "selectedNode.detail",
    "const renderHeavyCanvas = false",
    "autoSpin = autoRotate ? orbitTick * 0.00058",
  ]) {
    if (!tokenRiskModal.includes(needle) && !globalsCss.includes(needle)) {
      errors.push(`PASS168 VLM brain polish marker missing: ${needle}.`);
    }
  }
  for (const forbidden of ["adaptive orbital risk sphere", "sparse react frames", "compositor motion", "ctx.fillText(`RISK"]) {
    if (`${tokenRiskModal}\n${globalsCss}`.includes(forbidden)) errors.push(`PASS168 debug/forbidden UI marker remains: ${forbidden}.`);
  }
  for (const needle of ["TokenAvatar image={item.image}", "live + table", "click to open Shield readout"]) {
    if (!marketClient.includes(needle)) errors.push(`PASS168 search suggestion marker missing: ${needle}.`);
  }
  if (!fs.existsSync(path.join(root, "scripts/verify-vlm-brain-static-advanced-polish-safety.mjs"))) {
    errors.push("PASS168 guard script is missing.");
  }
} catch (error) {
  errors.push(`PASS168 VLM brain polish guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


// PASS169 home locale runtime guard
try {
  const homeSource = read("components/home/HomePageClient.tsx");
  if (!homeSource.includes("const locale = useLocale();")) {
    errors.push("components/home/HomePageClient.tsx: missing scoped const locale = useLocale(); for Home readiness panels.");
  }
  if (!homeSource.includes("const copy = homeCopy(locale);")) {
    errors.push("components/home/HomePageClient.tsx: must use homeCopy(locale), not inline useLocale(), so locale is available in JSX.");
  }
  if (!homeSource.includes("<FullSurfaceReadinessIndex locale={locale} surface=\"home\" />")) {
    errors.push("components/home/HomePageClient.tsx: missing scoped locale prop for FullSurfaceReadinessIndex.");
  }
  if (homeSource.includes("homeCopy(useLocale())")) {
    errors.push("components/home/HomePageClient.tsx: homeCopy(useLocale()) can cause locale to be unavailable for later JSX.");
  }
} catch (error) {
  errors.push(`PASS169 home locale runtime guard failed: ${error instanceof Error ? error.message : String(error)}`);
}


if (errors.length) {
  console.error("Velmère preflight failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Velmère preflight OK · next ${pkg.dependencies?.next ?? pkg.devDependencies?.next} · scanned ${textFiles.length} files`);
