'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { ChatMessage, ChatInputData } from '@/types/chat';
import { generateMessageId } from '@/utils/chat';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (data: ChatInputData) => {
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      text: data.text,
      isUser: true,
      timestamp: new Date(),
      detectedLanguage: data.language as 'mr' | 'en' | 'hi' | 'unknown',
      intent: data.intent?.intent,
      confidence: data.intent?.confidence,
      entities: data.intent?.entities,
      location: data.location ? {
        latitude: data.location.coords.latitude,
        longitude: data.location.coords.longitude,
        accuracy: data.location.coords.accuracy
      } : undefined,
      imageUrl: data.image ? URL.createObjectURL(data.image) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (replace with actual AI service call)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: generateMessageId(),
        text: `तुमचा प्रश्न समजला. ${data.intent?.intent || 'सामान्य'} विषयी माहिती देतो... / I understand your question about ${data.intent?.intent || 'general topic'}. Let me provide information...`,
        isUser: false,
        timestamp: new Date(),
        detectedLanguage: 'mr'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen">
      <ChatInterface 
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
