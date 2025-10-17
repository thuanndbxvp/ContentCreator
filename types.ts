// Literal types from constants
export type Tone = 'Formal' | 'Informative' | 'Conversational' | 'Persuasive' | 'Humorous' | 'Empathetic' | 'Inspirational';
export type Style = 'Narrative' | 'Descriptive' | 'Expository' | 'Persuasive' | 'Technical' | 'Academic' | 'Business';
export type Voice = 'Authoritative' | 'Conversational' | 'Personal' | 'Humorous' | 'Professional' | 'Empathetic' | 'Persuasive';

// Options interfaces
export interface StyleOptions {
  tone: Tone;
  style: Style;
  voice: Voice;
}

export interface FormattingOptions {
  headings: boolean;
  bullets: boolean;
  bold: boolean;
  includeIntro: boolean;
  includeOutro: boolean;
}

// Data structures
export interface LibraryItem {
  id: number;
  topic: string;
  script: string;
}

export interface GenerationParams {
  topic: string;
  targetAudience: string;
  styleOptions: StyleOptions;
  keywords: string;
  formattingOptions: FormattingOptions;
  wordCount: string;
  scriptParts: string;
}

export interface VisualPrompt {
    english: string;
    vietnamese: string;
}

export interface AllVisualPromptsResult {
    scene: string;
    english: string;
    vietnamese: string;
}
