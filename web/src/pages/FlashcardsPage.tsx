import { useState, useEffect } from 'react'
import { getDueCardIds, updateCardProgress, recordDailyReview } from '../services/progress'
import { segmentWord, getPronunciationTips } from '../utils/pronunciation'
import { PronunciationGuide } from '../components/PronunciationGuide'
import vocabulary from '../data/vocabulary.json'
import type { VocabWord, RecallRating } from '../types'

const words = vocabulary as VocabWord[]

function getWordById(id: string): VocabWord | undefined {
  return words.find((w) => w.id === id)
}

function getRandomWords(excludeIds: Set<string>, count: number): VocabWord[] {
  return [...words]
    .filter((w) => !excludeIds.has(w.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

const RATINGS: { label: string; sub: string; rating: RecallRating; color: string }[] = [
  { label: 'Again', sub: 'Forgot', rating: 0, color: 'bg-red-100 hover:bg-red-200 text-red-800' },
  { label: 'Hard', sub: 'Difficult', rating: 1, color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
  { label: 'Good', sub: 'Recalled', rating: 2, color: 'bg-green-100 hover:bg-green-200 text-green-800' },
  { label: 'Easy', sub: 'Simple', rating: 3, color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
]

export default function FlashcardsPage() {
  const [cards, setCards] = useState<VocabWord[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => { loadCards() }, [])

  function loadCards() {
    setLoading(true)
    const dueIds = getDueCardIds(20)
    const dueWords = dueIds.map(getWordById).filter(Boolean) as VocabWord[]
    const extra = getRandomWords(new Set(dueIds), Math.max(0, 15 - dueWords.length))
    setCards([...dueWords, ...extra])
    setIndex(0); setFlipped(false); setDone(false); setReviewed(0)
    setLoading(false)
  }

  async function rate(rating: RecallRating) {
    updateCardProgress(cards[index].id, rating)
    recordDailyReview()
    const next = index + 1
    if (next >= cards.length) { setDone(true) } else { setFlipped(false); setIndex(next) }
    setReviewed((r) => r + 1)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-teal text-xl">Loading...</div>

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-4">
      <p className="text-6xl">🌊</p>
      <h2 className="text-2xl font-extrabold text-gray-800">Session Complete!</h2>
      <p className="text-gray-500">You reviewed <span className="font-bold text-teal">{reviewed}</span> cards.</p>
      <p className="text-sm text-gray-400">Maolek! Keep riding the wave.</p>
      <button onClick={loadCards} className="mt-4 bg-teal text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-dark transition-colors">
        Study More
      </button>
    </div>
  )

  const word = cards[index]
  const tips = getPronunciationTips(word.chamorro)
  const segments = segmentWord(word.chamorro)

  return (
    <>
      {showGuide && <PronunciationGuide onClose={() => setShowGuide(false)} />}

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col h-[calc(100vh-80px)]">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">{index + 1} / {cards.length}</p>
          <button onClick={() => setShowGuide(true)} className="text-xs text-teal underline underline-offset-2">
            Pronunciation guide
          </button>
        </div>
        <div className="h-1 bg-gray-200 rounded mb-6">
          <div className="h-1 bg-coral rounded transition-all" style={{ width: `${(index / cards.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div className="flex-1 cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped(!flipped)}>
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front */}
            <div className="absolute inset-0 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center p-8 backface-hidden">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">{word.category}</p>
              <p className="text-5xl font-extrabold text-ocean mt-4 text-center">
                {segments.map((seg, i) =>
                  seg.highlight
                    ? <span key={i} className="text-coral">{seg.text}</span>
                    : <span key={i}>{seg.text}</span>
                )}
              </p>
              <p className="text-sm text-gray-400 mt-3 italic">{word.part_of_speech}</p>
              <p className="text-gray-300 text-sm mt-8">Tap to reveal ›</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-teal rounded-2xl shadow-md flex flex-col p-6 overflow-hidden"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {/* Category tag */}
              <p className="text-xs font-bold text-teal-light/70 uppercase tracking-widest">{word.category}</p>

              {/* English */}
              <p className="text-4xl font-extrabold text-white mt-2 text-center flex-shrink-0">{word.english}</p>

              {/* Chamorro word (smaller, reference) */}
              <p className="text-center text-teal-light/80 mt-1 text-lg">
                {segments.map((seg, i) =>
                  seg.highlight
                    ? <span key={i} className="text-coral-light font-bold">{seg.text}</span>
                    : <span key={i}>{seg.text}</span>
                )}
              </p>

              {/* Example */}
              {word.example_chamorro && (
                <div className="mt-3 text-center">
                  <p className="text-teal-light italic text-sm">"{word.example_chamorro}"</p>
                  <p className="text-teal-light/70 text-xs mt-1">{word.example_english}</p>
                </div>
              )}

              {/* Pronunciation tips */}
              {tips.length > 0 && (
                <div className="mt-auto pt-3 border-t border-teal-dark/40">
                  <p className="text-xs font-bold text-teal-light/70 uppercase tracking-widest mb-1.5">Pronunciation</p>
                  <div className="space-y-1">
                    {tips.map((tip) => (
                      <div key={tip.char} className="flex items-center gap-2">
                        <span className="bg-teal-dark rounded px-1.5 py-0.5 text-coral-light text-xs font-bold font-mono">{tip.char}</span>
                        <span className="text-xs text-teal-light/80">{tip.rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        <div className="mt-6">
          {flipped ? (
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map(({ label, sub, rating, color }) => (
                <button
                  key={label}
                  onClick={() => rate(rating)}
                  className={`${color} rounded-xl py-3 text-center font-bold text-sm transition-colors`}
                >
                  <div>{label}</div>
                  <div className="text-xs font-normal opacity-70">{sub}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">Tap the card to flip it</p>
          )}
        </div>
      </div>
    </>
  )
}
