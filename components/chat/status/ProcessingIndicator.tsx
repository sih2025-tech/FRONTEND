import { Brain } from 'lucide-react';

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  message?: string;
}

export default function ProcessingIndicator({ 
  isProcessing, 
  message = "AI प्रक्रिया सुरू आहे... / AI Processing..." 
}: ProcessingIndicatorProps) {
  if (!isProcessing) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-2 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
        <Brain className="w-4 h-4 animate-pulse" />
        {message}
      </div>
    </div>
  );
}
