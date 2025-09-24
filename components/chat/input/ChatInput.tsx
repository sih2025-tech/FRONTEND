import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  MicOff, 
  Send, 
  Camera, 
  Upload,
  Paperclip
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
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    };

    if (isAttachmentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachmentMenuOpen]);

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
          <div className="flex gap-2 relative">
            <Input
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="तुमचा प्रश्न लिहा... / Type your question..."
              className="flex-1"
              data-testid="input-message"
              disabled={isRecording || isLoading}
            />
            
            {/* Attachment Menu Button */}
            <div className="relative" ref={attachmentMenuRef}>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                disabled={isLoading}
                data-testid="button-attachment"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              {/* Attachment Menu Dropdown */}
              {isAttachmentMenuOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-background border rounded-lg shadow-lg p-2 min-w-[200px] z-10">
                  {/* Voice input button */}
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "ghost"}
                    onClick={() => {
                      if (isRecording) {
                        onStopRecording();
                      } else {
                        onStartRecording();
                      }
                      setIsAttachmentMenuOpen(false);
                    }}
                    data-testid="button-voice"
                    disabled={isLoading}
                    className="w-full justify-start gap-2"
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isRecording ? 'Stop Recording' : 'Voice Input'}
                  </Button>
                  
                  {/* Camera input */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      cameraInputRef.current?.click();
                      setIsAttachmentMenuOpen(false);
                    }}
                    data-testid="button-camera"
                    disabled={isLoading}
                    className="w-full justify-start gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                  
                  {/* File upload */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsAttachmentMenuOpen(false);
                    }}
                    data-testid="button-upload"
                    disabled={isLoading}
                    className="w-full justify-start gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>
                </div>
              )}
            </div>
            
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
