export const formatLocation = (location: GeolocationPosition): string => {
  const { latitude, longitude, accuracy } = location.coords;
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy || 0)}m)`;
};

export const detectLanguage = (text: string): 'mr' | 'en' | 'hi' | 'unknown' => {
  if (!text.trim()) return 'unknown';
  
  // Simple language detection
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  return hasDevanagari ? 'mr' : 'en';
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const scrollToBottom = (element: HTMLElement | null): void => {
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
