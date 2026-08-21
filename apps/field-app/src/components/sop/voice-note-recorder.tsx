import React, { useState } from 'react';
import { Mic, Square, Check, Play } from 'lucide-react';
import { COLORS } from '../../theme/colors';

export const VoiceNoteRecorder: React.FC<{
  onAudioRecorded: (uri: string) => void;
}> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const mockAudio = `file:///audio/note-${Date.now()}.m4a`;
        setAudioUri(mockAudio);
        onAudioRecorded(mockAudio);
      }, 1500);
    }
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        onClick={handleToggleRecord}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '14px',
          backgroundColor: audioUri ? '#fee5f2' : isRecording ? '#ffe4e6' : '#f8fafc',
          border: `1px dashed ${audioUri ? COLORS.secondary : isRecording ? '#f43f5e' : '#cbd5e1'}`,
          color: audioUri ? COLORS.secondaryDark : isRecording ? '#e11d48' : '#475569',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {audioUri ? (
          <Check size={14} color={COLORS.secondary} />
        ) : isRecording ? (
          <Square size={14} color="#e11d48" className="animate-pulse" />
        ) : (
          <Mic size={14} />
        )}
        <span>{audioUri ? 'Voice Memo Attached (0:15)' : isRecording ? 'Recording Voice Memo...' : 'Record Voice Observation'}</span>
      </button>
    </div>
  );
};
