type GeminiTask = "product_description" | "rewrite_copy" | "alt_text" | "import_cleanup";

type GenerateGeminiTextInput = {
  task: GeminiTask;
  locale: "pl" | "en" | "de";
  input: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const TASK_INSTRUCTIONS: Record<GeminiTask, string> = {
  product_description:
    "Generate refined product copy for a luxury streetwear product. Return concise PL/EN/DE sections if useful. Do not invent composition, stock, delivery promises, discounts, provider names, or checkout readiness.",
  rewrite_copy:
    "Rewrite weak storefront copy in the Velmère tone: restrained, premium, clothing-first, minimal, never crypto-hype.",
  alt_text:
    "Generate concise accessibility alt text. Describe visible garment/form only. Avoid brand claims that are not visible.",
  import_cleanup:
    "Clean an imported product draft into review notes and improved product copy. Keep warnings when data is missing. Do not publish or approve the draft.",
};

export async function generateGeminiAdminText({ task, locale, input }: GenerateGeminiTextInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      ok: false as const,
      status: 500,
      payload: { error: "Missing GEMINI_API_KEY on server." },
    };
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "You are a private admin copy assistant for Velmère, a luxury streetwear maison with a draft VLM access layer. Keep fashion first. Never expose secrets. Never claim legal, audit, fulfilment, or payment readiness.",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Locale: ${locale}\nTask: ${TASK_INSTRUCTIONS[task]}\n\nInput:\n${input.slice(0, 12000)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: 1100,
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      payload: {
        error: "Gemini request failed on the server.",
        detail: data.error?.message ?? "Verify GEMINI_API_KEY and Google AI Studio billing/access.",
      },
    };
  }

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  if (!text) {
    return {
      ok: false as const,
      status: 502,
      payload: { error: "Gemini returned an empty response." },
    };
  }

  return {
    ok: true as const,
    status: 200,
    payload: { text, model: GEMINI_MODEL },
  };
}
