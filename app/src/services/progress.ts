import * as SQLite from 'expo-sqlite';
import type { CardProgress, RecallRating } from '../types';

const DB_NAME = 'chamorro_progress.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS card_progress (
        word_id TEXT PRIMARY KEY,
        interval INTEGER NOT NULL DEFAULT 1,
        repetitions INTEGER NOT NULL DEFAULT 0,
        ease_factor REAL NOT NULL DEFAULT 2.5,
        next_review TEXT NOT NULL,
        last_reviewed TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS lesson_progress (
        lesson_id INTEGER PRIMARY KEY,
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT
      );
      CREATE TABLE IF NOT EXISTS user_stats (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }
  return db;
}

// SM-2 spaced repetition algorithm
export function sm2(
  rating: RecallRating,
  interval: number,
  repetitions: number,
  easeFactor: number
): { interval: number; repetitions: number; easeFactor: number } {
  let newInterval = interval;
  let newRepetitions = repetitions;
  let newEF = easeFactor;

  if (rating < 2) {
    // Failed — reset
    newInterval = 1;
    newRepetitions = 0;
  } else {
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * easeFactor);
    newRepetitions = repetitions + 1;
  }

  newEF = easeFactor + 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02);
  if (newEF < 1.3) newEF = 1.3;

  return { interval: newInterval, repetitions: newRepetitions, easeFactor: newEF };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function getCardProgress(wordId: string): Promise<CardProgress | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CardProgress>(
    'SELECT * FROM card_progress WHERE word_id = ?',
    [wordId]
  );
  return row ?? null;
}

export async function updateCardProgress(wordId: string, rating: RecallRating): Promise<void> {
  const db = await getDb();
  const existing = await getCardProgress(wordId);
  const now = new Date().toISOString();

  let interval = 1;
  let repetitions = 0;
  let easeFactor = 2.5;

  if (existing) {
    interval = existing.interval;
    repetitions = existing.repetitions;
    easeFactor = existing.ease_factor;
  }

  const result = sm2(rating, interval, repetitions, easeFactor);
  const nextReview = addDays(new Date(), result.interval).toISOString();

  await db.runAsync(
    `INSERT OR REPLACE INTO card_progress
     (word_id, interval, repetitions, ease_factor, next_review, last_reviewed)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [wordId, result.interval, result.repetitions, result.easeFactor, nextReview, now]
  );
}

export async function getDueCards(limit = 20): Promise<string[]> {
  const db = await getDb();
  const today = new Date().toISOString();
  const rows = await db.getAllAsync<{ word_id: string }>(
    'SELECT word_id FROM card_progress WHERE next_review <= ? ORDER BY next_review ASC LIMIT ?',
    [today, limit]
  );
  return rows.map((r) => r.word_id);
}

export async function completeLesson(lessonId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO lesson_progress (lesson_id, completed, completed_at) VALUES (?, 1, ?)`,
    [lessonId, new Date().toISOString()]
  );
}

export async function getLessonProgress(): Promise<Record<number, boolean>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ lesson_id: number; completed: number }>(
    'SELECT lesson_id, completed FROM lesson_progress'
  );
  const map: Record<number, boolean> = {};
  for (const row of rows) {
    map[row.lesson_id] = row.completed === 1;
  }
  return map;
}

export async function getStat(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_stats WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setStat(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO user_stats (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getTotalReviewed(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM card_progress WHERE repetitions > 0'
  );
  return row?.count ?? 0;
}

export async function getStreak(): Promise<number> {
  const streakStr = await getStat('streak');
  const lastReviewDate = await getStat('last_review_date');
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const streak = parseInt(streakStr ?? '0', 10);

  if (lastReviewDate === today) return streak;
  if (lastReviewDate === yesterday) return streak;
  return 0;
}

export async function recordDailyReview(): Promise<void> {
  const lastDate = await getStat('last_review_date');
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const streakStr = await getStat('streak');
  let streak = parseInt(streakStr ?? '0', 10);

  if (lastDate !== today) {
    if (lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    await setStat('streak', String(streak));
    await setStat('last_review_date', today);
  }
}
