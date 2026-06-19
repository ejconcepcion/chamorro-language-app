import { useState, useEffect } from 'react'
import { getAllLessonProgress, completeLesson } from '../services/progress'
import lessonsData from '../data/lessons.json'
import vocabularyData from '../data/vocabulary.json'
import type { Lesson, VocabWord } from '../types'

const lessons = lessonsData as Lesson[]
const vocabulary = vocabularyData as VocabWord[]

function getWordsByIds(ids: string[]): VocabWord[] {
  return ids.map((id) => vocabulary.find((w) => w.id === id)).filter(Boolean) as VocabWord[]
}

function LessonDetail({
  lesson,
  completed,
  onComplete,
  onBack,
}: {
  lesson: Lesson
  completed: boolean
  onComplete: () => void
  onBack: () => void
}) {
  const words = getWordsByIds(lesson.vocabulary_ids)

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-teal px-6 pt-6 pb-8">
        <button onClick={onBack} className="text-teal-light text-sm mb-4 block">‹ Back to Lessons</button>
        <h1 className="text-2xl font-extrabold text-white">{lesson.title}</h1>
        <p className="text-teal-light text-sm mt-1">{lesson.subtitle}</p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Description */}
        <div>
          <h2 className="text-xs font-bold text-teal uppercase tracking-widest mb-2">About This Lesson</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{lesson.description}</p>
        </div>

        {/* Grammar Note */}
        {lesson.grammar_note && (
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4">
            <p className="text-xs font-bold text-teal uppercase tracking-widest mb-2">Grammar Note</p>
            <p className="text-blue-900 text-sm leading-relaxed">{lesson.grammar_note}</p>
          </div>
        )}

        {/* Cultural Note */}
        {lesson.cultural_note && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Cultural Context</p>
            <p className="text-amber-900 text-sm leading-relaxed">{lesson.cultural_note}</p>
          </div>
        )}

        {/* Vocabulary */}
        <div>
          <h2 className="text-xs font-bold text-teal uppercase tracking-widest mb-3">
            Vocabulary ({words.length} words)
          </h2>
          <div className="space-y-2">
            {words.map((word) => (
              <div key={word.id} className="bg-white rounded-xl p-3 flex gap-4 shadow-sm">
                <div className="flex-1">
                  <p className="font-bold text-teal">{word.chamorro}</p>
                  <p className="text-xs text-gray-400 italic">{word.part_of_speech}</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{word.english}</p>
                  {word.example_chamorro && (
                    <p className="text-xs text-gray-400 italic mt-0.5">{word.example_chamorro}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete button */}
        {completed ? (
          <div className="bg-green-100 rounded-xl p-4 text-center text-green-800 font-bold">
            ✓ Lesson Complete
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="w-full bg-teal text-white font-bold py-4 rounded-xl hover:bg-teal-dark transition-colors"
          >
            Mark as Complete ✓
          </button>
        )}
      </div>
    </div>
  )
}

export default function LessonsPage() {
  const [progress, setProgress] = useState<Record<number, boolean>>({})
  const [selected, setSelected] = useState<Lesson | null>(null)

  useEffect(() => { setProgress(getAllLessonProgress()) }, [])

  function handleComplete(id: number) {
    completeLesson(id)
    setProgress(getAllLessonProgress())
  }

  function isUnlocked(lesson: Lesson): boolean {
    return lesson.unlock_requires === null || !!progress[lesson.unlock_requires]
  }

  if (selected) {
    return (
      <LessonDetail
        lesson={selected}
        completed={!!progress[selected.id]}
        onComplete={() => handleComplete(selected.id)}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-gray-800">Lessons</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">10 lessons covering everyday Chamorro</p>

      <div className="space-y-3">
        {lessons.map((lesson, i) => {
          const completed = !!progress[lesson.id]
          const unlocked = isUnlocked(lesson)
          return (
            <button
              key={lesson.id}
              onClick={() => unlocked && setSelected(lesson)}
              disabled={!unlocked}
              className={`w-full flex items-center bg-white rounded-2xl p-4 shadow-sm text-left transition-shadow
                ${unlocked ? 'hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0
                ${completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                <span className="font-bold text-sm">{completed ? '✓' : i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{lesson.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {unlocked ? lesson.subtitle : '🔒 Complete previous lesson to unlock'}
                </p>
              </div>
              {unlocked && <span className="text-gray-300 text-xl ml-2">›</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
