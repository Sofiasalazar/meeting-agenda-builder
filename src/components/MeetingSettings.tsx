import React from 'react';
import { Clock, Users, Globe } from 'lucide-react';
import { DURATION_OPTIONS, MEETING_TYPE_LABELS, LANGUAGE_OPTIONS } from '../types';
import type { Duration, MeetingType, Language } from '../types';

interface Props {
  duration: Duration;
  meetingType: MeetingType;
  language: Language;
  onDurationChange: (d: Duration) => void;
  onMeetingTypeChange: (t: MeetingType) => void;
  onLanguageChange: (l: Language) => void;
}

export const MeetingSettings: React.FC<Props> = ({
  duration,
  meetingType,
  language,
  onDurationChange,
  onMeetingTypeChange,
  onLanguageChange,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#F5F5F5] mb-1.5">
            <Clock size={14} className="text-[#8b5cf6]" />
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => onDurationChange(Number(e.target.value) as Duration)}
            className="w-full bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-[14px] text-[#F5F5F5] focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 appearance-none cursor-pointer"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#F5F5F5] mb-1.5">
            <Users size={14} className="text-[#8b5cf6]" />
            Meeting type
          </label>
          <select
            value={meetingType}
            onChange={(e) => onMeetingTypeChange(e.target.value as MeetingType)}
            className="w-full bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-[14px] text-[#F5F5F5] focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 appearance-none cursor-pointer"
          >
            {(Object.entries(MEETING_TYPE_LABELS) as [MeetingType, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#F5F5F5] mb-1.5">
          <Globe size={14} className="text-[#8b5cf6]" />
          Language
        </label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="w-full sm:w-auto sm:min-w-[180px] bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-[14px] text-[#F5F5F5] focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 appearance-none cursor-pointer"
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
