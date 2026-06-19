# Workflow: Source Chamorro Language Content

## Objective
Build and maintain the canonical Chamorro language content files used by the mobile app: `content/vocabulary.json`, `content/lessons.json`, and `content/phrases.json`.

## Required Inputs
- Raw word list (TSV or CSV) OR direct content entry
- Lesson structure definition (categories, ordering)
- Validation rules (required fields, allowed parts of speech, etc.)

## Tools
- `tools/build_vocabulary.py` — normalizes raw word data into `content/vocabulary.json`
- `tools/build_lessons.py` — assembles lesson JSON from vocabulary + lesson definitions
- `tools/validate_content.py` — validates all three content JSON files

## Vocabulary JSON Schema

Each word in `content/vocabulary.json`:
```json
{
  "id": "string (zero-padded, e.g. '001')",
  "chamorro": "string (use å for the Chamorro 'a with ring')",
  "english": "string",
  "category": "one of: greetings, numbers, colors, family, food, time, verbs, body, places, grammar",
  "part_of_speech": "one of: noun, verb, adjective, adverb, pronoun, phrase, number, interjection",
  "example_chamorro": "string (optional but preferred)",
  "example_english": "string (optional but preferred)"
}
```

## Lesson JSON Schema

Each lesson in `content/lessons.json`:
```json
{
  "id": "number",
  "title": "string",
  "subtitle": "string",
  "category": "string (matches vocabulary category)",
  "description": "string",
  "vocabulary_ids": ["array of vocabulary IDs covered in this lesson"],
  "grammar_note": "string (optional grammar explanation)",
  "cultural_note": "string (optional cultural context)",
  "completed": false
}
```

## Content Categories (10 lessons)
1. greetings — Greetings & Farewells
2. numbers — Numbers 1–20
3. colors — Colors
4. family — Family Members
5. food — Food & Drinks
6. time — Days, Months & Time
7. verbs — Common Verbs
8. body — Body Parts
9. places — Places & Directions
10. grammar — Basic Sentence Structure

## Key Chamorro Orthography Notes
- **å** (a with ring) = the "a" sound in Chamorro (e.g., *håfa* = what)
- **'** (glottal stop / ʼ) = used before vowels in some words (e.g., *na'an* = name)
- **ch** = /tʃ/ as in "church"
- **ng** = /ŋ/ as in "sing"
- **ñ** = /ɲ/ as in Spanish "mañana"

## Trusted Sources
- University of Guam Chamorro Studies resources
- Guam Public Library Chamorro language materials
- Wikipedia: Chamorro language, Chamorro people
- chamorro.com dictionary
- Kumisión i Fino' CHamoru (Guam's Chamorro Language Commission)

## Procedure
1. Collect raw word data from trusted sources above
2. Run `python tools/build_vocabulary.py --input <raw_file> --output content/vocabulary.json`
3. Run `python tools/build_lessons.py --vocab content/vocabulary.json --output content/lessons.json`
4. Run `python tools/validate_content.py` — fix any reported errors
5. Copy updated JSON files to `app/data/` for bundling with the app
6. Test in the app: flashcards and lessons should reflect the new content

## Edge Cases
- Chamorro words with the glottal stop (ʼ) must be preserved exactly — don't strip punctuation
- Multiple English translations: use " / " separator (e.g., "hello / welcome")
- Words that appear in multiple categories: assign the primary category only
- Audio file names (future): should be `{id}_{chamorro_slug}.mp3` with glottal stops replaced by underscore
