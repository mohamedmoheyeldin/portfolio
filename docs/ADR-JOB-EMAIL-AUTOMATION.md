# ADR: Resumable Job Email Automation

Status: accepted for the feature branch; safety behavior amended August 21, 2026
Date: August 21, 2026

## Context

The portfolio demonstrates and will eventually operate an autonomous job-email system across Cloudflare Workers, Gmail, OpenAI through AI Gateway, private resume artifacts, and optional Google Sheets/Drive data. Scheduled runs can overlap, APIs can fail after performing a side effect, and inbound email is untrusted. The system must keep working without public setup or approval controls while preventing duplicate replies and unsafe attachment behavior.

## Decision

Use D1 as the private workflow authority and advance each source message through explicit durable stages:

```text
Gmail discovery
     |
     v
discovered -> analyzed -> resume-ready -> draft-ready -> sent -> logged -> complete
                    |                  |                   |        |         |
                    +-> needs-review   +-> drafted         |        |         +-> archive entire thread
                         keep INBOX        DRAFT_ONLY      |        |
                                                           |        +-> D1 + optional Sheet mirror
                                                           +-> reconcile stable Message-ID in Sent
```

- Insert a discovery record before calling AI so an AI outage cannot lose the email.
- Apply deterministic current-employer and automated-alert rules before AI.
- Use OpenAI Structured Outputs for bounded classification and reply fields, then apply server-side policy overrides.
- Claim work with a short D1 lease. Retry the same durable stage with capped exponential backoff.
- Give every generated reply a deterministic RFC `Message-ID`; check Gmail Sent before retrying `drafts.send`.
- Record send completion before external logging, and record logging before removing `INBOX` from the whole thread.
- Keep D1 audit events authoritative. An exact, private Google Sheet may receive an idempotent Activity Log mirror keyed by the application item ID.
- Route low-confidence, high-impact, sender-uncertain, sensitive, and exhausted-retry decisions to `needs-review`; apply `AI-Career/Needs-Attention` and retain `INBOX`.
- Default automation to `AUTOMATION_OFF`. Check the effective mode immediately before draft creation and delivery.
- Never send identity, financial, tax, immigration, or government documents—or an automatic deferral for those requests—without private review.

## Assumptions

- Personal-mailbox scale: tens, not millions, of candidate messages per scheduled run.
- One Worker and D1 region are sufficient; per-item leases handle schedule overlap.
- Gmail and Google Sheet access share the enrolled user's OAuth token.
- Canonical career facts remain in `src/content/career.json`; generated outputs cannot update them.
- The public portfolio receives sanitized aggregates only.

## Trade-offs

- D1 orchestration is simpler and cheaper than adding a queue, but polling and leases require careful status transitions.
- Gmail and Sheets do not offer a distributed transaction. Stable IDs and reconciliation provide at-least-once processing with side-effect deduplication rather than exactly-once guarantees.
- A Sheet mirror is easy for the owner to inspect but is not the workflow authority and currently records Activity Log rows rather than maintaining a full relational job tracker.
- Whole-thread archiving clears the inbox recoverably. Automatic Trash was rejected because classification mistakes should not destroy recruiter conversations or sent replies.
- Review state is private and mailbox-native. It requires no public approval control, while keeping uncertain mail visible to the owner.

## Growth triggers

Revisit the design when any of these become true:

- More than one scheduled run regularly exhausts `AUTOMATION_BATCH_SIZE`.
- Rate limits require per-provider queues or concurrency controls.
- A full Job Tracker, Recruiters, Interviews, and duplicate-opportunity model is needed in Sheets; promote those records to normalized D1 tables and treat Sheets as projections.
- Calendar-backed interview scheduling is added.
- Drive attachment policy is implemented; add a private allowlist table, checksums, MIME/size validation, and malware scanning before attachment.
- Operational recovery needs an owner interface; keep it behind Cloudflare Access and separate from the public portfolio.
