type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();
const DEFAULT_WINDOW_MS = 60_000;

export type ApiGuardOptions = {
  limit?: number;
  windowMs?: number;
  keyPrefix?: string;
};

export function securityJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  return new Response(JSON.stringify(body, null, 2), { ...init, headers });
}

export function methodNotAllowed(allowed: string[]) {
  return securityJson(
    {
      ok: false,
      mode: "method_not_allowed",
      allowed,
    },
    {
      status: 405,
      headers: { allow: allowed.join(", ") },
    },
  );
}

export function getClientKey(request: Request, prefix = "api") {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  const userAgent = headers.get("user-agent")?.slice(0, 80) ?? "unknown";
  return `${prefix}:${forwardedFor || realIp || "unknown"}:${userAgent}`;
}

export function applySoftRateLimit(request: Request, options: ApiGuardOptions = {}) {
  const limit = Math.max(1, options.limit ?? 60);
  const windowMs = Math.max(1_000, options.windowMs ?? DEFAULT_WINDOW_MS);
  const key = getClientKey(request, options.keyPrefix ?? "api");
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1, resetAt: now + windowMs };
  }

  current.count += 1;
  if (current.count > limit) {
    return {
      ok: false as const,
      response: securityJson(
        {
          ok: false,
          mode: "rate_limited",
          retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
        },
        {
          status: 429,
          headers: {
            "retry-after": String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))),
          },
        },
      ),
    };
  }

  return { ok: true as const, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

export function sanitizeBoundedParam(value: string | null, options: { maxLength?: number; fallback?: string } = {}) {
  const maxLength = Math.max(1, options.maxLength ?? 96);
  const fallback = options.fallback ?? "";
  const clean = (value ?? fallback)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>`]/g, "")
    .trim()
    .slice(0, maxLength);
  return clean || fallback;
}

export function rejectOversizedUrl(request: Request, maxLength = 2048) {
  if (request.url.length <= maxLength) return null;
  return securityJson({ ok: false, mode: "url_too_large" }, { status: 414 });
}

export function assertGetRequest(request: Request) {
  if (request.method === "GET") return null;
  return methodNotAllowed(["GET"]);
}
