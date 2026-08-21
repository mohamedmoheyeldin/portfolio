export const AUTOMATION_MODES = Object.freeze({
  OFF: 'AUTOMATION_OFF',
  DRAFT_ONLY: 'DRAFT_ONLY',
  SAFE: 'SAFE_AUTOMATION',
  FULL: 'FULL_CONFIGURED_AUTOMATION',
});

const REPLY_ACTIONS = new Set(['reply-with-resume', 'reply-without-resume', 'reply-safe-deferral']);
const HIGH_IMPACT_CATEGORIES = new Set([
  'interview', 'interview-invitation', 'interview-scheduling', 'interview-rescheduling',
  'technical-interview', 'behavioral-interview', 'hiring-manager-interview', 'final-interview',
  'offer-related', 'offer-discussion', 'negotiation', 'onboarding-related', 'onboarding-decision',
  'compensation-negotiation', 'work-authorization-uncertain', 'uncertain',
]);
const PROFILE_REQUIRED_CATEGORIES = new Set([
  'compensation-question', 'salary-range-question', 'hourly-rate-question',
  'work-authorization-question', 'availability-question', 'employment-type-question',
]);
const SAFE_AUTOMATION_CATEGORIES = new Set([
  'job', 'new-job-opportunity', 'recruiter-introduction', 'job-description-received',
  'request-for-resume', 'location-question', 'remote-work-question', 'follow-up',
  'confirmation', 'application-confirmation', 'status-update', 'general-recruiter-correspondence',
]);

function configuredList(value) {
  return String(value || '').split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean);
}

export function automationMode(env = {}) {
  const configured = String(env.AUTOMATION_MODE || AUTOMATION_MODES.OFF).trim().toUpperCase();
  return Object.values(AUTOMATION_MODES).includes(configured) ? configured : AUTOMATION_MODES.OFF;
}

export function senderAddress(value) {
  return String(value || '').match(/<([^>]+)>/)?.[1]?.toLowerCase() || String(value || '').trim().toLowerCase();
}

function senderDomain(value) {
  return senderAddress(value).split('@')[1] || '';
}

export function senderTrust(message, env = {}) {
  const from = senderAddress(message.sender);
  const replyTo = senderAddress(message.replyTo || message.sender);
  const authentication = String(message.authenticationResults || '').toLowerCase();
  const authenticated = /(?:^|[;\s])(dmarc|dkim|spf)=pass(?:[;\s]|$)/.test(authentication);
  const allowlistedDomains = configuredList(env.AUTOMATION_SENDER_DOMAINS);
  const allowlisted = allowlistedDomains.includes(senderDomain(from));
  const sameRecipient = Boolean(from && replyTo && from === replyTo);
  const trusted = sameRecipient && (authenticated || allowlisted);
  return {
    trusted,
    from,
    replyTo,
    authenticated,
    allowlisted,
    reason: !sameRecipient ? 'REPLY_TO_MISMATCH' : !authenticated && !allowlisted ? 'SENDER_NOT_AUTHENTICATED' : 'SENDER_TRUSTED',
  };
}

export function deterministicDecision(message, env = {}) {
  const address = senderAddress(message.sender);
  const domain = address.split('@')[1] || '';
  const currentEmployerDomains = configuredList(env.CURRENT_EMPLOYER_DOMAINS);
  const text = `${message.subject || ''} ${message.body || ''}`.toLowerCase();
  const automatedSender = /(^|[._+-])(no-?reply|notifications?|alerts?|jobs?)([._+@-]|$)/i.test(address);
  const automatedContent = /(unsubscribe|job alert|recommended jobs|daily jobs|weekly digest)/i.test(text);

  if (message.oversized) return {
    relevant: true, category: 'oversized-message', action: 'needs-review', priority: 100,
    confidence: 100, reason: 'Message exceeded the configured safe body limit', reasonCodes: ['MESSAGE_TOO_LARGE'],
    needsResume: false, requiresHumanReview: true, automationAllowed: false,
  };
  if (currentEmployerDomains.includes(domain)) return {
    relevant: false, category: 'current-employer', action: 'archive-only', priority: 100,
    confidence: 100, reason: 'Configured current-employer domain', reasonCodes: ['CURRENT_EMPLOYER'],
    needsResume: false, requiresHumanReview: false, automationAllowed: false,
  };
  if (automatedSender && automatedContent) return {
    relevant: false, category: 'automated-alert', action: 'archive-only', priority: 20,
    confidence: 98, reason: 'Automated job alert or newsletter', reasonCodes: ['AUTOMATED_ALERT'],
    needsResume: false, requiresHumanReview: false, automationAllowed: false,
  };
  return null;
}

export function verifiedDecision(analysis, message, env = {}) {
  const deterministic = deterministicDecision(message, env);
  if (deterministic) return { ...analysis, ...deterministic };

  const requested = (analysis.requestedDocuments || []).join(' ').toLowerCase();
  const sensitiveRequest = /(driver.?s? license|passport|social security|ssn|birth|bank|tax|i-?9|w-?4|government id|immigration)/i.test(requested);
  const category = String(analysis.category || 'uncertain');
  const minimumConfidence = Number(env.AUTOMATION_MIN_CONFIDENCE || 85);
  const trust = senderTrust(message, env);
  const reasonCodes = new Set(analysis.reasonCodes || []);
  let action = analysis.action;
  let requiresHumanReview = Boolean(analysis.requiresHumanReview);

  if (HIGH_IMPACT_CATEGORIES.has(category)) {
    requiresHumanReview = true;
    reasonCodes.add('HIGH_IMPACT_CATEGORY');
  }
  if (PROFILE_REQUIRED_CATEGORIES.has(category)) {
    requiresHumanReview = true;
    reasonCodes.add('APPROVED_PROFILE_ANSWER_REQUIRED');
  }
  if (sensitiveRequest) {
    requiresHumanReview = true;
    reasonCodes.add('SENSITIVE_DOCUMENT_REQUEST');
  }
  if (Number(analysis.confidence || 0) < minimumConfidence) {
    requiresHumanReview = true;
    reasonCodes.add('LOW_CONFIDENCE');
  }
  if (REPLY_ACTIONS.has(action) && !trust.trusted) {
    requiresHumanReview = true;
    reasonCodes.add(trust.reason);
  }
  if (action === 'quarantine' || action === 'needs-review') {
    requiresHumanReview = true;
    reasonCodes.add('AI_RECOMMENDED_REVIEW');
  }
  if (!analysis.relevant && REPLY_ACTIONS.has(action)) action = 'archive-only';
  if (requiresHumanReview) action = 'needs-review';

  const mode = automationMode(env);
  if (REPLY_ACTIONS.has(action) && mode === AUTOMATION_MODES.OFF) {
    action = 'needs-review';
    requiresHumanReview = true;
    reasonCodes.add('AUTOMATION_DISABLED');
  }

  const automationAllowed = REPLY_ACTIONS.has(action)
    && trust.trusted
    && !requiresHumanReview
    && (mode === AUTOMATION_MODES.FULL || (mode === AUTOMATION_MODES.SAFE && SAFE_AUTOMATION_CATEGORIES.has(category)) || mode === AUTOMATION_MODES.DRAFT_ONLY);

  return {
    ...analysis,
    category,
    action,
    needsResume: action === 'reply-with-resume' && ['job', 'new-job-opportunity', 'job-description-received', 'request-for-resume'].includes(category),
    containsSensitiveRequest: sensitiveRequest,
    requiresHumanReview,
    automationAllowed,
    reasonCodes: [...reasonCodes],
    senderTrust: { authenticated: trust.authenticated, allowlisted: trust.allowlisted, recipientMatchesSender: trust.from === trust.replyTo },
  };
}

export function shouldReply(decision) {
  return REPLY_ACTIONS.has(decision.action) && decision.automationAllowed !== false;
}

export function canCreateDraft(env = {}, decision = {}) {
  return shouldReply(decision) && automationMode(env) !== AUTOMATION_MODES.OFF;
}

export function canSend(env = {}, decision = {}) {
  const mode = automationMode(env);
  return shouldReply(decision) && (mode === AUTOMATION_MODES.SAFE || mode === AUTOMATION_MODES.FULL);
}

export function retryDelaySeconds(attempt) {
  return Math.min(6 * 60 * 60, 60 * (2 ** Math.max(0, attempt - 1)));
}
