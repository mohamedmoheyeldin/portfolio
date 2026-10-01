import defaults from "../../config/application-studio.public.json" with { type: "json" };
import { documentMessages } from "./prompts.mjs";

const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export async function readLimitedJSON(request, maxBytes = 64000) {
  if (!request.body) throw Error("Missing request body.");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw Error("Input is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export function normalizeInput(body) {
  if (!body || typeof body !== "object" || body.consent !== true)
    throw Error("Consent is required to use AI.");
  const fields = [
    "name",
    "headline",
    "experience",
    "company",
    "role",
    "job",
    "kind",
  ];
  const input = Object.fromEntries(
    fields.map((key) => [
      key,
      typeof body[key] === "string" ? body[key].trim() : "",
    ]),
  );
  if (!["resume", "cover-letter"].includes(input.kind))
    throw Error("Choose a resume or cover letter.");
  if (!input.experience)
    throw Error("Provide experience and skills.");
  for (const [key, values] of Object.entries({ tone: ["professional", "conversational"], focus: ["balanced", "customer", "technical"] })) {
    const value = body[key] ?? values[0];
    if (!values.includes(value)) throw Error("Choose a supported writing preference.");
    input[key] = value;
  }
  if (
    fields.reduce((total, key) => total + input[key].length, 0) >
    defaults.maxInputCharacters
  )
    throw Error(
      `Keep the combined inputs under ${defaults.maxInputCharacters} characters.`,
    );
  return input;
}
export async function handleStudioRequest(request, env) {
  const url = new URL(request.url);
  // There is deliberately no owner credential path in this public Worker.
  if (url.pathname.startsWith("/api/studio/private/"))
    return json(
      { error: "Owner access is not implemented in this preview." },
      401,
    );
  if (url.pathname === "/api/studio/public/status" && request.method === "GET")
    return json({
      enabled:
        env.PUBLIC_AI_ENABLED === "true" && Boolean(env.AI && env.PUBLIC_QUOTA),
      provider: "cloudflare",
      ownerEnabled: false,
      googleConnected: false,
    });
  if (url.pathname !== "/api/studio/public/generate")
    return json({ error: "Endpoint not found." }, 404);
  if (request.method !== "POST") return json({ error: "Use POST." }, 405);
  if (request.headers.get("Origin") !== url.origin)
    return json({ error: "Use the same-origin Studio page." }, 403);
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return json({ error: "Use JSON input." }, 415);
  if (env.PUBLIC_AI_ENABLED !== "true" || !env.AI || !env.PUBLIC_QUOTA)
    return json(
      { error: "Public AI is not connected. Create a template draft instead." },
      503,
    );
  let input;
  try {
    input = normalizeInput(await readLimitedJSON(request));
  } catch {
    return json(
      {
          error: `Invalid input. Consent, experience, and a combined limit of ${defaults.maxInputCharacters} characters are required.`,
      },
      400,
    );
  }
  const quota = env.PUBLIC_QUOTA.get(
    env.PUBLIC_QUOTA.idFromName("public-global-budget"),
  );
  const allowance = await quota.fetch("https://quota.internal/reserve", {
    method: "POST",
  });
  if (!allowance.ok)
    return json(
      {
        error:
          "The public daily AI limit has been reached. Template generation is still available.",
      },
      429,
    );
  try {
    const result = await env.AI.run(defaults.publicModel, {
      messages: documentMessages(input),
      max_tokens: defaults.maxOutputTokens,
    });
    if (typeof result?.response !== "string" || !result.response.trim())
      throw Error("Empty provider result.");
    return json({
      text: result.response.slice(0, 16000),
      provider: "cloudflare",
      reviewRequired: true,
    });
  } catch {
    return json(
      {
        error:
          "AI generation is temporarily unavailable. No paid fallback is used. Try a template draft.",
      },
      502,
    );
  }
}
