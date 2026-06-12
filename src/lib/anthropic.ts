import { buildSystemPrompt } from './system-prompt';
import type { Agenda, MeetingType, Duration, Language } from '../types';

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface GenerateResult {
  agenda: Agenda | null;
  rawText: string;
  inputTokens: number;
  outputTokens: number;
}

function extractJSON(text: string): Agenda | null {
  try {
    return JSON.parse(text) as Agenda;
  } catch {
    // continue
  }

  const stripped = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(stripped) as Agenda;
  } catch {
    // continue
  }

  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(stripped.slice(firstBrace, lastBrace + 1)) as Agenda;
    } catch {
      // continue
    }
  }

  return null;
}

function validateAgenda(obj: Agenda): Agenda {
  return {
    title: obj.title || 'Meeting Agenda',
    items: Array.isArray(obj.items)
      ? obj.items.map((item) => ({
          startTime: item.startTime || '0:00',
          endTime: item.endTime || '0:00',
          durationMinutes: item.durationMinutes || 0,
          topic: item.topic || '',
          prompts: Array.isArray(item.prompts) ? item.prompts : [],
        }))
      : [],
    totalMinutes: obj.totalMinutes || 0,
  };
}

export async function generateAgenda(
  apiKey: string,
  topics: string,
  duration: Duration,
  meetingType: MeetingType,
  language: Language
): Promise<GenerateResult> {
  const systemPrompt = buildSystemPrompt(meetingType, language);
  const userMessage = `Topics:\n${topics}\n\nTotal meeting duration: ${duration} minutes`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 401) throw new Error('Invalid API key. Check your key in Settings and try again.');
    if (status === 429) throw new Error('Rate limit reached. Wait a moment and try again.');
    if (status === 529) throw new Error('Anthropic is overloaded. Try again in a few seconds.');
    throw new Error('Could not reach Anthropic. Check your connection and try again.');
  }

  const data: AnthropicResponse = await response.json();
  const text = data.content[0]?.text || '';

  const parsed = extractJSON(text);
  return {
    agenda: parsed ? validateAgenda(parsed) : null,
    rawText: text,
    inputTokens: data.usage.input_tokens,
    outputTokens: data.usage.output_tokens,
  };
}
