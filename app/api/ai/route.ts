import { verifyAdminImportRequest } from "@/lib/admin/auth";
import { generateGeminiAdminText } from "@/lib/ai/gemini";

export const runtime = "nodejs";

type AiRequestBody = {
  task?: "product_description" | "rewrite_copy" | "alt_text" | "import_cleanup";
  locale?: "pl" | "en" | "de";
  input?: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Missing GEMINI_API_KEY on server." }, { status: 500 });
  }

  const auth = verifyAdminImportRequest(req);
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => null)) as AiRequestBody | null;
  const task = body?.task ?? "import_cleanup";
  const locale = body?.locale === "en" || body?.locale === "de" || body?.locale === "pl" ? body.locale : "pl";
  const input = body?.input?.trim();

  if (!input) {
    return Response.json({ error: "Input is required." }, { status: 400 });
  }

  const result = await generateGeminiAdminText({ task, locale, input });
  return Response.json(result.payload, { status: result.status });
}
