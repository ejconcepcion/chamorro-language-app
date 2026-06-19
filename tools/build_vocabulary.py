"""
Converts a raw TSV/CSV word list into a normalized content/vocabulary.json file.

Usage:
  python tools/build_vocabulary.py --input raw_words.tsv --output content/vocabulary.json

TSV format (tab-separated, with header row):
  chamorro  english  category  part_of_speech  example_chamorro  example_english

The tool will:
- Assign sequential IDs starting from the current max ID + 1
- Strip and normalize whitespace
- Validate category and part_of_speech fields
- Merge with existing vocabulary.json (no duplicates by chamorro field)
- Output sorted by category then by id
"""
import argparse
import csv
import json
import sys
from pathlib import Path

CONTENT_DIR = Path(__file__).parent.parent / "content"
VOCAB_PATH = CONTENT_DIR / "vocabulary.json"

VALID_CATEGORIES = {"greetings", "numbers", "colors", "family", "food", "time", "verbs", "body", "places", "grammar"}
VALID_POS = {"noun", "verb", "adjective", "adverb", "pronoun", "phrase", "number", "interjection"}


def load_existing_vocab() -> tuple[list, set, int]:
    if not VOCAB_PATH.exists():
        return [], set(), 0
    with open(VOCAB_PATH, encoding="utf-8") as f:
        vocab = json.load(f)
    existing_chamorro = {w["chamorro"].strip().lower() for w in vocab}
    max_id = max((int(w["id"]) for w in vocab if w.get("id", "0").isdigit()), default=0)
    return vocab, existing_chamorro, max_id


def parse_tsv(path: str) -> list[dict]:
    rows = []
    with open(path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            rows.append({k.strip(): v.strip() for k, v in row.items()})
    return rows


def validate_row(row: dict, line_num: int) -> list[str]:
    errors = []
    for field in ("chamorro", "english", "category", "part_of_speech"):
        if not row.get(field):
            errors.append(f"Line {line_num}: missing '{field}'")
    if row.get("category") and row["category"] not in VALID_CATEGORIES:
        errors.append(f"Line {line_num}: invalid category '{row['category']}'. Valid: {sorted(VALID_CATEGORIES)}")
    if row.get("part_of_speech") and row["part_of_speech"] not in VALID_POS:
        errors.append(f"Line {line_num}: invalid part_of_speech '{row['part_of_speech']}'. Valid: {sorted(VALID_POS)}")
    return errors


def main():
    parser = argparse.ArgumentParser(description="Build vocabulary.json from a raw TSV word list")
    parser.add_argument("--input", required=True, help="Path to raw TSV file")
    parser.add_argument("--output", default=str(VOCAB_PATH), help="Output JSON path")
    parser.add_argument("--dry-run", action="store_true", help="Validate only, don't write")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"ERROR: Input file not found: {input_path}")
        sys.exit(1)

    existing_vocab, existing_chamorro, max_id = load_existing_vocab()
    raw_rows = parse_tsv(str(input_path))

    all_errors = []
    new_entries = []
    skipped = 0
    next_id = max_id + 1

    for i, row in enumerate(raw_rows, start=2):
        errors = validate_row(row, i)
        if errors:
            all_errors.extend(errors)
            continue

        chamorro_key = row["chamorro"].strip().lower()
        if chamorro_key in existing_chamorro:
            print(f"  SKIP (duplicate): '{row['chamorro']}'")
            skipped += 1
            continue

        entry = {
            "id": str(next_id).zfill(3),
            "chamorro": row["chamorro"].strip(),
            "english": row["english"].strip(),
            "category": row["category"].strip(),
            "part_of_speech": row["part_of_speech"].strip(),
            "example_chamorro": row.get("example_chamorro", "").strip(),
            "example_english": row.get("example_english", "").strip(),
        }
        new_entries.append(entry)
        existing_chamorro.add(chamorro_key)
        next_id += 1

    if all_errors:
        print(f"\n{len(all_errors)} validation error(s):")
        for e in all_errors:
            print(f"  ✗ {e}")
        sys.exit(1)

    print(f"\nResults:")
    print(f"  New entries: {len(new_entries)}")
    print(f"  Skipped (duplicates): {skipped}")
    print(f"  Existing entries: {len(existing_vocab)}")
    print(f"  Total after merge: {len(existing_vocab) + len(new_entries)}")

    if args.dry_run:
        print("\nDry run — no files written.")
        return

    merged = existing_vocab + new_entries
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"\nWritten to: {output_path}")
    print("Run 'python tools/validate_content.py' to confirm.")


if __name__ == "__main__":
    main()
