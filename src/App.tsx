import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTokenCounter } from './hooks/useTokenCounter';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { generateAgenda } from './lib/anthropic';
import { Header } from './components/Header';
import { DataNotice } from './components/DataNotice';
import { FooterCTA } from './components/FooterCTA';
import { SettingsModal } from './components/SettingsModal';
import { EmptyState } from './components/EmptyState';
import { TopicInput } from './components/TopicInput';
import { MeetingSettings } from './components/MeetingSettings';
import { AgendaDisplay } from './components/AgendaDisplay';
import { LANGUAGE_OPTIONS } from './types';
import type { Agenda, Duration, MeetingType, Language } from './types';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useLocalStorage('agenticsis_agenda_builder_api_key', '');
  const [duration, setDuration] = useLocalStorage<Duration>('agenticsis_agenda_builder_duration', 30);
  const [meetingType, setMeetingType] = useLocalStorage<MeetingType>('agenticsis_agenda_builder_meeting_type', 'team-standup');
  const [language, setLanguage] = useLocalStorage<Language>('agenticsis_agenda_builder_language', 'en');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { usage, totalTokens, addUsage } = useTokenCounter();

  const [topics, setTopics] = useState('');
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isSupported, isListening, interimTranscript, start, stop } = useSpeechRecognition();

  const hasApiKey = apiKey.length > 0;

  const getSpeechCode = useCallback(() => {
    return LANGUAGE_OPTIONS.find((l) => l.code === language)?.speechCode || 'en-US';
  }, [language]);

  const handleToggleVoice = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start((text) => {
        setTopics((prev) => {
          const trimmed = prev.trimEnd();
          if (trimmed.length === 0) return text.trim();
          return trimmed + ', ' + text.trim();
        });
      }, getSpeechCode());
    }
  }, [isListening, start, stop, getSpeechCode]);

  const handleGenerate = useCallback(async () => {
    if (!apiKey || !topics.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateAgenda(apiKey, topics, duration, meetingType, language);
      if (result.agenda) {
        setAgenda(result.agenda);
      } else {
        setError('Could not parse the agenda response. Try again.');
      }
      addUsage(result.inputTokens, result.outputTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, topics, duration, meetingType, language, addUsage]);

  return (
    <div className="h-full flex flex-col">
      <Header
        hasApiKey={hasApiKey}
        tokenUsage={usage}
        totalTokens={totalTokens}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <DataNotice />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
        onClearApiKey={() => setApiKey('')}
      />

      <main className="flex-1 flex flex-col pt-14 pb-12 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Input panel */}
          <div className="flex flex-col p-4 gap-4 lg:w-[40%] lg:flex-shrink-0 lg:border-r lg:border-[#262626] min-h-[280px] lg:min-h-0 overflow-y-auto">
            <TopicInput
              topics={topics}
              onChange={setTopics}
              isListening={isListening}
              isSupported={isSupported}
              interimTranscript={interimTranscript}
              onToggleVoice={handleToggleVoice}
            />

            <MeetingSettings
              duration={duration}
              meetingType={meetingType}
              language={language}
              onDurationChange={setDuration}
              onMeetingTypeChange={setMeetingType}
              onLanguageChange={setLanguage}
            />

            <button
              onClick={handleGenerate}
              disabled={!hasApiKey || !topics.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-[15px] font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Building agenda...
                </>
              ) : (
                'Build Agenda'
              )}
            </button>

            {!hasApiKey && topics.trim() && (
              <p className="text-[12px] text-[#A3A3A3] text-center">
                Add your API key in{' '}
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="text-[#8b5cf6] hover:underline"
                >
                  Settings
                </button>
                {' '}to generate agendas.
              </p>
            )}
          </div>

          {/* Output panel */}
          <div className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto">
            {error && (
              <div className="mb-3 px-3 py-2 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
                <p className="text-[13px] text-[#ef4444]">{error}</p>
              </div>
            )}

            {isGenerating && !agenda && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 size={32} className="text-[#8b5cf6] animate-spin" />
                <p className="text-[14px] text-[#A3A3A3]">Generating your agenda...</p>
              </div>
            )}

            {!agenda && !isGenerating && (
              <EmptyState
                hasApiKey={hasApiKey}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            )}

            {agenda && (
              <AgendaDisplay
                agenda={agenda}
                isGenerating={isGenerating}
                onRegenerate={handleGenerate}
              />
            )}
          </div>
        </div>
      </main>

      <FooterCTA />
    </div>
  );
};

export default App;
