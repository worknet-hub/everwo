
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LikeState {
  [thoughtId: string]: {
    count: number;
    isLiked: boolean;
  };
}

export const useRealtimeLikes = (thoughtIds: string[]) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<LikeState>({});
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!thoughtIds.length) {
      // Clean up channel if no thoughts to track
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const fetchLikes = async () => {
      try {
        const { data: likeCounts } = await supabase
          .from('thoughts')
          .select('id, likes_count')
          .in('id', thoughtIds);

        const { data: userLikes } = await supabase
          .from('thought_likes')
          .select('thought_id')
          .in('thought_id', thoughtIds)
          .eq('user_id', user?.id || '');

        const likeState: LikeState = {};
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

    fetchLikes();

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel with unique name
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channelName = `likes_${thoughtIds.join('_')}_${uniqueId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thought_likes',
          filter: `thought_id=in.(${thoughtIds.map(id => `"${id}"`).join(',')})`
        },
        (payload) => {
          if (!payload) return;
          fetchLikes();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'thoughts',
          filter: `id=in.(${thoughtIds.map(id => `"${id}"`).join(',')})`
        },
        (payload) => {
          if (!payload) return;
          fetchLikes();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [thoughtIds.join(','), user?.id]);

  const toggleLike = async (thoughtId: string) => {
    if (!user) return;

    try {
      const isCurrentlyLiked = likes[thoughtId]?.isLiked || false;
      console.log('Toggling like for thought:', thoughtId, 'Currently liked:', isCurrentlyLiked);

      // Optimistically update the UI
      setLikes(prev => ({
        ...prev,
        [thoughtId]: {
          count: (prev[thoughtId]?.count || 0) + (isCurrentlyLiked ? -1 : 1),
          isLiked: !isCurrentlyLiked
        }
      }));

      if (isCurrentlyLiked) {
        console.log('Removing like...');
        await supabase
          .from('thought_likes')
          .delete()
          .eq('thought_id', thoughtId)
          .eq('user_id', user.id);
      } else {
        console.log('Adding like and creating notification...');
        // Only insert if not already liked
        try {
          await supabase
            .from('thought_likes')
            .insert({
              thought_id: thoughtId,
              user_id: user.id
            });
        } catch (error: any) {
          if (error.code === '409') {
            // Already liked, ignore
            console.log('Like already exists, ignoring 409 conflict.');
          } else {
            console.error('Error inserting like:', error);
          }
        }
        // Create notification using RPC function
        const { data: notificationData, error: notificationError } = await supabase.rpc('create_like_notification_rpc', {
          p_thought_id: thoughtId,
          p_liker_id: user.id
        });
        if (notificationError) {
          console.error('Error creating like notification:', notificationError);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return { likes, toggleLike };
};
