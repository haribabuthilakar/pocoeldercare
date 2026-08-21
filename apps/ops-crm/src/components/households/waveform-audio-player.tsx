'use client';

import React, { useState } from 'react';
import { Play, Pause, Volume2, Headphones, Smile } from 'lucide-react';

export const WaveformAudioPlayer: React.FC<{
  title?: string;
  duration?: string;
  sentiment?: string;
}> = ({
  title = 'Exotel Telephony Call Recording (Elder Bi-Weekly Check-in)',
  duration = '0:48s',
  sentiment = 'POSITIVE_SATISFACTION',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  // Simulated waveform bar heights
  const bars = [20, 45, 60, 80, 40, 95, 70, 50, 85, 90, 65, 30, 75, 85, 40, 60, 90, 70, 45, 80, 55, 30, 60, 40];

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones size={15} className="text-brand-600" />
          <strong className="text-xs font-bold text-slate-800">{title}</strong>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <Smile size={11} />
          <span>Sentiment: Normal / Relaxed</span>
        </span>
      </div>

      {/* Waveform Visualization & Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-xs glow-primary transition-all flex-shrink-0"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        {/* Animated Waveform Scrubber */}
        <div className="flex-1 flex items-center gap-1 h-8 bg-slate-50 p-2 rounded-xl border border-slate-100 overflow-hidden">
          {bars.map((height, i) => {
            const isPlayed = (i / bars.length) * 100 <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all ${
                  isPlayed ? 'bg-brand-500' : 'bg-slate-300'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        <span className="font-mono text-xs font-bold text-slate-500 whitespace-nowrap">
          {duration}
        </span>
      </div>
    </div>
  );
};
