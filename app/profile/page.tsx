'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FarmerProfile, { FarmerProfileData } from '@/components/FarmerProfile';

// Mock farmer data - replace with actual data fetching
const mockFarmerData: FarmerProfileData = {
  id: '1',
  name: 'राजू पाटील',
  phone: '+91 9876543210',
  location: 'पुणे, महाराष्ट्र',
  farmSize: '5 एकर',
  preferredLanguage: 'mr',
  cropHistory: [
    {
      cropName: 'भात',
      season: 'खरीप',
      year: 2024,
      yield: '2.5 टन प्रति एकर',
      issues: ['पाण्याची कमतरता', 'कीडांचा प्रादुर्भाव']
    },
    {
      cropName: 'गहू',
      season: 'रब्बी',
      year: 2023,
      yield: '3 टन प्रति एकर',
      issues: ['मातीची गुणवत्ता']
    }
  ],
  createdAt: new Date('2024-01-15')
};

export default function ProfilePage() {
  const router = useRouter();
  const [farmerData, setFarmerData] = useState<FarmerProfileData>(mockFarmerData);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateProfile = (updates: Partial<FarmerProfileData>) => {
    setFarmerData(prev => ({ ...prev, ...updates }));
    // Here you would typically make an API call to save the updates
    console.log('Profile updated:', updates);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center gap-4 p-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            शेतकरी प्रोफाइल / Farmer Profile
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <FarmerProfile
          farmer={farmerData}
          onUpdateProfile={handleUpdateProfile}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
        />
      </div>
    </div>
  );
}