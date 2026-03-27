export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface AgendaItem {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  topic: string;
  prompts: string[];
}

export interface Agenda {
  title: string;
  items: AgendaItem[];
  totalMinutes: number;
}

export type MeetingType =
  | 'team-standup'
  | 'strategy-session'
  | 'client-call'
  | 'brainstorm'
  | 'one-on-one'
  | 'custom';

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  'team-standup': 'Team Standup',
  'strategy-session': 'Strategy Session',
  'client-call': 'Client Call',
  'brainstorm': 'Brainstorm',
  'one-on-one': '1:1 Meeting',
  'custom': 'Custom',
};

export const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const;
export type Duration = (typeof DURATION_OPTIONS)[number];

export type Language = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt';

export const LANGUAGE_OPTIONS: { code: Language; label: string; speechCode: string }[] = [
  { code: 'en', label: 'English', speechCode: 'en-US' },
  { code: 'de', label: 'Deutsch', speechCode: 'de-DE' },
  { code: 'fr', label: 'Francais', speechCode: 'fr-FR' },
  { code: 'es', label: 'Espanol', speechCode: 'es-ES' },
  { code: 'it', label: 'Italiano', speechCode: 'it-IT' },
  { code: 'pt', label: 'Portugues', speechCode: 'pt-PT' },
];
