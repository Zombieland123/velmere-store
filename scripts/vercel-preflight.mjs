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
  for (const needle of ["type MotionPreset", "motionPreset", "renderHeavyCanvas", "shield-vlm-motion-governor"]) {
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
  for (const needle of ["isInvestigationMode", "advancedOrbitalSlots", "setOrbitTick", "adaptive orbital risk sphere", `runVlmAiSequence("pro")`]) {
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
  if (!homeSource.includes("function homeCopy(locale: string)") || !homeSource.includes("const copy = homeCopy(useLocale())")) {
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
  for (const needle of ["allowedMotionPresets", "renderHeavyCanvas = isAdvanced", "shield-vlm-detail-panel-solid", "operatorQuestion"]) {
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
    "shield-vlm-runtime-governor",
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

if (errors.length) {
  console.error("Velmère preflight failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Velmère preflight OK · next ${pkg.dependencies?.next ?? pkg.devDependencies?.next} · scanned ${textFiles.length} files`);
