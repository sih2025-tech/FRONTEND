import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow, 
  Wind,
  Droplets,
  Thermometer,
  Eye,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export interface WeatherData {
  location: string;
  temperature: string;
  humidity: string;
  rainfall: string;
  windSpeed: string;
  description: string;
  alerts?: string[];
  forecast?: {
    day: string;
    temp: string;
    condition: string;
  }[];
  lastUpdated: Date;
}

interface WeatherCardProps {
  weather: WeatherData;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function WeatherCard({ weather, onRefresh, isRefreshing = false }: WeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('पाऊस')) return CloudRain;
    if (lower.includes('cloud') || lower.includes('ढग')) return Cloud;
    if (lower.includes('snow') || lower.includes('बर्फ')) return CloudSnow;
    if (lower.includes('wind') || lower.includes('वारा')) return Wind;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon(weather.description);

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <WeatherIcon className="w-6 h-6 text-primary" />
          हवामान माहिती / Weather Info
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh-weather"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          रिफ्रेश / Refresh
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <WeatherIcon className="w-12 h-12 text-primary" />
            <div>
              <div className="text-3xl font-bold">{weather.temperature}</div>
              <div className="text-sm text-muted-foreground">{weather.description}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            📍 {weather.location}
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div className="text-xs">
              <div className="font-medium">आर्द्रता / Humidity</div>
              <div className="text-muted-foreground">{weather.humidity}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <CloudRain className="w-4 h-4 text-blue-600" />
            <div className="text-xs">
              <div className="font-medium">पाऊस / Rainfall</div>
              <div className="text-muted-foreground">{weather.rainfall}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Wind className="w-4 h-4 text-gray-500" />
            <div className="text-xs">
              <div className="font-medium">वाऱ्याचा वेग / Wind Speed</div>
              <div className="text-muted-foreground">{weather.windSpeed}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Eye className="w-4 h-4 text-gray-600" />
            <div className="text-xs">
              <div className="font-medium">शेवटचे अपडेट / Last Update</div>
              <div className="text-muted-foreground">{weather.lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        {weather.alerts && weather.alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="w-4 h-4" />
              हवामान सूचना / Weather Alerts
            </div>
            {weather.alerts.map((alert, index) => (
              <Badge key={index} variant="destructive" className="text-xs block w-full text-left p-2">
                {alert}
              </Badge>
            ))}
          </div>
        )}

        {/* 3-Day Forecast */}
        {weather.forecast && weather.forecast.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              3 दिवसांचा अंदाज / 3-Day Forecast
            </div>
            <div className="space-y-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <div className="text-sm font-medium">{day.day}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">{day.temp}</div>
                    <div className="text-xs text-muted-foreground">{day.condition}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agricultural Advisory */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="text-sm font-medium text-primary mb-1">
            शेती सल्ला / Agricultural Advisory
          </div>
          <div className="text-xs text-muted-foreground">
            {weather.temperature.includes('30') || weather.temperature.includes('35') ? 
              'उष्णतेमुळे पिकांना पाणी द्या. जास्त उष्णतेपासून बचाव करा. / Give water to crops due to heat. Protect from excessive heat.' :
              'सध्याचे हवामान शेतीसाठी योग्य आहे. नियमित तपासणी करा. / Current weather is suitable for farming. Regular monitoring advised.'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}