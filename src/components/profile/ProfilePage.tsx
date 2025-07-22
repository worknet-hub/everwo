import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home,
  ArrowLeft
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { ProfileHeader } from './ProfileHeader';
import { ProfileOverviewTab } from './ProfileOverviewTab';
import { useRealtimeProfile } from "@/contexts/RealtimeProfileContext";
import SavedThoughtsList from './SavedThoughtsList';
import UserThoughtsList from './UserThoughtsList';
import { ReferralInfo } from './ReferralInfo';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  college_name: string;
  college_verified: boolean;
  skills: string[];
  portfolio: string[];
  rating: number;
  location: string;
  availability_status: string;
  badges: string[];
  created_at: string;
  available: boolean;
  college: string;
  interests: string[];
  onboarding_completed: boolean;
}

interface ProfilePageProps {
  profileId?: string;
}

export const ProfilePage = ({ profileId }: ProfilePageProps) => {
  const { user } = useAuth();
  const { profiles, connections, fetchProfiles } = useRealtimeProfile();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [fetchedProfile, setFetchedProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Try to find profile by id, then by username
  let profile = null;
  if (profileId) {
    profile = profiles?.find((p: any) => p.id === profileId) || profiles?.find((p: any) => p.username === profileId) || null;
  } else {
    profile = profiles?.find((p: any) => p.id === user?.id) || null;
  }

  // Fallback: fetch from Supabase if not found in context
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (profile || !profileId) return;
      setLoadingProfile(true);
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${profileId},username.eq.${profileId}`)
        .single();
      if (isMounted) {
        setFetchedProfile(data || null);
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [profile, profileId]);

  const finalProfile = profile || fetchedProfile;

  // More robust isOwnProfile logic
  const isOwnProfile = !profileId || 
    profileId === user?.id || 
    profileId === user?.username ||
    (finalProfile && finalProfile.id === user?.id) ||
    (finalProfile && finalProfile.username === user?.username);
  
  // Debug logging
  console.log('🔍 Profile Debug:', {
    profileId,
    user_id: user?.id,
    user_username: user?.username,
    finalProfile_id: finalProfile?.id,
    finalProfile_username: finalProfile?.username,
    isOwnProfile,
    condition1: !profileId,
    condition2: profileId === user?.id,
    condition3: profileId === user?.username,
    condition4: finalProfile && finalProfile.id === user?.id,
    condition5: finalProfile && finalProfile.username === user?.username
  });
  
  // Check if onboarding is completed
  const onboardingCompleted = finalProfile?.onboarding_completed;

  const handleAvatarChange = (newAvatarUrl: string) => {
    // Optionally update avatar locally for instant UI feedback
    // Real-time update will come from context
    if (fetchProfiles) fetchProfiles();
  };

  if (!finalProfile || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <img src="/logo.png" alt="Loading..." className="w-48 h-48 object-contain animate-pulse" style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
      </div>
    );
  }

  const tabs = ['overview', 'thoughts'];
  if (isOwnProfile) tabs.push('saved');
  if (isOwnProfile) tabs.push('referral');

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-34 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-foreground hover:opacity-80 transition-opacity">
              {/* <img src="/logo.png" alt="Everwo Logo" className="w-32 h-32 object-contain" /> */}
              {/* <span>Everwo</span> */}
            </Link>
          </div>
          <h1 className="text-lg font-semibold">Profile</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto px-0 sm:px-6 space-y-6 pb-24 flex flex-col items-center">
        {/* Header */}
        <div className="w-full relative">
          {/* Removed duplicate ProfileHeader in md:block absolute left-0 top-0 z-20 */}
          <Card className="shadow-none border-0">
            <CardContent className="p-8 pt-8 md:pt-12">
              <ProfileHeader 
                profile={finalProfile} 
                isOwnProfile={isOwnProfile} 
                onEditClick={() => setShowEditModal(true)}
                onAvatarChange={isOwnProfile ? handleAvatarChange : undefined}
                connections={connections}
                hideMenu
              />
              {/* Start Onboarding Button - only for own profile */}
              {/* {isOwnProfile && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => navigate('/onboarding')} className="bg-gradient-to-r from-emerald-400 to-blue-500 text-white font-semibold px-6 py-2 rounded-xl shadow-md">
                    Start Onboarding
                  </Button>
                </div>
              )} */}
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="thoughts">Thoughts</TabsTrigger>
            <TabsTrigger value="saved" className={!isOwnProfile ? 'hidden' : ''}>Saved</TabsTrigger>
            <TabsTrigger value="referral" className={!isOwnProfile ? 'hidden' : ''}>Referral</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProfileOverviewTab profile={finalProfile} isOwnProfile={isOwnProfile} />
          </TabsContent>

          <TabsContent value="thoughts" className="space-y-6">
            <UserThoughtsList userId={finalProfile.id} />
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {isOwnProfile ? (
              <SavedThoughtsList userId={finalProfile.id} />
            ) : (
              <div className="text-center text-gray-400 py-8">
                This tab is only available for your own profile.
              </div>
            )}
          </TabsContent>

          <TabsContent value="referral" className="space-y-6">
            {isOwnProfile && finalProfile?.id && (
              <ReferralInfo userId={finalProfile.id} />
            )}
          </TabsContent>
        </Tabs>

        {/* Place ReferralInfo below the tabs for better fit */}
        {/* Removed ReferralInfo below the tabs */}

        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={finalProfile}
          onProfileUpdated={() => {}}
        />
      </div>
    </div>
  );
};
