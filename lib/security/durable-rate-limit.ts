export type DurableRateLimitMode = "memory" | "upstash_rest" | "upstash_fallback_memory" | "disabled";
// PASS183 compatibility marker: upstash_ready was upgraded to upstash_rest in PASS184.
export type DurableRateLimitDecision = {
  ok: boolean;
  mode: DurableRateLimitMode;
  remaining: number;
  resetAt: number;
  reason?: string;
  retryAfterSeconds?: number;
  provider?: "memory" | "upstash";
  providerError?: string;
};

export type DurableRateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  namespace?: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, Bucket>();

function nowMs() {
  return Date.now();
}

function normalizeKey(value: string) {
  return value
    .replace(/[^a-zA-Z0-9:_@.-]/g, "_")
    .slice(0, 240);
}

function resolveMode(): DurableRateLimitMode {
  if (process.env.VELMERE_RATE_LIMIT_DISABLED === "1") return "disabled";
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return "upstash_rest";
  return "memory";
}

function memoryDecision(options: DurableRateLimitOptions, mode: DurableRateLimitMode, providerError?: string): DurableRateLimitDecision {
  const key = normalizeKey(`${options.namespace ?? "velmere"}:${options.key}`);
  const limit = Math.max(1, options.limit);
  const windowMs = Math.max(1_000, options.windowMs);
  const now = nowMs();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, mode, provider: "memory", remaining: limit - 1, resetAt: now + windowMs, providerError };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  if (existing.count > limit) {
    return {
      ok: false,
      mode,
      provider: "memory",
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      reason: "rate_limit_exceeded",
      providerError,
    };
  }

  return { ok: true, mode, provider: "memory", remaining, resetAt: existing.resetAt, providerError };
}

async function upstashRestDecision(options: DurableRateLimitOptions): Promise<DurableRateLimitDecision> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return memoryDecision(options, "memory");

  const limit = Math.max(1, options.limit);
  const windowSeconds = Math.max(1, Math.ceil(Math.max(1_000, options.windowMs) / 1000));
  const key = normalizeKey(`${options.namespace ?? "velmere"}:${options.key}`);
  const resetAt = nowMs() + windowSeconds * 1000;

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds)],
      ]),
      cache: "no-store",
    });

    if (!response.ok) {
      return memoryDecision(options, "upstash_fallback_memory", `upstash_http_${response.status}`);
    }

    const payload = await response.json() as Array<{ result?: number | string; error?: string }>;
    const countRaw = payload?.[0]?.result ?? 1;
    const count = Number(countRaw);
    if (!Number.isFinite(count)) {
      return memoryDecision(options, "upstash_fallback_memory", "upstash_invalid_count");
    }

    if (payload?.some((entry) => entry?.error)) {
      return memoryDecision(options, "upstash_fallback_memory", "upstash_pipeline_error");
    }

    const remaining = Math.max(0, limit - count);
    if (count > limit) {
      return {
        ok: false,
        mode: "upstash_rest",
        provider: "upstash",
        remaining: 0,
        resetAt,
        retryAfterSeconds: windowSeconds,
        reason: "rate_limit_exceeded",
      };
    }

    return {
      ok: true,
      mode: "upstash_rest",
      provider: "upstash",
      remaining,
      resetAt,
    };
  } catch (error) {
    return memoryDecision(options, "upstash_fallback_memory", error instanceof Error ? error.message.slice(0, 120) : "upstash_unknown_error");
  }
}

export async function applyDurableRateLimit(options: DurableRateLimitOptions): Promise<DurableRateLimitDecision> {
  const mode = resolveMode();

  if (mode === "disabled") {
    return {
      ok: true,
      mode,
      remaining: Math.max(0, options.limit - 1),
      resetAt: nowMs() + Math.max(1_000, options.windowMs),
    };
  }

  if (mode === "upstash_rest") {
    return upstashRestDecision(options);
  }

  return memoryDecision(options, "memory");
}

export function buildDurableRateLimitReadiness() {
  const mode = resolveMode();
  return {
    schemaVersion: "velmere-durable-rate-limit-readiness-v2",
    mode,
    hasUpstashUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    hasUpstashToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
    memoryFallback: mode !== "disabled",
    upstashRestAdapter: "implemented",
    fallbackMode: "upstash_fallback_memory",
    productionBoundary:
      "PASS184 adds the server-only Upstash REST adapter with memory fallback. Production should configure provider credentials, monitor fallback rate and add platform/WAF rules.",
  };
}
