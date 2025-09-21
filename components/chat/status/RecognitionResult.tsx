import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SpeechRecognitionResult, IntentClassificationResult } from '@/types/chat';

interface RecognitionResultProps {
  recognitionResult: SpeechRecognitionResult | null;
  intentResult: IntentClassificationResult | null;
}

export default function RecognitionResult({ recognitionResult, intentResult }: RecognitionResultProps) {
  if (!recognitionResult) return null;

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-3">
      <div className="flex items-start gap-2">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-800 dark:text-green-200">
            भाषा ओळखली / Language Detected: 
            <Badge variant="outline" className="ml-2">
              {recognitionResult.detectedLanguage === 'mr' ? 'मराठी' : recognitionResult.detectedLanguage.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="ml-2">
              {Math.round(recognitionResult.confidence * 100)}% आत्मविश्वास / Confidence
            </Badge>
          </div>
          {intentResult && (
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">
              हेतू / Intent: <strong>{intentResult.intent}</strong>
              {intentResult.entities.crops && (
                <span className="ml-2">
                  पिके / Crops: {intentResult.entities.crops.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
