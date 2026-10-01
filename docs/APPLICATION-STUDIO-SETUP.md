# Application Studio: implementation and connection guide

Application Studio is being developed on `application-studio`. The existing production Worker and `main` branch remain separate. This guide describes the first working preview, not a finished private job-search service.

## What works now

### Private company exclusions

Excluded organizations are backend configuration, not public inbox examples or editable browser fields. The public demo does not display the list or fetch it.

- Copy `workers/studio/config/owner-exclusions.example.json` to `workers/studio/config/owner-exclusions.local.json` for local preparation. The local file is ignored by Git. Populate company names, aliases, email domains, email addresses, and end clients separately; use domains without `@`.
- For a future authenticated owner Worker, store the same JSON as a private Cloudflare secret named `OWNER_EXCLUSIONS_JSON`. Do not add it to the public Worker, public JSON configuration, `VITE_*` variables, assets, or API status responses.
- Before implementing sending, validate this configuration on the backend and check organizations, aliases, sender and recipient addresses/domains, and end clients before each outbound action. Missing or invalid configuration must block sending. A frontend choice must never override the policy.

This is a configuration template for the future private email backend. The current preview has no Gmail sending implementation and does not load or enforce this list against real email. All private API routes remain closed.

The public Connections page shows compact service-status tags only. Public AI availability is read automatically from `/api/studio/public/status`; this reports whether generation is enabled, not a completed provider health check. Email and Google Workspace remain demo-only. Private connection details are never requested by this page. Configuration, provider setup links and owner-access requirements belong in this repository guide, not in the public UI.

| Feature | Current behavior |
| --- | --- |
| Studio navigation | Six prerendered pages, shared portfolio header, responsive layout, existing Untitled UI buttons, inputs, badges and icons. |
| Documents | Add, edit or remove up to 12 separate job/project cards with title, organization, dates and details; add skills, generate a template resume or cover letter, edit it, download text. No AI required. |
| Inbox | Explore fictional messages and prepare sample replies. Interviews and sensitive requests are marked for review. Nothing is sent. |
| Career preferences | Edit temporary sample fields; calculate an annual equivalent from an hourly rate. |
| Rules | Preview a tagging rule and inspect automation boundaries. No real automation is activated. |
| Public AI | Optional Cloudflare Workers AI adapter, explicit consent, bounded inputs/outputs, atomic shared daily quota. Disabled by default. |
| Owner and Google features | Not connected or implemented. Private API paths return 401 regardless of public AI settings. |

Inputs and edits are held in page memory. They are lost on navigation/reload. There is no browser persistence, private career import, fake login, or saved history. AI generation sends only the explicitly provided document fields after consent. Do not provide confidential data to public generation.

The document form combines the current job/project cards and skills into the API's `experience` text field. Removed cards are excluded from subsequent drafts and AI requests. There is no separate contributions field; describe your work within each entry. Reset sample restores the fictional job and project cards. Existing drafts remain editable snapshots until regenerated.

AI drafting checks public availability automatically and requires consent and experience. Tone (professional/conversational) and emphasis (balanced/customer delivery/technical implementation) are validated enums on the backend. Separate resume and cover-letter prompts live in `workers/studio/prompts.mjs`; job descriptions influence relevance but are explicitly treated as untrusted data, not evidence of candidate qualifications. Templates do not apply AI writing preferences. The existing model, output budget and daily cap are unchanged. These prompt instructions reduce unsupported claims but cannot guarantee model accuracy; evaluate real outputs with consented sample facts before enabling the connection.

## Run the UI locally

Use Node 24 and the pnpm version in `package.json`:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite and append `/application-studio/`. The document builder is `/application-studio/documents/`. Vite serves the static frontend; the public AI button reports that AI is unavailable when no backend is running.

## Run the separate Studio backend

```powershell
pnpm build:cloudflare
pnpm dlx wrangler@4.144.0 types --config wrangler.studio.jsonc workers/studio/worker-configuration.d.ts
pnpm dlx wrangler@4.144.0 dev --config wrangler.studio.local.jsonc --port 8787
```

Open `http://localhost:8787/application-studio/`. Wrangler serves the built UI and `/api/studio/*` from the same origin. `GET /api/studio/public/status` reports the configured public mode; it never returns secrets. Private routes are intentionally unavailable.

Alternatively run `pnpm studio:dev` to build and start this local preview in one command. The local config deliberately omits the remote AI binding, so it runs without Cloudflare credentials. For a connected AI preview, use `wrangler.studio.jsonc` and authenticate Wrangler with your Cloudflare account/token. Even when AI is disabled, that config's remote AI binding requires authentication for local development.

On Windows, stop Wrangler before rebuilding `dist`, then restart it. The build replaces the asset directory; a running Wrangler asset watcher can lose access to it and serve stale or missing pages. Use Vite for frontend edits and restart the built Worker preview for final HTTP checks.

The Studio config names a separate Worker, `application-studio-preview`, with no production custom-domain route. Existing `wrangler.jsonc` is unchanged. Do not deploy Studio through the portfolio's production command. There is no automatic Studio release.

## Configure public AI

1. Review Cloudflare's current [Workers AI model pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) and account allowances. Free allowances are finite and account-wide; a request quota is not a guarantee of zero Cloudflare charges on a paid account.
2. Keep `PUBLIC_AI_ENABLED` set to `false` until the preview is ready. This server-side variable in `wrangler.studio.jsonc` controls activation. A browser flag cannot activate it.
3. The `AI` binding uses Cloudflare's account connection; there is no API token in the browser. Follow [Workers AI setup](https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/).
4. Edit `config/application-studio.public.json` to choose the model, combined input-character limit, output-token limit, and shared daily request count. Defaults are 20 total attempts per UTC day, 12,000 input characters and 800 output tokens. Failed provider attempts consume quota too. Changes require a rebuild and Worker upload.
5. Enable only on a separate preview after checking the account's billing controls. In the deployed Worker dashboard, a non-secret `PUBLIC_AI_ENABLED=true` variable can enable the adapter. A subsequent config-based deployment can overwrite dashboard changes; keep Git and dashboard values aligned.
6. Add Cloudflare rate limiting/bot controls before public release. Same-origin checks block cross-site browser requests, but are not authentication or bot protection. Anonymous visitors share a single quota and can exhaust it; template drafts stay usable.
7. The current public adapter uses one configured Cloudflare model. Multi-provider free routing, per-visitor limits and Turnstile remain future work. No paid fallback or credential rotation is implemented.

To disable immediately, set `PUBLIC_AI_ENABLED=false` in the Studio Worker settings. Disabling AI does not affect template generation.

## Owner authentication and private configuration

Before importing real data, implement a separate owner backend:

1. Create a dedicated owner origin or API Worker. Keep the public Studio Worker free of private bindings, refresh tokens and owner API keys.
2. Configure Cloudflare Access for the owner application, an exact owner-email allowlist, and MFA (prefer WebAuthn/passkey or an identity provider with enforced MFA). Protect alternate Worker URLs too.
3. Validate Access JWT signature, issuer, audience and expiry in the backend. Reject missing or invalid tokens. A hidden page or a client mode selector is not authorization.
4. Implement session/CSRF checks, no-store private responses, an encrypted token vault, retention controls and audit events before enabling private actions.
5. Store API keys and encryption keys as Cloudflare secrets on the owner Worker. Use `.dev.vars` locally, which is ignored by Git. Never use `VITE_*` for secrets: Vite embeds those values in the public bundle.

Suggested private configuration names for the later owner Worker (these are a contract, not currently read by the public Worker):

```text
ACCESS_ISSUER                non-secret Access team URL
ACCESS_AUDIENCE              non-secret application audience
OWNER_EMAIL                 private setting
OWNER_AI_PROVIDER           openai / anthropic / gemini / compatible
OWNER_AI_MODEL              provider-specific model ID
OWNER_AI_API_KEY            Cloudflare secret
GOOGLE_CLIENT_ID            OAuth client identifier
GOOGLE_CLIENT_SECRET        Cloudflare secret
GOOGLE_REDIRECT_URI         exact registered HTTPS callback
TOKEN_ENCRYPTION_KEY        Cloudflare secret
```

Public connection cards distinguish available code from planned adapters. Do not label a provider connected until a real capability check succeeds.

## OpenAI and a paid ChatGPT plan

An OpenAI API key is a separately billed connection; paying for ChatGPT does not itself configure this website's API access. Website [Sign in with ChatGPT](https://developers.openai.com/siwc/website) has registration/eligibility requirements. Confirm approval, allowed inference usage and product restrictions before implementing that path. Do not copy browser cookies or assume every self-hosted website can consume a subscription. The existing plan records the provider adapter roadmap.

Future adapters should share a document request contract: document type, career facts, job context, output length and review requirements. Provider-specific code must handle authentication, response formats, timeouts, errors and quotas. Start with one owner provider, then add tested adapters; do not equate an OpenAI-compatible endpoint with support for every provider's features.

## Google connection setup

The preview does not yet perform Google OAuth or read/send email. These are the setup steps for the next protected implementation phase:

1. Create/select a Google Cloud project owned by the deployer.
2. Configure the OAuth consent screen and audience. Add your account as a test user while developing. Check Google's current publishing/verification requirements before broader use.
3. Enable Gmail, Drive, Docs, Sheets and Calendar APIs only for the features being implemented.
4. Create a Web application OAuth client. Register the exact owner callback, for example `https://owner.example.com/api/google/callback`; register a separate localhost callback for development.
5. Put the client secret in the owner Worker's secrets. Store the client ID and callback in its settings. Never place refresh tokens in Git, the public Worker or localStorage.
6. Implement [Google's server-side OAuth flow](https://developers.google.com/identity/protocols/oauth2/web-server), one-time state bound to the owner session, token exchange, encrypted refresh-token storage, refresh and revocation handling. Request offline access when appropriate. Confirm test-mode token lifetime restrictions before relying on unattended processing.
7. Begin with the minimum scopes. Gmail read/modify scopes can be restricted and may require verification. Use `drive.file` for files created by the app when sufficient. Add sending and calendar-write scopes only when those actions are ready.
8. Connect from the authenticated owner workspace and verify the returned account identity. Show scope/expiry/reconnect state and provide a revoke/disconnect action.
9. Start Gmail integration with read/classify/draft. Add labels and a dedicated interview queue. Implement watch renewal and deduplication before background processing. Keep sending disabled until exclusion rules, recipients, permissions and retries are exercised.
10. Use a private application folder and spreadsheet. Share neither automatically. Keep a backend database authoritative; Google Sheets can mirror the tracker. A calendar hold should not invite external attendees unless explicitly authorized.

Google access requires the owner to complete consent. This repository cannot establish it using a sample UI switch.

## Next implementation milestones

- Owner authentication, MFA verification, persistent profile, history and encrypted credentials.
- Native owner-provider adapters and connection checks.
- Google OAuth, private tracker and email label/draft sync.
- Supported job feeds, eligibility matching and duplicate detection.
- Reviewed rules for email sending and identity disclosure, with excluded-employer checks.
- PDF/DOCX exports from the Studio builder. The existing portfolio downloads remain unchanged.
- Public bot controls, accessibility/browser review and live-provider acceptance tests before release.

## Validation

`pnpm verify` includes Studio API tests and both static packaging paths. `pnpm build:cloudflare` restores root-path output. `pnpm studio:bundle` validates the separate Worker bundle without deploying. Browser interaction, live AI generation, Google consent and private authentication require separate verification; code checks do not prove those states.
