# Secure OpenAI, Gmail, and Google Drive Integration

Last reviewed: August 21, 2026

## Recommended design

Do not put OpenAI, Gmail, or Google Drive credentials in Astro, browser JavaScript, GitHub source, public environment variables, or the public dashboard. The browser should call only the Cloudflare Worker. The Worker owns every privileged integration and returns a deliberately sanitized public projection.

```text
Public browser
   |
   | GET sanitized aggregate status only
   v
Cloudflare Worker
   |-- Cloudflare Access: owner-only setup and private APIs
   |-- Worker secrets: Google OAuth client secret, gateway token, encryption key
   |-- D1: encrypted Gmail/Drive refresh tokens and exact Drive file allowlist
   |-- private R2: generated resumes and approved non-identity attachments
   |
   +-- AI Gateway -- stored OpenAI project key (BYOK) -- OpenAI Responses API
   +-- Google OAuth -- Gmail API + per-file Google Drive API
```

This follows the vendor guidance to keep OpenAI keys out of client code, use Cloudflare secrets instead of plaintext variables, use a server-side OAuth flow with offline access for scheduled work, and request the narrowest Google scopes. See the official [OpenAI API authentication guidance](https://developers.openai.com/api/reference/overview#authentication), [Cloudflare Worker secret guidance](https://developers.cloudflare.com/workers/configuration/environment-variables/), and [Google OAuth policy](https://developers.google.com/identity/protocols/oauth2/policies).

## Where each value belongs

| Value | Correct storage | Never store in |
| --- | --- | --- |
| OpenAI project service-account key | AI Gateway Provider Keys / BYOK, `default` alias | Worker source, GitHub, Astro, browser, D1 |
| AI Gateway authentication token | Cloudflare Worker secret | GitHub source, Wrangler `vars`, browser |
| Google OAuth client ID | Worker configuration or secret; it is an identifier, not a password | Browser only if it is not needed there |
| Google OAuth client secret | Cloudflare Worker secret | GitHub, browser, Wrangler `vars` |
| Gmail/Drive refresh tokens | AES-GCM encrypted D1 rows, one per Gmail account | GitHub, browser, logs, public API |
| Token encryption key | Cloudflare Worker secret | D1, R2, source, GitHub |
| Browser Rendering token | Cloudflare Worker secret | Source, GitHub, browser |
| Cloudflare account ID, gateway ID, model name | Wrangler `vars` | No secrecy required; still avoid unnecessary display |
| Drive file IDs | Private D1 allowlist | Public activity feed |
| Generated resumes and approved attachments | Private R2 | Static `public/` directory |

For this one-Worker system, per-Worker secrets are simpler and more narrowly scoped than an account-wide Secrets Store. Use [Cloudflare Secrets Store](https://developers.cloudflare.com/secrets-store/integrations/workers/) later only when the same secret must be centrally shared or rotated across multiple Workers.

## Why GitHub Secrets are not the runtime solution

GitHub Secrets exist only while a GitHub Actions job runs. They do not securely provide credentials to a live Worker after deployment. Copying application keys into GitHub adds another place where they can be exposed and rotated.

This repository already uses Cloudflare Git integration, so the recommended production setup requires no OpenAI or Google secret in GitHub. If deployment later moves to GitHub Actions, add only a narrowly scoped Cloudflare deployment API token to a protected GitHub Environment. Do not add `OPENAI_API_KEY`, `GOOGLE_CLIENT_SECRET`, OAuth refresh tokens, or `TOKEN_ENCRYPTION_KEY` to GitHub.

When a provider supports GitHub OIDC, prefer short-lived workload credentials over a permanent deployment secret. GitHub documents the security benefit of avoiding duplicated long-lived cloud credentials in its [OIDC guidance](https://docs.github.com/en/actions/concepts/security/openid-connect).

## 1. Configure the OpenAI side

1. In the OpenAI API platform, create a dedicated project named `portfolio-job-assistant`. Do not use a personal key from the default project.
2. Create a project service account and a project-scoped API key. OpenAI projects support service accounts, model permissions, project rate limits, spend alerts, and hard spend limits in the [Projects API](https://developers.openai.com/api/reference/typescript/resources/admin/subresources/organization/subresources/projects).
3. Allow only the model used by `OPENAI_MODEL` and the Responses API capabilities required by this Worker.
4. Set a low project request/token limit suitable for a personal mailbox and configure both spend alerts and a hard monthly spend limit.
5. In Cloudflare, open **AI → AI Gateway → portfolio-job-assistant → Provider Keys**. Add the OpenAI key with alias `default`. AI Gateway stores BYOK provider keys in Secrets Store and can rotate them without a Worker redeploy. See [AI Gateway BYOK](https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/).
6. Enable authenticated gateway access. Create a dedicated token, do not reuse it elsewhere, and save it as the Worker secret `AI_GATEWAY_TOKEN`. Cloudflare currently scopes AI Gateway Run permission at the account level rather than to one gateway, so treat this token as high impact even though only this Worker should receive it. See [authenticated gateway behavior](https://developers.cloudflare.com/ai-gateway/configuration/authentication/).
7. Keep prompt/response payload logging disabled, keep caching disabled for email analysis, and retain the existing bounded retry and timeout settings.

The production Worker intentionally does not receive `OPENAI_API_KEY`; AI Gateway resolves the stored provider key. OpenAI also states that API keys must be loaded server-side from an environment variable or key-management service and never exposed in browsers or apps.

## 2. Configure Cloudflare Worker secrets

Use interactive commands so values do not appear in shell history:

```bash
pnpm exec wrangler secret put GOOGLE_CLIENT_ID --config wrangler.job-assistant.jsonc
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler.job-assistant.jsonc
pnpm exec wrangler secret put AI_GATEWAY_TOKEN --config wrangler.job-assistant.jsonc
pnpm exec wrangler secret put TOKEN_ENCRYPTION_KEY --config wrangler.job-assistant.jsonc
pnpm exec wrangler secret put CLOUDFLARE_BROWSER_RENDERING_TOKEN --config wrangler.job-assistant.jsonc
```

Generate the D1 token-encryption key once:

```bash
openssl rand -base64 32 | tr '+/' '-_' | tr -d '=\n'
```

Paste it into the interactive `TOKEN_ENCRYPTION_KEY` prompt. Do not pass secrets through command-line `--value` arguments; Cloudflare warns that doing so can leave plaintext in terminal history. Cloudflare also requires secrets rather than Wrangler plaintext variables for sensitive values in its [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).

For local Worker development only, copy `.dev.vars.example` to `.dev.vars`. The real file is ignored by Git. Use different development credentials and a different OpenAI/Google project from production.

## 3. Configure Gmail safely

1. Create separate Google OAuth web clients for localhost and production. Google requires a client appropriate to each platform.
2. Register the production callback exactly:

   ```text
   https://mohamedmoheyeldin.com/api/assistant/oauth/google/callback
   ```

3. Keep OAuth enrollment and callback routes behind Cloudflare Access. The public site must never initiate OAuth.
4. Request offline access so scheduled Worker runs can refresh short-lived access tokens. Validate the OAuth `state` value before exchanging the authorization code. Google documents both requirements in its [web-server OAuth flow](https://developers.google.com/identity/protocols/oauth2/web-server).
5. Request these base scopes:

   ```text
   openid
   email
   https://www.googleapis.com/auth/gmail.modify
   ```

   `gmail.modify` covers reading messages, creating and sending drafts, and removing the `INBOX` label after successful delivery. The Worker uses modification only for that inbox-cleanup step; it does not delete mail or alter Gmail settings. Do not request `mail.google.com`, deletion, or settings scopes. Gmail classifies `gmail.modify` as restricted; review the [Gmail scope table](https://developers.google.com/workspace/gmail/api/auth/scopes).
   When `GOOGLE_SHEETS_SPREADSHEET_ID` or Drive support is configured, the OAuth URL also requests `drive.file`. Accounts enrolled before that feature is enabled must be enrolled again to grant the additional per-file permission.
6. Encrypt refresh tokens before writing them to D1. Never return them from an endpoint or include them in logs.
7. Enroll each allowlisted Gmail account separately. Automation begins only with messages received after that account's enrollment timestamp.

Because the system reads Gmail content and stores restricted-scope data server-side, plan for Google's production OAuth verification and any required security assessment before treating this as a generally available application. A private test configuration is useful for development but is not a substitute for production approval.

## 4. Add Google Drive with per-file access

Do not give the Worker read access to the entire Drive. Use this design:

1. Enable Google Drive API and Google Picker API in the same Google Cloud project.
2. Add only this scope when Drive support is implemented:

   ```text
   https://www.googleapis.com/auth/drive.file
   ```

3. From an owner-only page behind Cloudflare Access, use Google Picker to select each document the application may use. Google specifically recommends `drive.file` with Picker because it gives per-file access and is non-sensitive. See [Drive scope guidance](https://developers.google.com/workspace/drive/api/guides/api-specific-auth) and [Google Picker](https://developers.google.com/workspace/drive/api/guides/picker).
4. Store only the selected file ID, approved purpose, expected MIME type, sensitivity class, and approval timestamp in a private D1 allowlist.
5. At send time, fetch by exact allowlisted file ID. Reject files whose owner, MIME type, or checksum differs from the approved record.
6. Export Google Docs to a bounded format such as PDF or plain text. Enforce file-size and page-count limits before sending content to AI or attaching it.
7. Never accept an arbitrary Drive URL or file ID found inside an email. Email bodies are untrusted input.

Avoid `drive.readonly` unless a future requirement truly needs every Drive file; it is a broad restricted scope and creates more verification and breach impact. Do not use a service-account JSON key for personal Gmail/Drive. Service-account impersonation is a Google Workspace domain-administration pattern, not the appropriate design for personal Gmail accounts.

## 5. Attachment policy

Automatic attachment is allowed only when all conditions are true:

- The file was explicitly selected through the owner-only Drive allowlist.
- Its policy class is `public-work-sample`, `resume-source`, or another documented non-sensitive class.
- The email type and expected recipient domain are compatible with that file's approved purpose.
- The file passes MIME, size, checksum, and malware/content checks.
- The audit event records the policy decision without recording file content.

Never automatically read, send to AI, or attach:

- Driver licenses, passports, Social Security cards, or other government IDs
- I-9, W-4, tax, banking, medical, background-check, or immigration documents
- Files containing signatures, account credentials, recovery codes, or security answers
- Any document requested only through an email link or unverified sender

Those requests should receive a response asking for a verified secure upload channel. The identity-data firewall must remain server-side and cannot be disabled from the public website.

## 6. Public and private routes

The only anonymous runtime route should be:

```text
GET /api/assistant/api/public-snapshot
```

It returns aggregates and generalized status. OAuth, Drive Picker, file allowlisting, message details, generated replies, artifacts, sync, recovery actions, and audit records must remain behind Cloudflare Access and the Worker's independent JWT checks.

Add rate limiting to the public snapshot even though it is read-only. Return `Cache-Control: no-store` for private responses. Do not enable browser CORS for origins other than the exact portfolio origin.

## 7. Rotation and incident runbook

### Routine rotation

- OpenAI key: rotate in the OpenAI project, replace the AI Gateway BYOK `default` key, test, then revoke the old key.
- AI Gateway token: create a replacement, update the Worker secret, deploy/test, then revoke the old token.
- Google client secret: create a replacement in Google Cloud, update the Worker secret, verify OAuth refresh, then revoke the old secret.
- Token encryption key: requires decrypting every D1 token with the old key and re-encrypting with the new key in a controlled migration. Do not overwrite it casually.
- OAuth grants: revoke in the Google Account security page and delete the related encrypted D1 row when an account is removed.

### If a secret may have leaked

1. Disable the scheduled trigger or Worker route.
2. Revoke the affected key/token at its provider first.
3. Search Git history, Cloudflare logs, GitHub Actions logs, and local shell history for exposure without printing the value again.
4. Rotate dependent credentials and OAuth grants.
5. Delete unauthorized drafts, R2 artifacts, and D1 rows after preserving a minimal incident record.
6. Re-enable using a test Gmail account and verify public/private route boundaries.

## Production readiness checklist

- [ ] No secret values in Git, Wrangler `vars`, Astro `PUBLIC_*`, browser bundles, or GitHub repository secrets
- [ ] Dedicated OpenAI project and service account
- [ ] OpenAI model allowlist, project rate limits, spend alerts, and hard spend limit
- [ ] OpenAI key stored in AI Gateway BYOK, not the Worker
- [ ] AI Gateway authentication on; prompt logging and caching off
- [ ] Production and development Google OAuth clients separated
- [ ] Gmail scope limited to `gmail.modify`; source archiving occurs only after successful delivery
- [ ] Optional `drive.file` access is enabled only for an exact configured Sheet or allowlisted Drive files
- [ ] Google OAuth verification/security requirements reviewed
- [ ] Each Gmail refresh token encrypted in D1
- [ ] Drive uses `drive.file` and exact Picker-selected file IDs only
- [ ] Identity documents excluded by server-side policy
- [ ] Cloudflare Access protects every private route
- [ ] Public snapshot verified to contain no mailbox, company, recipient, or file identifiers
- [ ] Rotation and emergency-disable procedure tested with non-production accounts
