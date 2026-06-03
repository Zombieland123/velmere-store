import { NextResponse } from "next/server";
import { velmereLensRoutes, type VelmereLensDestination } from "@/lib/search/velmere-lens-route-map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanRoute(value: string | null): VelmereLensDestination {
  const allowed = new Set(velmereLensRoutes.map((route) => route.id));
  return allowed.has(value as VelmereLensDestination) ? (value as VelmereLensDestination) : "shield";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const routeId = cleanRoute(url.searchParams.get("route"));
  const route = velmereLensRoutes.find((item) => item.id === routeId) ?? velmereLensRoutes[0];
  const generatedAt = new Date().toISOString();

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(route.reportTitle)} · Velmère Lens</title>
  <style>
    body{margin:0;background:#050608;color:#f5f0e8;font-family:Inter,Arial,sans-serif;}
    main{max-width:840px;margin:0 auto;padding:48px 28px;}
    .card{border:1px solid rgba(200,169,106,.22);border-radius:28px;padding:30px;background:radial-gradient(circle at 0 0,rgba(200,169,106,.13),transparent 36%),linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.012));box-shadow:0 28px 96px rgba(0,0,0,.35)}
    .eyebrow{font:700 10px ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;color:#d7b86a}
    h1{font-family:Georgia,serif;font-size:44px;line-height:.95;letter-spacing:-.05em;margin:18px 0}
    p{color:rgba(245,240,232,.68);line-height:1.7}.box{border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px;margin-top:14px;background:rgba(0,0,0,.28)}
    .label{font:700 9px ui-monospace,monospace;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.42)}
    .boundary{color:rgba(255,205,130,.72)}@media print{body{background:#fff;color:#111}.card{box-shadow:none;background:#fff;color:#111}.boundary,p{color:#333}}
  </style>
</head>
<body>
  <main>
    <section class="card">
      <div class="eyebrow">Velmère Lens · PDF-ready evidence note</div>
      <h1>${escapeHtml(route.reportTitle)}</h1>
      <p>${escapeHtml(route.whatItDoes)}</p>
      <div class="box"><div class="label">Route</div><p>${escapeHtml(route.label)} · ${escapeHtml(route.href)}</p></div>
      <div class="box"><div class="label">Missing before stronger trust</div><p>${route.missingBeforeFullTrust.map(escapeHtml).join(" · ")}</p></div>
      <div class="box"><div class="label">Boundary</div><p class="boundary">${escapeHtml(route.whatItDoesNotDo)} This is not a safety certificate, investment advice, legal proof or guaranteed result.</p></div>
      <div class="box"><div class="label">Generated</div><p>${generatedAt}</p></div>
    </section>
  </main>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-disposition": `inline; filename="velmere-lens-${route.id}-report.html"`,
    },
  });
}
