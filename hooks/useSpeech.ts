import { useState, useEffect, useCallback } from 'react';
import { 
  speechService, 
  ttsService, 
  wakeWordService,
  SpeechRecognitionResult,
  IntentClassificationResult 
} from '@/services/speechServices';

export interface UseSpeechOptions {
  enableWakeWord?: boolean;
  autoStartOnWakeWord?: boolean;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<SpeechRecognitionResult | null>(null);
  const [intentResult, setIntentResult] = useState<IntentClassificationResult | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(speechService.isRecognitionSupported());
  }, []);

  const startRecording = useCallback(async (): Promise<SpeechRecognitionResult | null> => {
    if (!isSupported) {
      throw new Error('Speech recognition not supported in this browser');
    }

    try {
      setIsRecording(true);
      
      const result = await speechService.startListening();
      setRecognitionResult(result);
      
      // Classify intent
      const intent = speechService.classifyIntent(result.transcript, result.detectedLanguage);
      setIntentResult(intent);
      
      return result;
    } catch (error) {
      console.error('Speech recognition error:', error);
      throw error;
    } finally {
      setIsRecording(false);
    }
  }, [isSupported]);

  // Initialize wake word detection
  useEffect(() => {
    if (options.enableWakeWord && isSupported) {
      setIsListening(true);
      wakeWordService.startWakeWordDetection(() => {
        console.log('Wake word "Krishi" detected');
        if (options.autoStartOnWakeWord) {
          startRecording();
        }
      });

      return () => {
        wakeWordService.stopWakeWordDetection();
        setIsListening(false);
      };
    }
  }, [options.enableWakeWord, options.autoStartOnWakeWord, isSupported, startRecording]);

  const stopRecording = useCallback(() => {
    if (speechService.getCurrentListeningState()) {
      speechService.stopListening();
      setIsRecording(false);
    }
  }, []);

  const speak = useCallback((text: string, language: 'mr' | 'en' = 'mr') => {
    if (ttsService.isSpeaking()) {
      ttsService.stop();
    }
    ttsService.speak(text, language);
  }, []);

  const stopSpeaking = useCallback(() => {
    ttsService.stop();
  }, []);

  const clearResults = useCallback(() => {
    setRecognitionResult(null);
    setIntentResult(null);
  }, []);

  return {
    isRecording,
    isListening,
    recognitionResult,
    intentResult,
    isSupported,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
    clearResults
  };
};
