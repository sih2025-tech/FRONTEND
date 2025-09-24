'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileIconProps {
  farmerName?: string;
  className?: string;
}

export default function ProfileIcon({ 
  farmerName = 'राजू पाटील', 
  className = '' 
}: ProfileIconProps) {
  const router = useRouter();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleProfileClick}
      className={`h-10 w-10 p-0 hover:bg-accent transition-colors ${className}`}
      title="View Profile / प्रोफाइल पहा"
    >
      <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
          {farmerName ? getInitials(farmerName) : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
    </Button>
  );
}