import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  Hash,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useTrendingData } from '@/hooks/useTrendingData';
import { useNavigate } from 'react-router-dom';

interface TrendingSidebarProps {
  onCommunitySelect?: (community: string) => void;
}

const TrendingSidebar = ({ onCommunitySelect }: TrendingSidebarProps) => {
  const { trendingTopics, stats, loading } = useTrendingData();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();
      setOnboardingCompleted(profile?.onboarding_completed ?? false);
    };
    fetchOnboardingStatus();
  }, [user]);

  const handleTopicClick = (tag: string) => {
    if (onCommunitySelect) {
      onCommunitySelect(tag);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-[rgba(0,0,0,0.7)] shadow-2xl border border-white/10 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg text-white">
              <TrendingUp className="w-5 h-5" />
              <span>Trending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4 bg-white/20" />
                  <Skeleton className="w-20 h-4 bg-white/20" />
                </div>
                <Skeleton className="w-12 h-4 bg-white/20" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="bg-[rgba(0,0,0,0.7)] shadow-2xl border border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Skeleton className="w-16 h-8 mx-auto bg-white/20" />
              <Skeleton className="w-24 h-4 mx-auto bg-white/20" />
              <Skeleton className="w-12 h-6 mx-auto bg-white/20" />
              <Skeleton className="w-20 h-4 mx-auto bg-white/20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card className="bg-[rgba(0,0,0,0.7)] shadow-2xl border border-white/10 text-white relative overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg text-white">
            <TrendingUp className="w-5 h-5" />
            <span>Trending</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.length === 0 ? (
            <p className="text-gray-300 text-sm">No trending topics yet</p>
          ) : (
            trendingTopics.map((topic, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors pointer-events-none"
              >
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-300" />
                  <div>
                    <p className="font-medium text-sm group-hover:text-white transition-colors text-white">
                      {topic.tag}
                    </p>
                    <p className="text-xs text-gray-300">{topic.posts} posts</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/10">
                  {topic.trending}
                </Badge>
              </div>
            ))
          )}
          {trendingTopics.length > 0 && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm text-gray-300 hover:bg-white/10 hover:text-white pointer-events-none"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Communities
            </Button>
          )}
        </CardContent>
      </Card>
      {/* Quick Stats */}
      <Card className="bg-[rgba(0,0,0,0.7)] shadow-2xl border border-white/10 text-white">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-white">{stats.activeStudents.toLocaleString()}</div>
            <p className="text-sm text-gray-300">Active Students</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingSidebar;
