export interface VocabWord {
  id: string
  chamorro: string
  english: string
  category: string
  part_of_speech: string
  example_chamorro?: string
  example_english?: string
}

export interface Lesson {
  id: number
  title: string
  subtitle: string
  category: string
  description: string
  vocabulary_ids: string[]
  grammar_note?: string
  cultural_note?: string
  completed: boolean
  unlock_requires: number | null
}

export interface Phrase {
  id: string
  category: string
  chamorro: string
  english: string
  romanization?: string
  context?: string
}

export interface CardProgress {
  word_id: string
  interval: number
  repetitions: number
  ease_factor: number
  next_review: string
  last_reviewed: string
}

export type RecallRating = 0 | 1 | 2 | 3
