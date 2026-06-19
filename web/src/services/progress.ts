import type { CardProgress, RecallRating } from '../types'

const KEY_PREFIX = 'chamorro_'

// SM-2 spaced repetition algorithm (platform-agnostic, copied from mobile app)
export function sm2(
  rating: RecallRating,
  interval: number,
  repetitions: number,
  easeFactor: number
): { interval: number; repetitions: number; easeFactor: number } {
  let newInterval = interval
  let newRepetitions = repetitions
  let newEF = easeFactor

  if (rating < 2) {
    newInterval = 1
    newRepetitions = 0
  } else {
    if (repetitions === 0) newInterval = 1
    else if (repetitions === 1) newInterval = 6
    else newInterval = Math.round(interval * easeFactor)
    newRepetitions = repetitions + 1
  }

  newEF = easeFactor + 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02)
  if (newEF < 1.3) newEF = 1.3

  return { interval: newInterval, repetitions: newRepetitions, easeFactor: newEF }
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function getCardProgress(wordId: string): CardProgress | null {
  const raw = localStorage.getItem(KEY_PREFIX + 'card_' + wordId)
  return raw ? JSON.parse(raw) : null
}

export function updateCardProgress(wordId: string, rating: RecallRating): void {
  const existing = getCardProgress(wordId)
  const now = new Date().toISOString()

  const interval = existing?.interval ?? 1
  const repetitions = existing?.repetitions ?? 0
  const easeFactor = existing?.ease_factor ?? 2.5

  const result = sm2(rating, interval, repetitions, easeFactor)
  const nextReview = addDays(new Date(), result.interval).toISOString()

  const progress: CardProgress = {
    word_id: wordId,
    interval: result.interval,
    repetitions: result.repetitions,
    ease_factor: result.easeFactor,
    next_review: nextReview,
    last_reviewed: now,
  }

  localStorage.setItem(KEY_PREFIX + 'card_' + wordId, JSON.stringify(progress))
}

export function getDueCardIds(limit = 20): string[] {
  const today = new Date().toISOString()
  const due: CardProgress[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(KEY_PREFIX + 'card_')) continue
    const p: CardProgress = JSON.parse(localStorage.getItem(key)!)
    if (p.next_review <= today) due.push(p)
  }

  return due
    .sort((a, b) => a.next_review.localeCompare(b.next_review))
    .slice(0, limit)
    .map((p) => p.word_id)
}

export function getTotalReviewed(): number {
  let count = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(KEY_PREFIX + 'card_')) continue
    const p: CardProgress = JSON.parse(localStorage.getItem(key)!)
    if (p.repetitions > 0) count++
  }
  return count
}

export function isLessonComplete(lessonId: number): boolean {
  return localStorage.getItem(KEY_PREFIX + 'lesson_' + lessonId) === 'done'
}

export function completeLesson(lessonId: number): void {
  localStorage.setItem(KEY_PREFIX + 'lesson_' + lessonId, 'done')
}

export function getAllLessonProgress(): Record<number, boolean> {
  const result: Record<number, boolean> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(KEY_PREFIX + 'lesson_')) continue
    const id = parseInt(key.replace(KEY_PREFIX + 'lesson_', ''))
    result[id] = true
  }
  return result
}

export function getStreak(): number {
  const streak = parseInt(localStorage.getItem(KEY_PREFIX + 'streak') ?? '0')
  const lastDate = localStorage.getItem(KEY_PREFIX + 'last_review_date')
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (lastDate === today || lastDate === yesterday) return streak
  return 0
}

export function recordDailyReview(): void {
  const lastDate = localStorage.getItem(KEY_PREFIX + 'last_review_date')
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  let streak = parseInt(localStorage.getItem(KEY_PREFIX + 'streak') ?? '0')

  if (lastDate !== today) {
    streak = lastDate === yesterday ? streak + 1 : 1
    localStorage.setItem(KEY_PREFIX + 'streak', String(streak))
    localStorage.setItem(KEY_PREFIX + 'last_review_date', today)
  }
}
