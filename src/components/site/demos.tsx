import { createElement, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, RefreshCw01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

/*
 * Two working demonstrations, each a small re-implementation in the page of rules a project documents in the career
 * record. They run on synthetic data in the visitor's browser and say so on their face. Neither is the project's own
 * code; the real implementations and their tests are in the public repositories linked beside them.
 */

const useHydrated = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
};

type Claim = { claimId: string; npi: string; icd10: string; cpt: string; serviceDate: string; receivedDate: string; referralExpires: string; amount: string };

const sampleClaim: Claim = {
  claimId: "SYN-2026-0417",
  npi: "1234567893",
  icd10: "M54.50",
  cpt: "97110",
  serviceDate: "2026-09-14",
  receivedDate: "2026-09-21",
  referralExpires: "2026-12-31",
  amount: "185.00",
};

const fieldLabels: Record<keyof Claim, string> = {
  claimId: "Claim ID",
  npi: "Provider NPI",
  icd10: "Diagnosis (ICD-10)",
  cpt: "Procedure (CPT)",
  serviceDate: "Service date",
  receivedDate: "Received",
  referralExpires: "Referral expires",
  amount: "Billed amount",
};

/** NPI check digit: Luhn over the 80840 health-industry prefix and the first nine digits. */
function npiValid(npi: string) {
  if (!/^\d{10}$/.test(npi)) return false;
  const digits = `80840${npi.slice(0, 9)}`.split("").map(Number);
  const sum = digits.reverse().reduce((total, digit, index) => {
    if (index % 2 === 0) { const doubled = digit * 2; return total + (doubled > 9 ? doubled - 9 : doubled); }
    return total + digit;
  }, 0);
  return (10 - (sum % 10)) % 10 === Number(npi[9]);
}

type Finding = { rule: string; ok: boolean; detail: string; fields: (keyof Claim)[] };

/** The rule types the Claims Document Assistant applies after extraction, in the order its description lists them. */
function checkClaim(claim: Claim): Finding[] {
  const empty = (Object.keys(claim) as (keyof Claim)[]).filter((key) => !claim[key].trim());
  const missing = empty.map((key) => fieldLabels[key]);
  const date = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);
  const service = date(claim.serviceDate), received = date(claim.receivedDate), expires = date(claim.referralExpires);
  const amount = Number(claim.amount);
  return [
    { rule: "Required fields", ok: !missing.length, detail: missing.length ? `Missing: ${missing.join(", ")}.` : "All eight fields present.", fields: empty },
    { rule: "NPI check digit", ok: npiValid(claim.npi), detail: npiValid(claim.npi) ? "Check digit matches." : "Not a valid 10-digit NPI: the check digit does not match.", fields: ["npi"] },
    { rule: "ICD-10 format", ok: /^[A-TV-Z]\d[0-9A-Z](\.[0-9A-Z]{1,4})?$/i.test(claim.icd10.trim()), detail: /^[A-TV-Z]\d[0-9A-Z](\.[0-9A-Z]{1,4})?$/i.test(claim.icd10.trim()) ? "Letter, two characters, optional decimal part." : "Diagnosis code is not in ICD-10 format.", fields: ["icd10"] },
    { rule: "CPT format", ok: /^\d{4}[0-9FT]$/.test(claim.cpt.trim()), detail: /^\d{4}[0-9FT]$/.test(claim.cpt.trim()) ? "Five-character procedure code." : "Procedure code is not a five-character CPT code.", fields: ["cpt"] },
    { rule: "Date order", ok: Boolean(service && received && service <= received), detail: service && received ? (service <= received ? "Service date is on or before the received date." : "Received before the service took place.") : "Dates must be YYYY-MM-DD.", fields: ["serviceDate", "receivedDate"] },
    { rule: "Referral in date", ok: Boolean(service && expires && service <= expires), detail: service && expires ? (service <= expires ? "Referral was valid on the service date." : "Referral had expired by the service date.") : "Dates must be YYYY-MM-DD.", fields: ["referralExpires"] },
    { rule: "Positive amount", ok: Number.isFinite(amount) && amount > 0, detail: Number.isFinite(amount) && amount > 0 ? "Amount is above zero." : "Billed amount must be above zero.", fields: ["amount"] },
  ];
}

/** The reply is drafted from the findings with a fixed template, the same fallback the project uses without a model. */
function draftReply(claim: Claim, findings: Finding[]) {
  const problems = findings.filter((finding) => !finding.ok);
  const id = claim.claimId.trim() || "this claim";
  if (!problems.length) return `Claim ${id} passed every check. It is queued for a reviewer, who approves the status reply before it is sent.`;
  return `Claim ${id} needs attention before it can move forward:\n${problems.map((problem) => `- ${problem.detail}`).join("\n")}\nPlease correct and resubmit. A reviewer approves this reply before it is sent.`;
}

const presets: [string, (claim: Claim) => Claim][] = [
  ["Break the NPI", (claim) => ({ ...claim, npi: claim.npi.slice(0, 9) + String((Number(claim.npi[9] ?? 0) + 1) % 10) })],
  ["Expire the referral", (claim) => ({ ...claim, referralExpires: "2026-08-31" })],
  ["Drop the diagnosis", (claim) => ({ ...claim, icd10: "" })],
];

/** Demo titles sit one level below the section they are placed in: h4 inside a home-page project, h3 on a case study. */
type Level = { level?: 3 | 4 };

export function RulesDemo({ level = 4 }: Level) {
  const ready = useHydrated();
  const [claim, setClaim] = useState(sampleClaim);
  const findings = useMemo(() => checkClaim(claim), [claim]);
  const failing = findings.filter((finding) => !finding.ok).length;
  const changed = JSON.stringify(claim) !== JSON.stringify(sampleClaim);
  return (
    <section className="demo" aria-labelledby="rules-demo-title" data-sc-act="peak">
      <header className="demo-head">
        <div>
          {createElement(`h${level}`, { id: "rules-demo-title" }, "Try the rule checks")}
          <p>A synthetic claim after extraction. Change any field and the checks rerun in your browser. This restates the rule types from the project, not its code.</p>
        </div>
        <p className="demo-stamp">Synthetic test document</p>
      </header>
      <div className="demo-grid">
        <div className="demo-form">
          <div className="demo-fields">
            {(Object.keys(fieldLabels) as (keyof Claim)[]).map((key) => (
              <label key={key} className="demo-field">
                <span>{fieldLabels[key]}</span>
                <input value={claim[key]} readOnly={!ready} spellCheck={false} autoComplete="off"
                  aria-invalid={findings.some((finding) => !finding.ok && finding.fields.includes(key)) || undefined}
                  onChange={(event) => setClaim({ ...claim, [key]: event.target.value })} />
              </label>
            ))}
          </div>
          {ready && (
            <div className="demo-presets" role="group" aria-label="Introduce a problem">
              {presets.map(([label, apply]) => <Button key={label} color="secondary" size="sm" onClick={() => setClaim(apply(claim))}>{label}</Button>)}
              <Button color="tertiary" size="sm" iconLeading={RefreshCw01} isDisabled={!changed} onClick={() => setClaim(sampleClaim)}>Reset</Button>
            </div>
          )}
        </div>
        <div className="demo-output">
          <p className="demo-verdict" data-state={failing ? "flagged" : "clear"} aria-live="polite">
            {failing ? `${failing} of ${findings.length} checks flagged` : `All ${findings.length} checks pass`}
          </p>
          <ul className="demo-rules">
            {findings.map((finding) => (
              <li key={finding.rule} data-state={finding.ok ? "pass" : "flag"}>
                {finding.ok ? <CheckCircle aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
                <span><strong>{finding.rule}<span className="sr-only">: {finding.ok ? "pass" : "flagged"}</span></strong> {finding.detail}</span>
              </li>
            ))}
          </ul>
          <div className="demo-reply">
            <p className="demo-reply-head"><span>Draft reply</span><span className="demo-held">Held for review</span></p>
            <p className="demo-reply-body">{draftReply(claim, findings)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Seeded so the prerendered batch matches the first render in the browser; a new batch draws a new seed. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Referral = { referral: string; patientId: string; ssn: string; phone: string; email: string; serviceDate: string; facility: string };
/** A placeholder catalog: the generator keeps codes inside valid reference lists; these codes are made up for the page. */
const facilities = ["FAC-101", "FAC-214", "FAC-327", "FAC-442"];

function generate(seed: number, count = 4): Referral[] {
  const next = random(seed);
  const pick = (length: number) => Math.floor(next() * length);
  const digits = (length: number) => Array.from({ length }, () => pick(10)).join("");
  const used = new Set<string>();
  return Array.from({ length: count }, (_, index) => {
    let referral = "";
    do referral = `RF${digits(8)}`; while (used.has(referral));
    used.add(referral);
    const day = String(1 + pick(28)).padStart(2, "0");
    return {
      referral,
      patientId: `PT-${String(index + 1).padStart(2, "0")}${digits(5)}`,
      ssn: `999-${digits(2)}-${digits(4)}`,
      phone: `(555) 555-01${digits(2)}`,
      email: `patient${index + 1}.${digits(3)}@example.com`,
      serviceDate: `2026-10-${day}`,
      facility: facilities[pick(facilities.length)]!,
    };
  });
}

type Manifest = { bytes: number; gzip: number | null; sha256: string };

async function describe(batch: Referral[]): Promise<Manifest> {
  const data = new TextEncoder().encode(JSON.stringify(batch));
  const digest = await crypto.subtle.digest("SHA-256", data);
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  let gzip: number | null = null;
  if (typeof CompressionStream !== "undefined") {
    const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("gzip"));
    gzip = (await new Response(stream).arrayBuffer()).byteLength;
  }
  return { bytes: data.byteLength, gzip, sha256 };
}

export function GeneratorDemo({ level = 4 }: Level) {
  const ready = useHydrated();
  const [seed, setSeed] = useState(20260417);
  const batch = useMemo(() => generate(seed), [seed]);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  useEffect(() => {
    if (!ready || !globalThis.crypto?.subtle) return;
    let current = true;
    setManifest(null);
    describe(batch).then((result) => current && setManifest(result), () => {});
    return () => { current = false; };
  }, [batch, ready]);
  return (
    <section className="demo demo-generator" aria-labelledby="generator-demo-title">
      <header className="demo-head">
        <div>
          {createElement(`h${level}`, { id: "generator-demo-title" }, "Generate a synthetic batch")}
          <p>The generator's rules for obviously fake values, sketched in your browser: SSNs start with 999, phones use 555-01xx, emails use example.com. The batch is then checksummed and gzipped, as the app does before upload.</p>
        </div>
        {ready && <Button color="secondary" size="sm" iconLeading={RefreshCw01} onClick={() => setSeed(Math.floor(Math.random() * 2 ** 31))}>New batch</Button>}
      </header>
      <div className="demo-table" role="region" aria-label="Generated referrals" tabIndex={0}>
        <table>
          <thead><tr><th scope="col">Referral</th><th scope="col">Patient ID</th><th scope="col">SSN</th><th scope="col">Phone</th><th scope="col">Email</th><th scope="col">Service</th><th scope="col">Facility</th></tr></thead>
          <tbody>
            {batch.map((row) => (
              <tr key={row.referral}><td>{row.referral}</td><td>{row.patientId}</td><td>{row.ssn}</td><td>{row.phone}</td><td>{row.email}</td><td>{row.serviceDate}</td><td>{row.facility}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="demo-manifest" aria-live="polite">
        <span><code>batch.json</code> {batch.length} records</span>
        {manifest ? <>
          <span>{manifest.bytes.toLocaleString("en-US")} bytes</span>
          {manifest.gzip !== null && <span>gzip {manifest.gzip.toLocaleString("en-US")} bytes</span>}
          <span title={manifest.sha256}>sha256 <code>{manifest.sha256.slice(0, 12)}…</code></span>
        </> : <span>{ready ? "Checksumming…" : "Checksum computed in the browser"}</span>}
      </p>
    </section>
  );
}
