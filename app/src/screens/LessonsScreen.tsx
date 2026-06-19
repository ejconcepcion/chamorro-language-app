import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { getLessonProgress, completeLesson } from '../services/progress';
import lessonsData from '../data/lessons.json';
import vocabularyData from '../data/vocabulary.json';
import type { Lesson, VocabWord } from '../types';

const TEAL = '#0B7B8C';
const DARK = '#1F2937';
const BEIGE = '#F5F0E8';

const lessons = lessonsData as Lesson[];
const vocabulary = vocabularyData as VocabWord[];

function getVocabByIds(ids: string[]): VocabWord[] {
  return ids.map((id) => vocabulary.find((w) => w.id === id)).filter(Boolean) as VocabWord[];
}

function LessonDetail({
  lesson,
  onComplete,
  onBack,
}: {
  lesson: Lesson;
  onComplete: () => void;
  onBack: () => void;
}) {
  const words = getVocabByIds(lesson.vocabulary_ids);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={[styles.detailHeader, { backgroundColor: TEAL }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{lesson.title}</Text>
          <Text style={styles.detailSubtitle}>{lesson.subtitle}</Text>
        </View>

        <View style={styles.detailBody}>
          {/* Description */}
          <Text style={styles.sectionLabel}>About This Lesson</Text>
          <Text style={styles.descText}>{lesson.description}</Text>

          {/* Grammar Note */}
          {lesson.grammar_note ? (
            <>
              <Text style={styles.sectionLabel}>Grammar Note</Text>
              <View style={styles.grammarBox}>
                <Text style={styles.grammarText}>{lesson.grammar_note}</Text>
              </View>
            </>
          ) : null}

          {/* Cultural Note */}
          {lesson.cultural_note ? (
            <>
              <Text style={styles.sectionLabel}>Cultural Context</Text>
              <View style={styles.culturalBox}>
                <Text style={styles.culturalText}>{lesson.cultural_note}</Text>
              </View>
            </>
          ) : null}

          {/* Vocabulary */}
          <Text style={styles.sectionLabel}>Vocabulary ({words.length} words)</Text>
          {words.map((word) => (
            <View key={word.id} style={styles.wordRow}>
              <View style={styles.wordLeft}>
                <Text style={styles.wordChamorro}>{word.chamorro}</Text>
                <Text style={styles.wordPos}>{word.part_of_speech}</Text>
              </View>
              <View style={styles.wordRight}>
                <Text style={styles.wordEnglish}>{word.english}</Text>
                {word.example_chamorro ? (
                  <Text style={styles.wordExample}>e.g. {word.example_chamorro}</Text>
                ) : null}
              </View>
            </View>
          ))}

          {/* Complete Button */}
          {!lesson.completed ? (
            <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
              <Text style={styles.completeBtnText}>Mark as Complete ✓</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ Completed</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function LessonsScreen() {
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    const p = await getLessonProgress();
    setProgress(p);
  }

  async function handleComplete(lessonId: number) {
    await completeLesson(lessonId);
    await loadProgress();
    setSelectedLesson((prev) => (prev ? { ...prev, completed: true } : null));
  }

  function isUnlocked(lesson: Lesson): boolean {
    if (lesson.unlock_requires === null) return true;
    return !!progress[lesson.unlock_requires];
  }

  if (selectedLesson) {
    const withProgress = { ...selectedLesson, completed: !!progress[selectedLesson.id] };
    return (
      <LessonDetail
        lesson={withProgress}
        onComplete={() => handleComplete(selectedLesson.id)}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.subtitle}>10 lessons covering everyday Chamorro</Text>

        <FlatList
          data={lessons}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => {
            const completed = !!progress[item.id];
            const unlocked = isUnlocked(item);

            return (
              <TouchableOpacity
                style={[styles.lessonCard, !unlocked && styles.locked]}
                onPress={() => unlocked && setSelectedLesson(item)}
                activeOpacity={unlocked ? 0.7 : 1}
              >
                <View style={[styles.lessonNum, completed && styles.lessonNumDone]}>
                  <Text style={[styles.lessonNumText, completed && { color: TEAL }]}>
                    {completed ? '✓' : index + 1}
                  </Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.lessonSubtitle, !unlocked && styles.lockedText]}>
                    {unlocked ? item.subtitle : '🔒 Complete previous lesson to unlock'}
                  </Text>
                </View>
                {unlocked && <Text style={styles.arrow}>›</Text>}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BEIGE },
  scroll: { flex: 1 },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: DARK },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 20 },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locked: { opacity: 0.5 },
  lessonNum: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  lessonNumDone: { backgroundColor: '#D1FAE5' },
  lessonNumText: { fontSize: 16, fontWeight: '700', color: DARK },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: DARK },
  lessonSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  lockedText: { color: '#9CA3AF' },
  arrow: { fontSize: 22, color: '#9CA3AF' },
  detailHeader: { padding: 24, paddingTop: 40 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#B2EBF2', fontSize: 16 },
  detailTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  detailSubtitle: { fontSize: 14, color: '#B2EBF2', marginTop: 4 },
  detailBody: { padding: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
  },
  descText: { fontSize: 14, color: DARK, lineHeight: 22 },
  grammarBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  grammarText: { fontSize: 14, color: '#1E40AF', lineHeight: 22 },
  culturalBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  culturalText: { fontSize: 14, color: '#78350F', lineHeight: 22 },
  wordRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  wordLeft: { flex: 1 },
  wordRight: { flex: 1 },
  wordChamorro: { fontSize: 16, fontWeight: '700', color: TEAL },
  wordPos: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontStyle: 'italic' },
  wordEnglish: { fontSize: 14, color: DARK, fontWeight: '600' },
  wordExample: { fontSize: 12, color: '#6B7280', marginTop: 2, fontStyle: 'italic' },
  completeBtn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  completeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  completedBadgeText: { color: '#065F46', fontSize: 16, fontWeight: '700' },
});
