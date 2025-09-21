export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
  detectedLanguage?: 'mr' | 'en' | 'hi' | 'unknown';
  intent?: string;
  confidence?: number;
  entities?: Record<string, string[] | string>;
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  mlPrediction?: {
    type: string;
    result: Record<string, unknown>;
    confidence: number;
  };
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  detectedLanguage: 'mr' | 'en' | 'hi' | 'unknown';
  languageConfidence: number;
  audioBlob?: Blob;
}

export interface IntentClassificationResult {
  intent: 'weather' | 'disease' | 'market' | 'advisory' | 'crop_health' | 'general';
  subIntent?: string;
  entities: {
    crops?: string[];
    location?: string;
    diseases?: string[];
    timeframe?: string;
  };
  confidence: number;
}

export interface ChatInputData {
  text: string;
  language?: string;
  intent?: IntentClassificationResult;
  location?: GeolocationPosition;
  image?: File;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
