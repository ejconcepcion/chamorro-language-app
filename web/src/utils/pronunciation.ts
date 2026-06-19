export interface PronunciationTip {
  char: string
  rule: string
}

export function getPronunciationTips(chamorro: string): PronunciationTip[] {
  const tips: PronunciationTip[] = []
  const w = chamorro.toLowerCase()
  if (/å/.test(w)) tips.push({ char: 'å', rule: '"a" as in father' })
  if (/ñ/.test(w)) tips.push({ char: 'ñ', rule: '"ny" like canyon' })
  if (/'/.test(w)) tips.push({ char: "'", rule: 'glottal stop — brief throat pause' })
  if (/ng/.test(w)) tips.push({ char: 'ng', rule: '"ng" as in sing' })
  if (/gu[aeiouå]/i.test(w)) tips.push({ char: 'gu', rule: '"gw" sound before vowels' })
  if (/hu[aeiouå]/i.test(w)) tips.push({ char: 'hu', rule: '"hw" sound before vowels' })
  return tips
}

// Highlight special chars in a word by wrapping them in marker spans (returns segments)
export interface Segment { text: string; highlight: boolean }

export function segmentWord(chamorro: string): Segment[] {
  const special = /[åñ']|ng|gu(?=[aeiouå])|hu(?=[aeiouå])/gi
  const segments: Segment[] = []
  let last = 0
  let match: RegExpExecArray | null
  while ((match = special.exec(chamorro)) !== null) {
    if (match.index > last) segments.push({ text: chamorro.slice(last, match.index), highlight: false })
    segments.push({ text: match[0], highlight: true })
    last = match.index + match[0].length
  }
  if (last < chamorro.length) segments.push({ text: chamorro.slice(last), highlight: false })
  return segments.length ? segments : [{ text: chamorro, highlight: false }]
}
