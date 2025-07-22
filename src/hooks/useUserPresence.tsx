
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPresence {
  user_id: string;
  online_at: string;
  username?: string;
}

export const useUserPresence = (roomId: string = 'general') => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence-${roomId}`);

    const userStatus: UserPresence = {
      user_id: user.id,
      online_at: new Date().toISOString(),
      username: user.user_metadata?.username || user.email
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).flat().map((presence: any) => ({
          user_id: presence.user_id,
          online_at: presence.online_at,
          username: presence.username
        })) as UserPresence[];
        setOnlineUsers(users);
        console.log('Online users:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        const presenceTrackStatus = await channel.track(userStatus);
        console.log('Presence track status:', presenceTrackStatus);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId]);

  return { onlineUsers };
};
