import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { getDueCards, updateCardProgress, recordDailyReview } from '../services/progress';
import vocabulary from '../data/vocabulary.json';
import type { VocabWord, RecallRating } from '../types';

const TEAL = '#0B7B8C';
const DARK = '#1F2937';
const BEIGE = '#F5F0E8';

function getWordById(id: string): VocabWord | undefined {
  return (vocabulary as VocabWord[]).find((w) => w.id === id);
}

function getRandomWords(exclude: Set<string>, count = 15): VocabWord[] {
  const pool = (vocabulary as VocabWord[]).filter((w) => !exclude.has(w.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function FlashcardsScreen() {
  const [cards, setCards] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    setLoading(true);
    const dueIds = await getDueCards(20);
    let wordList: VocabWord[] = [];

    for (const id of dueIds) {
      const word = getWordById(id);
      if (word) wordList.push(word);
    }

    if (wordList.length < 5) {
      const extra = getRandomWords(new Set(dueIds), 15 - wordList.length);
      wordList = [...wordList, ...extra];
    }

    setCards(wordList);
    setIndex(0);
    setFlipped(false);
    setDone(false);
    setLoading(false);
  }

  function flipCard() {
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  }

  async function rate(rating: RecallRating) {
    const word = cards[index];
    await updateCardProgress(word.id, rating);
    await recordDailyReview();
    setReviewed((r) => r + 1);

    const next = index + 1;
    if (next >= cards.length) {
      setDone(true);
    } else {
      flipAnim.setValue(0);
      setFlipped(false);
      setIndex(next);
    }
  }

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={TEAL} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Session Complete!</Text>
          <Text style={styles.doneSubtitle}>You reviewed {reviewed} cards.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={loadCards}>
            <Text style={styles.doneBtnText}>Study More</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const word = cards[index];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Progress */}
        <Text style={styles.progress}>{index + 1} / {cards.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((index) / cards.length) * 100}%` }]} />
        </View>

        {/* Card */}
        <TouchableOpacity style={styles.cardContainer} onPress={flipCard} activeOpacity={0.9}>
          {/* Front */}
          <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRotate }] }]}>
            <Text style={styles.cardCategory}>{word.category.toUpperCase()}</Text>
            <Text style={styles.cardChamorro}>{word.chamorro}</Text>
            <Text style={styles.cardPos}>{word.part_of_speech}</Text>
            <Text style={styles.tapHint}>Tap to reveal ›</Text>
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
            <Text style={styles.cardEnglish}>{word.english}</Text>
            {word.example_chamorro ? (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleChamorro}>{word.example_chamorro}</Text>
                <Text style={styles.exampleEnglish}>{word.example_english}</Text>
              </View>
            ) : null}
          </Animated.View>
        </TouchableOpacity>

        {/* Rating buttons — only show when flipped */}
        {flipped ? (
          <View style={styles.ratingRow}>
            <TouchableOpacity style={[styles.rateBtn, styles.rateBtnAgain]} onPress={() => rate(0)}>
              <Text style={styles.rateBtnText}>Again</Text>
              <Text style={styles.rateBtnSub}>Forgot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateBtn, styles.rateBtnHard]} onPress={() => rate(1)}>
              <Text style={styles.rateBtnText}>Hard</Text>
              <Text style={styles.rateBtnSub}>Difficult</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateBtn, styles.rateBtnGood]} onPress={() => rate(2)}>
              <Text style={styles.rateBtnText}>Good</Text>
              <Text style={styles.rateBtnSub}>Remembered</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rateBtn, styles.rateBtnEasy]} onPress={() => rate(3)}>
              <Text style={styles.rateBtnText}>Easy</Text>
              <Text style={styles.rateBtnSub}>Simple</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.flipPrompt}>Tap the card to flip it</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BEIGE },
  container: { flex: 1, padding: 20 },
  progress: { textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 24 },
  progressFill: { height: 4, backgroundColor: TEAL, borderRadius: 2 },
  cardContainer: { flex: 1, marginBottom: 20 },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardFront: { backgroundColor: '#FFFFFF' },
  cardBack: { backgroundColor: TEAL },
  cardCategory: { fontSize: 11, color: '#9CA3AF', letterSpacing: 1.5, fontWeight: '600' },
  cardChamorro: { fontSize: 40, fontWeight: '800', color: DARK, marginTop: 16, textAlign: 'center' },
  cardPos: { fontSize: 14, color: '#9CA3AF', marginTop: 8, fontStyle: 'italic' },
  tapHint: { position: 'absolute', bottom: 24, fontSize: 13, color: '#D1D5DB' },
  cardEnglish: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  exampleBox: { marginTop: 24, alignItems: 'center', paddingHorizontal: 10 },
  exampleChamorro: { fontSize: 15, color: '#B2EBF2', fontStyle: 'italic', textAlign: 'center' },
  exampleEnglish: { fontSize: 13, color: '#80DEEA', marginTop: 4, textAlign: 'center' },
  ratingRow: { flexDirection: 'row', gap: 8, paddingBottom: 10 },
  rateBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rateBtnAgain: { backgroundColor: '#FEE2E2' },
  rateBtnHard: { backgroundColor: '#FEF3C7' },
  rateBtnGood: { backgroundColor: '#D1FAE5' },
  rateBtnEasy: { backgroundColor: '#DBEAFE' },
  rateBtnText: { fontSize: 13, fontWeight: '700', color: DARK },
  rateBtnSub: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  flipPrompt: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, paddingBottom: 20 },
  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 28, fontWeight: '800', color: DARK, marginTop: 16 },
  doneSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  doneBtn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 32,
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
