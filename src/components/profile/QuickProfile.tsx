import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';
import { AvatarUpload } from './AvatarUpload';
import { useRealtimeProfile } from "@/contexts/RealtimeProfileContext";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  college_name: string;
  college_verified: boolean;
  skills: string[];
  rating: number;
  location: string;
  availability_status: string;
  badges: string[];
}

export const QuickProfile = ({ userId, onClose }: QuickProfileProps) => {
  const { profiles } = useRealtimeProfile();
  const profile = profiles?.find((p: any) => p.id === userId) || null;
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use real-time updates for profile data
  // Removed useRealtime subscription for profiles

  useEffect(() => {
    if (user?.id) {
      // fetchProfile(); // This line is removed
    }
  }, [user?.id]);



  const handleViewFullProfile = () => {
    if (profile?.username && profile.username.trim() !== '') {
      navigate(`/profile/${profile.username}`);
    } else if (profile?.id) {
      navigate(`/profile/${profile.id}`);
    }
  };



  if (!profile) {
    return (
      <Card className="bg-black border border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-white">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black text-white shadow-none border-0">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center justify-center w-full">
          <AvatarUpload
            currentAvatar={profile.avatar_url}
            userName={profile.full_name}
            onAvatarChange={() => {}} // No longer needed
            size="md"
          />
        </div>
        <div className="flex justify-center mt-4 mb-2">
          <div className="bg-white text-black rounded-2xl px-4 py-2 font-semibold text-base shadow border border-gray-200">
            {profile.full_name}
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 mt-2">
          <MapPin className="w-4 h-4" />
          <span>{profile.college_name || profile.location || 'Location not set'}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">


        {/* Quick Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start bg-white/10 hover:bg-white/20 text-white"
            onClick={handleViewFullProfile}
          >
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickProfile;
