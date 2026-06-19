import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDueCards, getTotalReviewed, getStreak } from '../services/progress';
import vocabulary from '../data/vocabulary.json';
import type { VocabWord } from '../types';

const TEAL = '#0B7B8C';
const BEIGE = '#F5F0E8';
const DARK = '#1F2937';

function getDailyWord(): VocabWord {
  const idx = Math.floor(Date.now() / 86400000) % vocabulary.length;
  return vocabulary[idx] as VocabWord;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [dueCount, setDueCount] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [streak, setStreak] = useState(0);
  const dailyWord = getDailyWord();

  useEffect(() => {
    async function load() {
      const due = await getDueCards();
      const total = await getTotalReviewed();
      const s = await getStreak();
      setDueCount(due.length);
      setTotalReviewed(total);
      setStreak(s);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Håfa Adai! 👋</Text>
          <Text style={styles.subtitle}>Learn the language of Guam & the Marianas</Text>
        </View>

        {/* Daily Word */}
        <View style={styles.dailyCard}>
          <Text style={styles.dailyLabel}>Word of the Day</Text>
          <Text style={styles.dailyChamorro}>{dailyWord.chamorro}</Text>
          <Text style={styles.dailyEnglish}>{dailyWord.english}</Text>
          {dailyWord.example_chamorro ? (
            <Text style={styles.dailyExample}>"{dailyWord.example_chamorro}"</Text>
          ) : null}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{totalReviewed}</Text>
            <Text style={styles.statLabel}>Words Learned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{dueCount}</Text>
            <Text style={styles.statLabel}>Cards Due</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Practice</Text>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Cards')}>
          <View style={styles.actionIcon}><Text style={{ fontSize: 28 }}>📚</Text></View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Flashcards</Text>
            <Text style={styles.actionDesc}>
              {dueCount > 0 ? `${dueCount} card${dueCount !== 1 ? 's' : ''} due for review` : 'Study new vocabulary'}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Lessons')}>
          <View style={styles.actionIcon}><Text style={{ fontSize: 28 }}>📖</Text></View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Lessons</Text>
            <Text style={styles.actionDesc}>10 structured lessons covering everyday Chamorro</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Quiz')}>
          <View style={styles.actionIcon}><Text style={{ fontSize: 28 }}>✏️</Text></View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Quiz</Text>
            <Text style={styles.actionDesc}>Test your knowledge with 10-question quizzes</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, styles.chatCard]} onPress={() => navigation.navigate('Chat')}>
          <View style={styles.actionIcon}><Text style={{ fontSize: 28 }}>💬</Text></View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: '#FFFFFF' }]}>AI Conversation</Text>
            <Text style={[styles.actionDesc, { color: '#B2EBF2' }]}>Practice chatting with an AI Chamorro tutor</Text>
          </View>
          <Text style={[styles.arrow, { color: '#FFFFFF' }]}>›</Text>
        </TouchableOpacity>

        {/* Cultural note */}
        <View style={styles.culturalBox}>
          <Text style={styles.culturalTitle}>Did you know?</Text>
          <Text style={styles.culturalText}>
            Chamorro is the native language of Guam (Guåhan), Saipan, and the other Mariana Islands.
            With about 45,000 speakers worldwide, learning Chamorro helps preserve an endangered Pacific heritage.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BEIGE },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: DARK },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  dailyCard: {
    backgroundColor: TEAL,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  dailyLabel: { fontSize: 12, color: '#B2EBF2', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  dailyChamorro: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginTop: 6 },
  dailyEnglish: { fontSize: 18, color: '#B2EBF2', marginTop: 4 },
  dailyExample: { fontSize: 13, color: '#80DEEA', marginTop: 10, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNum: { fontSize: 24, fontWeight: '800', color: TEAL },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 12 },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chatCard: { backgroundColor: TEAL },
  actionIcon: { width: 48, alignItems: 'center' },
  actionText: { flex: 1, paddingLeft: 8 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: DARK },
  actionDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  arrow: { fontSize: 24, color: '#9CA3AF', fontWeight: '300' },
  culturalBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  culturalTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  culturalText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
});
