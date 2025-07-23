
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash, Users, TrendingUp, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';
import { useNavigate } from 'react-router-dom';
import { useRealtimeCommunities } from "@/contexts/RealtimeCommunitiesContext";

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
  recent_activity_count: number;
}

interface RealtimeCommunitiesListProps {
  selectedCommunity?: string | null;
  onCommunitySelect?: (community: string | null) => void;
}

export const RealtimeCommunitiesList = ({ 
  selectedCommunity, 
  onCommunitySelect 
}: RealtimeCommunitiesListProps) => {
  const { communities } = useRealtimeCommunities();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [communities]);

  const handleCommunityClick = (communityName: string) => {
    if (onCommunitySelect) {
      onCommunitySelect(communityName);
    } else {
      navigate(`/communities/${communityName}`);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading communities...</div>;
  }

  return (
    <Card className="glass-card relative">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-10 flex flex-col items-center justify-center">
        <Lock className="w-8 h-8 text-white/70 mb-2" />
        <span className="text-white/80 font-medium">Coming Soon</span>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <TrendingUp className="w-5 h-5" />
          <span>Trending Communities</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {communities.map((community) => (
          <div 
            key={community.id} 
            className={`p-3 rounded-lg transition-colors ${
              selectedCommunity === community.name 
                ? 'bg-primary/20 border border-primary/30' 
                : 'bg-muted/50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <Hash className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">
                  {community.name}
                </h4>
                {community.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {community.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {community.member_count} members
                    </span>
                  </div>
                  <span className="text-xs text-primary font-medium">
                    {community.recent_activity_count} recent posts
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {communities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active communities this week. Create one by mentioning it in a thought!
          </p>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => communities.length === 0 ? navigate('/no-communities') : navigate('/communities')}
        >
          View All Communities
        </Button>
      </CardContent>
    </Card>
  );
};
