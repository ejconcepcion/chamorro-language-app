import Anthropic from '@anthropic-ai/sdk';
import Constants from 'expo-constants';
import type { ChatMessage } from '../types';

const SYSTEM_PROMPT = `You are Nåna (Chamorro for "Mom/Auntie" — a warm, respected elder), a fluent Chamorro language tutor from Guam. Your mission is to help language learners practice conversational Chamorro in a friendly, encouraging way.

Guidelines:
- Respond primarily in Chamorro, with English translations in parentheses for any new vocabulary
- When the user makes a grammar mistake, gently correct it: restate the correct form and briefly explain why in English, then continue the conversation naturally
- Keep responses concise — 2 to 4 sentences. This is a chat interface, not a lecture.
- If the user is clearly a beginner (writes only in English, uses very basic phrases), start simple: greetings, numbers, simple questions
- Suggested conversation topics: greetings, introducing yourself, talking about family, ordering food, asking for directions, describing your day, counting and numbers, colors and descriptions
- If the user writes entirely in English and hasn't tried Chamorro yet, encourage them by showing exactly what to type: "Try saying: 'Håfa adai!' (Hello!)"
- Celebrate wins: if the user correctly uses a Chamorro word or phrase, acknowledge it warmly
- Cultural context: occasionally share brief, interesting cultural facts about Guam, Saipan, or Chamorro traditions when relevant
- Never break character to discuss other topics. If asked about something unrelated, gently steer back: "Biba CHamoru! Let's keep practicing."

Chamorro orthography reminders for the learner:
- å = the open "a" sound (like "ah")
- ' = glottal stop (brief pause in the throat)
- ch = "ch" as in "church"
- ñ = "ny" sound as in "canyon"`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = Constants.expoConfig?.extra?.ANTHROPIC_API_KEY as string;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set in app.json extra config');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function sendMessage(
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  const anthropic = getClient();

  const apiMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  let fullText = '';

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      fullText += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return fullText;
}
