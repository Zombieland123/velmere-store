export type VelmereSearchMode = "all" | "token" | "contract" | "velmere" | "osint";
export type VelmereSearchSourceMode = "table" | "live" | "live_table" | "fallback" | "missing";
export type VelmereSearchRiskTone = "calm" | "review" | "elevated" | "blocked";

export type VelmereSearchSource = {
  id: string;
  label: string;
  mode: VelmereSearchSourceMode;
  freshness: string;
  confidence: number;
  note: string;
};

export type VelmereShieldBridge = {
  href: string;
  queryKey: string;
  origin: "velmere_search";
  mode: "full_shield_analysis";
  note: string;
};

export type VelmereSearchResult = {
  id: string;
  title: string;
  symbol?: string;
  category: "token" | "contract" | "velmere" | "osint" | "document";
  tone: VelmereSearchRiskTone;
  summary: string;
  whyItMatters: string;
  missingData: string[];
  nextOperatorStep: string;
  sourceMode: VelmereSearchSourceMode;
  sourceConfidence: number;
  shieldHref: string;
  avatarLabel?: string;
  avatarImage?: string;
  bridge?: VelmereShieldBridge;
  sources: VelmereSearchSource[];
  chips: string[];
};

export const velmereSearchModeLabels = {
  all: "All",
  token: "Tokens",
  contract: "Contracts",
  velmere: "Velmère",
  osint: "OSINT",
} satisfies Record<VelmereSearchMode, string>;

export function buildVelmereShieldBridge(query: string, assetId?: string): VelmereShieldBridge {
  const queryKey = normalizeSearchQuery(assetId || query || "research");
  const params = new URLSearchParams();
  params.set(assetId ? "asset" : "query", queryKey);
  params.set("from", "velmere-search");
  params.set("view", "full");
  return {
    href: `/market-integrity?${params.toString()}`,
    queryKey,
    origin: "velmere_search",
    mode: "full_shield_analysis",
    note: "Search-to-Shield bridge: short result opens the full Velmère Shield analysis surface.",
  };
}

const tokenSeed: VelmereSearchResult[] = [
  {
    id: "solana",
    title: "Solana",
    symbol: "SOL",
    category: "token",
    tone: "review",
    summary: "High-activity asset with strong market visibility. The short readout stays partial until source freshness, contract context and holder concentration are attached.",
    whyItMatters: "Fast attention spikes can make a token look cleaner than the available evidence actually supports.",
    missingData: ["fresh holder cluster snapshot", "contract permission review", "orderbook depth by venue"],
    nextOperatorStep: "Open Velmère Shield full analysis and compare market, source and liquidity lanes before treating the score as stable.",
    sourceMode: "live_table",
    sourceConfidence: 66,
    shieldHref: buildVelmereShieldBridge("SOL", "solana").href,
    avatarLabel: "SOL",
    avatarImage: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    bridge: buildVelmereShieldBridge("SOL", "solana"),
    sources: [
      { id: "local-table", label: "Velmère table", mode: "table", freshness: "cached", confidence: 64, note: "local indexed token context" },
      { id: "source-ledger", label: "Source ledger preview", mode: "fallback", freshness: "preview", confidence: 52, note: "needs live adapter" },
    ],
    chips: ["market context", "liquidity review", "full Shield shortcut"],
  },
  {
    id: "bitcoin",
    title: "Bitcoin",
    symbol: "BTC",
    category: "token",
    tone: "calm",
    summary: "Large-cap baseline asset. The short readout focuses on volatility, volume quality and source freshness rather than a directional call.",
    whyItMatters: "Even high-liquidity assets can have noisy candles, venue-specific spread and stale source windows.",
    missingData: ["venue-specific orderbook depth", "fresh candle source timestamp"],
    nextOperatorStep: "Open Shield and verify candle/source lanes before comparing against smaller tokens.",
    sourceMode: "live_table",
    sourceConfidence: 74,
    shieldHref: buildVelmereShieldBridge("BTC", "bitcoin").href,
    avatarLabel: "BTC",
    avatarImage: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    bridge: buildVelmereShieldBridge("BTC", "bitcoin"),
    sources: [
      { id: "local-table", label: "Velmère table", mode: "table", freshness: "cached", confidence: 71, note: "baseline asset context" },
      { id: "source-ledger", label: "Source ledger preview", mode: "fallback", freshness: "preview", confidence: 57, note: "adapter not attached" },
    ],
    chips: ["baseline", "volume quality", "source freshness"],
  },
  {
    id: "ethereum",
    title: "Ethereum",
    symbol: "ETH",
    category: "token",
    tone: "review",
    summary: "Large-cap smart-contract asset. The quick summary highlights source freshness, contract ecosystem complexity and liquidity context.",
    whyItMatters: "Network-level trust does not remove token-specific, venue-specific or source-specific blind spots.",
    missingData: ["fresh venue depth", "ecosystem contract context", "holder cluster snapshot"],
    nextOperatorStep: "Use full Shield analysis for the token-specific evidence lanes.",
    sourceMode: "live_table",
    sourceConfidence: 69,
    shieldHref: buildVelmereShieldBridge("ETH", "ethereum").href,
    avatarLabel: "ETH",
    avatarImage: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    bridge: buildVelmereShieldBridge("ETH", "ethereum"),
    sources: [
      { id: "local-table", label: "Velmère table", mode: "table", freshness: "cached", confidence: 68, note: "local indexed context" },
      { id: "source-ledger", label: "Source ledger preview", mode: "fallback", freshness: "preview", confidence: 54, note: "needs live adapter" },
    ],
    chips: ["smart contract context", "liquidity", "source review"],
  },
  {
    id: "usdc",
    title: "USD Coin",
    symbol: "USDC",
    category: "token",
    tone: "review",
    summary: "Stablecoin-style asset. The short readout prioritizes peg context, issuer/source data and liquidity instead of market-hype scoring.",
    whyItMatters: "Stable assets require different evidence: reserves/source transparency, peg deviations and venue liquidity.",
    missingData: ["fresh peg deviation feed", "issuer/source ledger", "venue liquidity split"],
    nextOperatorStep: "Open Shield and review source quality, peg context and exchange depth.",
    sourceMode: "table",
    sourceConfidence: 61,
    shieldHref: buildVelmereShieldBridge("USDC", "usd-coin").href,
    avatarLabel: "USDC",
    avatarImage: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
    bridge: buildVelmereShieldBridge("USDC", "usd-coin"),
    sources: [
      { id: "local-table", label: "Velmère table", mode: "table", freshness: "cached", confidence: 61, note: "stablecoin context" },
    ],
    chips: ["stablecoin", "peg context", "source quality"],
  },
];

const velmereSeed: VelmereSearchResult[] = [
  {
    id: "velmere-shield",
    title: "Velmère Shield",
    category: "velmere",
    tone: "review",
    summary: "Risk-radar surface for token context, source lanes, VLM brain readouts and full Shield analysis.",
    whyItMatters: "This is the shortcut from quick search into deeper token evidence review.",
    missingData: ["live third-party adapters", "durable source snapshots"],
    nextOperatorStep: "Use the Shield shortcut when a token result needs full chart, source and VLM readout.",
    sourceMode: "table",
    sourceConfidence: 82,
    shieldHref: buildVelmereShieldBridge("Velmère Shield", "shield").href,
    avatarLabel: "VLM",
    bridge: buildVelmereShieldBridge("Velmère Shield", "shield"),
    sources: [{ id: "velmere-doc", label: "Velmère internal page map", mode: "table", freshness: "local", confidence: 82, note: "site route" }],
    chips: ["full analysis", "VLM brain", "source lanes"],
  },
  {
    id: "vlm-access",
    title: "VLM Access",
    category: "velmere",
    tone: "review",
    summary: "Access and utility layer for Velmère experiences. Search keeps it as product access context, not a return promise.",
    whyItMatters: "VLM should be described as access/utility only and not as a performance claim.",
    missingData: ["final access policy", "wallet gate implementation"],
    nextOperatorStep: "Open the VLM page when the question is about access, not risk verdicts.",
    sourceMode: "table",
    sourceConfidence: 76,
    shieldHref: "/vlm-token",
    avatarLabel: "VLM",
    bridge: buildVelmereShieldBridge("VLM Access", "vlm-access"),
    sources: [{ id: "velmere-page", label: "Velmère VLM page", mode: "table", freshness: "local", confidence: 76, note: "site route" }],
    chips: ["access", "utility", "no ROI promise"],
  },
];

export function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, 96);
}

export function buildFallbackResult(query: string): VelmereSearchResult {
  const clean = normalizeSearchQuery(query) || "unknown asset";
  return {
    id: `fallback-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 36) || "query"}`,
    title: clean,
    symbol: clean.length <= 8 ? clean.toUpperCase() : undefined,
    category: "osint",
    tone: "blocked",
    summary: "Velmère has no strong indexed result yet. This should be treated as a research request, not a confirmed token verdict.",
    whyItMatters: "Unknown or low-data assets can look neutral only because evidence is missing.",
    missingData: ["market source", "contract address", "holder snapshot", "orderbook depth", "OSINT source ledger"],
    nextOperatorStep: "Run full Shield analysis only after attaching source, chain and contract context.",
    sourceMode: "missing",
    sourceConfidence: 24,
    shieldHref: buildVelmereShieldBridge(clean).href,
    avatarLabel: clean.slice(0, 3).toUpperCase(),
    bridge: buildVelmereShieldBridge(clean),
    sources: [{ id: "missing-source", label: "No indexed source", mode: "missing", freshness: "missing", confidence: 24, note: "manual review required" }],
    chips: ["missing data", "manual review", "Shield shortcut"],
  };
}

export function searchVelmereIntelligence(query: string, mode: VelmereSearchMode = "all") {
  const clean = normalizeSearchQuery(query);
  const all = [...tokenSeed, ...velmereSeed];

  if (!clean) {
    return {
      query: clean,
      mode,
      results: all.slice(0, 5),
      generatedAt: new Date().toISOString(),
      productionBoundary: "Local preview search only. Live web/OSINT adapters are not attached yet.",
    };
  }

  const terms = clean.toLowerCase().split(" ");
  const filtered = all.filter((item) => {
    if (mode !== "all" && item.category !== mode && !(mode === "contract" && item.category === "token")) return false;
    const haystack = `${item.title} ${item.symbol ?? ""} ${item.category} ${item.chips.join(" ")} ${item.summary}`.toLowerCase();
    return terms.every((term) => haystack.includes(term) || (item.symbol ?? "").toLowerCase().startsWith(term));
  });

  const results = filtered.length ? filtered : [buildFallbackResult(clean)];
  return {
    query: clean,
    mode,
    results,
    generatedAt: new Date().toISOString(),
    productionBoundary: "Local preview search only. Live web/OSINT adapters are not attached yet.",
  };
}
