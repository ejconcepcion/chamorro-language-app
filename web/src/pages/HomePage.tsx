import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDueCardIds, getTotalReviewed, getStreak } from '../services/progress'
import { segmentWord } from '../utils/pronunciation'
import { PronunciationGuide } from '../components/PronunciationGuide'
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
  const [showGuide, setShowGuide] = useState(false)
  const daily = getDailyWord()

  useEffect(() => {
    setDueCount(getDueCardIds().length)
    setTotalReviewed(getTotalReviewed())
    setStreak(getStreak())
  }, [])

  const dailySegments = segmentWord(daily.chamorro)

  return (
    <>
      {showGuide && <PronunciationGuide onClose={() => setShowGuide(false)} />}

      {/* Island hero */}
      <div className="bg-ocean rounded-b-3xl px-5 pt-10 pb-8 shadow-lg">
        <p className="text-teal-light text-xs font-bold tracking-[0.2em] uppercase">Fino' CHamoru</p>
        <h1 className="text-4xl font-extrabold text-white mt-1 leading-tight">Håfa Adai! 🌊</h1>
        <p className="text-teal-light/70 text-sm mt-1">The language of Guåhan &amp; the Marianas</p>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-5 pt-5 pb-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-coral">{streak}</p>
            <p className="text-xs text-gray-400 mt-1">Day Streak 🔥</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-teal">{totalReviewed}</p>
            <p className="text-xs text-gray-400 mt-1">Words Learned</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-teal">{dueCount}</p>
            <p className="text-xs text-gray-400 mt-1">Cards Due</p>
          </div>
        </div>

        {/* Daily word */}
        <div className="bg-teal rounded-2xl overflow-hidden shadow-md">
          <div className="px-5 pt-5 pb-4">
            <p className="text-xs font-bold tracking-widest text-teal-light/70 uppercase">Word of the Day</p>
            <p className="text-4xl font-extrabold text-white mt-2">
              {dailySegments.map((seg, i) =>
                seg.highlight
                  ? <span key={i} className="text-coral-light">{seg.text}</span>
                  : <span key={i}>{seg.text}</span>
              )}
            </p>
            <p className="text-lg text-teal-light mt-1">{daily.english}</p>
            {daily.example_chamorro && (
              <p className="text-sm text-teal-light/70 mt-2 italic">"{daily.example_chamorro}"</p>
            )}
          </div>
          <div className="bg-teal-dark px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-teal-light/60">{daily.category} · {daily.part_of_speech}</p>
            <button onClick={() => setShowGuide(true)} className="text-xs text-teal-light underline underline-offset-2">
              How to pronounce?
            </button>
          </div>
        </div>

        {/* Practice */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Practice</p>
          <div className="space-y-3">
            <Link to="/flashcards" className="flex items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-coral">
              <span className="text-2xl w-10">🃏</span>
              <div className="flex-1 pl-3">
                <p className="font-bold text-gray-800">Flashcards</p>
                <p className="text-xs text-gray-500">
                  {dueCount > 0 ? `${dueCount} card${dueCount !== 1 ? 's' : ''} due for review` : 'Spaced repetition study'}
                </p>
              </div>
              <span className="text-coral font-bold text-xl">›</span>
            </Link>

            <Link to="/lessons" className="flex items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-teal">
              <span className="text-2xl w-10">📖</span>
              <div className="flex-1 pl-3">
                <p className="font-bold text-gray-800">Lessons</p>
                <p className="text-xs text-gray-500">10 lessons with grammar &amp; cultural notes</p>
              </div>
              <span className="text-teal font-bold text-xl">›</span>
            </Link>

            <Link to="/quiz" className="flex items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-teal">
              <span className="text-2xl w-10">✏️</span>
              <div className="flex-1 pl-3">
                <p className="font-bold text-gray-800">Quiz</p>
                <p className="text-xs text-gray-500">Test yourself with 10-question sessions</p>
              </div>
              <span className="text-teal font-bold text-xl">›</span>
            </Link>
          </div>
        </div>

        {/* Pronunciation guide */}
        <button
          onClick={() => setShowGuide(true)}
          className="w-full flex items-center bg-coral/10 border border-coral/20 rounded-2xl p-4 text-left hover:bg-coral/15 transition-colors"
        >
          <span className="text-2xl w-10">🗣️</span>
          <div className="flex-1 pl-3">
            <p className="font-bold text-coral-dark">Pronunciation Guide</p>
            <p className="text-xs text-gray-500">Learn å, ñ, glottal stops &amp; more</p>
          </div>
          <span className="text-coral font-bold text-xl">›</span>
        </button>

        {/* Cultural note */}
        <div className="bg-ocean/5 border border-ocean/10 rounded-2xl p-4">
          <p className="text-xs font-bold text-ocean uppercase tracking-widest mb-1">Did you know?</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Fino' CHamoru is one of the oldest Pacific languages — spoken in Guåhan, Saipan,
            and the Marianas for over 3,500 years. With about 45,000 speakers worldwide,
            every word you learn helps preserve an irreplaceable piece of Pacific heritage.
          </p>
        </div>
      </div>
    </>
  )
}
