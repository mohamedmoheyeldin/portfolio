const sheetsBase = 'https://sheets.googleapis.com/v4/spreadsheets';

export async function appendActivity(tokens, spreadsheetId, item) {
  if (!spreadsheetId) return { skipped: true };
  const keyRange = encodeURIComponent('Activity Log!B:B');
  const existing = await fetch(`${sheetsBase}/${encodeURIComponent(spreadsheetId)}/values/${keyRange}`, {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  if (!existing.ok) throw new Error(`Google Sheets activity lookup failed: ${existing.status} ${await existing.text()}`);
  const existingValues = await existing.json();
  if ((existingValues.values || []).some((row) => row[0] === item.id)) return { duplicate: true };
  const range = encodeURIComponent('Activity Log!A:M');
  const response = await fetch(`${sheetsBase}/${encodeURIComponent(spreadsheetId)}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: { authorization: `Bearer ${tokens.access_token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ values: [[
      new Date().toISOString(), item.id, item.account_email, item.thread_id, item.analysis.category,
      item.analysis.company || '', item.analysis.role || '', item.analysis.workMode || 'unknown',
      item.analysis.action, item.status, item.sent_at || '', item.archived_at || '', 'Automated by portfolio job assistant',
    ]] }),
  });
  if (!response.ok) throw new Error(`Google Sheets activity append failed: ${response.status} ${await response.text()}`);
  return response.json();
}
