import React, { useState } from 'react';
import { Camera, Check, Image as ImageIcon } from 'lucide-react';
import { COLORS } from '../../theme/colors';

export const PhotoProofUploader: React.FC<{
  label: string;
  onPhotoCaptured: (uri: string) => void;
}> = ({ label, onPhotoCaptured }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleSimulateCapture = () => {
    const mockUri = `file:///photos/proof-${Date.now()}.jpg`;
    setPhotoUri(mockUri);
    onPhotoCaptured(mockUri);
  };

  return (
    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
      <button
        type="button"
        onClick={handleSimulateCapture}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '14px',
          backgroundColor: photoUri ? COLORS.primaryLight : '#f8fafc',
          border: `1px dashed ${photoUri ? COLORS.primary : '#cbd5e1'}`,
          color: photoUri ? COLORS.primaryDark : '#475569',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {photoUri ? <Check size={14} color={COLORS.primary} /> : <Camera size={14} />}
        <span>{photoUri ? `Photo Attached (${label})` : `Attach Mandatory Photo (${label})`}</span>
      </button>
    </div>
  );
};
