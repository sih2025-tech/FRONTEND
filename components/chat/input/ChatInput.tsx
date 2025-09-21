import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  MicOff, 
  Send, 
  Camera, 
  Upload
} from 'lucide-react';
import { ChatInputData, IntentClassificationResult } from '@/types/chat';
import { detectLanguage } from '@/utils/chat';
import ImagePreview from './ImagePreview';

interface ChatInputProps {
  onSendMessage: (data: ChatInputData) => void;
  isLoading: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  inputText: string;
  onInputChange: (text: string) => void;
  intentResult?: IntentClassificationResult;
  currentLocation?: GeolocationPosition | null;
  onLocationRequest?: () => Promise<GeolocationPosition | null>;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  isRecording,
  onStartRecording,
  onStopRecording,
  inputText,
  onInputChange,
  intentResult,
  currentLocation,
  onLocationRequest
}: ChatInputProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    try {
      // Detect language and classify intent for text input
      let language: 'mr' | 'en' | 'hi' | 'unknown' = 'unknown';
      const intent = intentResult;

      if (inputText.trim()) {
        language = detectLanguage(inputText);
      }

      // Check if location is needed for the query
      const needsLocation = intent?.intent === 'weather' || intent?.intent === 'market';
      let location = currentLocation;
      
      if (needsLocation && !location && onLocationRequest) {
        location = await onLocationRequest();
      }

      // Send the enhanced message
      onSendMessage({
        text: inputText,
        language,
        intent,
        location: location || undefined,
        image: selectedImage || undefined
      });

      // Clear inputs
      onInputChange('');
      clearSelectedImage();
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <>
      {/* Image Preview */}
      {imagePreview && (
        <ImagePreview 
          imagePreview={imagePreview}
          onClear={clearSelectedImage}
        />
      )}

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleTextSubmit} className="space-y-3">
          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="तुमचा प्रश्न लिहा... / Type your question..."
              className="flex-1"
              data-testid="input-message"
              disabled={isRecording || isLoading}
            />
            
            {/* Voice input button */}
            <Button
              type="button"
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? onStopRecording : onStartRecording}
              data-testid="button-voice"
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            {/* Camera input */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              data-testid="button-camera"
              disabled={isLoading}
            >
              <Camera className="w-4 h-4" />
            </Button>
            
            {/* File upload */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4" />
            </Button>
            
            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelection}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelection}
            className="hidden"
          />
        </form>
        
        {/* Help text */}
        <div className="text-xs text-muted-foreground mt-2 text-center">
          🎤 आवाज • 📷 कॅमेरा • 📁 फाइल अपलोड • 📍 स्थान / Voice • Camera • File Upload • Location
        </div>
      </div>
    </>
  );
}
