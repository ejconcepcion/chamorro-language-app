"""
Generates or updates content/lessons.json based on vocabulary categories.

Usage:
  python tools/build_lessons.py

This tool reads content/vocabulary.json and:
- Groups words by category
- Reports which lesson categories have vocabulary coverage
- Optionally regenerates vocabulary_ids lists in existing lessons

This is a helper/audit tool — lesson content (title, description, grammar notes, etc.)
should be written manually and preserved. This tool only manages the vocabulary_ids arrays.
"""
import json
from pathlib import Path
from collections import defaultdict

CONTENT_DIR = Path(__file__).parent.parent / "content"
VOCAB_PATH = CONTENT_DIR / "vocabulary.json"
LESSONS_PATH = CONTENT_DIR / "lessons.json"

CATEGORY_ORDER = ["greetings", "numbers", "colors", "family", "food", "time", "verbs", "body", "places", "grammar"]


def main():
    if not VOCAB_PATH.exists():
        print(f"ERROR: {VOCAB_PATH} not found. Run build_vocabulary.py first.")
        return

    with open(VOCAB_PATH, encoding="utf-8") as f:
        vocab = json.load(f)

    by_category = defaultdict(list)
    for word in vocab:
        cat = word.get("category", "unknown")
        by_category[cat].append(word["id"])

    print("=" * 60)
    print("Vocabulary Coverage by Category")
    print("=" * 60)
    for cat in CATEGORY_ORDER:
        ids = by_category.get(cat, [])
        print(f"  {cat:<12} {len(ids):>3} words   ids: {ids[:5]}{'...' if len(ids) > 5 else ''}")

    unknown = [cat for cat in by_category if cat not in CATEGORY_ORDER]
    if unknown:
        print(f"\nUnknown categories: {unknown}")

    if not LESSONS_PATH.exists():
        print(f"\nNo lessons.json found at {LESSONS_PATH}.")
        print("Create it manually using the lesson schema in workflows/source_chamorro_content.md")
        return

    with open(LESSONS_PATH, encoding="utf-8") as f:
        lessons = json.load(f)

    print("\n" + "=" * 60)
    print("Syncing vocabulary_ids into lessons...")
    print("=" * 60)

    updated = False
    for lesson in lessons:
        cat = lesson.get("category")
        if not cat:
            continue
        current_ids = set(lesson.get("vocabulary_ids", []))
        available_ids = set(by_category.get(cat, []))
        missing = available_ids - current_ids
        if missing:
            print(f"\n  Lesson {lesson['id']} '{lesson['title']}' ({cat}):")
            print(f"    {len(missing)} vocab IDs in this category not yet in lesson: {sorted(missing)}")
            print(f"    Add them manually to preserve your lesson ordering.")
        else:
            print(f"  Lesson {lesson['id']} '{lesson['title']}' — vocab_ids up to date ({len(current_ids)} words)")

    print("\nDone. Edit lessons.json manually to add new vocabulary_ids.")
    print("Run 'python tools/validate_content.py' when ready.")


if __name__ == "__main__":
    main()
