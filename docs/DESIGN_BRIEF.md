# Design brief — current direction

## Confirmed

- The website, PDF, and Word resume should feel like one personal brand.
- Typography roles, spacing rhythm, and information hierarchy should remain consistent across media.
- Resume outputs must prioritize readability, editability, searchable text, and ATS-safe reading order.
- Accessibility and performance are product requirements, not finishing steps.
- The website uses an original premium editorial direction: bright content surfaces, deep navy signal visuals, restrained blue-violet gradients, large type, generous whitespace, and rounded product-like panels.
- The MM monogram remains compact and secondary to Mohamed's full name.
- Motion remains subtle and is removed for visitors who prefer reduced motion.
- Page heroes and section-heading blocks use a centered presentation across routes; card titles and long-form case-study content remain left-aligned for reading clarity.
- The fluid typography scale is intentionally restrained so headings support the work instead of overpowering it.

## Still open for iteration

- short versus detailed resume variants.
- final PDF and editable DOCX renderer details;
- future case studies and field-note content;
- whether professional photography should complement the abstract quality-signal visual language.

The design system is intentionally tokenized so these future decisions can evolve without separating the web, PDF, and Word brand presentations.

## Autonomous system-flow pattern

The `/assistant/` case study uses a reusable dark observability surface to make an event-driven process understandable without exposing private data. It presents the system as an operational topology rather than a looping illustration.

- Five sequential stages show Gmail intake, policy/classification, resume generation, delivery, and thread completion; a visible branch shows messages held by safety policy.
- Each stage value is bound to the sanitized Worker snapshot. When that snapshot is unavailable, values render as em dashes and the page explicitly states that no production values are simulated.
- Motion is event-based: a stage highlights only when a refreshed live value changes. There is no ambient packet loop, fake clock, scanning line, or simulated active stage.
- Desktop uses one horizontal topology; mobile converts the same data contract to a readable vertical sequence.
- Green identifies live telemetry, amber identifies the safety branch, and the restrained navy surface matches the portfolio's existing system visuals.
- Public status uses only aggregate counts and system labels. Account setup, credentials, private replies, and owner controls are not part of this presentation pattern.

## Runtime-aware presentation pattern

The site uses `prop-for-that` as a narrowly scoped progressive-enhancement layer. Static HTML and CSS remain complete without JavaScript; live properties add environmental context when available.

- `visibility` drives reveal-once transitions for major cards and proof points. Content remains fully visible when the runtime is unavailable.
- `pointer-local` adds a restrained two-degree depth response to cards and a stronger response to the decorative quality-signal visual. It is limited to fine-pointer devices.
- The home-page quality signal is a decorative system metaphor, not a claim of live production telemetry. Its values are labeled as visual presentation rather than exposed mailbox or delivery data.
- Modern CSS features include typed custom properties, `color-mix()` in OKLCH, `:has()`, container containment, and progressive cross-document view transitions.
- Reduced-motion preferences remove refresh, entrance, and pointer-depth animation while preserving layout, content, contrast, and interaction.

### Surface states

| State | Behavior |
| --- | --- |
| Default | Flat readable surface with tokenized border and shadow |
| Entered | One-time fade, lift, and unblur |
| Hover with fine pointer | Subtle local tilt, pointer-positioned light, stronger border |
| Keyboard focus | Existing high-contrast focus outline remains authoritative |
| Reduced motion | No reveal displacement, orbit, sweep, or tilt |
