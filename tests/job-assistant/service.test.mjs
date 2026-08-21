import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

import { buildMimeMessage, decodeBase64Url, extractMessage } from '../../services/job-assistant/lib/gmail.mjs';
import { verifiedAnalysis } from '../../services/job-assistant/lib/openai.mjs';
import { toSnapshot } from '../../services/job-assistant/lib/snapshot.mjs';

const runFile = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, '../..');
const careerPath = resolve(projectRoot, 'src/content/career.json');

test('extracts a plain-text Gmail message without exposing transport encoding', () => {
  const message = {
    id: 'mail-1', threadId: 'thread-1', internalDate: '1760000000000',
    payload: {
      headers: [
        { name: 'From', value: 'Recruiter <recruiter@example.com>' },
        { name: 'Subject', value: 'Remote SDET opening' },
      ],
      mimeType: 'text/plain', body: { data: Buffer.from('Hello Mohamed, remote role.').toString('base64url') },
    },
  };
  const extracted = extractMessage(message);
  assert.equal(extracted.body, 'Hello Mohamed, remote role.');
  assert.equal(extracted.replyTo, 'Recruiter <recruiter@example.com>');
  assert.equal(decodeBase64Url(message.payload.body.data), extracted.body);
});

test('removes AI-selected resume claims that are absent from canonical career facts', async () => {
  const [profile] = JSON.parse(await readFile(careerPath, 'utf8'));
  const knownHighlight = profile.experience[0].highlights[0];
  const analysis = verifiedAnalysis({ selectedHighlights: [knownHighlight, 'Invented 75% improvement.'], selectedSkills: ['Playwright', 'Magic QA'] }, profile);
  assert.deepEqual(analysis.selectedHighlights, [knownHighlight]);
  assert.deepEqual(analysis.selectedSkills, ['Playwright']);
});

test('builds a Gmail draft MIME payload with a safe recipient and PDF attachment', () => {
  const message = buildMimeMessage({
    to: 'Recruiter <recruiter@example.com>', subject: 'Re: Senior SDET', body: 'Hello', threadId: 'thread-1',
    attachment: { name: 'resume.pdf', data: Buffer.from('%PDF-test') },
  });
  const decoded = Buffer.from(message.raw, 'base64url').toString('utf8');
  assert.match(decoded, /To: recruiter@example.com/);
  assert.match(decoded, /filename="resume.pdf"/);
  assert.equal(message.threadId, 'thread-1');
  assert.throws(() => buildMimeMessage({ to: 'victim@example.com\r\nBcc: attacker@example.com', subject: 'x', body: 'x' }));
});

test('projects private state into redacted dashboard data', () => {
  const state = {
    reviewed: 2, account: 'owner@example.com', lastSyncAt: '2026-08-21T12:00:00.000Z',
    items: [{
      id: 'mail-1', sender: 'Recruiter <recruiter@example.com>', subject: 'Role', body: 'private email body', receivedAt: '2026-08-21T11:00:00.000Z', status: 'needs-review', resumePath: null,
      analysis: { relevant: true, kind: 'job', company: 'Example', role: 'SDET', workMode: 'remote', confidence: 95, summary: 'Relevant role.', requestedDocuments: [] },
    }],
  };
  const snapshot = toSnapshot(state, true);
  assert.equal(snapshot.stats.remote, 1);
  assert.equal(snapshot.items[0].sender, 'Recruiter');
  assert.equal(JSON.stringify(snapshot).includes('private email body'), false);
});

test('generates readable PDF and DOCX artifacts from verified facts', async (context) => {
  const python = process.env.JOB_ASSISTANT_PYTHON ?? 'python3';
  try {
    await runFile(python, ['-c', 'import docx, reportlab'], { cwd: projectRoot });
  } catch {
    context.skip('Install requirements-resume.txt or set JOB_ASSISTANT_PYTHON to test artifact rendering.');
    return;
  }
  const testRoot = resolve(projectRoot, '.local/job-assistant-tests');
  await mkdir(testRoot, { recursive: true });
  const directory = await mkdtemp(resolve(testRoot, 'render-'));
  const [profile] = JSON.parse(await readFile(careerPath, 'utf8'));
  const planPath = resolve(directory, 'plan.json');
  await writeFile(planPath, JSON.stringify({ company: 'Example Co', role: 'Senior SDET', selectedHighlights: [profile.experience[0].highlights[0], 'Invented claim'], selectedSkills: ['Playwright', 'Invented skill'] }));
  const runtimePath = (path) => python.toLowerCase().endsWith('.exe') ? relative(projectRoot, path) : path;
  const { stdout } = await runFile(python, [runtimePath(resolve(projectRoot, 'scripts/generate-tailored-resume.py')), '--career', runtimePath(careerPath), '--plan', runtimePath(planPath), '--output', runtimePath(directory)], { cwd: projectRoot });
  const artifacts = JSON.parse(stdout);
  const localArtifactPath = (path) => resolve(projectRoot, path.replaceAll('\\', '/'));
  assert.equal((await readFile(localArtifactPath(artifacts.pdf))).subarray(0, 4).toString(), '%PDF');
  assert.equal((await readFile(localArtifactPath(artifacts.docx))).subarray(0, 2).toString(), 'PK');
});
