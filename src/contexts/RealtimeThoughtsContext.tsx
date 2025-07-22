import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

const RealtimeThoughtsContext = createContext<any>(null);

export const RealtimeThoughtsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState([]);
  const [likes, setLikes] = useState({});

  const fetchThoughts = async () => {
    try {
      // Join profiles to get user info for each thought
      const { data, error } = await supabase
        .from("thoughts")
        .select(`*, profiles:user_id (full_name, avatar_url, college_name, college_verified, username)`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching thoughts:', error);
        return;
      }
      
      if (data) {
        // Shape each thought to always have a user object with username
        const shaped = data.map((thought: any) => ({
          ...thought,
          user: {
            name: thought.profiles?.full_name || 'Anonymous',
            avatar: thought.profiles?.avatar_url || '',
            college: thought.profiles?.college_name || '',
            verified: thought.profiles?.college_verified || false,
            username: thought.profiles?.username || '',
          },
        }));

        // Organize into threaded structure
        const topLevel = shaped.filter((t: any) => !t.parent_id);
        const replies = shaped.filter((t: any) => t.parent_id);
        // Map of id -> replies
        const repliesMap: Record<string, any[]> = {};
        replies.forEach((reply: any) => {
          if (!repliesMap[reply.parent_id]) repliesMap[reply.parent_id] = [];
          repliesMap[reply.parent_id].push(reply);
        });
        // Attach replies to top-level thoughts
        const threaded = topLevel.map((thought: any) => ({
          ...thought,
          replies: repliesMap[thought.id] || [],
        }));
        setThoughts(threaded);
      } else {
        setThoughts([]);
      }
    } catch (error) {
      console.error('Exception in fetchThoughts:', error);
      setThoughts([]);
    }
  };

  const fetchLikes = async () => {
    try {
      const thoughtIds = thoughts.map((t: any) => t.id);
      if (!thoughtIds.length) {
        setLikes({});
        return;
      }
      const { data: likeCounts } = await supabase
        .from('thoughts')
        .select('id, likes_count')
        .in('id', thoughtIds);
      const { data: userLikes } = await supabase
        .from('thought_likes')
        .select('thought_id')
        .in('thought_id', thoughtIds)
        .eq('user_id', user?.id || '');
      const likeState: any = {};
      likeCounts?.forEach(thought => {
        likeState[thought.id] = {
          count: thought.likes_count || 0,
          isLiked: userLikes?.some(like => like.thought_id === thought.id) || false
        };
      });
      setLikes(likeState);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  useEffect(() => {
    fetchThoughts();
  }, []);

  useEffect(() => {
    fetchLikes();
  }, [thoughts, user?.id]);

  // Use a single realtime subscription for thoughts with better error handling
  useRealtime({
    table: "thoughts",
    onUpdate: () => {
      console.log('Thoughts realtime update triggered');
      fetchThoughts();
    },
  });

  // Use a single realtime subscription for thought_likes
  useRealtime({
    table: "thought_likes",
    onUpdate: () => {
      console.log('Thought likes realtime update triggered');
      fetchLikes();
    },
  });

  const toggleLike = async (thoughtId: string) => {
    if (!user) return;
    try {
      const isCurrentlyLiked = likes[thoughtId]?.isLiked || false;
      // Optimistically update the UI
      setLikes((prev: any) => ({
        ...prev,
        [thoughtId]: {
          count: (prev[thoughtId]?.count || 0) + (isCurrentlyLiked ? -1 : 1),
          isLiked: !isCurrentlyLiked
        }
      }));
      if (isCurrentlyLiked) {
        await supabase
          .from('thought_likes')
          .delete()
          .eq('thought_id', thoughtId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('thought_likes')
          .insert({
            thought_id: thoughtId,
            user_id: user.id
          });
      }
      // No direct update to thoughts.likes_count here. The trigger will handle it.
      // The real-time subscription will refetch the count.
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      const isCurrentlyLiked = likes[thoughtId]?.isLiked || false;
      setLikes((prev: any) => ({
        ...prev,
        [thoughtId]: {
          count: (prev[thoughtId]?.count || 0) + (isCurrentlyLiked ? 1 : -1),
          isLiked: isCurrentlyLiked
        }
      }));
    }
  };

  return (
    <RealtimeThoughtsContext.Provider value={{ thoughts, likes, toggleLike }}>
      {children}
    </RealtimeThoughtsContext.Provider>
  );
};

export const useRealtimeThoughts = () => useContext(RealtimeThoughtsContext); 