import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Volume2, MapPin } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { formatLocation } from '@/utils/chat';
import Image from 'next/image';

interface ChatMessageItemProps {
  message: ChatMessage;
  onSpeak: (text: string, language: 'mr' | 'en') => void;
}

export default function ChatMessageItem({ message, onSpeak }: ChatMessageItemProps) {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-xs sm:max-w-sm lg:max-w-md hover-elevate ${
        message.isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card'
      }`}>
        <CardContent className="p-3">
          {/* Message content */}
          <div className="text-sm leading-relaxed">{message.text}</div>
          
          {/* AI metadata for user messages */}
          {message.isUser && (message.detectedLanguage || message.intent) && (
            <div className="mt-2 pt-2 border-t border-primary-foreground/20">
              <div className="flex flex-wrap gap-1">
                {message.detectedLanguage && (
                  <Badge variant="secondary" className="text-xs">
                    {message.detectedLanguage === 'mr' ? '🇮🇳 मराठी' : '🇬🇧 English'}
                  </Badge>
                )}
                {message.intent && (
                  <Badge variant="secondary" className="text-xs">
                    📊 {message.intent}
                  </Badge>
                )}
                {message.confidence && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ {Math.round(message.confidence * 100)}%
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Image display */}
          {message.imageUrl && (
            <div className="mt-2">
              <Image 
                src={message.imageUrl} 
                alt="User uploaded image" 
                width={300}
                height={200}
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
          
          {/* ML Prediction results */}
          {message.mlPrediction && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="text-xs font-medium text-blue-800 dark:text-blue-200">
                🤖 AI विश्लेषण / AI Analysis: {message.mlPrediction.type}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                आत्मविश्वास / Confidence: {Math.round(message.mlPrediction.confidence * 100)}%
              </div>
            </div>
          )}
          
          {/* Location info */}
          {message.location && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {formatLocation({ coords: message.location } as GeolocationPosition)}
            </div>
          )}
          
          {/* TTS button for AI responses */}
          {!message.isUser && (
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 h-6 px-2 text-xs"
              onClick={() => onSpeak(message.text, (message.detectedLanguage === 'en' ? 'en' : 'mr'))}
              data-testid={`button-speak-${message.id}`}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              बोला / Speak
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
