import { useState, useMemo } from 'react'
import { segmentWord, getPronunciationTips } from '../utils/pronunciation'
import vocabulary from '../data/vocabulary.json'
import type { VocabWord } from '../types'

const words = vocabulary as VocabWord[]

function search(query: string): VocabWord[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return words.filter(
    (w) =>
      w.english.toLowerCase().includes(q) ||
      w.chamorro.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q)
  )
}

function WordCard({ word }: { word: VocabWord }) {
  const [expanded, setExpanded] = useState(false)
  const tips = getPronunciationTips(word.chamorro)
  const segments = segmentWord(word.chamorro)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xl font-extrabold text-ocean leading-tight">
            {segments.map((seg, i) =>
              seg.highlight
                ? <span key={i} className="text-coral">{seg.text}</span>
                : <span key={i}>{seg.text}</span>
            )}
          </p>
          <p className="text-gray-700 font-medium mt-0.5">{word.english}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs bg-teal/10 text-teal font-semibold px-2 py-0.5 rounded-full">
            {word.category}
          </span>
          <span className="text-xs text-gray-400 italic">{word.part_of_speech}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50">
          {word.example_chamorro && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Example</p>
              <p className="text-sm text-teal italic">"{word.example_chamorro}"</p>
              <p className="text-xs text-gray-500 mt-0.5">{word.example_english}</p>
            </div>
          )}
          {tips.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pronunciation</p>
              <div className="flex flex-wrap gap-2">
                {tips.map((tip) => (
                  <span key={tip.char} className="inline-flex items-center gap-1 bg-coral/10 rounded-lg px-2 py-1">
                    <span className="font-bold text-coral text-xs font-mono">{tip.char}</span>
                    <span className="text-xs text-gray-600">{tip.rule}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </button>
  )
}

const CATEGORIES = [...new Set(words.map((w) => w.category))].sort()

export default function DictionaryPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const results = useMemo(() => {
    if (query.trim()) return search(query)
    if (activeCategory) return words.filter((w) => w.category === activeCategory)
    return []
  }, [query, activeCategory])

  const showBrowse = !query.trim() && !activeCategory

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-64px)]">
      {/* Search header */}
      <div className="bg-ocean px-4 pt-8 pb-4">
        <p className="text-teal-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Dictionary</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveCategory(null) }}
            placeholder="Search English or Chamorro…"
            autoComplete="off"
            className="w-full bg-white rounded-xl pl-10 pr-10 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {showBrowse && (
          <>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Browse by Category</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const count = words.filter((w) => w.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="bg-white rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-shadow border-l-4 border-teal"
                  >
                    <p className="font-bold text-gray-800 capitalize">{cat}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{count} words</p>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {activeCategory && !query && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest capitalize">{activeCategory}</p>
            <button onClick={() => setActiveCategory(null)} className="text-xs text-teal underline">
              ← All categories
            </button>
          </div>
        )}

        {results.length > 0 && (
          <>
            {query && (
              <p className="text-xs text-gray-400">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
            )}
            {results.map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </>
        )}

        {!showBrowse && results.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No results found</p>
            <p className="text-sm mt-1">Try a different word or browse by category</p>
          </div>
        )}
      </div>
    </div>
  )
}
