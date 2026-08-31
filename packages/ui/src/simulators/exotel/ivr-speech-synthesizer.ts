/**
 * Browser Speech Synthesis IVR Engine with fallback transcript callback.
 */

export interface IvrSpeechOptions {
  voiceSpeed?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export class IvrSpeechSynthesizer {
  private isSpeaking = false;

  /**
   * Speaks IVR prompt text using window.speechSynthesis.
   */
  public speak(text: string, options: IvrSpeechOptions = {}): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      options.onStart?.();
      options.onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.voiceSpeed ?? 0.95;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.lang = options.lang ?? 'en-IN';

      utterance.onstart = () => {
        this.isSpeaking = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        options.onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        options.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      options.onStart?.();
      options.onEnd?.();
    }
  }

  /**
   * Stops active speech.
   */
  public stop(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public getSpeakingStatus(): boolean {
    return this.isSpeaking;
  }
}
