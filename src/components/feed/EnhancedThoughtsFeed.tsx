import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { EnhancedThoughtCard } from './EnhancedThoughtCard';
import { useRealtimeThoughts } from "@/contexts/RealtimeThoughtsContext";

interface Thought {
  id: string;
  content: string;
  mentions: any[];
  community_id: string | null;
  community_name?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  user: {
    name: string;
    avatar: string;
    college: string;
    verified: boolean;
  };
  replies?: Thought[];
}

interface EnhancedThoughtsFeedProps {
  communityFilter?: string | null;
  filter?: 'public' | 'friends' | 'university';
  selectedThoughtId?: string | null;
}

export const EnhancedThoughtsFeed = ({ communityFilter, filter = 'public', selectedThoughtId }: EnhancedThoughtsFeedProps) => {
  const { thoughts, likes, toggleLike } = useRealtimeThoughts();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connectionIds, setConnectionIds] = useState<string[]>([]);
  const [userCollege, setUserCollege] = useState<string>('');

  // Debug: log the filter prop
  console.log('EnhancedThoughtsFeed received filter:', filter);

  // Fetch user's college from profiles table
  useEffect(() => {
    const fetchUserCollege = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('college_name')
          .eq('id', user.id)
          .single();
        
        if (data?.college_name) {
          setUserCollege(data.college_name);
        }
      } catch (error) {
        console.error('Error fetching user college:', error);
      }
    };

    fetchUserCollege();
  }, [user?.id]);

  // Filter thoughts by community if needed
  let filteredThoughts = communityFilter
    ? thoughts.filter((t: any) => t.community_name === communityFilter)
    : thoughts;

  // Always filter out connections-only thoughts for public feed
  if (filter === 'public') {
    filteredThoughts = filteredThoughts.filter((t: any) => t.visibility === 'public');
  }

  // For friends-only feed, show public thoughts and connections-only thoughts from friends/self
  if (filter === 'friends' && user) {
    filteredThoughts = filteredThoughts.filter((t: any) =>
      t.visibility === 'public' ||
      ((t.visibility === 'connections') && (connectionIds.includes(t.user_id) || t.user_id === user.id))
    );
  }

  // For university-only feed, show only thoughts with university visibility
  if (filter === 'university') {
    console.log('Applying university filter. User college:', userCollege);
    filteredThoughts = filteredThoughts.filter((t: any) => {
      // Show thoughts with university visibility
      const hasUniversityVisibility = t.visibility === 'university';
      console.log(`Thought ${t.id}: visibility "${t.visibility}" is university: ${hasUniversityVisibility}`);
      return hasUniversityVisibility;
    });
  }
  
  // Debug: log thoughts and user college
  console.log('All thoughts:', thoughts);
  console.log('User college:', userCollege);
  console.log('Filter:', filter);
  console.log('Filtered thoughts count:', filteredThoughts.length);

  // Gather all thought IDs for realtime likes (must be before any return)
  const thoughtIds = useMemo(() => filteredThoughts.map((t: any) => t.id), [filteredThoughts]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (filter === 'friends' && user) {
        const { data, error } = await supabase
          .from('connections')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted');
        if (data) {
          const ids = data.map((c: any) => c.requester_id === user.id ? c.addressee_id : c.requester_id);
          setConnectionIds(ids);
        } else {
          setConnectionIds([]);
        }
      } else {
        setConnectionIds([]);
      }
    };
    fetchConnections();
  }, [filter, user]);

  useEffect(() => {
    setLoading(false);
  }, [thoughts, connectionIds]);

  if (loading) {
    return <div className="p-6 text-center text-white">Loading thoughts...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0 pb-28">
      {filteredThoughts.map((thought: any, idx: number) => (
        <div key={thought.id} id={`thought-${thought.id}`}>
          <EnhancedThoughtCard
            id={thought.id}
            content={thought.content}
            author={{ ...thought.user, id: thought.user_id }}
            timestamp={thought.created_at}
            likes={thought.likes_count}
            comments={thought.comments_count}
            mentions={thought.mentions}
            communityName={thought.community_name}
            replies={thought.replies}
            onReplyPosted={() => {}}
            userId={thought.user_id}
            isLiked={likes[thought.id]?.isLiked ?? false}
            onToggleLike={() => toggleLike(thought.id)}
            likeCount={likes[thought.id]?.count ?? thought.likes_count}
            visibility={thought.visibility}
            image={thought.image_url} // Pass image_url to EnhancedThoughtCard
          />
          {/* Faint white line between thoughts, except after last */}
          {idx < filteredThoughts.length - 1 && (
            <div className="h-px bg-white w-full my-3" />
          )}
        </div>
      ))}

      {filteredThoughts.length === 0 && (
        <div className="text-center py-8 md:py-12 text-gray-300 px-4">
          {communityFilter 
            ? `No thoughts in ${communityFilter} community yet.`
            : 'No thoughts yet. Be the first to share something!'
          }
        </div>
      )}
    </div>
  );
};
