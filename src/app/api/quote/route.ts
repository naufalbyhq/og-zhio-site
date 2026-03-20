export const runtime = "nodejs";

const MAX_TOPIC = 140;
const MAX_AUTHOR = 80;
const DEFAULT_GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const DEFAULT_GLM_MODEL = "glm-4.7";

type QuoteRequest = {
  topic?: string;
  author?: string;
};

type GlmResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function clean(input: unknown, max: number): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.replace(/\s+/g, " ").trim().slice(0, max);
}

function extractQuote(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const typed = payload as GlmResponse;
  const raw = typed.choices?.[0]?.message?.content;

  if (typeof raw !== "string") {
    return "";
  }

  return raw.replace(/\s+/g, " ").trim().slice(0, 320);
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

  const topic = clean(body.topic, MAX_TOPIC);
  const author = clean(body.author, MAX_AUTHOR);

  if (!topic) {
    return Response.json({ error: "`topic` cannot be empty." }, { status: 400 });
  }

  const userPrompt = `Create one short quote about: ${topic}`;

  const authorHint = author ? ` Include a tone fitting author: ${author}.` : "";

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
        messages: [
          {
            role: "system",
            content:
              "You write concise memorable quotes for OpenGraph cards. Return only one quote as plain text, no markdown, no extra commentary.",
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
    const errorPayload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;

    const upstreamMessage = errorPayload?.error?.message;

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

  const data = (await response.json().catch(() => null)) as unknown;
  const quote = extractQuote(data);

  if (!quote) {
    return Response.json(
      { error: "GLM returned no quote content." },
      { status: 502 },
    );
  }

  return Response.json({ quote });
}
