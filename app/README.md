# Håfa Adai — Chamorro Language App

## Setup

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [Expo Go](https://expo.dev/go) app installed on your iOS or Android phone

### Install & Run

```bash
cd app
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

### Configure AI Chat

1. Get a free API key from [console.anthropic.com](https://console.anthropic.com)
2. Open `app.json` and add your key:

```json
"extra": {
  "ANTHROPIC_API_KEY": "sk-ant-..."
}
```

3. Restart the Expo server.

> ⚠️ For production, move the API key to a backend proxy rather than bundling it in the app.

## Features

| Tab | Feature |
|-----|---------|
| 🏠 Home | Daily word, streak, quick navigation |
| 📚 Flashcards | SM-2 spaced repetition with 244 Chamorro words |
| 📖 Lessons | 10 structured lessons with grammar & cultural notes |
| ✏️ Quiz | Multiple choice, reverse, and fill-in-the-blank |
| 💬 Chat | Real-time AI conversation with Claude (claude-haiku-4-5) |

## Content

All Chamorro language content lives in `../content/`:
- `vocabulary.json` — 244 words across 10 categories
- `lessons.json` — 10 structured lessons
- `phrases.json` — 48 common conversational phrases

To add more vocabulary:
```bash
# Create a raw_words.tsv with columns: chamorro, english, category, part_of_speech
python ../tools/build_vocabulary.py --input raw_words.tsv

# Validate content
python ../tools/validate_content.py

# Copy updated files to app
cp ../content/*.json src/data/
```
