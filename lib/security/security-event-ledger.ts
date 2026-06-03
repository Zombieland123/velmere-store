import { appendSecurityEventBestEffort, buildSecurityEventAppendReadiness } from "@/lib/security/security-event-append-adapter";
export type SecurityEventKind =
  | "abuse_blocked"
  | "rate_limited"
  | "suspicious_allowed"
  | "request_allowed"
  | "method_blocked"
  | "url_too_large"
  | "icon_proxy_blocked"
  | "provider_fallback";

export type SecurityEventSeverity = "info" | "review" | "elevated" | "blocked";

export type SecurityEventRecord = {
  id: string;
  kind: SecurityEventKind;
  severity: SecurityEventSeverity;
  profile: string;
  route: string;
  method: string;
  clientFingerprint: string;
  userAgentFamily: string;
  abuseScore: number;
  notes: string[];
  rateLimitMode?: string;
  provider?: string;
  createdAt: string;
  safeSummary: string;
};

const securityEvents: SecurityEventRecord[] = [];
const MAX_EVENTS = 220;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function familyFromUserAgent(userAgent: string) {
  const value = userAgent.toLowerCase();
  if (!value) return "missing";
  if (/(sqlmap|nikto|nmap|masscan|acunetix|wpscan|dirbuster|gobuster)/i.test(value)) return "scanner";
  if (/(curl|wget|python-requests|httpclient|bot|spider|crawler)/i.test(value)) return "automation";
  if (/(chrome|safari|firefox|edg|opera)/i.test(value)) return "browser";
  return "unknown";
}

function eventId(kind: SecurityEventKind, route: string, createdAt: string) {
  return `${kind}_${stableHash(`${route}:${createdAt}:${Math.random()}`).slice(3, 11)}`;
}

export function createClientFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const realIp = request.headers.get("x-real-ip")?.trim() ?? "";
  const userAgent = request.headers.get("user-agent")?.slice(0, 120) ?? "";
  return stableHash(`${forwardedFor || realIp || "unknown"}:${userAgent}`);
}

export function recordSecurityEvent(input: {
  request: Request;
  kind: SecurityEventKind;
  severity: SecurityEventSeverity;
  profile: string;
  abuseScore: number;
  notes?: string[];
  rateLimitMode?: string;
  provider?: string;
  safeSummary?: string;
}) {
  const createdAt = new Date().toISOString();
  const route = new URL(input.request.url).pathname;
  const userAgent = input.request.headers.get("user-agent") ?? "";
  const record: SecurityEventRecord = {
    id: eventId(input.kind, route, createdAt),
    kind: input.kind,
    severity: input.severity,
    profile: input.profile,
    route,
    method: input.request.method,
    clientFingerprint: createClientFingerprint(input.request),
    userAgentFamily: familyFromUserAgent(userAgent),
    abuseScore: input.abuseScore,
    notes: (input.notes ?? []).slice(0, 8),
    rateLimitMode: input.rateLimitMode,
    provider: input.provider,
    createdAt,
    safeSummary:
      input.safeSummary ??
      `${input.kind} on ${route}. Stored with fingerprint only; raw IP/query is not persisted in this in-memory preview ledger.`,
  };

  securityEvents.unshift(record);
  if (securityEvents.length > MAX_EVENTS) securityEvents.length = MAX_EVENTS;
  void appendSecurityEventBestEffort(record);
  return record;
}

export function listSecurityEvents(options: { limit?: number; severity?: SecurityEventSeverity | "all" } = {}) {
  const limit = Math.max(1, Math.min(options.limit ?? 40, 100));
  const severity = options.severity ?? "all";
  const events = severity === "all" ? securityEvents : securityEvents.filter((event) => event.severity === severity);
  return events.slice(0, limit);
}

export function buildSecurityEventLedgerSnapshot() {
  const blocked = securityEvents.filter((event) => event.severity === "blocked").length;
  const elevated = securityEvents.filter((event) => event.severity === "elevated").length;
  const review = securityEvents.filter((event) => event.severity === "review").length;

  return {
    schemaVersion: "velmere-security-event-ledger-v1",
    mode: "in_memory_security_event_ledger",
    generatedAt: new Date().toISOString(),
    total: securityEvents.length,
    blocked,
    elevated,
    review,
    recent: listSecurityEvents({ limit: 20 }),
    appendAdapter: buildSecurityEventAppendReadiness(),
    storageWritePerformed: buildSecurityEventAppendReadiness().storageWritePerformed,
    durableStorageReady: buildSecurityEventAppendReadiness().mode === "upstash_list",
    productionBoundary:
      "Security Event Ledger is currently in-memory preview only. Production needs durable storage, retention policy, alerting and access controls.",
  };
}

// PASS184 compatibility marker: storageWritePerformed: false · durableStorageReady: false was the preview baseline before PASS187 append adapter.
