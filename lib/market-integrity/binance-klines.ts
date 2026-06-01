export type BinanceKlineInterval = "1m" | "15m" | "1h" | "4h" | "1d" | "7d";

export type MarketCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume?: number;
  trades?: number;
};

type RawKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

function n(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
}

function intervalToBinance(range: BinanceKlineInterval) {
  if (range === "7d") return { interval: "1d", limit: 7 };
  if (range === "1d") return { interval: "1h", limit: 24 };
  if (range === "4h") return { interval: "15m", limit: 16 };
  if (range === "1h") return { interval: "1m", limit: 60 };
  if (range === "15m") return { interval: "1m", limit: 15 };
  return { interval: "1m", limit: 80 };
}

export async function fetchBinanceKlines(
  symbol: string,
  range: BinanceKlineInterval = "7d",
): Promise<{ pair: string; source: "Binance spot klines"; candles: MarketCandle[] }> {
  const clean = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!clean) throw new Error("Missing symbol");
  const pair = clean.endsWith("USDT") ? clean : `${clean}USDT`;
  const { interval, limit } = intervalToBinance(range);
  const params = new URLSearchParams({
    symbol: pair,
    interval,
    limit: String(limit),
  });
  const response = await fetch(`https://api.binance.com/api/v3/klines?${params.toString()}`, {
    headers: { accept: "application/json" },
    next: { revalidate: range === "1m" || range === "15m" ? 15 : 45 },
  } as RequestInit & { next: { revalidate: number } });
  if (!response.ok) {
    throw new Error(`Binance kline request failed with status ${response.status}`);
  }
  const rows = (await response.json()) as RawKline[];
  const candles = rows
    .map((row) => ({
      timestamp: n(row[0]),
      open: n(row[1]),
      high: n(row[2]),
      low: n(row[3]),
      close: n(row[4]),
      volume: n(row[5]),
      quoteVolume: n(row[7]),
      trades: n(row[8]),
    }))
    .filter(
      (item) =>
        item.timestamp > 0 &&
        item.open > 0 &&
        item.high > 0 &&
        item.low > 0 &&
        item.close > 0,
    );
  if (candles.length < 2) throw new Error("Not enough Binance candle data");
  return { pair, source: "Binance spot klines", candles };
}
