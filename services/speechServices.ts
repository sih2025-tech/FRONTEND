// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// Speech Recognition Service with Language Detection and Intent Classification
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

// Language patterns for detection
const MARATHI_PATTERNS = [
  // Common Marathi words and phrases
  'हवामान', 'पिक', 'शेत', 'पाऊस', 'रोग', 'भाव', 'बाजार', 'पाणी', 'खत', 'बियाणे',
  'कापूस', 'सोयाबीन', 'ज्वारी', 'बाजरी', 'गहू', 'तांदूळ', 'मका', 'ऊस', 'कांदा',
  'माझ्या', 'तुमच्या', 'आहे', 'नाही', 'काय', 'कसे', 'कधी', 'कुठे', 'कोण',
  'पानावर', 'झाडावर', 'फळावर', 'मूळावर', 'डाग', 'कीड', 'रोगराई'
];

const ENGLISH_PATTERNS = [
  'weather', 'crop', 'farm', 'rain', 'disease', 'price', 'market', 'water', 'fertilizer', 'seed',
  'cotton', 'soybean', 'wheat', 'rice', 'corn', 'sugarcane', 'onion',
  'my', 'your', 'is', 'are', 'not', 'what', 'how', 'when', 'where', 'who',
  'leaf', 'plant', 'fruit', 'root', 'spot', 'pest', 'infection'
];

// Agricultural vocabulary for entity extraction
const CROP_ENTITIES = {
  marathi: ['कापूस', 'सोयाबीन', 'ज्वारी', 'बाजरी', 'गहू', 'तांदूळ', 'मका', 'ऊस', 'कांदा', 'भात', 'हरभरा'],
  english: ['cotton', 'soybean', 'sorghum', 'millet', 'wheat', 'rice', 'corn', 'sugarcane', 'onion', 'chickpea', 'groundnut']
};

const DISEASE_ENTITIES = {
  marathi: ['पर्णरोग', 'मुळे कुजणे', 'पांढरी माशी', 'तुडतुडे', 'कीड', 'बुरशी', 'विषाणु'],
  english: ['leaf blight', 'root rot', 'whitefly', 'aphid', 'pest', 'fungus', 'virus', 'bacterial']
};

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private currentLanguage: string = 'mr-IN';

  constructor() {
    this.initializeWebSpeechAPI();
  }

  private initializeWebSpeechAPI() {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      this.isSupported = false;
      return;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.isSupported = true;
        
        this.setupRecognitionConfig();
      } else {
        console.warn('Speech recognition constructor not available');
        this.isSupported = false;
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
      this.isSupported = false;
    }
  }

  private setupRecognitionConfig() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    
    // Start with Marathi as default
    this.recognition.lang = 'mr-IN';
  }

  async startListening(): Promise<SpeechRecognitionResult> {
    if (!this.isSupported || !this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      throw new Error('Already listening');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not initialized'));
        return;
      }

      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence || 0.5;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            bestConfidence = Math.max(bestConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
        
        if (finalTranscript.trim()) {
          const languageResult = this.detectLanguage(finalTranscript);
          
          resolve({
            transcript: finalTranscript.trim(),
            confidence: bestConfidence,
            detectedLanguage: languageResult.language,
            languageConfidence: languageResult.confidence
          });
        } else {
          reject(new Error('No speech detected'));
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false;
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      // Attempt recognition with multiple languages
      this.startMultiLanguageRecognition();
    });
  }

  private async startMultiLanguageRecognition() {
    if (!this.recognition) return;

    try {
      // Try Marathi first
      this.recognition.lang = 'mr-IN';
      this.recognition.start();
    } catch (error) {
      // Fallback to English if Marathi fails
      try {
        this.recognition.lang = 'en-IN';
        this.recognition.start();
      } catch (fallbackError) {
        console.error('Failed to start speech recognition in both languages:', fallbackError);
        throw fallbackError;
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  private detectLanguage(text: string): { language: 'mr' | 'en' | 'hi' | 'unknown', confidence: number } {
    const lowerText = text.toLowerCase();
    let marathiScore = 0;
    let englishScore = 0;

    // Check for Devanagari script (strong indicator of Marathi/Hindi)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
      marathiScore += 0.8;
    }

    // Check for Marathi patterns
    MARATHI_PATTERNS.forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        marathiScore += 0.1;
      }
    });

    // Check for English patterns
    ENGLISH_PATTERNS.forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        englishScore += 0.1;
      }
    });

    // Normalize scores
    const totalScore = marathiScore + englishScore;
    if (totalScore === 0) {
      return { language: 'unknown', confidence: 0 };
    }

    const marathiConfidence = marathiScore / totalScore;
    const englishConfidence = englishScore / totalScore;

    if (marathiConfidence > englishConfidence && marathiConfidence > 0.3) {
      return { language: 'mr', confidence: marathiConfidence };
    } else if (englishConfidence > 0.3) {
      return { language: 'en', confidence: englishConfidence };
    } else {
      return { language: 'unknown', confidence: Math.max(marathiConfidence, englishConfidence) };
    }
  }

  classifyIntent(text: string, language: 'mr' | 'en' | 'hi' | 'unknown'): IntentClassificationResult {
    const lowerText = text.toLowerCase();
    
    // Intent patterns for different categories
    const intentPatterns = {
      weather: {
        mr: ['हवामान', 'पाऊस', 'तापमान', 'वारा', 'ढग', 'आर्द्रता', 'अंदाज'],
        en: ['weather', 'rain', 'temperature', 'wind', 'cloud', 'humidity', 'forecast', 'climate']
      },
      disease: {
        mr: ['रोग', 'डाग', 'कीड', 'पानावर', 'झाडावर', 'पीक रोग', 'कुजणे', 'मुरझाणे'],
        en: ['disease', 'spot', 'pest', 'infection', 'blight', 'rot', 'wilt', 'fungus', 'virus']
      },
      market: {
        mr: ['भाव', 'बाजार', 'किंमत', 'दर', 'विकणे', 'खरेदी', 'मंडी'],
        en: ['price', 'market', 'rate', 'sell', 'buy', 'cost', 'value', 'mandi']
      },
      advisory: {
        mr: ['सल्ला', 'योजना', 'अनुदान', 'मदत', 'कशी', 'काय करावे', 'पद्धत'],
        en: ['advice', 'scheme', 'subsidy', 'help', 'how', 'what to do', 'method', 'guidance']
      },
      crop_health: {
        mr: ['पिकाचे आरोग्य', 'वाढ', 'फळे', 'उत्पादन', 'खत', 'पाणी', 'काळजी'],
        en: ['crop health', 'growth', 'yield', 'production', 'fertilizer', 'water', 'care', 'nutrition']
      }
    };

    // Score each intent
    const scores: Record<string, number> = {};
    
    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      scores[intent] = 0;
      const relevantPatterns = patterns[language as keyof typeof patterns] || patterns['en'];
      
      relevantPatterns.forEach((pattern: string) => {
        if (lowerText.includes(pattern.toLowerCase())) {
          scores[intent] += 1;
        }
      });
    });

    // Find best matching intent
    const bestIntent = Object.entries(scores).reduce((best, [intent, score]) => 
      score > best.score ? { intent, score } : best, 
      { intent: 'general', score: 0 }
    );

    // Extract entities
    const entities = this.extractEntities(text, language);

    return {
      intent: bestIntent.intent as any,
      entities,
      confidence: bestIntent.score > 0 ? Math.min(bestIntent.score / 3, 1) : 0.1
    };
  }

  private extractEntities(text: string, language: 'mr' | 'en' | 'hi' | 'unknown'): IntentClassificationResult['entities'] {
    const lowerText = text.toLowerCase();
    const entities: IntentClassificationResult['entities'] = {};

    // Extract crops
    const crops: string[] = [];
    const cropList = language === 'mr' ? CROP_ENTITIES.marathi : CROP_ENTITIES.english;
    cropList.forEach(crop => {
      if (lowerText.includes(crop.toLowerCase())) {
        crops.push(crop);
      }
    });
    if (crops.length > 0) entities.crops = crops;

    // Extract diseases
    const diseases: string[] = [];
    const diseaseList = language === 'mr' ? DISEASE_ENTITIES.marathi : DISEASE_ENTITIES.english;
    diseaseList.forEach(disease => {
      if (lowerText.includes(disease.toLowerCase())) {
        diseases.push(disease);
      }
    });
    if (diseases.length > 0) entities.diseases = diseases;

    // Extract timeframe
    const timePatterns = {
      mr: ['आज', 'उद्या', 'परवा', 'आठवड्यात', 'महिन्यात'],
      en: ['today', 'tomorrow', 'week', 'month', 'season', 'year']
    };
    
    const timeList = language === 'mr' ? timePatterns.mr : timePatterns.en;
    timeList.forEach(time => {
      if (lowerText.includes(time.toLowerCase())) {
        entities.timeframe = time;
      }
    });

    return entities;
  }

  // Simulate wav2vec2-base model integration for better Marathi support
  async processWithWav2Vec2(audioBlob: Blob): Promise<SpeechRecognitionResult> {
    // TODO: Integrate with actual wav2vec2-base model endpoint
    // For now, this is a placeholder that would send audio to ML model
    
    console.log('Processing audio with wav2vec2-base model...');
    
    // This would be replaced with actual API call to ML model
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transcript: "काल पावसामुळे माझ्या कापसाच्या पिकाला नुकसान झाले आहे", // Mock Marathi transcript
          confidence: 0.95,
          detectedLanguage: 'mr',
          languageConfidence: 0.98,
          audioBlob
        });
      }, 2000);
    });
  }

  isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  getCurrentListeningState(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const speechService = new SpeechRecognitionService();

// Text-to-Speech Service
export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      // Voices might not be loaded yet, wait for them
      this.synth.onvoiceschanged = () => {
        if (this.synth) {
          this.voices = this.synth.getVoices();
        }
      };
    }
  }

  speak(text: string, language: 'mr' | 'en' = 'mr'): void {
    if (!this.synth) return;
    
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure for language
    if (language === 'mr') {
      utterance.lang = 'mr-IN';
      // Find Marathi voice if available
      const marathiVoice = this.voices.find(voice => 
        voice.lang.includes('mr') || voice.lang.includes('hi')
      );
      if (marathiVoice) {
        utterance.voice = marathiVoice;
      }
    } else {
      utterance.lang = 'en-IN';
      // Find Indian English voice if available
      const englishVoice = this.voices.find(voice => 
        voice.lang.includes('en-IN') || voice.lang.includes('en-GB')
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    // Configure speech parameters for natural sound
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    this.synth?.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const ttsService = new TextToSpeechService();

// Wake word detection simulation
export class WakeWordService {
  private isListening: boolean = false;
  private recognition: SpeechRecognition | null = null;
  private onWakeWordDetected?: () => void;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'mr-IN';
      }
    }
  }

  startWakeWordDetection(callback: () => void) {
    if (!this.recognition) return;

    this.onWakeWordDetected = callback;
    this.isListening = true;

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        
        // Check for "Krishi" wake word in multiple languages
        if (transcript.includes('krishi') || 
            transcript.includes('कृषी') || 
            transcript.includes('कृषि')) {
          console.log('Wake word detected:', transcript);
          this.onWakeWordDetected?.();
          break;
        }
      }
    };

    this.recognition.start();
  }

  stopWakeWordDetection() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isDetecting(): boolean {
    return this.isListening;
  }
}

export const wakeWordService = new WakeWordService();