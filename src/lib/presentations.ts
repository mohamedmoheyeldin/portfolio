/**
 * Presentation channels consume the same validated career record.
 * They may select and format facts, but must not own duplicate career content.
 */
export type PresentationChannel = 'web' | 'pdf' | 'docx';

export interface PresentationTheme {
  typography: {
    brand: string;
    body: string;
    document: string;
  };
  spacing: readonly number[];
  hierarchy: readonly ['identity', 'positioning', 'experience', 'expertise', 'education'];
}

/** Provisional values. Final theme decisions belong to the design phase. */
export const presentationTheme: PresentationTheme = {
  typography: {
    brand: 'system-ui',
    body: 'system-ui',
    document: 'Arial',
  },
  spacing: [4, 8, 12, 16, 24, 36, 56],
  hierarchy: ['identity', 'positioning', 'experience', 'expertise', 'education'],
};
