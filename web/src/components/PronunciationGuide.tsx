interface Props { onClose: () => void }

const SOUNDS = [
  { label: 'å', desc: 'Open "a" as in father', example: 'Håfa, Guåhan, Tåno\'' },
  { label: 'ñ', desc: '"ny" like canyon', example: 'Ñalang, Señot' },
  { label: "'", desc: 'Glottal stop — a brief pause in the throat, like the break in "uh‑oh"', example: 'Tåno\', famagu\'on' },
  { label: 'ng', desc: '"ng" as in sing — can appear at the start of words', example: 'Nginge\'' },
  { label: 'gu', desc: '"gw" before vowels', example: 'Guåhan' },
  { label: 'hu', desc: '"hw" before vowels', example: 'Håfa' },
]

const VOWELS = [
  { v: 'a', sound: '"ah"' }, { v: 'e', sound: '"eh"' },
  { v: 'i', sound: '"ee"' }, { v: 'o', sound: '"oh"' }, { v: 'u', sound: '"oo"' },
]

const EXAMPLES = [
  { word: 'Håfa', phonetic: 'HAH-fah', meaning: 'what / hello' },
  { word: 'Maolek', phonetic: 'mow-LEK', meaning: 'good' },
  { word: 'Guåhan', phonetic: 'GWAH-han', meaning: 'Guam' },
  { word: 'Håfa Adai', phonetic: 'HAH-fah ah-DIE', meaning: 'hello / greetings' },
  { word: 'Si Yu\'os Ma\'åse\'', phonetic: 'see JUS mah-AH-se\'', meaning: 'thank you' },
]

export function PronunciationGuide({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div
        className="relative bg-white rounded-t-2xl mt-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="mx-auto w-10 h-1 bg-gray-300 rounded absolute top-2 left-1/2 -translate-x-1/2" />
          <h2 className="text-lg font-extrabold text-gray-800 mt-4">Chamorro Pronunciation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl mt-4">✕</button>
        </div>

        <div className="px-4 py-5 space-y-6">
          {/* Vowels */}
          <section>
            <h3 className="text-xs font-bold text-teal uppercase tracking-widest mb-3">Vowels</h3>
            <p className="text-xs text-gray-500 mb-3">Chamorro vowels are pure and consistent — once you know them, they never change.</p>
            <div className="grid grid-cols-5 gap-2">
              {VOWELS.map(({ v, sound }) => (
                <div key={v} className="bg-teal/10 rounded-xl p-2 text-center">
                  <p className="text-xl font-extrabold text-teal">{v}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sound}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Special sounds */}
          <section>
            <h3 className="text-xs font-bold text-teal uppercase tracking-widest mb-3">Special Sounds</h3>
            <div className="space-y-3">
              {SOUNDS.map(({ label, desc, example }) => (
                <div key={label} className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-extrabold text-coral">{label}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5 italic">e.g. {example}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stress */}
          <section className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Word Stress</p>
            <p className="text-sm text-amber-900 leading-relaxed">
              Stress usually falls on the <strong>second-to-last syllable</strong> — e.g. <em>MA-o-lek</em>, <em>GUÅ-han</em>.
              The glottal stop (') can also shift emphasis.
            </p>
          </section>

          {/* Word examples */}
          <section>
            <h3 className="text-xs font-bold text-teal uppercase tracking-widest mb-3">Common Words</h3>
            <div className="space-y-2">
              {EXAMPLES.map(({ word, phonetic, meaning }) => (
                <div key={word} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{word}</p>
                    <p className="text-xs text-gray-400 italic">{meaning}</p>
                  </div>
                  <p className="text-sm font-mono text-teal font-semibold">{phonetic}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-xs text-gray-400 text-center pb-2">
            Fino' CHamoru — the language of Guåhan &amp; the Marianas
          </p>
        </div>
      </div>
    </div>
  )
}
