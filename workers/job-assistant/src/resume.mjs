function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

export function verifiedResumeHtml(profile, analysis) {
  const facts = new Set(profile.experience.flatMap((role) => role.highlights));
  const skills = new Set(profile.skillGroups.flatMap((group) => group.items));
  const selectedHighlights = analysis.selectedHighlights.filter((value) => facts.has(value));
  const selectedSkills = analysis.selectedSkills.filter((value) => skills.has(value));
  const grouped = new Map();
  for (const highlight of selectedHighlights) {
    const role = profile.experience.find((candidate) => candidate.highlights.includes(highlight));
    if (!role) continue;
    if (!grouped.has(role.employer)) grouped.set(role.employer, { role, highlights: [] });
    grouped.get(role.employer).highlights.push(highlight);
  }
  if (!grouped.size) {
    for (const role of profile.experience.slice(0, 2)) grouped.set(role.employer, { role, highlights: role.highlights.slice(0, 2) });
  }
  const experience = [...grouped.values()].map(({ role, highlights }) => `
    <section class="role"><h3>${escapeHtml(role.professionalTitle || role.title)} <span>· ${escapeHtml(role.employer)}</span></h3>
    <p class="meta">${escapeHtml(role.start)}–${escapeHtml(role.end || 'Present')} · ${escapeHtml(role.location)}</p>
    <ul>${highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul></section>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(profile.name)} — ${escapeHtml(analysis.role)}</title><style>
    @page{size:Letter;margin:.48in .55in}*{box-sizing:border-box}body{margin:0;color:#0b1020;font:9pt/1.35 Arial,sans-serif}h1{margin:0;font-size:23pt;letter-spacing:-.04em}h2{margin:12pt 0 5pt;color:#1267e8;font-size:9pt;text-transform:uppercase;letter-spacing:.08em}h3{margin:7pt 0 1pt;font-size:10pt}h3 span,.meta,p{color:#4d5568}.headline{margin:2pt 0 7pt;color:#1267e8;font-weight:700}.contact{font-size:8pt}.summary{max-width:7.2in}ul{margin:3pt 0 0;padding-left:14pt}li{margin:0 0 3pt}.skills{color:#30394c}.footer{margin-top:10pt;padding-top:5pt;border-top:1px solid #dfe3eb;color:#687083;font-size:7pt}</style></head><body>
    <h1>${escapeHtml(profile.name)}</h1><p class="headline">${escapeHtml(analysis.role || profile.headline)}</p>
    <p class="contact">Reston, VA · mohamedmoheyeldin.jobs@gmail.com · linkedin.com/in/moheyeldin · github.com/mohamedmoheyeldin</p>
    <h2>Profile</h2><p class="summary">${escapeHtml(profile.summary)}</p>
    <h2>Relevant expertise</h2><p class="skills">${escapeHtml((selectedSkills.length ? selectedSkills : profile.competencies.slice(0, 7)).join(' · '))}</p>
    <h2>Selected experience</h2>${experience}
    <h2>Education</h2><p>Bachelor's degree, Computer Science · American College of Commerce and Technology</p>
    <p class="footer">Tailored for ${escapeHtml(analysis.company || 'prospective employer')} · Generated only from verified canonical career facts</p>
  </body></html>`;
}

export async function renderPdf(env, html) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/pdf`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.CLOUDFLARE_BROWSER_RENDERING_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ html }),
  });
  if (!response.ok) throw new Error(`Cloudflare Browser Rendering failed: ${response.status} ${await response.text()}`);
  return response.arrayBuffer();
}

export function artifactKey(itemId, analysis) {
  const slug = `${analysis.company}-${analysis.role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'application';
  return `resumes/${itemId}/mohamed-moheyeldin-${slug}.pdf`;
}
