// User types
export interface User {
  email: string;
  name: string;
}

// Tutorial types
export interface Tutorial {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status?: 'draft' | 'review' | 'published';
  isSubtutorial?: boolean;
  opdracht?: OpdrachtConfig;
}

// Opdracht types
export interface OpdrachtConfig {
  ingeschakeld: boolean;
  titel: string;
  instructie: string;
  templateSheetUrl?: string;
  aantalTabs?: number;
  criteria: Criterium[];
  maxScore: number;
  deadline?: string;
  verplicht?: boolean;
}

export interface Criterium {
  naam: string;
  beschrijving: string;
  verwacht?: string;
  controleer?: string[];
  gewicht: number;
}

export interface OpdrachtInzending {
  id: string;
  user_email: string;
  user_name: string;
  tutorial_id: string;
  tutorial_slug: string;
  opdracht_titel: string;
  sheet_url?: string;
  pdf_url?: string;
  score?: number;
  feedback?: string;
  correctie_data?: any;
  status: 'ingediend' | 'bezig' | 'voltooid' | 'mislukt';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Opdracht Voortgang types (Nieuw - 18/03/2026)
export interface OpdrachtVoortgang {
  id: string;
  user_email: string;
  user_name: string;
  tutorial_id: string;
  tutorial_slug: string;
  opdracht_id: string;
  opdracht_titel: string;
  antwoorden: Record<string, any>;
  voltooid: boolean;
  score?: number;
  feedback?: string;
  pdf_url?: string;
  status: 'niet_begonnen' | 'bezig' | 'ingediend' | 'gekeurd' | 'voltooid';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// AI Correctie Response
export interface CorrectieResultaat {
  score: number;
  feedback: string;
  details: {
    criterium: string;
    score: number;
    feedback: string;
  }[];
}
