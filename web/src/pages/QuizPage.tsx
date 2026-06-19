import { useState } from 'react'
import { updateCardProgress } from '../services/progress'
import vocabulary from '../data/vocabulary.json'
import type { VocabWord, RecallRating } from '../types'

const words = vocabulary as VocabWord[]
const QUIZ_SIZE = 10

type QType = 'mc' | 'reverse' | 'fill'
interface Question { word: VocabWord; type: QType; options?: string[]; answer: string }

function buildQuiz(): Question[] {
  const pool = [...words].sort(() => Math.random() - 0.5).slice(0, QUIZ_SIZE)
  return pool.map((word): Question => {
    const r = Math.random()
    if (r < 0.45) {
      const opts = [...words].filter((w) => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map((w) => w.english)
      return { word, type: 'mc', options: [...opts, word.english].sort(() => Math.random() - 0.5), answer: word.english }
    } else if (r < 0.75) {
      const opts = [...words].filter((w) => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map((w) => w.chamorro)
      return { word, type: 'reverse', options: [...opts, word.chamorro].sort(() => Math.random() - 0.5), answer: word.chamorro }
    } else {
      return { word, type: 'fill', answer: word.chamorro }
    }
  })
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[åā]/g, 'a').replace(/ñ/g, 'n').replace(/'/g, "'")
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [fill, setFill] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)

  function start() {
    setQuestions(buildQuiz())
    setIdx(0); setSelected(null); setFill(''); setChecked(false); setScore(0); setStarted(true); setDone(false)
  }

  function check() {
    const q = questions[idx]
    const ans = q.type === 'fill' ? fill : selected ?? ''
    const correct = q.type === 'fill' ? normalize(ans) === normalize(q.answer) : ans === q.answer
    if (correct) setScore((s) => s + 1)
    updateCardProgress(q.word.id, (correct ? 2 : 0) as RecallRating)
    setSelected(ans)
    setChecked(true)
  }

  function next() {
    const n = idx + 1
    if (n >= questions.length) { setDone(true) } else { setIdx(n); setSelected(null); setFill(''); setChecked(false) }
  }

  if (!started) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
      <p className="text-6xl">✏️</p>
      <h1 className="text-2xl font-extrabold text-gray-800">Knowledge Quiz</h1>
      <p className="text-gray-500 text-sm">10 questions — multiple choice, reverse, and fill-in-the-blank</p>
      <button onClick={start} className="mt-4 bg-teal text-white font-bold px-10 py-3 rounded-xl hover:bg-teal-dark transition-colors">
        Start Quiz
      </button>
    </div>
  )

  if (done) {
    const pct = Math.round((score / QUIZ_SIZE) * 100)
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-6xl">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'}</p>
        <h2 className="text-2xl font-extrabold text-gray-800">Quiz Complete!</h2>
        <p className="text-5xl font-extrabold text-teal">{score}/{QUIZ_SIZE}</p>
        <p className="text-gray-500">{pct}% correct</p>
        <p className="text-gray-500 text-sm">{pct >= 80 ? 'Maolek! Excellent work!' : pct >= 60 ? 'Biba! Keep practicing!' : "Keep studying — you'll get there!"}</p>
        <button onClick={start} className="mt-4 bg-teal text-white font-bold px-10 py-3 rounded-xl hover:bg-teal-dark transition-colors">
          Try Again
        </button>
      </div>
    )
  }

  const q = questions[idx]
  const userAnswer = q.type === 'fill' ? fill : selected ?? ''
  const isCorrect = checked && (q.type === 'fill' ? normalize(userAnswer) === normalize(q.answer) : userAnswer === q.answer)
  const canSubmit = q.type === 'fill' ? fill.trim().length > 0 : selected !== null

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Progress */}
      <p className="text-center text-sm text-gray-400">{idx + 1} / {QUIZ_SIZE}</p>
      <div className="h-1 bg-gray-200 rounded">
        <div className="h-1 bg-teal rounded transition-all" style={{ width: `${(idx / QUIZ_SIZE) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="bg-teal rounded-2xl p-6 text-center">
        <p className="text-xs font-bold text-teal-light uppercase tracking-widest">
          {q.type === 'mc' ? 'What does this mean?' : q.type === 'reverse' ? 'How do you say in Chamorro?' : 'Type the Chamorro word for:'}
        </p>
        <p className="text-3xl font-extrabold text-white mt-3">
          {q.type === 'mc' ? q.word.chamorro : q.word.english}
        </p>
      </div>

      {/* Answer area */}
      {q.type === 'fill' ? (
        <div className="space-y-2">
          <input
            type="text"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !checked && canSubmit && check()}
            disabled={checked}
            placeholder="Type Chamorro word..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-teal"
          />
          {checked && (
            <div className={`rounded-xl p-3 text-center font-bold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isCorrect ? '✓ Correct!' : `✗ Answer: ${q.answer}`}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {q.options!.map((opt) => {
            let cls = 'w-full text-left p-4 rounded-xl border-2 font-medium transition-colors '
            if (checked) {
              if (opt === q.answer) cls += 'bg-green-100 border-green-400 text-green-800'
              else if (opt === selected && opt !== q.answer) cls += 'bg-red-100 border-red-300 text-red-800'
              else cls += 'bg-white border-gray-200 text-gray-400'
            } else {
              cls += opt === selected ? 'bg-teal/10 border-teal text-gray-800' : 'bg-white border-gray-200 text-gray-800 hover:border-teal/50'
            }
            return (
              <button key={opt} disabled={checked} onClick={() => setSelected(opt)} className={cls}>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Action */}
      {!checked ? (
        <button
          onClick={check}
          disabled={!canSubmit}
          className="w-full bg-teal text-white font-bold py-3 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <button onClick={next} className="w-full bg-teal text-white font-bold py-3 rounded-xl hover:bg-teal-dark transition-colors">
          {idx + 1 < QUIZ_SIZE ? 'Next Question ›' : 'See Results'}
        </button>
      )}
    </div>
  )
}
