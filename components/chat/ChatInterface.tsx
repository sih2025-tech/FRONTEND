import { useState } from 'react';
import { ChatMessage, ChatInputData } from '@/types/chat';
import { useSpeech } from '@/hooks/useSpeech';
import { useLocation } from '@/hooks/useLocation';

import ProcessingIndicator from './status/ProcessingIndicator';
import RecognitionResult from './status/RecognitionResult';
import LocationStatus from './status/LocationStatus';
import ChatMessageList from './message/ChatMessageList';
import ChatInput from './input/ChatInput';
import ThemeToggle from '../ThemeToggle';
import ProfileIcon from '../ProfileIcon';

interface ChatInterfaceProps {
  messages?: ChatMessage[];
  onSendMessage: (data: ChatInputData) => void;
  isLoading?: boolean;
}

export default function ChatInterface({ 
  messages = [], 
  onSendMessage,
  isLoading = false
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const {
    isRecording,
    recognitionResult,
    intentResult,
    startRecording,
    stopRecording,
    speak,
    clearResults
  } = useSpeech({
    enableWakeWord: true,
    autoStartOnWakeWord: true
  });

  const {
    currentLocation,
    isRequesting: isLocationRequesting,
    requestLocation
  } = useLocation();

  const handleStartRecording = async () => {
    try {
      setIsProcessingAI(true);
      const result = await startRecording();
      if (result) {
        setInputText(result.transcript);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      alert('Speech recognition failed. Please try again.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSendMessage = async (data: ChatInputData) => {
    setIsProcessingAI(true);
    
    try {
      // Check if location is needed for the query
      const needsLocation = data.intent?.intent === 'weather' || data.intent?.intent === 'market';
      let location = data.location || currentLocation;
      
      if (needsLocation && !location) {
        location = await requestLocation();
      }

      // Send the enhanced message with location if available
      onSendMessage({
        ...data,
        location: location || undefined
      });

      // Clear recognition results
      clearResults();
      
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with profile icon and theme toggle */}
      <div className="flex justify-between items-center p-3 border-b border-border">
        <ProfileIcon farmerName="राजू पाटील" />
        <ThemeToggle />
      </div>
      
      {/* Status indicators */}
     
      <ProcessingIndicator isProcessing={isProcessingAI} />
      <RecognitionResult 
        recognitionResult={recognitionResult}
        intentResult={intentResult}
      />

      {/* Messages */}
      <ChatMessageList 
        messages={messages}
        isLoading={isLoading}
        onSpeak={speak}
      />

      {/* Location Status */}
      <LocationStatus 
        isRequesting={isLocationRequesting}
        currentLocation={currentLocation}
      />

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading || isProcessingAI}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
        inputText={inputText}
        onInputChange={setInputText}
        intentResult={intentResult || undefined}
        currentLocation={currentLocation}
        onLocationRequest={requestLocation}
      />
    </div>
  );
}
