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

if (errors.length) {
  console.error("Velmère preflight failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Velmère preflight OK · next ${pkg.dependencies?.next ?? pkg.devDependencies?.next} · scanned ${textFiles.length} files`);
