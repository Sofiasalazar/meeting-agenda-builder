import React from 'react';
import { Mic, Type, CalendarClock } from 'lucide-react';

interface Props {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export const EmptyState: React.FC<Props> = ({ hasApiKey, onOpenSettings }) => {
  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center mb-4">
          <CalendarClock size={32} className="text-[#8b5cf6]" />
        </div>
        <h2 className="text-[18px] font-bold text-[#F5F5F5] mb-2">
          Set up your API key to start
        </h2>
        <p className="text-[14px] text-[#A3A3A3] mb-4 max-w-sm">
          This tool uses Claude to generate your meeting agenda. Add your Anthropic API key in Settings.
        </p>
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[14px] font-semibold rounded-lg transition-colors"
        >
          Open Settings
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center mb-4">
        <CalendarClock size={32} className="text-[#8b5cf6]" />
      </div>
      <h2 className="text-[18px] font-bold text-[#F5F5F5] mb-2">
        Build your meeting agenda
      </h2>
      <p className="text-[14px] text-[#A3A3A3] mb-6 max-w-sm">
        Add your topics, pick a duration, and get a timed agenda with discussion prompts in seconds.
      </p>
      <div className="flex flex-col gap-3 text-left">
        <div className="flex items-center gap-3 text-[14px] text-[#A3A3A3]">
          <Mic size={18} className="text-[#8b5cf6] flex-shrink-0" />
          <span>Tap the mic and say your topics out loud</span>
        </div>
        <div className="flex items-center gap-3 text-[14px] text-[#A3A3A3]">
          <Type size={18} className="text-[#8b5cf6] flex-shrink-0" />
          <span>Or type them in the text box</span>
        </div>
      </div>
    </div>
  );
};
