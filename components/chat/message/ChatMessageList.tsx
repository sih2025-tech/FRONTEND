import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import ChatMessageItem from './ChatMessageItem';
import { scrollToBottom } from '@/utils/chat';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSpeak: (text: string, language: 'mr' | 'en') => void;
}

export default function ChatMessageList({ messages, isLoading, onSpeak }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom(messagesEndRef.current);
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <div className="text-lg font-medium mb-2">नमस्कार! मी कृषी AI सहायक आहे</div>
          <div className="text-sm">Hello! I&apos;m your AI Agricultural Assistant</div>
          <div className="text-xs mt-4 space-y-2">
            <div>&ldquo;Krishi&rdquo; बोला किंवा टाईप करा / Say &ldquo;Krishi&rdquo; or type to start</div>
            <div className="flex justify-center gap-4 text-xs">
              <span>🌤️ हवामान / Weather</span>
              <span>🌱 रोग / Disease</span>
              <span>📈 बाजार / Market</span>
              <span>💡 सल्ला / Advisory</span>
            </div>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessageItem 
            key={message.id} 
            message={message} 
            onSpeak={onSpeak}
          />
        ))
      )}
      
      {isLoading && (
        <div className="flex justify-start">
          <Card className="max-w-xs bg-card">
            <CardContent className="p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                AI विचार करत आहे... / AI Thinking...
              </span>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
