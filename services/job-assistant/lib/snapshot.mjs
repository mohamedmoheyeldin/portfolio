export function publicItem(item) {
  return {
    id: item.id,
    kind: item.analysis.kind,
    company: item.analysis.company || 'Unknown company',
    role: item.analysis.role || item.subject,
    sender: item.sender.replace(/<[^>]+>/, '').trim(),
    receivedAt: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(item.receivedAt)),
    workMode: item.analysis.workMode,
    confidence: item.analysis.confidence,
    status: item.status,
    summary: item.analysis.summary,
    nextAction: item.status === 'needs-review' ? 'Generate resume and reply' : item.status === 'resume-ready' ? 'Review tailored resume and AI reply' : item.status === 'draft-ready' ? 'Review Gmail draft' : 'View audit record',
    requestedDocuments: item.analysis.requestedDocuments,
  };
}

export function toSnapshot(state, connected) {
  const relevant = state.items.filter((item) => item.analysis?.relevant);
  return {
    mode: connected ? 'connected' : 'demo',
    connected,
    account: connected ? state.account : null,
    lastSyncAt: state.lastSyncAt ? `Last synced ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.lastSyncAt))}` : 'Not synced yet',
    stats: {
      reviewed: state.reviewed,
      opportunities: relevant.filter((item) => item.analysis.kind === 'job').length,
      remote: relevant.filter((item) => item.analysis.workMode === 'remote').length,
      resumes: relevant.filter((item) => item.resumePath).length,
      awaitingApproval: relevant.filter((item) => item.status !== 'sent').length,
    },
    items: relevant.map(publicItem),
  };
}
