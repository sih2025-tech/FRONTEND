import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';

export interface MarketRate {
  cropName: string;
  market: string;
  pricePerUnit: string;
  unit: string;
  date: Date;
  trend?: 'up' | 'down' | 'stable';
  change?: string;
}

interface MarketRatesCardProps {
  rates: MarketRate[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function MarketRatesCard({ rates, onRefresh, isRefreshing = false }: MarketRatesCardProps) {
  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = (trend?: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          📈 बाजार भाव / Market Rates
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh-rates"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          रिफ्रेश / Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {rates.length > 0 ? (
          <div className="space-y-3">
            {rates.map((rate, index) => {
              const TrendIcon = getTrendIcon(rate.trend);
              const trendColor = getTrendColor(rate.trend);
              
              return (
                <div key={`${rate.cropName}-${rate.market}-${index}`} 
                     className="p-3 rounded-lg border hover-elevate"
                     data-testid={`rate-item-${index}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{rate.cropName}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {rate.market}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        ₹{rate.pricePerUnit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        प्रति {rate.unit} / per {rate.unit}
                      </div>
                      
                      {rate.trend && (
                        <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
                          <TrendIcon className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {rate.change || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {rate.date.toLocaleDateString('mr-IN')}
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {rate.trend === 'up' ? 'वाढत्या भावात / Rising' : 
                       rate.trend === 'down' ? 'कमी होत्या भावात / Falling' : 
                       'स्थिर भाव / Stable'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm">
              बाजार भाव उपलब्ध नाहीत<br />
              No market rates available
            </div>
          </div>
        )}

        {/* Agricultural Market Advisory */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30">
          <div className="text-sm font-medium mb-2">
            बाजार सल्ला / Market Advisory
          </div>
          <div className="text-xs text-muted-foreground">
            {rates.some(r => r.trend === 'up') ? 
              'काही पिकांच्या भावात वाढ दिसत आहे. विक्री करण्यासाठी योग्य वेळ. / Some crop prices are rising. Good time for selling.' :
              'बाजार भाव स्थिर आहेत. ग्रेडिंग आणि पॅकिंगवर लक्ष द्या. / Market prices are stable. Focus on grading and packaging.'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}