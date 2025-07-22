
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTopic {
  tag: string;
  posts: number;
  trending: string;
}

interface SuggestedUser {
  id: string;
  name: string;
  title: string;
  avatar: string;
  mutualConnections: number;
}

interface TrendingStats {
  activeStudents: number;
  availableGigs: number;
}

export const useTrendingData = () => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [stats, setStats] = useState<TrendingStats>({ activeStudents: 0, availableGigs: 0 });
  const [loading, setLoading] = useState(true);

  const fetchTrendingTopics = async () => {
    try {
      // Get trending topics from thoughts with community tags
      const { data: thoughtsData, error } = await supabase
        .from('thoughts')
        .select('community_tag, created_at')
        .not('community_tag', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      if (error) throw error;
      if (!thoughtsData) return;

      // Count posts by community tag
      const tagCounts: { [key: string]: number } = {};
      thoughtsData.forEach(thought => {
        if (thought.community_tag) {
          tagCounts[thought.community_tag] = (tagCounts[thought.community_tag] || 0) + 1;
        }
      });

      // Convert to trending format and calculate growth
      const trending = Object.entries(tagCounts)
        .map(([tag, count]) => ({
          tag,
          posts: count,
          trending: `+${Math.floor(Math.random() * 25 + 5)}%` // Simulated growth
        }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5);

      setTrendingTopics(trending);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      setTrendingTopics([]);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return;
      // Get all accepted connections for current user
      const { data: myConnections, error: connError } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');
      if (connError) throw connError;
      const myConnectionIds = new Set(
        myConnections?.map(c => c.requester_id === user.id ? c.addressee_id : c.requester_id)
      );
      // Get random users excluding current user
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, bio, avatar_url, skills, username')
        .neq('id', user.id)
        .not('full_name', 'is', null)
        .limit(3);
      if (usersError) throw usersError;
      if (!usersData) return;

      // For each suggested user, get their accepted connections
      const suggested = await Promise.all(usersData.map(async profile => {
        const { data: theirConnections } = await supabase
          .from('connections')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
          .eq('status', 'accepted');
        const theirConnectionIds = new Set(
          theirConnections?.map(c => c.requester_id === profile.id ? c.addressee_id : c.requester_id)
        );
        // Count mutuals
        const mutualConnections = [...myConnectionIds].filter(id => theirConnectionIds.has(id)).length;
        return {
          id: profile.id,
          name: profile.full_name || 'Anonymous User',
          username: profile.username || '',
          title: profile.skills?.[0] || profile.bio?.slice(0, 30) || 'Student',
          avatar: profile.avatar_url || '',
          mutualConnections
        };
      }));
      setSuggestedUsers(suggested);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      setSuggestedUsers([]);
    }
  };

  const fetchStats = async () => {
    try {
      // Get active students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('full_name', 'is', null);
      if (studentsError) throw studentsError;

      // Get available gigs count
      const { count: gigsCount, error: gigsError } = await supabase
        .from('gigs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      if (gigsError) throw gigsError;

      setStats({
        activeStudents: studentsCount || 0,
        availableGigs: gigsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ activeStudents: 0, availableGigs: 0 });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTrendingTopics(),
        fetchSuggestedUsers(),
        fetchStats()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  return {
    trendingTopics,
    suggestedUsers,
    stats,
    loading,
    refetch: () => {
      fetchTrendingTopics();
      fetchSuggestedUsers();
      fetchStats();
    }
  };
};
