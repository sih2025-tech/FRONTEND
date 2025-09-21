import { MapPin } from 'lucide-react';
import { formatLocation } from '@/utils/chat';

interface LocationStatusProps {
  isRequesting: boolean;
  currentLocation: GeolocationPosition | null;
}

export default function LocationStatus({ isRequesting, currentLocation }: LocationStatusProps) {
  if (!isRequesting && !currentLocation) return null;

  return (
    <div className="border-t bg-blue-50 dark:bg-blue-900/20 p-2">
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4" />
        {isRequesting ? (
          <span className="text-blue-600 dark:text-blue-400">
            स्थान मिळवत आहे... / Getting location...
          </span>
        ) : (
          <span className="text-green-600 dark:text-green-400">
            स्थान मिळाले / Location acquired: {formatLocation(currentLocation!)}
          </span>
        )}
      </div>
    </div>
  );
}
