"""
Validates the Chamorro language content JSON files for completeness and consistency.
Run from the project root: python tools/validate_content.py
"""
import json
import sys
from pathlib import Path

CONTENT_DIR = Path(__file__).parent.parent / "content"

VOCAB_REQUIRED_FIELDS = {"id", "chamorro", "english", "category", "part_of_speech"}
LESSON_REQUIRED_FIELDS = {"id", "title", "subtitle", "category", "description", "vocabulary_ids"}
PHRASE_REQUIRED_FIELDS = {"id", "category", "chamorro", "english"}

VALID_CATEGORIES = {"greetings", "numbers", "colors", "family", "food", "time", "verbs", "body", "places", "grammar"}
VALID_POS = {"noun", "verb", "adjective", "adverb", "pronoun", "phrase", "number", "interjection"}


def load_json(path: Path) -> list:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def validate_vocabulary(vocab: list) -> list[str]:
    errors = []
    seen_ids = set()
    seen_chamorro = set()

    for i, word in enumerate(vocab):
        ctx = f"vocab[{i}] id={word.get('id', '?')}"

        missing = VOCAB_REQUIRED_FIELDS - set(word.keys())
        if missing:
            errors.append(f"{ctx}: missing fields: {missing}")
            continue

        wid = word["id"]
        if wid in seen_ids:
            errors.append(f"{ctx}: duplicate id '{wid}'")
        seen_ids.add(wid)

        chamorro = word["chamorro"].strip()
        if chamorro in seen_chamorro:
            errors.append(f"{ctx}: duplicate chamorro entry '{chamorro}'")
        seen_chamorro.add(chamorro)

        if word["category"] not in VALID_CATEGORIES:
            errors.append(f"{ctx}: invalid category '{word['category']}'. Valid: {VALID_CATEGORIES}")

        if word["part_of_speech"] not in VALID_POS:
            errors.append(f"{ctx}: invalid part_of_speech '{word['part_of_speech']}'. Valid: {VALID_POS}")

        if not word["english"].strip():
            errors.append(f"{ctx}: empty english translation")

    return errors


def validate_lessons(lessons: list, vocab_ids: set) -> list[str]:
    errors = []
    seen_ids = set()

    for i, lesson in enumerate(lessons):
        ctx = f"lesson[{i}] id={lesson.get('id', '?')}"

        missing = LESSON_REQUIRED_FIELDS - set(lesson.keys())
        if missing:
            errors.append(f"{ctx}: missing fields: {missing}")
            continue

        lid = lesson["id"]
        if lid in seen_ids:
            errors.append(f"{ctx}: duplicate lesson id {lid}")
        seen_ids.add(lid)

        if lesson["category"] not in VALID_CATEGORIES:
            errors.append(f"{ctx}: invalid category '{lesson['category']}'")

        for vid in lesson["vocabulary_ids"]:
            if vid not in vocab_ids:
                errors.append(f"{ctx}: references unknown vocabulary id '{vid}'")

    return errors


def validate_phrases(phrases: list) -> list[str]:
    errors = []
    seen_ids = set()

    for i, phrase in enumerate(phrases):
        ctx = f"phrase[{i}] id={phrase.get('id', '?')}"

        missing = PHRASE_REQUIRED_FIELDS - set(phrase.keys())
        if missing:
            errors.append(f"{ctx}: missing fields: {missing}")
            continue

        pid = phrase["id"]
        if pid in seen_ids:
            errors.append(f"{ctx}: duplicate id '{pid}'")
        seen_ids.add(pid)

        if not phrase["chamorro"].strip():
            errors.append(f"{ctx}: empty chamorro field")
        if not phrase["english"].strip():
            errors.append(f"{ctx}: empty english field")

    return errors


def main():
    all_errors = []
    all_ok = True

    print("=" * 60)
    print("Chamorro Content Validator")
    print("=" * 60)

    # Vocabulary
    vocab_path = CONTENT_DIR / "vocabulary.json"
    if not vocab_path.exists():
        print(f"ERROR: {vocab_path} not found")
        sys.exit(1)

    vocab = load_json(vocab_path)
    vocab_ids = {w["id"] for w in vocab if "id" in w}
    vocab_errors = validate_vocabulary(vocab)
    if vocab_errors:
        all_ok = False
        print(f"\nvocabulary.json — {len(vocab_errors)} error(s):")
        for e in vocab_errors:
            print(f"  [ERR] {e}")
    else:
        print(f"\nvocabulary.json -- OK ({len(vocab)} words, {len(set(w.get('category') for w in vocab))} categories)")

    # Lessons
    lessons_path = CONTENT_DIR / "lessons.json"
    if not lessons_path.exists():
        print(f"ERROR: {lessons_path} not found")
        sys.exit(1)

    lessons = load_json(lessons_path)
    lesson_errors = validate_lessons(lessons, vocab_ids)
    if lesson_errors:
        all_ok = False
        print(f"\nlessons.json -- {len(lesson_errors)} error(s):")
        for e in lesson_errors:
            print(f"  [ERR] {e}")
    else:
        print(f"lessons.json  -- OK ({len(lessons)} lessons)")

    # Phrases
    phrases_path = CONTENT_DIR / "phrases.json"
    if not phrases_path.exists():
        print(f"ERROR: {phrases_path} not found")
        sys.exit(1)

    phrases = load_json(phrases_path)
    phrase_errors = validate_phrases(phrases)
    if phrase_errors:
        all_ok = False
        print(f"\nphrases.json  -- {len(phrase_errors)} error(s):")
        for e in phrase_errors:
            print(f"  [ERR] {e}")
    else:
        print(f"phrases.json  — OK ({len(phrases)} phrases)")

    print("\n" + "=" * 60)
    if all_ok:
        print("All content valid. Ready to bundle into the app.")
        print("Next step: copy content/*.json to app/data/")
    else:
        all_errors_count = len(vocab_errors) + len(lesson_errors) + len(phrase_errors)
        print(f"Found {all_errors_count} error(s). Fix before bundling.")
        sys.exit(1)


if __name__ == "__main__":
    main()
