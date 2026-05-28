import { generateGeminiAdminText } from "@/lib/ai/gemini";

export const runtime = "nodejs";

type AngelRequestBody = {
  message?: string;
  locale?: "pl" | "en" | "de";
};

const ANGEL_SYSTEM_PROMPT =
  "You are Angel, the Velmère luxury concierge. Help with fit, products, orders, archive access, store policy, and VLM access explanations. VLM is an access layer for private drops, archive unlocking, and selected brand privileges. Never give investment advice, never discuss whether to buy VLM, never handle private keys or seed phrases, never claim live trading, audits, listings, or deployed contracts. Keep answers concise and elegant.";

export async function POST(req: Request) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openAiKey) {
    return Response.json({ error: "Angel is not configured yet." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as AngelRequestBody | null;
  const message = body?.message?.trim();
  const locale = body?.locale === "en" || body?.locale === "de" || body?.locale === "pl" ? body.locale : "en";

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  if (geminiKey) {
    const result = await generateGeminiAdminText({
      task: "rewrite_copy",
      locale,
      input: `${ANGEL_SYSTEM_PROMPT}\n\nUser: ${message.slice(0, 4000)}`,
    });
    if (result.ok) {
      return Response.json({ reply: (result.payload as { text: string }).text });
    }
  }

  return Response.json({ error: "Angel is not configured yet." }, { status: 503 });
}
