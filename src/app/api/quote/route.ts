export const runtime = "nodejs";

const MAX_TOPIC = 140;
const MAX_AUTHOR = 80;
const DEFAULT_GLM_URL = "https://api.z.ai/api/paas/v4/chat/completions";
const DEFAULT_GLM_MODEL = "glm-4.7";

type QuoteRequest = {
  topic?: string;
  author?: string;
  language?: string;
};

type QuoteLanguage = "en" | "id";

type GlmResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
      reasoning_content?: unknown;
    };
    delta?: {
      content?: unknown;
    };
    text?: unknown;
  }>;
  output_text?: unknown;
  error?: {
    message?: unknown;
  };
  message?: unknown;
  msg?: unknown;
  code?: unknown;
};

function clean(input: unknown, max: number): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const text = (item as { text?: unknown; content?: unknown }).text;
          if (typeof text === "string") {
            return text;
          }

          const content = (item as { text?: unknown; content?: unknown }).content;
          if (typeof content === "string") {
            return content;
          }
        }

        return "";
      })
      .join(" ");
  }

  if (value && typeof value === "object") {
    const text = (value as { text?: unknown }).text;
    if (typeof text === "string") {
      return text;
    }

    const content = (value as { content?: unknown }).content;
    if (typeof content === "string") {
      return content;
    }
  }

  return "";
}

function extractQuote(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const typed = payload as GlmResponse;
  const choice = typed.choices?.[0];

  const candidates: unknown[] = [
    choice?.message?.content,
    choice?.message?.reasoning_content,
    choice?.delta?.content,
    choice?.text,
    typed.output_text,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeText(candidate).replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized.slice(0, 320);
    }
  }

  return "";
}

function extractUpstreamError(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const typed = payload as GlmResponse;
  const candidates: unknown[] = [typed.error?.message, typed.message, typed.msg];

  for (const candidate of candidates) {
    const normalized = normalizeText(candidate).replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized.slice(0, 240);
    }
  }

  return "";
}

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function looksLikeMetaOutput(text: string): boolean {
  return /(analyze the request|topic:|tone:|output constraint)/i.test(text);
}

function fallbackQuote(topic: string, author: string, language: QuoteLanguage): string {
  const writer = author || "zhio.site";
  if (language === "id") {
    return `${topic} tumbuh lewat langkah kecil yang konsisten. - ${writer}`;
  }

  return `${topic} grows through consistent small steps. - ${writer}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GLM_API_KEY?.trim() || "";
  const model = process.env.GLM_MODEL?.trim() || DEFAULT_GLM_MODEL;
  const glmUrl = process.env.GLM_API_URL?.trim() || DEFAULT_GLM_URL;

  if (!apiKey) {
    return Response.json(
      { error: "GLM API key is missing. Set GLM_API_KEY in your environment." },
      { status: 500 },
    );
  }

  let body: QuoteRequest;

  try {
    body = (await request.json()) as QuoteRequest;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body.topic !== "string") {
    return Response.json({ error: "`topic` is required and must be a string." }, { status: 400 });
  }

  if (body.author !== undefined && typeof body.author !== "string") {
    return Response.json({ error: "`author` must be a string." }, { status: 400 });
  }

  if (body.language !== undefined && body.language !== "en" && body.language !== "id") {
    return Response.json({ error: "`language` must be either `en` or `id`." }, { status: 400 });
  }

  const topic = clean(body.topic, MAX_TOPIC);
  const author = clean(body.author, MAX_AUTHOR);
  const language: QuoteLanguage = body.language === "id" ? "id" : "en";

  if (!topic) {
    return Response.json({ error: "`topic` cannot be empty." }, { status: 400 });
  }

  const userPrompt =
    language === "id"
      ? `Buat satu kutipan pendek tentang: ${topic}`
      : `Create one short quote about: ${topic}`;

  const authorHint = author
    ? language === "id"
      ? ` Gunakan nuansa yang cocok dengan penulis: ${author}.`
      : ` Include a tone fitting author: ${author}.`
    : "";

  let response: Response;

  try {
    response = await fetch(glmUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 120,
        thinking: {
          type: "disabled",
        },
        messages: [
          {
            role: "system",
            content:
              language === "id"
                ? "Kamu menulis kutipan singkat yang mudah diingat untuk kartu OpenGraph. Kembalikan hanya satu kutipan dalam Bahasa Indonesia sebagai plain text, tanpa markdown, tanpa komentar tambahan."
                : "You write concise memorable quotes for OpenGraph cards. Return only one quote in English as plain text, no markdown, no extra commentary.",
          },
          {
            role: "user",
            content: `${userPrompt}${authorHint}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(18_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return Response.json({ error: "GLM request timed out." }, { status: 504 });
    }

    return Response.json({ error: "Unable to reach GLM service." }, { status: 502 });
  }

  if (!response.ok) {
    const rawErrorText = await response.text();
    const errorPayload = parseJsonSafe(rawErrorText || "");
    const upstreamMessage = extractUpstreamError(errorPayload) || rawErrorText.slice(0, 240);

    console.error("GLM upstream error", {
      status: response.status,
      message: upstreamMessage,
    });

    return Response.json(
      {
        error: "Failed to generate quote from GLM.",
      },
      { status: response.status },
    );
  }

  const rawText = await response.text();
  const data = parseJsonSafe(rawText || "");
  const upstreamError = extractUpstreamError(data);

  if (upstreamError) {
    console.error("GLM upstream logical error", {
      model,
      message: upstreamError,
    });

    return Response.json(
      {
        error: `GLM error: ${upstreamError}`,
      },
      { status: 502 },
    );
  }

  const quote = extractQuote(data);

  if (!quote) {
    console.error("GLM parse error: empty content", {
      model,
      hasChoices: Boolean((data as { choices?: unknown } | null)?.choices),
      keys: data && typeof data === "object" ? Object.keys(data as Record<string, unknown>) : [],
      bodyPreview: rawText.slice(0, 240),
    });

    return Response.json(
      { error: "GLM returned no quote content." },
      { status: 502 },
    );
  }

  if (looksLikeMetaOutput(quote)) {
    return Response.json({ quote: fallbackQuote(topic, author, language) });
  }

  return Response.json({ quote });
}
