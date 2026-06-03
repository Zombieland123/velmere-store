import { abuseShieldResponseMeta, applyApiAbuseShield } from "@/lib/security/api-abuse-shield";
import { verifySecurityAdminToken } from "@/lib/security/security-admin-auth";
import { buildSecurityAlertSnapshot } from "@/lib/security/security-alert-rules";
import { securityJson } from "@/lib/security/api-guard";
import { buildSecurityEventLedgerSnapshot } from "@/lib/security/security-event-ledger";
import { buildSecurityReadinessSnapshot } from "@/lib/security/security-readiness";
import { buildDurableRateLimitReadiness } from "@/lib/security/durable-rate-limit";
import { buildSecurityEventAppendReadiness } from "@/lib/security/security-event-append-adapter";
import { buildSecurityRuntimeQaSnapshot } from "@/lib/security/security-runtime-qa";
import { buildSecurityReleaseGateSnapshot } from "@/lib/security/security-release-gate";
import { buildPaymentWebhookSecuritySnapshot } from "@/lib/security/payment-webhook-security";
import { buildPaymentRuntimeEvidenceSnapshot } from "@/lib/security/payment-runtime-evidence";
import { buildStripeWebhookReplayQaSnapshot } from "@/lib/security/stripe-webhook-replay-qa";
import { buildSecurityAdminAuditSnapshot } from "@/lib/security/security-admin-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const shield = await applyApiAbuseShield(request, "security", {
    keyPrefix: "security-export",
    queryParam: "format",
    allowEmptyQuery: true,
  });
  if (!shield.ok) return shield.response;

  const admin = verifySecurityAdminToken(request, ["security:export"]);
  if (!admin.ok) return admin.response;

  const generatedAt = new Date().toISOString();
  return securityJson({
    ok: true,
    schemaVersion: "velmere-security-export-v1",
    mode: "security_export_safe_preview",
    generatedAt,
    readiness: buildSecurityReadinessSnapshot(),
    durableRateLimit: buildDurableRateLimitReadiness(),
    eventLedger: buildSecurityEventLedgerSnapshot(),
    eventAppendAdapter: buildSecurityEventAppendReadiness(),
    runtimeQa: buildSecurityRuntimeQaSnapshot(),
    releaseGate: buildSecurityReleaseGateSnapshot(),
    paymentWebhookSecurity: buildPaymentWebhookSecuritySnapshot(),
    paymentRuntimeEvidence: buildPaymentRuntimeEvidenceSnapshot(),
    stripeWebhookReplayQa: buildStripeWebhookReplayQaSnapshot(),
    securityAdminAudit: buildSecurityAdminAuditSnapshot(),
    alertRules: buildSecurityAlertSnapshot(),
    securityAdminGate: admin.snapshot,
    operator: admin.operator,
    exportBoundary:
      "Safe export only: no raw IP addresses, no raw query payloads and no secrets are included. Production export should be admin-gated and written to durable storage.",
    ...abuseShieldResponseMeta(shield),
  }, {
    headers: {
      "content-disposition": `attachment; filename="velmere-security-export-${generatedAt.slice(0, 10)}.json"`,
    },
  });
}
