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
  if (!/api\|_next\|_vercel\|\.\*\\\.\.\*/.test(middleware) && !/api\|_next\|_vercel\|\.\*\\\.\*/.test(middleware)) {
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

if (errors.length) {
  console.error("Velmère preflight failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Velmère preflight OK · next ${pkg.dependencies?.next ?? pkg.devDependencies?.next} · scanned ${textFiles.length} files`);
