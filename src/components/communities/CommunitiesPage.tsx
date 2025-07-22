import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CommunityFeed } from './CommunityFeed';
import { RealtimeCommunitiesList } from './RealtimeCommunitiesList';

interface Profile {
  interests: string[];
  college_name: string;
}

export const CommunitiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('profiles')
      .select('interests, college_name')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  if (selectedCommunity) {
    return (
      <CommunityFeed 
        community={selectedCommunity}
        onBack={() => setSelectedCommunity(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
              <Users className="w-6 h-6" />
              {/* <img src="/logo.png" alt="Everwo Logo" className="h-8 w-auto ml-2" /> */}
            </Link>
          </div>
          <h1 className="text-lg font-semibold">Communities</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Your Communities</h2>
          <p className="text-muted-foreground">
            Connect with students at {profile?.college_name || 'your university'} who share your interests
          </p>
        </div>

        <RealtimeCommunitiesList 
          selectedCommunity={selectedCommunity} 
          onCommunitySelect={setSelectedCommunity} 
        />
      </div>
    </div>
  );
};
