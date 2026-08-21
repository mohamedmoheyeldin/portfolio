import { resolve } from 'node:path';

export const projectRoot = resolve(import.meta.dirname, '../../..');
export const servicePort = Number.parseInt(process.env.JOB_ASSISTANT_PORT ?? '8787', 10);
export const portfolioOrigin = process.env.JOB_ASSISTANT_ORIGIN ?? 'http://127.0.0.1:4321';
export const serviceOrigin = `http://127.0.0.1:${servicePort}`;
export const dataDirectory = resolve(projectRoot, '.local/job-assistant');
export const artifactDirectory = resolve(dataDirectory, 'artifacts');
export const statePath = resolve(dataDirectory, 'state.json');
export const tokenPath = resolve(dataDirectory, 'google-tokens.json');
export const careerPath = resolve(projectRoot, 'src/content/career.json');
export const assistantQuery = process.env.JOB_ASSISTANT_GMAIL_QUERY
  ?? 'newer_than:30d (job OR recruiter OR interview OR application OR "right to represent" OR confirmation)';
export const demoMode = process.env.JOB_ASSISTANT_DEMO === 'true';
export const openAiModel = process.env.OPENAI_MODEL ?? 'gpt-5.4-mini';

export function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for this operation.`);
  return value;
}
