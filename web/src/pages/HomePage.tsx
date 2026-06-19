import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDueCardIds, getTotalReviewed, getStreak } from '../services/progress'
import vocabulary from '../data/vocabulary.json'
import type { VocabWord } from '../types'

const words = vocabulary as VocabWord[]

function getDailyWord(): VocabWord {
  return words[Math.floor(Date.now() / 86400000) % words.length]
}

export default function HomePage() {
  const [dueCount, setDueCount] = useState(0)
  const [totalReviewed, setTotalReviewed] = useState(0)
  const [streak, setStreak] = useState(0)
  const daily = getDailyWord()

  useEffect(() => {
    setDueCount(getDueCardIds().length)
    setTotalReviewed(getTotalReviewed())
    setStreak(getStreak())
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">Håfa Adai! 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Learn the language of Guam &amp; the Marianas</p>
      </div>

      {/* Daily Word */}
      <div className="bg-teal rounded-2xl p-6 text-white">
        <p className="text-xs font-bold tracking-widest text-teal-light uppercase">Word of the Day</p>
        <p className="text-4xl font-extrabold mt-2">{daily.chamorro}</p>
        <p className="text-lg text-teal-light mt-1">{daily.english}</p>
        {daily.example_chamorro && (
          <p className="text-sm text-teal-light/80 mt-3 italic">"{daily.example_chamorro}"</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: streak, label: 'Day Streak 🔥' },
          { val: totalReviewed, label: 'Words Learned' },
          { val: dueCount, label: 'Cards Due' },
        ].map(({ val, label }) => (
          <div key={label} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-teal">{val}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-bold text-gray-800">Practice</h2>
      <div className="space-y-3">
        <Link to="/flashcards" className="flex items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl w-12">📚</span>
          <div className="flex-1 pl-2">
            <p className="font-bold text-gray-800">Flashcards</p>
            <p className="text-sm text-gray-500">
              {dueCount > 0 ? `${dueCount} card${dueCount !== 1 ? 's' : ''} due for review` : 'Study vocabulary with spaced repetition'}
            </p>
          </div>
          <span className="text-gray-300 text-2xl">›</span>
        </Link>

        <Link to="/lessons" className="flex items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl w-12">📖</span>
          <div className="flex-1 pl-2">
            <p className="font-bold text-gray-800">Lessons</p>
            <p className="text-sm text-gray-500">10 structured lessons with grammar &amp; culture notes</p>
          </div>
          <span className="text-gray-300 text-2xl">›</span>
        </Link>

        <Link to="/quiz" className="flex items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl w-12">✏️</span>
          <div className="flex-1 pl-2">
            <p className="font-bold text-gray-800">Quiz</p>
            <p className="text-sm text-gray-500">Test your knowledge with 10-question quizzes</p>
          </div>
          <span className="text-gray-300 text-2xl">›</span>
        </Link>
      </div>

      {/* Cultural note */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
        <p className="text-sm font-bold text-amber-800 mb-1">Did you know?</p>
        <p className="text-sm text-amber-700 leading-relaxed">
          Chamorro is the native language of Guam (Guåhan), Saipan, and the other Mariana Islands.
          With about 45,000 speakers worldwide, learning Chamorro helps preserve an endangered Pacific heritage.
        </p>
      </div>
    </div>
  )
}
