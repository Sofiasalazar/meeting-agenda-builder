import React from 'react';
import { VoiceButton } from './VoiceButton';

interface Props {
  topics: string;
  onChange: (value: string) => void;
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  onToggleVoice: () => void;
}

export const TopicInput: React.FC<Props> = ({
  topics,
  onChange,
  isListening,
  isSupported,
  interimTranscript,
  onToggleVoice,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[14px] font-semibold text-[#F5F5F5]">
          Topics
        </label>
        <div className="flex items-center gap-2">
          {isListening && (
            <span className="text-[12px] text-[#ef4444] font-medium">
              Listening...
            </span>
          )}
          <VoiceButton
            isListening={isListening}
            isSupported={isSupported}
            onClick={onToggleVoice}
          />
        </div>
      </div>

      <div className="relative">
        <textarea
          value={topics}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Q2 roadmap review, hiring update, budget approval, team feedback..."
          className="w-full h-40 bg-[#141414] border border-[#262626] rounded-lg px-3 py-2.5 text-[14px] text-[#F5F5F5] placeholder-[#525252] resize-none focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30"
        />
        {interimTranscript && (
          <div className="absolute bottom-2 left-3 right-3 text-[13px] text-[#8b5cf6]/70 italic truncate pointer-events-none">
            {interimTranscript}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[#525252]">
          Separate topics with commas, new lines, or just speak naturally
        </p>
        <span className="text-[12px] text-[#525252]">
          {topics.length} chars
        </span>
      </div>
    </div>
  );
};
