import type { MeetingType, Language } from '../types';

const MEETING_TYPE_GUIDANCE: Record<MeetingType, string> = {
  'team-standup': 'Keep items brief and action-oriented. Focus on blockers, progress, and next steps. Discussion prompts should surface blockers and dependencies.',
  'strategy-session': 'Allow deeper exploration of each topic. Discussion prompts should be exploratory and challenge assumptions. Include time for divergent thinking.',
  'client-call': 'Keep a professional, structured tone. Discussion prompts should surface requirements, concerns, and next steps. Include time for Q&A.',
  'brainstorm': 'Maximize creative discussion time. Discussion prompts should be open-ended and provocative. Minimize administrative time.',
  'one-on-one': 'Balance between updates and coaching. Discussion prompts should encourage reflection and growth. Include time for personal check-in.',
  'custom': 'Balance time evenly across topics. Discussion prompts should be practical and actionable.',
};

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
};

export function buildSystemPrompt(meetingType: MeetingType, language: Language): string {
  const guidance = MEETING_TYPE_GUIDANCE[meetingType];
  const langName = LANGUAGE_NAMES[language];
  const langInstruction = language === 'en'
    ? ''
    : `\n\nIMPORTANT: The entire agenda output (title, topic names, and discussion prompts) MUST be written in ${langName}. The JSON keys remain in English, but all string values must be in ${langName}.`;

  return `You are a meeting planning assistant used by team leads and consultants. Given a list of topics and a total meeting duration, create a structured, timed agenda.

Rules:
- Allocate time proportionally based on topic complexity and importance
- Always include a 2-minute "Welcome + context setting" opener as the first item
- Always include a 3-minute "Next steps + action items" closer as the last item
- The remaining time is split across the user's topics
- For each topic, provide 2-3 specific discussion prompts that drive productive conversation
- Discussion prompts must be open-ended questions (never yes/no)
- Time blocks must be consecutive and add up to exactly the total meeting duration
- Use "0:00" format for times (e.g., "0:00", "0:15", "1:05")

Meeting type guidance: ${guidance}${langInstruction}

You MUST respond with ONLY valid JSON matching this exact schema -- no markdown fences, no explanation, no text before or after:

{
  "title": "string - a concise meeting title derived from the topics",
  "items": [
    {
      "startTime": "string - e.g. 0:00",
      "endTime": "string - e.g. 0:05",
      "durationMinutes": number,
      "topic": "string - topic name",
      "prompts": ["string - discussion prompt 1", "string - discussion prompt 2"]
    }
  ],
  "totalMinutes": number
}`;
}
