import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getVisibleProducts, getLocalizedString, formatMoney } from "@/lib/products/catalog";

export const runtime = "nodejs";

const MODEL = "gemini-1.5-flash";
const MAX_MESSAGES = 14;
const MAX_CHARS_PER_MESSAGE = 1800;

type AngelRole = "user" | "assistant";

type AngelChatMessage = {
  role: AngelRole;
  content: string;
};

type AngelRequestBody = {
  message?: string;
  locale?: "pl" | "en" | "de";
  history?: AngelChatMessage[];
};

function buildCatalogContext(locale: "pl" | "en" | "de") {
  return getVisibleProducts().map((product) => ({
    id: product.id,
    slug: product.slug,
    title: getLocalizedString(product.title, locale),
    description: getLocalizedString(product.description, locale),
    price: formatMoney(product.price, locale),
    status: product.status,
    provider: product.provider,
    fulfilmentMode: product.fulfilmentMode,
    collection: product.collection,
    tags: product.tags,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      size: variant.size,
      price: variant.price ? formatMoney(variant.price, locale) : formatMoney(product.price, locale),
      available: Boolean(variant.providerVariantId || product.providerVariantIds?.[variant.id] || product.fulfilmentMode !== "automatic"),
    })),
  }));
}

const ANGEL_SYSTEM_PROMPT = `You are Angel, the AI concierge of VELMÈRE.
Voice: highly sophisticated, minimalist, slightly cryptic, never loud.
Brand world: dark luxury, heavyweight garments, archive drops, restrained editorial styling, chrome/black/gold terminal aesthetics.
Known internal vocabulary: AMU constant = 3162.27, VLM Basic mode, VLM Pro mode, wallet-gated archive access, exchange-style modules.
Behavior:
- Help with fit, outfit direction, product selection, archive mood, order/checkout guidance, and VLM interface explanations.
- Keep answers short, elegant, practical, and fashion-first.
- Never invent stock, shipping dates, live contract addresses, audit status, listings, investment returns, or transaction instructions.
- Never ask for seed phrases, private keys, or card details.
- If payment/order/account data is needed, tell the user to use the official checkout/account UI.`;

function cleanMessages(history: AngelChatMessage[] = []) {
  return history
    .filter((message): message is AngelChatMessage => {
      return (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim().length > 0;
    })
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_CHARS_PER_MESSAGE),
    }));
}

function toGeminiRole(role: AngelRole) {
  return role === "assistant" ? "model" : "user";
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Angel is offline: missing GEMINI_API_KEY." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as AngelRequestBody | null;
  const locale = body?.locale === "pl" || body?.locale === "de" || body?.locale === "en" ? body.locale : "en";
  const message = body?.message?.trim().slice(0, MAX_CHARS_PER_MESSAGE);
  const cleanedHistory = cleanMessages(body?.history ?? []);

  if (!message && cleanedHistory.length === 0) {
    return NextResponse.json({ error: "Message or history is required." }, { status: 400 });
  }

  const generativeAI = new GoogleGenerativeAI(apiKey);
  const model = generativeAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: `${ANGEL_SYSTEM_PROMPT}\nPreferred response locale: ${locale.toUpperCase()}.\n[SYSTEM: You are Angel, the cyber-luxury concierge for VELMÈRE. You have absolute, real-time knowledge of the brand\'s active apparel catalog. Use the following structured JSON catalog to answer stock, description, fit, price, and style inquiries. Do not hallucinate products outside this catalog: ${JSON.stringify(buildCatalogContext(locale))}]`,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
    generationConfig: {
      temperature: 0.62,
      topP: 0.9,
      maxOutputTokens: 650,
    },
  });

  const history = cleanedHistory.map((entry) => ({ role: toGeminiRole(entry.role), parts: [{ text: entry.content }] }));
  const lastMessage = message ?? cleanedHistory[cleanedHistory.length - 1]?.content;
  if (!lastMessage) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  try {
    const chat = model.startChat({ history: message ? history : history.slice(0, -1) });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text().trim();
    if (!reply) return NextResponse.json({ error: "Angel returned an empty response." }, { status: 502 });
    return NextResponse.json({ reply, model: MODEL });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Angel failed to answer.",
        detail: error instanceof Error ? error.message : "Unknown Gemini error.",
      },
      { status: 502 },
    );
  }
}
