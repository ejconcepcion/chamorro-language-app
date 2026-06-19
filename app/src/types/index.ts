export interface VocabWord {
  id: string;
  chamorro: string;
  english: string;
  category: string;
  part_of_speech: string;
  example_chamorro?: string;
  example_english?: string;
}

export interface Lesson {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  vocabulary_ids: string[];
  grammar_note?: string;
  cultural_note?: string;
  completed: boolean;
  unlock_requires: number | null;
}

export interface Phrase {
  id: string;
  category: string;
  chamorro: string;
  english: string;
  romanization?: string;
  context?: string;
}

export interface CardProgress {
  word_id: string;
  interval: number;       // days until next review
  repetitions: number;    // number of successful reviews
  ease_factor: number;    // SM-2 ease factor (starts at 2.5)
  next_review: string;    // ISO date string
  last_reviewed: string;  // ISO date string
}

export type RecallRating = 0 | 1 | 2 | 3;
// 0 = Again (complete blackout), 1 = Hard, 2 = Good, 3 = Easy

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
