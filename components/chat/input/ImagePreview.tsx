import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImagePreviewProps {
  imagePreview: string;
  onClear: () => void;
}

export default function ImagePreview({ imagePreview, onClear }: ImagePreviewProps) {
  return (
    <div className="border-t bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image 
            src={imagePreview} 
            alt="Selected image" 
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-md"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={onClear}
          >
            ×
          </Button>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">चित्र निवडले / Image Selected</div>
          <div className="text-xs text-muted-foreground">
            रोग शोधण्यासाठी / For disease detection
          </div>
        </div>
      </div>
    </div>
  );
}
