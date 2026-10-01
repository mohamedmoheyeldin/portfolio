import { DurableObject } from "cloudflare:workers";
import defaults from "../../config/application-studio.public.json" with { type: "json" };
import { handleStudioRequest } from "./handler.mjs";
import { reserveDailyQuota } from "./quota.mjs";

export class PublicQuota extends DurableObject {
  async fetch(request) {
    if (request.method !== "POST") return new Response(null, { status: 405 });
    const day = new Date().toISOString().slice(0, 10);
    const allowed = reserveDailyQuota(
      this.ctx.storage,
      day,
      defaults.publicRequestsPerDay,
    );
    return new Response(null, { status: allowed ? 204 : 429 });
  }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleStudioRequest(request, env);
      } catch {
        return Response.json(
          { error: "Service unavailable." },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
    }
    return env.ASSETS.fetch(request);
  },
};
