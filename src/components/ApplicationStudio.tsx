import { useEffect, useState } from "react";
import { ArrowRight, Download01, File06 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Tag, TagGroup, TagList } from "@/components/base/tags/tags";
import {
  createDraft,
  formatExperience,
  sampleExperience,
  type ExperienceEntry,
  sampleProfile,
  studioSections,
} from "@/lib/studio";
const root = `${import.meta.env.BASE_URL}application-studio/`;
const initial = {
  ...sampleProfile,
  company: "",
  role: "Forward Deployed Engineer",
  job: "",
  kind: "cover-letter",
  tone: "professional",
  focus: "balanced",
};
function TextArea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={12000}
      />
    </label>
  );
}
function Documents() {
  const [form, setForm] = useState(initial);
  const [entries, setEntries] = useState<ExperienceEntry[]>(sampleExperience);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const ai = usePublicAIStatus();
  const update = (key: keyof typeof initial, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const updateEntry = (
    id: string,
    key: keyof Omit<ExperienceEntry, "id" | "kind">,
    value: string,
  ) =>
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, [key]: value } : entry,
      ),
    );
  function addEntry(kind: ExperienceEntry["kind"]) {
    setEntries((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        kind,
        title: "",
        organization: "",
        start: "",
        end: "",
        details: "",
      },
    ]);
  }
  const documentInput = () => ({
    ...form,
    experience: formatExperience(entries, form.experience),
  });
  async function generateAI() {
    setBusy(true);
    setStatus(form.job.trim() ? "Tailoring your document to this job…" : "Preparing a draft from your experience…");
    try {
      const response = await fetch(
        `${import.meta.env.BASE_URL}api/studio/public/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...documentInput(), consent }),
          signal: AbortSignal.timeout(45000),
        },
      );
      if (
        !(response.headers.get("content-type") ?? "").includes(
          "application/json",
        )
      )
        throw Error(
          "AI is not connected on this preview. Use Create draft to work without AI.",
        );
      const result: { text?: string; error?: string } = await response.json();
      if (!response.ok || typeof result.text !== "string" || !result.text.trim())
        throw Error(result.error || "The AI service is unavailable.");
      setDraft(result.text);
      setStatus("AI draft ready. Check every claim before submitting.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "AI generation failed. Your inputs are still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([draft], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${form.kind}-draft.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="studio-split">
      <section className="studio-card studio-stack">
        <h2>Start with your experience.</h2>
        <p>
          Use the sample or replace it with your own facts. Inputs stay in this
          page unless you choose AI. Nothing is saved after you leave.
        </p>
        <label className="studio-field">
          Document
          <select
            value={form.kind}
            onChange={(e) => update("kind", e.target.value)}
          >
            <option value="cover-letter">Cover letter</option>
            <option value="resume">Resume</option>
          </select>
        </label>
        <Input
          label="Name"
          value={form.name}
          onChange={(v) => update("name", v)}
        />
        <Input
          label="Professional headline"
          value={form.headline}
          onChange={(v) => update("headline", v)}
        />
        <div className="studio-two">
          <Input
            label="Target role"
            value={form.role}
            onChange={(v) => update("role", v)}
          />
          <Input
            label="Company (optional)"
            value={form.company}
            onChange={(v) => update("company", v)}
          />
        </div>
        <section
          className="studio-stack"
          aria-labelledby="experience-editor-title"
        >
          <div className="studio-row">
            <h3 id="experience-editor-title">Experience and skills</h3>
            <Badge color="gray">{entries.length} entries</Badge>
          </div>
          <p>
            Add your jobs and projects separately. Include the work you did and
            the skills you used.
          </p>
          {entries.map((entry, index) => (
            <fieldset
              className="studio-experience-entry studio-stack"
              key={entry.id}
            >
              <legend>
                {entry.kind === "job" ? "Job" : "Project"} {index + 1}
              </legend>
              <div className="studio-row">
                <Badge color="brand">
                  {entry.kind === "job" ? "Work experience" : "Project"}
                </Badge>
                <Button
                  color="secondary"
                  size="sm"
                  aria-label={`Remove ${entry.kind} ${index + 1}`}
                  onPress={() =>
                    setEntries((current) =>
                      current.filter((item) => item.id !== entry.id),
                    )
                  }
                >
                  Remove
                </Button>
              </div>
              <Input
                label={entry.kind === "job" ? "Job title" : "Project name"}
                value={entry.title}
                onChange={(value) => updateEntry(entry.id, "title", value)}
              />
              <Input
                label={
                  entry.kind === "job" ? "Company" : "Organization (optional)"
                }
                value={entry.organization}
                onChange={(value) =>
                  updateEntry(entry.id, "organization", value)
                }
              />
              <div className="studio-two">
                <Input
                  label="Start date (optional)"
                  placeholder="Sep 2022"
                  value={entry.start}
                  onChange={(value) => updateEntry(entry.id, "start", value)}
                />
                <Input
                  label="End date (optional)"
                  placeholder="Present"
                  value={entry.end}
                  onChange={(value) => updateEntry(entry.id, "end", value)}
                />
              </div>
              <TextArea
                label={
                  entry.kind === "job"
                    ? "Responsibilities and achievements"
                    : "Project details and results"
                }
                value={entry.details}
                onChange={(value) => updateEntry(entry.id, "details", value)}
                rows={4}
              />
            </fieldset>
          ))}
          {entries.length === 0 && (
            <p className="studio-note">
              Add a job or project to start building your experience.
            </p>
          )}
          <div className="studio-actions">
            <Button
              color="secondary"
              isDisabled={entries.length >= 12}
              onPress={() => addEntry("job")}
            >
              Add job
            </Button>
            <Button
              color="secondary"
              isDisabled={entries.length >= 12}
              onPress={() => addEntry("project")}
            >
              Add project
            </Button>
          </div>
          {entries.length >= 12 && (
            <p>You can include up to 12 jobs and projects in this draft.</p>
          )}
          <TextArea
            label="Skills"
            value={form.experience}
            onChange={(value) => update("experience", value)}
            rows={3}
          />
        </section>
        <TextArea
          label="Job description (optional)"
          value={form.job}
          onChange={(v) => update("job", v)}
          rows={4}
        />
        <p className="studio-hint">Paste the job requirements to tailor the wording. Leave this blank for a general application.</p>
        <section className="studio-stack" aria-labelledby="ai-writing-title">
          <div className="studio-row">
            <h3 id="ai-writing-title">AI writing assistant</h3>
            <Badge color="gray">{ai === "enabled" ? "Available" : ai === "checking" ? "Checking" : ai === "disabled" ? "Not connected" : "Status unavailable"}</Badge>
          </div>
          <div className="studio-two">
            <label className="studio-field">Tone
              <select value={form.tone} onChange={(e) => update("tone", e.target.value)}>
                <option value="professional">Professional</option>
                <option value="conversational">Warm and conversational</option>
              </select>
            </label>
            <label className="studio-field">Emphasis
              <select value={form.focus} onChange={(e) => update("focus", e.target.value)}>
                <option value="balanced">Balanced</option>
                <option value="customer">Customer delivery / FDE</option>
                <option value="technical">Technical implementation</option>
              </select>
            </label>
          </div>
          <p>AI can improve wording and highlight relevant experience. Review the draft for accuracy before applying.</p>
          <label className="studio-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I agree to send these details to AI. I have removed confidential information.
          </label>
          <Button isDisabled={!consent || busy || ai !== "enabled" || !documentInput().experience.trim()} isLoading={busy} onPress={generateAI}>
            {busy ? "Writing your draft…" : form.job.trim() ? "Tailor draft with AI" : "Write draft with AI"}
          </Button>
          {ai !== "enabled" && <p className="studio-hint">{ai === "checking" ? "Checking AI availability…" : "AI is unavailable in this preview. You can still create and edit a template below."}</p>}
        </section>
        <div className="studio-actions">
          <Button
            color="secondary"
            isDisabled={busy || !documentInput().experience.trim()}
            onPress={() => {
              setDraft(createDraft(documentInput()));
              setStatus(
                "Template draft ready. This uses your facts directly; AI can tailor it to a job when connected.",
              );
            }}
            iconLeading={File06}
          >
            Create template
          </Button>
          <Button
            color="secondary"
            isDisabled={busy}
            onPress={() => {
              setConsent(false);
              setForm(initial);
              setEntries(sampleExperience);
              setDraft("");
              setStatus("Sample restored.");
            }}
          >
            Reset sample
          </Button>
        </div>
      </section>
      <section className="studio-card studio-stack">
        <h2>Review your draft.</h2>
        <p>
          Check accuracy, add missing details, and make the wording your own.
          Template generation works without any connection.
        </p>
        <TextArea
          label="Editable document"
          value={draft}
          onChange={setDraft}
          rows={24}
        />
        <div className="studio-actions">
          <Button
            color="secondary"
            iconLeading={Download01}
            isDisabled={!draft}
            onPress={download}
          >
            Download text
          </Button>
          <Button
            color="secondary"
            isDisabled={!draft}
            onPress={() => {
              setDraft("");
              setStatus("Draft cleared.");
            }}
          >
            Clear draft
          </Button>
        </div>
        <p className="studio-status" role="status">
          {status || "Your draft will appear here."}
        </p>
      </section>
    </div>
  );
}
function Inbox() {
  const [selected, setSelected] = useState("Interview request");
  const [draft, setDraft] = useState("");
  return (
    <div className="studio-split">
      <section className="studio-card studio-stack">
        <h2>Priority inbox</h2>
        <p>Fictional messages show how review and protection will work.</p>
        {[
          "Interview request",
          "Remote role opportunity",
          "Identity information request",
        ].map((s) => (
          <Button
            key={s}
            color={selected === s ? "primary" : "secondary"}
            onPress={() => {
              setSelected(s);
              setDraft("");
            }}
          >
            {s}
          </Button>
        ))}
      </section>
      <section className="studio-card studio-stack">
        <Badge color="brand">Sample · Review needed</Badge>
        <h2>{selected}</h2>
        <p>
          {selected === "Interview request"
            ? "Northstar Labs would like to arrange an interview. Proposed time: Tuesday, 2 PM Eastern. Review the time before replying."
            : selected === "Identity information request"
              ? "This message requests identity information. A private recipient and purpose check is required. Sensitive details are never part of public samples or AI prompts."
              : "A recruiter shared a remote engineering role. Review the job description, compensation, and end client before continuing."}
        </p>
        <Button
          isDisabled={
            selected === "Identity information request"
          }
          onPress={() =>
            setDraft(
              "Thank you for reaching out. I would welcome a conversation about the role. Please share the available times and the full job description. Best, Alex Morgan",
            )
          }
        >
          Prepare sample reply
        </Button>
        <TextArea label="Sample reply" value={draft} onChange={setDraft} />
        <p>
          No email is sent. Interview requests always remain available for owner
          review.
        </p>
      </section>
    </div>
  );
}
function Profile() {
  const [name, setName] = useState(sampleProfile.name);
  const [skills, setSkills] = useState(sampleProfile.experience);
  const [rate, setRate] = useState("45");
  return (
    <section className="studio-card studio-stack studio-reading">
      <h2>Career profile & preferences</h2>
      <p>
        Try editing the fictional profile. Private profile persistence will
        require owner authentication. These fields are temporary.
      </p>
      <Input label="Name" value={name} onChange={setName} />
      <TextArea
        label="Skills and experience"
        value={skills}
        onChange={setSkills}
      />
      <Input
        label="Minimum hourly rate (USD)"
        type="number"
        value={rate}
        onChange={setRate}
      />
      <p>
        Full-time annual equivalent at 2,080 hours:{" "}
        {rate.trim() !== "" &&
        Number.isFinite(Number(rate)) &&
        Number(rate) >= 0
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(Number(rate) * 2080)
          : "Enter a valid rate"}
        .
      </p>
      <Badge color="brand">Preference: fully remote U.S. roles</Badge>
      <p>
        Employer exclusions and private identity information belong in the
        protected owner workspace.
      </p>
    </section>
  );
}
function Rules() {
  const [enabled, setEnabled] = useState(false);
  return (
    <section className="studio-card studio-stack studio-reading">
      <h2>Organize job emails and review replies.</h2>
      <p>
        This is a rule preview. Changing a switch does not activate email
        automation.
      </p>
      <label className="studio-consent">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Preview job-email tagging
      </label>
      <div className="studio-note">
        {enabled
          ? "Sample rule: classify as Job / Interview / Needs review and keep visible in the priority inbox."
          : "Email tagging preview is off."}
      </div>
      <h3>Always-on protections in the design</h3>
      <ul>
        <li>Keep interviews in a dedicated review queue.</li>
        <li>Block excluded employers, aliases, recipients, and end clients.</li>
        <li>
          Draft replies before sending; check recipients and factual claims.
        </li>
        <li>Keep identity documents and SSN fragments out of AI inputs.</li>
        <li>Archive unrelated messages before considering deletion.</li>
        <li>Deduplicate applications and respect provider limits.</li>
      </ul>
      <p>
        Real sending, deletion, identity disclosure, and job submission are not
        implemented in this preview.
      </p>
    </section>
  );
}
function usePublicAIStatus() {
  const [ai, setAI] = useState<"checking" | "enabled" | "disabled" | "unavailable">("checking");
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;
    async function check() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}api/studio/public/status`, { signal: controller.signal });
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw Error("Unavailable");
        const result: { enabled?: unknown } = await response.json();
        if (typeof result.enabled !== "boolean") throw Error("Invalid status");
        if (active) setAI(result.enabled ? "enabled" : "disabled");
      } catch {
        if (active) setAI("unavailable");
      } finally {
        clearTimeout(timeout);
      }
    }
    void check();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  return ai;
}
function Connections() {
  const ai = usePublicAIStatus();
  const aiLabel = { checking: "Public AI · Checking", enabled: "Public AI · Enabled", disabled: "Public AI · Not connected", unavailable: "Public AI · Status unavailable" }[ai];
  return (
    <section className="studio-card studio-stack studio-reading studio-connections" aria-label="Connection status">
      <p>Service availability for this public preview.</p>
      <div role="status" aria-live="polite">
        <TagGroup label="Connection status">
          <TagList className="flex flex-wrap justify-center gap-3">
            <Tag id="templates" available>Document templates · Available</Tag>
            <Tag id="ai" available={ai === "enabled"}>{aiLabel}</Tag>
            <Tag id="email">Email · Demo only</Tag>
            <Tag id="workspace">Google Workspace · Demo only</Tag>
          </TagList>
        </TagGroup>
      </div>
    </section>
  );
}
export function ApplicationStudio({ path }: { path: string }) {
  const key = path.split("/")[2] || "overview";
  const title = studioSections.find((s) => s[0] === key)?.[1] ?? "Overview";
  return (
    <section className="shell studio">
      <header className="studio-heading hero-copy">
        <h1>
          Application <span>Studio</span>
        </h1>
        <p>Your next application, thoughtfully prepared.</p>
      </header>
      <div className="studio-note">
        <strong>Public workspace preview.</strong> Job and email records are
        fictional. AI is optional and requires a separately configured backend.
        Your private accounts are never connected to this demo.
      </div>
      <nav className="studio-nav" aria-label="Application Studio">
        {studioSections.map(([id, label]) => (
          <Button
            key={id}
            href={`${root}${id === "overview" ? "" : `${id}/`}`}
            color={id === key ? "primary" : "secondary"}
            aria-current={id === key ? "page" : undefined}
          >
            {label}
          </Button>
        ))}
      </nav>
      <noscript>
        <p className="studio-note">
          Enable JavaScript to edit documents and interact with samples.
          Live connection status also requires JavaScript.
        </p>
      </noscript>
      <header className="studio-section-heading">
        <h2>{title}</h2>
        {key === "rules" && (
          <p>
            Preview how job emails are labeled, recruiter replies are prepared,
            and interview requests are kept for review.
          </p>
        )}
        <Badge color="brand">Development preview</Badge>
      </header>
      {key === "documents" ? (
        <Documents />
      ) : key === "inbox" ? (
        <Inbox />
      ) : key === "profile" ? (
        <Profile />
      ) : key === "rules" ? (
        <Rules />
      ) : key === "connections" ? (
        <Connections />
      ) : (
        <>
          <div className="studio-metrics">
            {[
              ["2", "Document formats"],
              ["1", "Interview to review"],
              ["0", "Live connections"],
            ].map(([value, label]) => (
              <article className="studio-card" key={label}>
                <p>{label}</p>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <div className="studio-split">
            <section className="studio-card studio-stack">
              <h2>Prepare your application</h2>
              <p>
                Start with verified experience, create a resume or cover letter,
                and review the result before downloading.
              </p>
              <Button href={`${root}documents/`} iconTrailing={ArrowRight}>
                Open document builder
              </Button>
            </section>
            <section className="studio-card studio-stack">
              <h2>Next in your sample workflow</h2>
              <p>
                An interview request is waiting in the priority inbox.
                Review the sample message and prepare a reply.
              </p>
              <div className="studio-actions">
                <Button color="secondary" href={`${root}inbox/`}>
                  Review inbox
                </Button>
                <Button color="secondary" href={`${root}connections/`}>
                  Explore connections
                </Button>
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
