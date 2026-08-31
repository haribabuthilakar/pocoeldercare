import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DtmfToneGenerator } from '../exotel/dtmf-tone-generator';

describe('DtmfToneGenerator (Web Audio API Dual Oscillators)', () => {
  let mockAudioContext: any;
  let mockOscillator1: any;
  let mockOscillator2: any;
  let mockGainNode: any;

  beforeEach(() => {
    mockOscillator1 = {
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
    mockOscillator2 = {
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
    mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn()
    };

    let oscCount = 0;
    mockAudioContext = {
      currentTime: 0,
      state: 'running',
      destination: {},
      createOscillator: vi.fn().mockImplementation(() => {
        oscCount++;
        return oscCount % 2 === 1 ? mockOscillator1 : mockOscillator2;
      }),
      createGain: vi.fn().mockReturnValue(mockGainNode),
      resume: vi.fn().mockResolvedValue(undefined)
    };

    // Assign to window
    (global as any).window = {
      AudioContext: vi.fn().mockImplementation(() => mockAudioContext)
    };
  });

  it('should play dual frequency tones for Key 1 (697Hz + 1209Hz)', () => {
    const generator = new DtmfToneGenerator();
    generator.playTone('1', 200);

    expect(mockOscillator1.frequency.setValueAtTime).toHaveBeenCalledWith(697, 0);
    expect(mockOscillator2.frequency.setValueAtTime).toHaveBeenCalledWith(1209, 0);
    expect(mockOscillator1.start).toHaveBeenCalledWith(0);
    expect(mockOscillator2.start).toHaveBeenCalledWith(0);
    expect(mockOscillator1.stop).toHaveBeenCalledWith(0.2);
    expect(mockOscillator2.stop).toHaveBeenCalledWith(0.2);
  });

  it('should play dual frequency tones for Key * (941Hz + 1209Hz)', () => {
    const generator = new DtmfToneGenerator();
    generator.playTone('*', 150);

    expect(mockOscillator1.frequency.setValueAtTime).toHaveBeenCalledWith(941, 0);
    expect(mockOscillator2.frequency.setValueAtTime).toHaveBeenCalledWith(1209, 0);
  });

  it('should play ringtone chime without throwing errors', () => {
    const generator = new DtmfToneGenerator();
    expect(() => generator.playRingtone()).not.toThrow();
  });
});
