"""One-shot script to remove duplicate vocabulary entries and update lesson references."""
import json
from pathlib import Path

CONTENT_DIR = Path(__file__).parent.parent / "content"

# Duplicate IDs to remove (lower-priority entries; canonical entries kept)
REMOVE_IDS = {"144", "186", "203", "218", "242", "243"}

# For lesson vocab_ids: replace removed ID with canonical ID where appropriate
# format: {removed_id: canonical_id_or_None}
REPLACEMENTS = {
    "144": "012",   # maolek body -> greetings entry
    "186": "122",   # para grammar -> verbs entry
    "203": "068",   # palao'an dup -> family entry
    "218": "079",   # hanom dup -> food entry
    "242": "002",   # hafa dup -> greetings entry
    "243": "182",   # nai dup -> grammar entry
}

def main():
    # Fix vocabulary.json
    vocab_path = CONTENT_DIR / "vocabulary.json"
    with open(vocab_path, encoding="utf-8") as f:
        vocab = json.load(f)

    before = len(vocab)
    vocab = [w for w in vocab if w["id"] not in REMOVE_IDS]
    after = len(vocab)
    print(f"vocabulary.json: removed {before - after} duplicates ({before} -> {after})")

    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)

    # Fix lessons.json
    lessons_path = CONTENT_DIR / "lessons.json"
    with open(lessons_path, encoding="utf-8") as f:
        lessons = json.load(f)

    for lesson in lessons:
        original = lesson["vocabulary_ids"][:]
        updated = []
        for vid in original:
            if vid in REMOVE_IDS:
                replacement = REPLACEMENTS.get(vid)
                if replacement and replacement not in updated:
                    updated.append(replacement)
                    print(f"  Lesson {lesson['id']}: replaced '{vid}' -> '{replacement}'")
                else:
                    print(f"  Lesson {lesson['id']}: dropped '{vid}' (no replacement needed)")
            else:
                updated.append(vid)
        lesson["vocabulary_ids"] = updated

    with open(lessons_path, "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)

    print("\nDone. Re-run validate_content.py to confirm.")

if __name__ == "__main__":
    main()
