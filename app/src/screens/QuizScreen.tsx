import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { updateCardProgress } from '../services/progress';
import vocabulary from '../data/vocabulary.json';
import type { VocabWord } from '../types';

const TEAL = '#0B7B8C';
const DARK = '#1F2937';
const BEIGE = '#F5F0E8';
const QUIZ_SIZE = 10;

type QuestionType = 'multiple_choice' | 'reverse' | 'fill_in';

interface Question {
  word: VocabWord;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
}

function buildQuiz(): Question[] {
  const words = [...(vocabulary as VocabWord[])].sort(() => Math.random() - 0.5).slice(0, QUIZ_SIZE);

  return words.map((word): Question => {
    const rand = Math.random();
    if (rand < 0.45) {
      // Multiple choice: chamorro → english
      const others = (vocabulary as VocabWord[])
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.english);
      const options = [...others, word.english].sort(() => Math.random() - 0.5);
      return { word, type: 'multiple_choice', options, correctAnswer: word.english };
    } else if (rand < 0.75) {
      // Reverse: english → chamorro options
      const others = (vocabulary as VocabWord[])
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.chamorro);
      const options = [...others, word.chamorro].sort(() => Math.random() - 0.5);
      return { word, type: 'reverse', options, correctAnswer: word.chamorro };
    } else {
      // Fill in the blank
      return { word, type: 'fill_in', correctAnswer: word.chamorro };
    }
  });
}

function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[åā]/g, 'a')
    .replace(/[ñ]/g, 'n')
    .replace(/'/g, "'");
}

export default function QuizScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  function startQuiz() {
    setQuestions(buildQuiz());
    setQIndex(0);
    setSelected(null);
    setFillInput('');
    setShowResult(false);
    setScore(0);
    setDone(false);
    setStarted(true);
  }

  async function submitAnswer() {
    const q = questions[qIndex];
    const answer = q.type === 'fill_in' ? fillInput : selected ?? '';
    const correct =
      q.type === 'fill_in'
        ? normalizeAnswer(answer) === normalizeAnswer(q.correctAnswer)
        : answer === q.correctAnswer;

    if (correct) setScore((s) => s + 1);
    await updateCardProgress(q.word.id, correct ? 2 : 0);
    setSelected(answer);
    setShowResult(true);
  }

  function next() {
    const next = qIndex + 1;
    if (next >= questions.length) {
      setDone(true);
    } else {
      setQIndex(next);
      setSelected(null);
      setFillInput('');
      setShowResult(false);
    }
  }

  if (!started) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text style={styles.bigEmoji}>✏️</Text>
          <Text style={styles.startTitle}>Knowledge Quiz</Text>
          <Text style={styles.startSubtitle}>
            10 questions — multiple choice, reverse, and fill-in-the-blank
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={startQuiz}>
            <Text style={styles.startBtnText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    const pct = Math.round((score / QUIZ_SIZE) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text style={styles.bigEmoji}>{emoji}</Text>
          <Text style={styles.startTitle}>Quiz Complete!</Text>
          <Text style={styles.scoreText}>{score} / {QUIZ_SIZE}</Text>
          <Text style={styles.pctText}>{pct}% correct</Text>
          <Text style={styles.startSubtitle}>
            {pct >= 80 ? 'Maolek! Excellent work!' : pct >= 60 ? 'Biba! Keep practicing!' : 'Keep studying — you\'ll get there!'}
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={startQuiz}>
            <Text style={styles.startBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const q = questions[qIndex];
  const isCorrect =
    showResult &&
    (q.type === 'fill_in'
      ? normalizeAnswer(selected ?? '') === normalizeAnswer(q.correctAnswer)
      : selected === q.correctAnswer);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          {/* Progress */}
          <Text style={styles.progress}>{qIndex + 1} / {QUIZ_SIZE}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(qIndex / QUIZ_SIZE) * 100}%` }]} />
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            {q.type === 'multiple_choice' && (
              <>
                <Text style={styles.qPrompt}>What does this mean?</Text>
                <Text style={styles.qWord}>{q.word.chamorro}</Text>
              </>
            )}
            {q.type === 'reverse' && (
              <>
                <Text style={styles.qPrompt}>How do you say in Chamorro?</Text>
                <Text style={styles.qWord}>{q.word.english}</Text>
              </>
            )}
            {q.type === 'fill_in' && (
              <>
                <Text style={styles.qPrompt}>Type the Chamorro word for:</Text>
                <Text style={styles.qWord}>{q.word.english}</Text>
              </>
            )}
          </View>

          {/* Answer area */}
          {q.type === 'fill_in' ? (
            <View style={styles.fillContainer}>
              <TextInput
                style={styles.fillInput}
                value={fillInput}
                onChangeText={setFillInput}
                placeholder="Type Chamorro word..."
                autoCapitalize="none"
                autoCorrect={false}
                editable={!showResult}
              />
              {showResult && (
                <View style={[styles.resultBanner, isCorrect ? styles.correctBanner : styles.wrongBanner]}>
                  <Text style={styles.resultText}>
                    {isCorrect ? '✓ Correct!' : `✗ The answer is: ${q.correctAnswer}`}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {q.options!.map((opt) => {
                let btnStyle = styles.optionBtn;
                if (showResult) {
                  if (opt === q.correctAnswer) btnStyle = { ...styles.optionBtn, ...styles.optionCorrect };
                  else if (opt === selected && opt !== q.correctAnswer) btnStyle = { ...styles.optionBtn, ...styles.optionWrong };
                } else if (opt === selected) {
                  btnStyle = { ...styles.optionBtn, ...styles.optionSelected };
                }
                return (
                  <TouchableOpacity
                    key={opt}
                    style={btnStyle}
                    onPress={() => !showResult && setSelected(opt)}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Action button */}
          {!showResult ? (
            <TouchableOpacity
              style={[styles.actionBtn, !(selected || fillInput) && styles.actionBtnDisabled]}
              onPress={submitAnswer}
              disabled={!selected && !fillInput}
            >
              <Text style={styles.actionBtnText}>Check</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={next}>
              <Text style={styles.actionBtnText}>
                {qIndex + 1 < QUIZ_SIZE ? 'Next Question ›' : 'See Results'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BEIGE },
  scroll: { flex: 1 },
  container: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  bigEmoji: { fontSize: 60 },
  startTitle: { fontSize: 26, fontWeight: '800', color: DARK, marginTop: 16, textAlign: 'center' },
  startSubtitle: { fontSize: 15, color: '#6B7280', marginTop: 10, textAlign: 'center', lineHeight: 22 },
  startBtn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginTop: 28,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  scoreText: { fontSize: 52, fontWeight: '800', color: TEAL, marginTop: 10 },
  pctText: { fontSize: 18, color: '#6B7280', marginTop: 4 },
  progress: { textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 20 },
  progressFill: { height: 4, backgroundColor: TEAL, borderRadius: 2 },
  questionCard: {
    backgroundColor: TEAL,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  qPrompt: { fontSize: 13, color: '#B2EBF2', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  qWord: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginTop: 10, textAlign: 'center' },
  optionsContainer: { gap: 10 },
  optionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: TEAL, backgroundColor: '#E0F4F6' },
  optionCorrect: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  optionWrong: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  optionText: { fontSize: 16, color: DARK, fontWeight: '500' },
  fillContainer: { marginBottom: 16 },
  fillInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    color: DARK,
  },
  resultBanner: {
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  correctBanner: { backgroundColor: '#D1FAE5' },
  wrongBanner: { backgroundColor: '#FEE2E2' },
  resultText: { fontSize: 15, fontWeight: '700', color: DARK },
  actionBtn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
