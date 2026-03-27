import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
}

export const VoiceButton: React.FC<Props> = ({ isListening, isSupported, onClick }) => {
  if (!isSupported) return null;

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
        isListening
          ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white'
          : 'bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6]'
      }`}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      title={isListening ? 'Stop recording' : 'Say your topics out loud'}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-[#ef4444]/40 mic-pulse" />
      )}
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};
