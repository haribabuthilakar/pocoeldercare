import * as React from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '../../components/button';

export interface CallRecordingPlayerProps {
  recordingUrl?: string;
  durationSeconds?: number;
  callerName?: string;
}

export function CallRecordingPlayer({
  recordingUrl,
  durationSeconds = 120,
  callerName = 'Senior Incoming Call'
}: CallRecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = (currentTime / durationSeconds) * 100;

  return (
    <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200 truncate flex items-center space-x-1.5">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{callerName} Recording</span>
        </span>
        <span className="font-mono text-slate-400 text-[11px]">
          {formatTime(currentTime)} / {formatTime(durationSeconds)}
        </span>
      </div>

      {/* Simulated Waveform Visualizer */}
      <div className="h-8 flex items-center space-x-1 px-1">
        {Array.from({ length: 32 }).map((_, i) => {
          const barProgress = (i / 32) * 100;
          const isPassed = barProgress <= progressPercent;
          // Deterministic pseudorandom bar heights
          const height = 20 + Math.sin(i * 1.2) * 12 + ((i % 5) * 3);

          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all ${
                isPassed ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
              style={{ height: `${Math.max(6, Math.min(28, height))}px` }}
            />
          );
        })}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 w-8 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center justify-center font-bold"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(false);
            }}
            className="h-8 w-8 p-0 rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          {recordingUrl ? 'Audio Link Synced' : 'Simulated Audio'}
        </span>
      </div>
    </div>
  );
}
