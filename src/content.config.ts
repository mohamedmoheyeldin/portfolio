import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const linkSchema = z.object({
  label: z.string(),
  href: z.url(),
});

const career = defineCollection({
  loader: file('src/content/career.json'),
  schema: z.object({
    name: z.string(),
    location: z.string(),
    headline: z.string(),
    heroTitle: z.string(),
    summary: z.string(),
    links: z.array(linkSchema),
    competencies: z.array(z.string()),
    skillGroups: z.array(
      z.object({
        label: z.string(),
        items: z.array(z.string()),
      }),
    ),
    experience: z.array(
      z.object({
        employer: z.string(),
        title: z.string(),
        professionalTitle: z.string().nullable(),
        location: z.string(),
        start: z.string(),
        end: z.string().nullable(),
        summary: z.string(),
        highlights: z.array(z.string()),
      }),
    ),
    education: z.array(
      z.object({
        institution: z.string(),
        credential: z.string(),
        field: z.string(),
        end: z.string(),
      }),
    ),
    projects: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        repository: z.url(),
        technologies: z.array(z.string()),
        highlights: z.array(z.string()),
      }),
    ),
    provenance: z.object({
      status: z.literal('draft'),
      referenceRepository: z.url(),
      sourceSnapshotDate: z.string(),
      importedOn: z.string(),
      policy: z.string(),
    }),
  }),
});

export const collections = { career };
