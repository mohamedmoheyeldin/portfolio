# Application Studio: product and implementation plan

Status: proposed, editable plan. No Studio services, account connections, or automation are implemented by this document.

Updated: October 1, 2026. Owner: Mohamed Moheyeldin.

Product name: **Application Studio**. Development branch: `application-studio`. The current portfolio is released from `main` to `https://mohamedmoheyeldin.com/`; this plan and future Studio implementation stay on the development branch until a separate release request.

## 1. Goal

Add `/application-studio/` to the portfolio: a useful job-search workspace and a public demonstration of customer-facing engineering, AI integration, and reliable workflow automation.

Visitors can explore every feature using fictional examples and create documents from information they provide. The owner uses the same interfaces with private career information, application history, AI connections, and Google integrations after signing in with MFA. People who host their own copy become the owner of that independent installation and connect their own accounts.

Keep the current portfolio and resume downloads simple and publicly accessible. Studio is an additional product area, not a replacement for the portfolio.

## 2. Product decisions and boundaries

| Area | Plan |
| --- | --- |
| Public access | Every Studio page has an interactive sample mode; no login is required to explore it. |
| Public document creation | Resume and cover-letter editing, preview, and export work with visitor-provided content; templates work without AI. |
| Public AI | Automatic routing among configured, approved free-tier providers; separate quotas and credentials, with templates available when all free allowances are exhausted. |
| Owner access | One allowlisted owner per installation initially, with MFA. No public account registration in version 1. |
| Owner AI | A provider-independent connection registry with native adapters and a compatible-endpoint adapter; owners can switch providers without changing product workflows. ChatGPT plan usage remains subject to deployment eligibility. |
| Real data | Private API authorization and private storage protect every imported record and generated owner artifact. |
| Automation | Explicit owner rules authorize actions; an AI model cannot grant itself permission. |
| Sharing the project | Publish source and a setup guide with fictional fixtures and configuration examples. Never include owner data or credentials. |

“Publicly available” means visitors can use the document tools and explore all workflows. Sending real email, submitting applications, viewing the owner's history, and changing owner settings require owner authorization. Sample buttons simulate these actions and clearly identify the simulation.

## 3. Pages and user experience

Use the current React/Vite, Untitled UI, blue palette, typography, and shared spacing conventions. Provide one responsive Studio navigation, a clear page title, and a visible “Sample workspace” or “Private workspace” indicator.

| Route under `/application-studio/` | Contents |
| --- | --- |
| Overview | Interviews, upcoming actions, application funnel, recent documents, connection health. |
| Documents | Resume and cover-letter builder, job import, evidence selection, preview, revision history, export. |
| Jobs | Saved and discovered jobs, eligibility checks, exclusions, fit explanation, application preparation. |
| Inbox | Email categories, proposed replies, automation results, interview requests, review queue. |
| Applications | Company, role, source, status, submitted documents, correspondence, follow-up dates. |
| Profile | Career facts, evidence, skills, contact details, preferences, compensation policies. |
| Rules | Email handling, exclusions, follow-ups, sensitive-field release policies, automation schedules. |
| Connections | AI and Google setup, permissions, health, disconnect, usage limits. |
| Activity | Audit history, failures, paused jobs, export and recovery tools. |

Connect sample records across pages so an employer can follow a complete example: find a job, check fit, create documents, simulate an application, classify a reply, and review an interview request. Use fictional companies and identities for these workflows.

Long descriptions and document bodies stay left aligned. Forms have accessible labels, keyboard controls, clear errors, and usable loading states. Phone layouts use stacked panels and cards instead of wide tables; document preview is optional alongside the editor. Avoid adding dense Studio controls to the portfolio header.

## 4. AI connections, including a paid ChatGPT plan

### Supported options to investigate

1. **Official ChatGPT plan connection:** OpenAI documents optional ChatGPT plan usage through Sign in with ChatGPT for eligible open-source and locally hosted applications. This requests specific inference permission; ordinary identity sign-in alone is insufficient. It does not import ChatGPT conversations or memories. Hosted website access has separate availability requirements. See [ChatGPT plan usage](https://developers.openai.com/siwc/token-sharing-open-source) and [website sign-in availability](https://developers.openai.com/siwc/website).
2. **Owner API connection:** A server-held API key for an owner-selected provider. Show its separate billing, limits, and consent clearly. Never silently switch a subscription connection to a paid API key.
3. **Public free-tier AI:** A separate Workers AI connection restricted to eligible models, input size, output size, request frequency, concurrency, and daily allocation. The free allowance is finite; some models require billing. See [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
4. **Manual AI handoff:** Export a prompt containing selected career facts and the job description for the owner to use in ChatGPT, then import the response for validation. This keeps document preparation usable if a direct connection is unavailable.

Before committing to ChatGPT integration, run a small eligibility and authentication investigation: supported hosting, registration, granted inference scopes, model access, refresh behavior, limits, and suitability for scheduled work. If the Cloudflare deployment is not eligible, evaluate an optional supported local/self-hosted companion. A local companion only operates while its host is available. Do not reuse browser cookies, scrape the ChatGPT interface, or assume a subscription is a general API key.

The current plan-usage interface has request constraints, including streaming and `store: false`, and excludes several hosted tools. Studio must maintain its own history and Google integrations. Verify constraints again during implementation against [preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations).

### Provider contract

#### Broad provider support

Design for broad support rather than claiming every provider is already integrated. Planned adapter families:

| Family | Intended coverage | Validation required before enabling |
| --- | --- | --- |
| OpenAI | Responses API; official ChatGPT plan authorization where eligible | Granted permission, streaming, output schema, usage, session renewal |
| Anthropic | Claude API | Native Messages format, authentication, tool/output support |
| Google | Gemini API; Vertex AI as a later enterprise adapter | Native formats, account authentication, model availability, free-tier data policy |
| Cloudflare | Workers AI | Eligible models, binding/API setup, quota and usage accounting |
| Compatible endpoints | Groq, DeepSeek, Mistral-compatible services, Together, Fireworks and other compatible deployments | Compatibility test per endpoint/model; no assumption that identical URLs mean identical features |
| Multi-provider gateway | OpenRouter and other owner-configured gateways | Allowed providers/models, privacy policy, routing and billing controls |
| Enterprise clouds | Azure OpenAI and Amazon Bedrock in a later phase | Their native identity, endpoint, region, and request requirements |
| Self-hosted services | Owner-provided compatible endpoints | Secure reachable endpoint and capability tests; no local model installation is required by this plan |

This table is a roadmap, not a claim of working connections. Implement the shared contract first, then test each enabled adapter. A provider without supported authentication or a usable text-generation interface remains unavailable until an adapter is added.

Every registry entry records authentication type, endpoint, allowed models, supported capabilities, data policy, owner/public eligibility, quotas, timeout, and health. Fetch model catalogs where supported but require an explicit model allowlist. Normalize streaming, cancellation, structured output, usage, errors, and retry hints; validate JSON at the application layer when native schema output is unavailable. Public requests cannot supply arbitrary endpoints or credential references. Owner-configured URLs require outbound-network validation to prevent internal-network access.

#### Automatic public AI

Visitors choose “Auto — free AI” by default. A provider picker can show currently available approved options. The backend chooses a healthy provider that supports the task, has a reserved allowance, and satisfies the visitor's data-consent policy. Use a bounded ordered fallback, respect rate-limit reset times, and record which provider handled the request.

Initial free-tier candidates are Workers AI, Gemini, Groq, and OpenRouter free models. Their current docs describe limited free access, not universal free access to every model: [Gemini billing](https://ai.google.dev/gemini-api/docs/billing), [Groq limits](https://console.groq.com/docs/rate-limits), [OpenRouter integration](https://openrouter.ai/docs/quickstart), and [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/). Each connection still needs installation-owner setup, current terms/data-policy review, and a successful test. No account has been created or connected by this plan.

Use dedicated demo credentials/projects and strict zero-paid-fallback policy. Do not rotate accounts to evade a provider's limits. A visitor's private content may only be sent to a fallback provider covered by their consent; otherwise ask them to select another option or use templates. Separate rate limits by anonymous session plus shared installation budget, with abuse controls and conservative concurrency accounting. Free inference does not guarantee free hosting, storage, or unlimited availability.

Owners can set provider/model defaults per task, choose a fallback chain, disconnect a provider, and keep existing document/history records after a switch. Private fallback requires owner-approved data and spending policies; never borrow the public connection or silently send private data to a new provider.

#### Verified ChatGPT website availability requirements

Official documentation checked October 1, 2026:

1. Website sign-in is offered to selected commercial partners through a limited trial. Request access via the interest form linked from [Request a client ID](https://developers.openai.com/siwc/request-client-id), or contact an OpenAI representative. No published self-service guarantee, acceptance criteria, or approval timeline was found.
2. Obtain a registered OpenAI client ID, exact callback URLs for each environment, and the assigned token-endpoint authentication method. A confidential client additionally receives a server-held secret.
3. Implement Authorization Code with PKCE and OpenID Connect, expiring one-use state and nonce, discovery/JWKS token verification, explicit account linking, and secure application sessions. See [website implementation requirements](https://developers.openai.com/siwc/website).
4. Website identity sign-in is separate from permission to consume ChatGPT plan inference. Remotely hosted plan usage needs the relevant OpenAI approval; publishing the source alone does not establish eligibility. The open-source/local flow has its own registration and permission rules.
5. Treat the ChatGPT connection as unavailable until approval and an end-to-end inference test succeed. A paid ChatGPT subscription by itself does not establish that this hosted site is approved. Keep MFA for Studio separate from provider authorization.

Do not submit an interest form or enroll a provider during planning without the owner's request. Use owner API access or manual handoff if hosted plan integration is unavailable; separately billed access requires an explicit spending policy.

Keep provider adapters behind a small interface: generate structured document content, classify a message, draft a reply, report usage, and report recoverable errors. Each task records provider/model, prompt version, career revision, and output revision. Provider failure preserves the user's draft and shows a retry or manual option.

Public AI has no access to the private provider adapter, private files, Google tokens, or owner preferences. Enforce the budget server-side with atomic reservations and conservative accounting for concurrent requests. Do not promise unlimited free AI or continuous AI availability. The pages and template tools should remain available during provider outages.

## 5. Owner login and protection

Use Cloudflare Access for owner authentication and an exact identity allowlist, with identity-provider MFA or Access independent MFA. Prefer a security key/biometric method with a recovery method. Email one-time codes alone are not the requested two-factor protection. See [Cloudflare independent MFA](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/independent-mfa/).

- Leave public Studio pages accessible. Protect an owner session entry point and every private API route, and validate authentication within the Worker as well as at the edge.
- Separate public and private endpoints and bindings. A mode switch, URL parameter, hidden button, or local-storage flag cannot authorize owner access.
- Validate token issuer, audience, signature, expiry, and owner identity. Protect mutations against cross-site requests and keep sessions in secure HTTP-only cookies where applicable.
- Close alternative routes that bypass protection, including unintended `workers.dev` endpoints. Scheduled tasks use restricted service credentials and the same action policy checks.
- Keep private data out of static HTML, JavaScript bundles, public R2 objects, search indexes, service-worker caches, analytics, and error logs. Private responses use appropriate no-store headers.
- Clear private client state on logout. Test that sample mode cannot retain or expose private records after a session ends.
- Reauthenticate for changing connections, exporting sensitive material, and changing release policies. Document account recovery and connection revocation.
- Google authorization and AI authorization are separate from the owner's Studio login; neither automatically grants Studio administrative access.

## 6. Career profile and preferences

Use validated career facts as the foundation, linked to evidence and provenance. Preserve actual employment titles and dates; distinguish total engineering experience from FDE-specific employment. Import the existing resume material and cover-letter template through an explicit reviewed mapping, not an indiscriminate upload of the private career repository.

Profile fields:

- Employment, education, skills, individual contributions, verified outcomes, approved public project descriptions.
- Contact details and approved signature; location and availability.
- Target roles, industries, seniority, technologies, preferred and excluded companies.
- Remote-only, hybrid, office, travel, location, time zone, and employment type preferences.
- Compensation minimums and quoted targets by W-2, contract, full-time, and part-time arrangement.
- Work authorization, sponsorship, and other application answers only where explicitly supplied.

Keep minimum acceptable pay separate from the rate quoted to recruiters. Show conversion assumptions: hourly rate × hours per week × paid weeks per year. Do not assume all part-time, contract, or salaried offers are equivalent.

The owner can edit preferences in the private UI. Git may hold public profile content, schemas, templates, and non-sensitive default examples. Credentials, current job-search exclusions, sensitive fields, correspondence, and private preferences remain outside public source control. Version profile edits and identify which revision produced each document.

## 7. Resume and cover-letter builder

Workflow: select profile → paste/import job details → inspect extracted requirements → choose evidence → generate or use a template → edit → validate → preview → export.

- Accept a job URL, pasted description, company, role, recipient, and optional notes. Always provide paste/manual fallback when the posting cannot be imported.
- With no job information, generate a strong general resume and adaptable letter for the owner's selected role family. Do not claim one letter is tailored to every possible job.
- Start from `positioning/cover-letter-template.md` and existing career facts; rewrite for the job using only supported claims.
- Separate a candidate's supplied facts from a job's requested qualifications. Flag missing qualifications rather than inventing them.
- Produce structured content with evidence references, then render through controlled templates. Treat model output as untrusted input.
- Offer concise and detailed resumes, a letter, recruiter reply, and interview preparation notes. Preserve centered name/tagline and left-aligned narrative text in resume formats.
- Show changes, unsupported claims, missing inputs, and a final readiness checklist. Do not add unverified metrics, certifications, employers, or responsibilities.
- Export PDF, DOCX, Markdown, and plain text; preserve selectable text and usable links. Record the exact artifact sent with an application.
- Keep real identity documents and last-four SSN out of prompts and generated resumes/letters.

The existing Python resume generator is not automatically executable inside a Cloudflare Worker. Choose and validate a compatible export implementation or separate restricted rendering service. Verify pagination, fonts, center alignment, and content parity across formats before promising exports.

## 8. Job discovery and application assistance

Start with employer career pages, supported public ATS feeds/APIs, and job-alert emails. Store source URL, external ID, employer, description snapshot, retrieval time, and eligibility evidence. Add connectors incrementally instead of promising universal job-board automation.

- Match FDE and related customer-facing engineering roles against actual experience; explain the match and gaps.
- Check the description for U.S. eligibility, remote conditions, state restrictions, travel, compensation, and seniority. Unknown eligibility enters review.
- Apply exclusion rules before saving outreach targets and again immediately before any send/submission.
- Deduplicate by source job ID and normalized company/role/location. Recheck expired postings before acting.
- Prepare tailored artifacts, suggested answers, and an application checklist.
- Enable automatic submission only for supported, permitted workflows with known answers and an owner-approved rule. CAPTCHA, MFA, unfamiliar legal attestations, and unknown required facts pause for owner action.
- Record “submitted” only after the destination confirms success; ambiguous network outcomes require reconciliation before retrying.
- Avoid bulk unsolicited outreach. Prefer replies to legitimate recruiter conversations and targeted applications to verified openings.

Public job-read access does not imply permission to submit: for example, Greenhouse application submission requires credentials associated with the employer's board. See [Greenhouse Job Board API](https://docs.greenhouse.io/job-board.html). A Cloudflare Worker also cannot simply inherit a signed-in browser session on the owner's computer.

## 9. Email rules and interview handling

Begin with classification and draft generation, then enable narrowly defined automatic rules after reviewing their results. AI proposes classifications and wording; deterministic policy checks authorize actions. Email bodies and attachments cannot override those policies.

| Email category | Proposed handling |
| --- | --- |
| Actual interview request or scheduling change | Preserve, mark high priority, link to the application, surface prominently for owner review. |
| Verified recruiter asking for resume | Reply automatically with an approved current resume when recipient, employer, and rule checks pass. |
| Rate, availability, remote preference questions | Use current owner-approved answers; escalate ambiguous arrangements or missing facts. |
| New role description | Extract, classify remote/hybrid/office, check exclusions, create a job record and proposed response. |
| Application receipt | Link to the application and update acknowledged status; no reply needed. |
| Rejection or position closed | Update status, stop follow-ups, archive according to the owner's policy. |
| Assessment or assignment | Flag deadline and requirements; preserve for review, without completing attestations automatically. |
| Offer, contract, background check, identity request | Route to the corresponding controlled workflow; highlight deadlines and sensitive content. |
| Current employer, excluded organization, suspicious sender | Block outbound actions and put the conversation into a protected review category. |
| Newsletter, mailing list, bounce, automated response | Classify; never create an auto-reply loop. |
| Personal or uncertain message | Leave intact and put uncertain job-related cases into review. |

Use Gmail labels as folders, with a consistent hierarchy:

- `Jobs/Stage/Discovered`, `Applied`, `Recruiter`, `Interview`, `Offer`, `Rejected`, `Closed`.
- `Jobs/Action/Review`, `Reply-ready`, `Waiting`, `Follow-up`, `Deadline`.
- `Jobs/Work-model/Remote`, `Hybrid`, `Office`, `Unknown`.
- `Jobs/Request/Resume`, `Rate`, `Assessment`, `Identity`.
- `Jobs/Protection/Excluded`, `Unverified`, `Sensitive` and `Jobs/System/Error`.

Keep interview requests in a dedicated dashboard queue even if classification confidence is low. Show the original message, time zone, suggested availability, scheduling link, and deadline. Calendar holds are private and have no external attendees unless the owner authorizes invitations. Automatic interview acceptance requires a separately defined availability rule; otherwise prepare a reply for review.

Check To, CC, BCC, Reply-To, thread participants, and attachments before every outbound action. Use sender authentication signals as evidence, not proof of business identity. Suppress duplicate sends, mailing-list replies, replies to the owner's own messages, and repeated follow-ups. Stop follow-ups after an interview, rejection, opt-out, offer, or new incoming response.

**Deletion decision:** the earlier request for permanent deletion of all non-job email should remain an unresolved high-impact preference. Recommended default is preserve personal/unknown mail and archive or move recognized low-value messages to Trash under explicit rules. Do not activate broad irreversible deletion during the first release.

## 10. Sensitive ID and last-four SSN requests

Owner-requested capability: automatically provide approved identity information to appropriate recruiting/onboarding contacts without requiring confirmation for every repeat request.

Recommended implementation: an encrypted private vault and explicit release policies defined by the owner in advance. A policy names the verified recipient/organization, permitted purpose, permitted field or file, destination, expiry, and frequency limit. New or unmatched requests enter review. Hiding information in the UI does not protect information sent to a recipient; last-four SSN remains sensitive personal information.

- Never place these values in public examples, public Git, Sheets, prompts, analytics, or routine logs.
- Use placeholders during AI drafting; retrieve and insert an allowed value only after server-side policy checks pass.
- Prefer a verified onboarding portal where available. For ID copies, support redaction and purpose-specific watermarking when accepted by the recipient.
- Check all recipients and employer exclusions again immediately before release. Never automatically forward original identity attachments to new participants.
- Audit the recipient, purpose, policy, time, and artifact reference without recording the secret itself.
- Provide immediate revocation, rotation/deletion, and a global pause control. Encrypt vault material with keys separate from the stored records.

This capability comes after recipient verification and vault tests. Approval of this plan does not connect a mailbox, upload identity documents, or send them.

## 11. Employer exclusion protection

Maintain a private denylist for the current employer and any organizations the owner excludes: company names, domains, parent companies, subsidiaries, clients, recruiting agencies, and known aliases.

Apply it to job targets, recipient addresses, disclosed end clients, calendar invitations, automated replies, follow-ups, and application submission. A recruiter who will not identify the end client goes to review. Blocked actions must appear in the dashboard with a reason.

Use a final check against the latest exclusions, even for previously approved queued work. Do not reveal the denylist in public mode. This reduces accidental disclosure but cannot prevent a recipient from forwarding information outside the system.

## 12. Google integrations and tracking

Use owner-authorized Google OAuth connections, with separate permissions for each feature and encrypted refresh tokens. Explain scopes, account identity, revocation, consent-screen configuration, and any production verification requirements. Gmail read/modify scopes are restricted; their requirements need review before launch. See [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).

| Service | Purpose |
| --- | --- |
| Gmail | Classify threads, apply labels, draft/send authorized replies, attach approved documents. |
| Drive | Private Studio folder for generated resumes, letters, and interview preparation. |
| Docs | Editable letters and preparation documents using controlled templates. |
| Sheets | Owner-visible application tracker, status summaries, and outcome reports. |
| Calendar | Private interview holds, reminders, availability checks; invitations under explicit rules. |

Use D1 as the operational record and Sheets as a readable mirror initially. If editable Sheet synchronization is added, define revision/conflict handling before enabling it. No sensitive vault values in the tracker. Google file permissions stay private unless sharing is explicitly authorized.

Start mailbox synchronization with scheduled incremental checks. Add Gmail push via Google Cloud Pub/Sub when justified, with webhook verification and watch renewal; this requires Google infrastructure in addition to Cloudflare. See [Gmail push notifications](https://developers.google.com/workspace/gmail/api/guides/push). Limit initial historical import and show the date range before syncing.

Self-hosters configure their own Google OAuth project, redirects, scopes, and storage. Project integration does not require reinstalling Google Workspace MCP servers in Codex.

## 13. Cloudflare architecture

Keep the portfolio's static assets and add a separately bounded Studio backend. Use separate public-demo and private-owner Workers/bindings where practical to reduce accidental access to owner credentials.

```text
Portfolio + public Studio pages
  ├─ Sample fixtures and local document editing/export
  ├─ Public API → capped demo AI, no owner bindings
  └─ Owner login → Cloudflare Access + MFA
                    └─ Private API → policy checks
                                      ├─ Career/application data: D1
                                      ├─ Private artifacts: R2
                                      ├─ Encrypted credential/vault records
                                      ├─ Owner AI adapter
                                      └─ Google adapters

Scheduled tasks → queues → policy checks → authorized actions → audit records
```

- Use Workers for API/authentication boundaries, D1 for structured records, private R2 for files, and secrets mechanisms for encryption keys/provider credentials.
- Use queues for retries and background work; add Workflows only where a long multi-step operation benefits from durable orchestration.
- Reserve an action once using a durable identifier before sending. Reconcile uncertain results; retries must not duplicate an email or application.
- Keep public and private storage, cache policies, logs, and credentials separate. No public bucket for private exports.
- Job URL imports need permitted schemes, redirect checks, internal-network blocking, size/time limits, and safe parsing. Imported HTML and attachments are untrusted.
- AI reads selected content only. It cannot browse internal addresses, change policy, reveal credentials, or execute instructions embedded in a job/email.
- Validate structured output; enforce action permissions outside the model. Use bounded concurrency and retry backoff.
- Configure automation hours, limits, circuit breakers, dead-letter handling, and a global pause. Authentication/provider failures pause work honestly.

## 14. Data, history, and operations

Core records: career revisions, evidence, preferences, connections, jobs, applications, document revisions, artifact references, email-thread references, interview tasks, policies, automation runs, audit events, and usage reservations.

Keep raw email and attachments only when necessary. Decide retention durations before import; provide export and deletion controls. Redact logs and disable full prompt/body logging by default. Back up private records securely and test restoration. Deleting local records and revoking external connections are separate operations and should be presented clearly.

Dashboard priorities:

1. Interviews and deadlines requiring attention.
2. Replies and applications awaiting review.
3. Recent submissions and follow-ups.
4. Blocked/excluded actions and automation failures.
5. AI allowance, provider availability, Google token health, and last successful sync.
6. Application-to-response and interview outcomes, with unknown states preserved.

## 15. Delivery phases and acceptance criteria

### Phase 0: decisions and technical investigation

- [ ] Verify ChatGPT plan eligibility for the intended deployment and choose a supported fallback.
- [ ] Choose public demo limits, owner login/MFA method, and recovery process.
- [ ] Confirm Google OAuth requirements and export rendering approach.
- [ ] Define owner preferences, exclusions, retention, and exact automation permissions.

### Phase 1: public Studio and document tools

- [ ] Shared pages with fictional linked sample data; no real connections or owner payloads.
- [ ] Profile input, job paste, deterministic resume/letter generation, editing and export.
- [ ] Capped public AI, clear exhausted/offline states, and template fallback.
- [ ] Provider registry, automatic free-provider routing, consent-aware fallback, and tested adapter capability matrix.
- [ ] Responsive and keyboard-accessible UI matching the portfolio.

### Phase 2: protected owner workspace

- [ ] MFA, private API authorization, storage isolation, session/logout tests.
- [ ] Reviewed career import, revision history, private document generation and artifacts.
- [ ] Owner AI connection, budgets, usage reporting, and manual handoff option.
- [ ] Anonymous and sample-mode attempts cannot access any owner record or provider.

### Phase 3: jobs, Google tracking, and inbox assistance

- [ ] Supported job sources, description-level eligibility, exclusions, deduplication.
- [ ] Gmail labeling and drafts, interview queue, Drive/Docs/Sheets exports, private Calendar holds.
- [ ] Audit records and recovery after failed sync or revoked connection.
- [ ] Fictional sample equivalents for every new interface.

### Phase 4: controlled automation

- [ ] Automatic low-risk replies under approved rules; verified submission flows only.
- [ ] Duplicate-send prevention, uncertain-result reconciliation, current denylist checks.
- [ ] Follow-up stopping conditions, deadlines, pause control, failure notifications.
- [ ] Sensitive vault/release rules only after dedicated security and recipient tests.

### Phase 5: self-hosting and project evidence

- [ ] Setup guide for independent AI, Google, MFA, and storage connections.
- [ ] Fictional fixtures, configuration examples, backup/recovery guide, and operational limits.
- [ ] Public project case study with implemented features and measured evidence only.
- [ ] Separate “planned,” “implemented,” and “verified” capabilities in the portfolio.

Required validation includes unauthorized API/file access, alternate-host bypass, logout/cache leakage, malicious email/job instructions, company alias exclusions, unknown end clients, AI quota concurrency, unsupported claims, duplicate queue deliveries, interview misclassification, OAuth revocation, and sensitive-value redaction. Test phone/desktop workflows and all export formats when browser/document rendering is authorized. Builds alone do not prove these workflows work.

## 16. Open decisions to edit

| ID | Decision | Recommended starting point |
| --- | --- | --- |
| D01 | Initial owner AI connection | Verify official ChatGPT eligibility; retain manual handoff and optional separately billed API. |
| D02 | Public AI allowance | Small explicit shared quota, no paid fallback; keep templates always usable. |
| D03 | Identity and MFA | Single owner allowlist, strong MFA, tested recovery. |
| D04 | Email automatic actions | Start labels/drafts; enable specific approved reply rules after observation. |
| D05 | ID/last-four release | Automatic only under preapproved recipient/purpose policies; unmatched requests reviewed. |
| D06 | Non-job deletion | Preserve unknown/personal messages; reversible archive/Trash first. |
| D07 | Applications | Supported sources/flows only; no universal auto-apply promise. |
| D08 | Private data retention | Decide by category before importing Gmail or documents. |
| D09 | Compensation | Owner-supplied targets and minimums with explicit conversion assumptions. |
| D10 | Google tracking edits | D1 authoritative, Sheets mirror initially. |

## 17. How to maintain this plan

Edit this file as the canonical website plan. Record a date, changed decisions, and reasons in the change log. Resolve open decisions before dependent implementation. Keep private values in private settings, not in this document. Update project instructions when actual architecture or validation commands change.

### Change log

- 2026-10-01: Removed the Jobs & applications page, navigation entry, fictional job records, and related overview copy at the owner's request. The current preview has six pages. Future job-search ideas in this plan remain proposals, not implemented features.

- 2026-10-01: First development preview implemented: seven Studio pages, temporary fictional workspace, editable template resume/cover-letter generation and text download, optional disabled Cloudflare public AI adapter with an atomic shared quota, and connection setup guide. Private owner authentication, Google OAuth, history, additional providers and real outbound automation remain unimplemented. This update does not release Studio to production.

- 2026-10-01: Initial full plan. Incorporates shared public/private pages, owner-provided AI, conditional ChatGPT plan integration, MFA, Google workflows, job automation, employer exclusions, and controlled sensitive-information handling. Documentation only; no deployment or account actions.
- 2026-10-01: Expanded broad provider adapters, automatic capped public AI routing, verified ChatGPT website registration requirements, and production/development branch separation. Studio remains planned for a later release.
