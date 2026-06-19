import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { sendMessage } from '../services/claude';
import type { ChatMessage } from '../types';

const TEAL = '#0B7B8C';
const DARK = '#1F2937';
const BEIGE = '#F5F0E8';

const STARTER_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Håfa adai! (Hello! Welcome!) I\'m Nåna, your Chamorro language tutor. Let\'s practice together!\n\nTry greeting me in Chamorro — type "Håfa adai!" to start. Or if you\'re not sure where to begin, just say hello in English and I\'ll guide you. 😊',
  timestamp: Date.now(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setSending(true);
    setStreamingText('');

    // Exclude the welcome message from API history (it's a UI-only message)
    const apiMessages = allMessages.filter((m) => m.id !== 'welcome');

    try {
      let accumulated = '';
      await sendMessage(apiMessages, (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
        listRef.current?.scrollToEnd({ animated: false });
      });

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: accumulated,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingText('');
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: err?.message?.includes('ANTHROPIC_API_KEY')
          ? '⚠️ API key not configured. Add your ANTHROPIC_API_KEY to app.json extra config.'
          : 'Having trouble connecting — check your internet and try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setStreamingText('');
    } finally {
      setSending(false);
    }
  }, [input, sending, messages]);

  function resetChat() {
    setMessages([STARTER_MESSAGE]);
    setStreamingText('');
    setSending(false);
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
        {!isUser && <View style={styles.avatar}><Text style={styles.avatarText}>N</Text></View>}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
        </View>
      </View>
    );
  }

  const displayMessages = messages;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI Conversation</Text>
            <Text style={styles.headerSub}>Practice with Nåna, your Chamorro tutor</Text>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={resetChat}>
            <Text style={styles.resetText}>New Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Streaming indicator */}
        {streamingText ? (
          <View style={styles.streamingRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>N</Text></View>
            <View style={[styles.bubble, styles.bubbleBot]}>
              <Text style={styles.bubbleText}>{streamingText}</Text>
              <ActivityIndicator size="small" color={TEAL} style={{ marginTop: 4 }} />
            </View>
          </View>
        ) : null}

        {/* Input bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Say something in Chamorro..."
            placeholderTextColor="#9CA3AF"
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendIcon}>›</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BEIGE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: DARK },
  headerSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  resetBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  resetText: { fontSize: 13, color: TEAL, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 8 },
  bubbleRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  bubbleRowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    padding: 12,
  },
  bubbleBot: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: TEAL, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, color: DARK, lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },
  streamingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: DARK,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: '300', marginTop: -2 },
});
