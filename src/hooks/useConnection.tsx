
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useConnection = (userId?: string) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const checkConnection = useCallback(async (partnerId: string) => {
    if (!userId) return;
    
    const { data, error } = await supabase.rpc('are_users_connected', {
      user1_id: userId,
      user2_id: partnerId
    });

    if (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } else {
      setIsConnected(data);
    }
  }, [userId]);

  const sendConnectionRequest = useCallback(async (partnerId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('connections')
      .insert({
        requester_id: user.id,
        addressee_id: partnerId,
        status: 'pending'
      });

    if (error) {
      throw error;
    }
  }, []);

  return {
    isConnected,
    setIsConnected,
    checkConnection,
    sendConnectionRequest
  };
};

export const getPendingSentRequests = async (userId: string) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('connections')
    .select('addressee_id')
    .eq('requester_id', userId)
    .eq('status', 'pending');
  if (error) {
    console.error('Error fetching pending sent requests:', error);
    return [];
  }
  return data ? data.map((c: any) => c.addressee_id) : [];
};

export const cancelPendingRequest = async (requesterId: string, addresseeId: string) => {
  if (!requesterId || !addresseeId) return;
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('requester_id', requesterId)
    .eq('addressee_id', addresseeId)
    .eq('status', 'pending');
  if (error) {
    console.error('Error cancelling pending request:', error);
    throw error;
  }
};
