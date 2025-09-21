import { Zap } from 'lucide-react';

interface WakeWordIndicatorProps {
  isListening: boolean;
}

export default function WakeWordIndicator({ isListening }: WakeWordIndicatorProps) {
  if (!isListening) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 p-2 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-primary">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <Zap className="w-4 h-4" />
        &ldquo;Krishi&rdquo; सुनत आहे... (Listening for &ldquo;Krishi&rdquo;...)
      </div>
    </div>
  );
}
