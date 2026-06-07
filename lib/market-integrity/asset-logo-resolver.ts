export type VelmereAssetClass =
  | "crypto"
  | "exchange_token"
  | "stock"
  | "etf"
  | "fx"
  | "commodity"
  | "real_estate"
  | "exchange"
  | "market";

export type VelmereAssetLogoInput = {
  symbol: string;
  name?: string;
  id?: string;
  assetClass?: VelmereAssetClass | string;
  imageUrl?: string;
  venue?: string;
};

export type VelmereAssetLogoResolution = {
  symbol: string;
  glyph: string;
  label: string;
  tone: string;
  imageCandidates: string[];
};

const cryptoLogoMap: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  BAT: "https://assets.coingecko.com/coins/images/677/large/basic-attention-token.png",
  BNB: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  USDT: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  XRP: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  ADA: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
  LINK: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
  BONK: "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg",
};

const companyBrandSlugMap: Record<string, string> = {
  AAPL: "apple",
  NVDA: "nvidia",
  MSFT: "microsoft",
  COIN: "coinbase",
  JPM: "jpmorgan",
  "MC.PA": "lvmh",
  SPY: "statestreet",
  QQQ: "invesco",
  VNQ: "vanguard",
  IYR: "ishares",
  GLD: "statestreet",
  SLV: "ishares",
};

const exchangeBrandSlugMap: Record<string, string> = {
  BINANCE: "binance",
  MEXC: "mexc",
  COINBASE: "coinbase",
  KRAKEN: "kraken",
  BYBIT: "bybit",
  OKX: "okx",
};

const glyphMap: Record<string, string> = {
  BTC: "₿",
  ETH: "◆",
  SOL: "◎",
  BAT: "▲",
  BNB: "BNB",
  USDT: "₮",
  USDC: "$",
  XRP: "X",
  XAU: "Au",
  "XAU/USD": "Au",
  GLD: "Au",
  XAG: "Ag",
  "XAG/USD": "Ag",
  SLV: "Ag",
  WTI: "OIL",
  BRENT: "OIL",
  DXY: "$",
  "EUR/USD": "€/$",
  "EUR/PLN": "€/zł",
  "USD/JPY": "$/¥",
  "USD/PLN": "$/zł",
  "CHF/PLN": "₣/zł",
};

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function proxiedVelmereLogo(url?: string) {
  if (!url) return undefined;
  if (url.startsWith("/")) return url;
  if (!url.startsWith("https://")) return undefined;
  return `/api/market-integrity/icon?url=${encodeURIComponent(url)}`;
}

export function resolveVelmereAssetLogo(
  input: VelmereAssetLogoInput,
): VelmereAssetLogoResolution {
  const symbol = input.symbol.trim().toUpperCase();
  const venue = (input.venue ?? input.name ?? symbol).trim().toUpperCase();
  const assetClass = (input.assetClass ?? "market").toLowerCase();
  const isCrypto = assetClass === "crypto" || assetClass === "exchange_token";
  const isExchange = assetClass === "exchange";
  const companyBrandSlug = companyBrandSlugMap[symbol];
  const exchangeBrandSlug =
    exchangeBrandSlugMap[venue] ?? exchangeBrandSlugMap[symbol];
  const providerSymbol = encodeURIComponent(symbol);

  const imageCandidates = unique([
    proxiedVelmereLogo(input.imageUrl),
    isCrypto ? proxiedVelmereLogo(cryptoLogoMap[symbol]) : undefined,
    !isCrypto && !isExchange
      ? `/api/market-integrity/asset-logo?symbol=${providerSymbol}`
      : undefined,
    companyBrandSlug
      ? proxiedVelmereLogo(
          `https://cdn.simpleicons.org/${companyBrandSlug}?viewbox=auto`,
        )
      : undefined,
    exchangeBrandSlug
      ? proxiedVelmereLogo(
          `https://cdn.simpleicons.org/${exchangeBrandSlug}?viewbox=auto`,
        )
      : undefined,
  ]);

  const glyph =
    glyphMap[symbol] ??
    (isExchange ? venue.slice(0, 3) : symbol.replace(/[^A-Z0-9]/g, "").slice(0, 3)) ??
    "?";

  return {
    symbol,
    glyph: glyph || "?",
    label: input.name || input.venue || symbol,
    tone:
      assetClass === "commodity"
        ? "commodity"
        : assetClass === "fx"
          ? "fx"
          : isExchange
            ? "exchange"
            : isCrypto
              ? "crypto"
              : "brand",
    imageCandidates,
  };
}

export function resolveVelmereExchangeLogo(venue: string) {
  return resolveVelmereAssetLogo({
    symbol: venue,
    venue,
    name: venue,
    assetClass: "exchange",
  });
}
