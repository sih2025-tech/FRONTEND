import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Sprout,
  TrendingUp,
  Edit,
  Save,
  X
} from 'lucide-react';

export interface FarmerProfileData {
  id: string;
  name: string;
  phone?: string;
  location?: string;
  farmSize?: string;
  preferredLanguage: string;
  cropHistory: {
    cropName: string;
    season: string;
    year: number;
    yield?: string;
    issues?: string[];
  }[];
  createdAt: Date;
}

interface FarmerProfileProps {
  farmer: FarmerProfileData;
  onUpdateProfile: (updates: Partial<FarmerProfileData>) => void;
  isEditing?: boolean;
  onToggleEdit?: () => void;
}

export default function FarmerProfile({ 
  farmer, 
  onUpdateProfile, 
  isEditing = false, 
  onToggleEdit 
}: FarmerProfileProps) {
  const [editData, setEditData] = useState({
    name: farmer.name,
    phone: farmer.phone || '',
    location: farmer.location || '',
    farmSize: farmer.farmSize || ''
  });

  const handleSave = () => {
    onUpdateProfile(editData);
    onToggleEdit?.();
    console.log('Profile updated:', editData);
  };

  const handleCancel = () => {
    setEditData({
      name: farmer.name,
      phone: farmer.phone || '',
      location: farmer.location || '',
      farmSize: farmer.farmSize || ''
    });
    onToggleEdit?.();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentYear = new Date().getFullYear();
  const recentCrops = farmer.cropHistory
    .filter(crop => crop.year >= currentYear - 2)
    .sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-6">
      {/* Basic Profile */}
      <Card className="hover-elevate">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {getInitials(farmer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-semibold"
                  data-testid="input-farmer-name"
                />
              ) : (
                <CardTitle className="text-xl">{farmer.name}</CardTitle>
              )}
              <div className="text-sm text-muted-foreground mt-1">
                सदस्यत्व: {farmer.createdAt.toLocaleDateString('mr-IN')} / Member since: {farmer.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="outline" onClick={handleCancel} data-testid="button-cancel-edit">
                  <X className="w-4 h-4 mr-1" />
                  रद्द करा / Cancel
                </Button>
                <Button size="sm" onClick={handleSave} data-testid="button-save-profile">
                  <Save className="w-4 h-4 mr-1" />
                  जतन करा / Save
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={onToggleEdit} data-testid="button-edit-profile">
                <Edit className="w-4 h-4 mr-1" />
                संपादन / Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" />
                फोन नंबर / Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="फोन नंबर प्रविष्ट करा / Enter phone number"
                  data-testid="input-farmer-phone"
                />
              ) : (
                <div className="text-sm">{farmer.phone || 'फोन नंबर नाही / No phone number'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                स्थान / Location
              </Label>
              {isEditing ? (
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="गाव, तालुका / Village, Taluka"
                  data-testid="input-farmer-location"
                />
              ) : (
                <div className="text-sm">{farmer.location || 'स्थान नाही / No location'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                शेताचे क्षेत्र / Farm Size
              </Label>
              {isEditing ? (
                <Input
                  value={editData.farmSize}
                  onChange={(e) => setEditData(prev => ({ ...prev, farmSize: e.target.value }))}
                  placeholder="एकर मध्ये / In acres"
                  data-testid="input-farmer-farmsize"
                />
              ) : (
                <div className="text-sm">{farmer.farmSize || 'क्षेत्र नाही / No farm size'}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                भाषा प्राधान्य / Language Preference
              </Label>
              <Badge variant="outline">
                {farmer.preferredLanguage === 'mr' ? 'मराठी / Marathi' : farmer.preferredLanguage}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crop History */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            पिकाचा इतिहास / Crop History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCrops.length > 0 ? (
            <div className="space-y-3">
              {recentCrops.map((crop, index) => (
                <div key={`${crop.cropName}-${crop.year}-${crop.season}-${index}`} 
                     className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <div className="font-medium">{crop.cropName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {crop.season} {crop.year}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {crop.yield && (
                      <div className="text-sm font-medium">{crop.yield}</div>
                    )}
                    {crop.issues && crop.issues.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {crop.issues.slice(0, 2).map((issue, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Sprout className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div className="text-sm">
                पिकाचा इतिहास उपलब्ध नाही<br />
                No crop history available
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}