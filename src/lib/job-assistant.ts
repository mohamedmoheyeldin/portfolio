export type WorkMode = 'remote' | 'hybrid' | 'on-site' | 'unknown';
export type AssistantItemKind = 'job' | 'confirmation';
export type AssistantItemStatus = 'discovered' | 'analyzed' | 'resume-ready' | 'draft-ready' | 'drafted' | 'sent' | 'logged' | 'complete' | 'quarantined' | 'needs-review';

export interface AssistantItem {
  id: string;
  kind: AssistantItemKind;
  company: string;
  role: string;
  sender: string;
  receivedAt: string;
  workMode: WorkMode;
  confidence: number;
  status: AssistantItemStatus;
  summary: string;
  nextAction: string;
  requestedDocuments: string[];
}

export interface AssistantSnapshot {
  mode: 'demo' | 'live';
  lastSyncAt: string | null;
  stats: {
    reviewed: number;
    opportunities: number;
    remote: number;
    resumes: number;
    replies: number;
    archived: number;
    attention: number;
  };
}

export const unavailableAssistantSnapshot: AssistantSnapshot = {
  mode: 'demo',
  lastSyncAt: 'Live telemetry unavailable',
  stats: {
    reviewed: 0,
    opportunities: 0,
    remote: 0,
    resumes: 0,
    replies: 0,
    archived: 0,
    attention: 0,
  },
};
