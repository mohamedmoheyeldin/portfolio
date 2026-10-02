import {readFile} from 'node:fs/promises';
const records = JSON.parse(await readFile(new URL('../src/content/career.json', import.meta.url), 'utf8'));
const credentialImages = JSON.parse(await readFile(new URL('../src/content/credential-images.json', import.meta.url), 'utf8'));
const url = value => { try {new URL(value); return typeof value === 'string';} catch {return false;} };
const text = value => typeof value === 'string';
const nonemptyText = value => text(value) && value.trim().length > 0;
const isoDate = value => text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const publicCredentialUrl = value => {
  if (!url(value)) return false;
  const parsed = new URL(value);
  return parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.search && !parsed.hash;
};
const nullable = check => value => value === null || check(value);
const array = check => value => Array.isArray(value) && value.every(check);
const object = fields => value => value !== null && typeof value === 'object' && Object.entries(fields).every(([key,check]) => check(value[key]));
const texts = array(text);
const schema = object({id:v=>v==='profile',name:text,location:text,headline:text,heroTitle:text,heroSummary:text,summary:text,detailedSummary:texts,links:array(object({label:text,href:url})),competencies:texts,skillGroups:array(object({label:text,items:texts})),experience:array(object({id:text,employer:text,title:text,professionalTitle:nullable(text),location:text,start:text,end:nullable(text),summary:text,highlights:texts,compactHighlights:texts,customer:nullable(text)})),education:array(object({institution:text,credential:text,field:text,end:text})),credentials:texts,verifiedCredentials:array(object({name:nonemptyText,issuer:nonemptyText,issuedOn:isoDate,expiresOn:nullable(isoDate),href:nullable(publicCredentialUrl)})),projects:array(object({slug:v=>text(v)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),kind:v=>['career','independent'].includes(v),experienceId:nullable(text),context:text,role:text,period:text,name:text,description:text,challenge:text,audience:text,systems:texts,decisions:texts,relevance:text,evidence:array(object({label:text,detail:text,href:nullable(url)})),approach:texts,outcome:text,repository:nullable(url),repositoryVisibility:v=>['public','private','unavailable'].includes(v),relatedProjects:array(object({slug:text,label:text})),technologies:texts,highlights:texts})),provenance:object({status:v=>v==='draft',referenceRepository:url,sourceSnapshotDate:text,importedOn:text,policy:text})});
if (!Array.isArray(records) || records.length !== 1 || !schema(records[0])) throw Error('Career content does not match the required public profile schema.');
if (new Set(records[0].projects.map(p=>p.slug)).size !== records[0].projects.length) throw Error('Duplicate project slugs.');
for (const credential of records[0].verifiedCredentials) {
  if (credential.expiresOn && credential.expiresOn < credential.issuedOn) throw Error('Credential expiration precedes its issue date.');
}
console.log('Career content schema validated.');

const credentialImageUrl = value => {
  if (!publicCredentialUrl(value)) return false;
  const parsed = new URL(value);
  return parsed.origin === 'https://api.accredible.com' && /^\/v1\/frontend\/credential_website_embed_image\/(badge|certificate)\/[1-9]\d*$/.test(parsed.pathname);
};
const dimension = value => Number.isInteger(value) && value > 0;
if (!array(object({credentialHref:publicCredentialUrl,src:credentialImageUrl,width:dimension,height:dimension}))(credentialImages)) throw Error('Credential images do not match the required presentation schema.');
const credentialHrefs = new Set(records[0].verifiedCredentials.map(credential => credential.href));
if (new Set(credentialImages.map(image => image.credentialHref)).size !== credentialImages.length) throw Error('Duplicate credential image references.');
if (new Set(credentialImages.map(image => image.src)).size !== credentialImages.length) throw Error('Duplicate credential image sources.');
for (const image of credentialImages) {
  if (!credentialHrefs.has(image.credentialHref)) throw Error('Credential image must reference a canonical verified credential.');
}
for (const credential of records[0].verifiedCredentials) {
  if (credential.issuer === 'OpenAI Academy' && credential.href && !credentialImages.some(image => image.credentialHref === credential.href)) throw Error('OpenAI Academy credential is missing its presentation image.');
}
console.log('Credential image presentation references validated.');

// Use a dated snapshot so server-rendered and client content agree.
const profile = records[0];
const firstStart = profile.experience.map(role => role.start).sort()[0];
const [startYear, startMonth] = firstStart.split('-').map(Number);
if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(profile.experienceAsOf)) throw Error('Experience snapshot month is required.');
const [asOfYear, asOfMonth] = profile.experienceAsOf.split('-').map(Number);
const completedYears = asOfYear - startYear - (asOfMonth < startMonth ? 1 : 0);
if (profile.experienceYears !== completedYears) throw Error('Experience years must match the first employment start and snapshot month.');
for (const summary of [profile.summary, ...profile.detailedSummary]) {
  for (const match of summary.matchAll(/\b(\d+) years\b/g)) {
    if (Number(match[1]) !== completedYears) throw Error('Summary experience count differs from the career timeline.');
  }
}

if (!text(records[0].projects.find(p => p.slug === 'portfolio-career-content-system')?.resumeSummary)) throw Error('Portfolio resume summary is required.');

for (const project of records[0].projects) {
  if (project.relatedProjects.some(link => !records[0].projects.some(p => p.slug === link.slug))) throw Error("Unknown related project.");
}

const experienceIds = new Set(records[0].experience.map(role => role.id));
if (experienceIds.size !== records[0].experience.length) throw Error("Duplicate experience IDs.");
for (const project of records[0].projects) {
  if (project.kind === "career" && !experienceIds.has(project.experienceId)) throw Error("Work project must reference an existing resume role.");
  if (project.kind === "independent" && project.experienceId !== null) throw Error("Independent projects must not claim an employment association.");
}
