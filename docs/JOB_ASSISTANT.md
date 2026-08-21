# Autonomous Application System

## Purpose

The `/assistant/` page is a public engineering case study of an autonomous Gmail, Cloudflare, and AI workflow. It shows system health and aggregate pipeline totals to potential employers. It does not publish a recent-message or generalized-event feed. It is not an owner console: mailbox connection, synchronization, message review, and credentials never appear in the public interface.

Production is designed to monitor one or more configured Gmail accounts. New recruiting messages are classified and passed through deterministic policy before any side effect. Permitted low-risk messages can be matched to canonical career facts, turned into tailored PDF resumes, answered in the original Gmail thread, recorded in the durable activity ledger, and archived as a complete thread. High-impact or uncertain messages stay in the inbox with the `AI-Career/Needs-Attention` label. The localhost service remains a development fallback and does not define the production automation contract.

Each account records its enrollment time. The first scheduled run ignores older matching mail, so connecting an account cannot trigger replies to the previous 30 days of search results; only messages received after enrollment enter automatic processing.

## System boundary

```text
Public portfolio `/assistant/`
       |
       +--> GET public sanitized snapshot only
       |
       v
Cloudflare Worker scheduled every 15 minutes
       |
       +--> encrypted OAuth tokens in D1, one per Gmail account
       +--> Gmail API: detect, draft, deduplicate sends, and archive the full thread
       +--> AI Gateway: payload logging off, caching off, retry bounded
       +--> OpenAI: structured classification and fact-grounded reply
       +--> Browser Rendering + private R2: tailored PDF
       +--> D1: leases, retry schedule, private workflow, and audit state
       +--> optional Google Sheet: idempotent Activity Log mirror

Owner-only OAuth and private APIs
       +--> Cloudflare Access JWT verification
```

The public snapshot never includes email addresses, companies, recruiters, subjects, bodies, message identifiers, generated text, tokens, or resume files. It generalizes events into types such as “remote quality engineering opportunity” and exposes only aggregate operational evidence.

## Automatic state machine

```text
discover -> analyze -> resume-ready -> draft-ready -> sent -> logged -> complete
    |          |            |              |          |         |        |
    |          |            |              |          |         |        +-- whole thread archived
    |          |            |              |          |         +----------- D1 + optional Sheet
    |          |            |              |          +--------------------- sent-copy dedupe check
    |          |            |              +-------------------------------- stable Message-ID draft
    |          |            +----------------------------------------------- fact-grounded PDF if needed
    |          +------------------------------------------------------------ deterministic policy + AI schema
    +----------------------------------------------------------------------- durable discovery record

analyzed -> needs-review -------------------------------------------------- Gmail label added; INBOX retained
draft-ready -> drafted ---------------------------------------------------- DRAFT_ONLY mode; never sent
```

`AUTOMATION_MODE` defaults to `AUTOMATION_OFF`; this remains true until an operator changes Worker configuration. `AUTOMATION_MIN_CONFIDENCE` defaults to `85`. Deterministic rules take precedence over AI for configured current-employer domains, obvious automated alerts, sender continuity, high-impact categories, oversized messages, and sensitive requests. Low-confidence, uncertain, interview, offer, negotiation, onboarding, sensitive-document, mismatched `Reply-To`, and exhausted-retry items receive the needs-attention label and remain in the inbox.

Every stage is resumable. D1 leases prevent overlapping scheduled/manual runs from processing the same item concurrently. Exponential backoff retries incomplete work, and a stable RFC `Message-ID` lets the Worker check Sent mail before retrying a delivery. A successful send is persisted before logging; logging is persisted before the entire Gmail thread loses its `INBOX` label. The optional Sheet mirror checks the item ID before appending, so retrying a completed write does not create another Activity Log row.

Requests for driver licenses, passports, Social Security information, work-authorization documents, or other identity records are never answered or attached automatically. They are routed to needs-attention without passing those documents to AI. This identity-data firewall is intentionally not configurable through the public site.

## Cloudflare setup

No Cloudflare resources are created or deployed automatically by this branch.

Follow [Secure integrations](SECURE_INTEGRATIONS.md) for the authoritative secret-placement decision, OpenAI project and AI Gateway BYOK setup, Gmail OAuth scopes, Google Drive per-file access, rotation, and incident response.

1. Create the D1 database, replace its placeholder ID in `wrangler.job-assistant.jsonc`, and apply the migration:

   ```bash
   pnpm exec wrangler d1 create portfolio-job-assistant
   pnpm exec wrangler d1 migrations apply portfolio-job-assistant --remote --config wrangler.job-assistant.jsonc
   ```

2. Create the private R2 bucket:

   ```bash
   pnpm exec wrangler r2 bucket create portfolio-job-assistant-artifacts
   ```

3. Create an AI Gateway named `portfolio-job-assistant`, enable authenticated gateway access, store the dedicated OpenAI project key in Provider Keys with alias `default`, and keep prompt/response payload logging disabled. The Worker also sends `cf-aig-collect-log-payload: false` and disables caching for every email-analysis request.
4. In Cloudflare Zero Trust, create a self-hosted Access application for owner-only paths under `mohamedmoheyeldin.com/api/assistant/*`, excluding the exact public path `/api/assistant/api/public-snapshot`. Replace `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, and `OWNER_EMAIL` in the Wrangler configuration.
5. Set `GMAIL_ACCOUNT_EMAILS` to a comma-separated allowlist. Example: `jobs.one@gmail.com,jobs.two@gmail.com`.
   Keep `AUTOMATION_MODE=AUTOMATION_OFF` for provisioning and sandbox validation. `DRAFT_ONLY` may be used for test accounts; `SAFE_AUTOMATION` and `FULL_CONFIGURED_AUTOMATION` require completed policy-matrix tests and an explicitly authorized configuration change.
6. In Google Cloud Console, enable Gmail API, create an OAuth web client, and add `https://mohamedmoheyeldin.com/api/assistant/oauth/google/callback`.
7. Add these values as Worker secrets:

   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AI_GATEWAY_TOKEN`
   - `TOKEN_ENCRYPTION_KEY`
   - `CLOUDFLARE_BROWSER_RENDERING_TOKEN`

   Optional automation-policy secrets:

   - `GOOGLE_SHEETS_SPREADSHEET_ID` — exact private spreadsheet used for the `Activity Log` mirror
   - `CURRENT_EMPLOYER_DOMAINS` — comma-separated domains that must be archived without an automatic reply

   Generate `TOKEN_ENCRYPTION_KEY` with `openssl rand -base64 32 | tr '+/' '-_' | tr -d '=\n'`.

   If Sheets logging is enabled, create an `Activity Log` tab with columns A–M reserved for this Worker. The OAuth flow then adds `drive.file`; re-enroll accounts that were authorized before enabling the Sheet. The spreadsheet must already be available to the OAuth application through Google's per-file access model.

8. Validate without deploying:

   ```bash
   pnpm assistant:cloud:dry-run
   ```

9. After an explicitly authorized deployment, connect each allowlisted account while signed into the intended Google account:

   ```text
   https://mohamedmoheyeldin.com/api/assistant/oauth/google/start?account=jobs.one@gmail.com
   ```

   Repeat with each configured address. OAuth setup is intentionally an owner-only URL rather than a public portfolio control.

## Data and AI rules

- Email content is untrusted data. Instructions inside an email cannot change the system task or invoke arbitrary tools.
- Current-employer and obvious automated-alert rules execute before AI and cannot be overridden by email text.
- AI Gateway receives email-analysis traffic with prompt/response payload logging and caching disabled, bounded retries, and feature-only metadata containing no Gmail identifiers.
- OpenAI receives only the selected message and the public canonical career facts required for matching; requests set `store: false`.
- OpenAI Structured Outputs select from a bounded category/action schema; server policy can narrow or replace that decision before any side effect.
- The effective automation mode is checked immediately before draft creation and again immediately before Gmail delivery.
- A trusted automatic recipient must match the authenticated sender or belong to an explicitly configured sender domain; inbound `Reply-To` cannot redirect a generated resume.
- Gmail payload metadata is checked against `GMAIL_MAX_MESSAGE_BYTES` before the full message body is fetched.
- AI-selected highlights and skills are intersected with exact canonical values before resume generation.
- Career facts remain owned by `src/content/career.json`; generated artifacts never flow back into that source.
- OAuth tokens are encrypted with AES-GCM before D1 persistence. PDF resumes remain in private R2.
- Stable reply IDs, D1 leases, and per-stage timestamps make retries idempotent across Worker restarts.
- The public API is a deliberate projection, not a redaction performed in the browser.

## API contract

- `GET /api/public-snapshot` — public aggregate pipeline totals and provenance only; no Access token required.
- `GET /api/snapshot` — owner-only operational snapshot.
- `GET /oauth/google/start?account=...` — owner-only OAuth enrollment for an allowlisted Gmail account.
- `GET /oauth/google/callback` — owner-only OAuth callback.
- `POST /api/sync` — owner-only immediate run of the same automatic workflow used by the scheduled trigger.
- `GET /api/items/:id` and `/artifact/:format` — owner-only private inspection and artifact retrieval.
- `POST /api/items/:id/generate|draft|send` — owner-only recovery endpoints; production normally advances these stages automatically.

All private endpoints require a validated Access JWT. Mutations also require the configured same-origin header.

## Verification and rollout boundary

Repository verification does not make real Gmail, OpenAI, or Cloudflare calls. Before automatic delivery is enabled, use dedicated test Gmail accounts and verify classification, thread targets, PDF attachments, confidence skips, duplicate suppression, identity-document handling, AI Gateway privacy settings, and audit events. Deploying, provisioning resources, enrolling Gmail accounts, and enabling live automatic delivery require explicit authorization.

## Growth path

- Gmail `watch` plus Pub/Sub, incremental `history.list`, Cloudflare Queues, and a DLQ are the selected target ingestion design; see [AI Career Automation Platform](CAREER_AUTOMATION_PLATFORM.md).
- A dead-letter queue and alert can make repeated stage failures easier to operate.
- AI Gateway cost and latency aggregates can be copied into D1 for additional public-safe engineering metrics.
- Stable fact IDs can allow controlled paraphrasing while retaining traceability to canonical career evidence.
