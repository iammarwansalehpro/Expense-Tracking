export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export type VoiceRecognitionCallback = (result: VoiceRecognitionResult) => void;
export type VoiceRecognitionErrorCallback = (error: string) => void;

class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: VoiceRecognitionCallback | null = null;
  private onErrorCallback: VoiceRecognitionErrorCallback | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'th-TH'; // Default to Thai

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.onResultCallback) {
          if (finalTranscript) {
            this.onResultCallback({ transcript: finalTranscript, isFinal: true });
          }
          if (interimTranscript) {
            this.onResultCallback({ transcript: interimTranscript, isFinal: false });
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
        this.stop();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(
    onResult: VoiceRecognitionCallback, 
    onError?: VoiceRecognitionErrorCallback,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      console.error('Error starting speech recognition:', e);
      if (this.onErrorCallback) this.onErrorCallback(e.message);
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceService = new VoiceService();
