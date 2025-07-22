
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimePostgresChangesFilter,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  event?: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`;
  filter?: string;
  onUpdate: () => void;
}

export const useRealtime = ({ table, event = '*', filter, onUpdate }: UseRealtimeOptions) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Reset retry count
    retryCountRef.current = 0;

    // Use a unique channel name based on table, event, filter, and a unique id
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channelName = filter ? `${table}-${event}-${filter}-${uniqueId}` : `${table}-${event}-${uniqueId}`;

    const changesFilter: RealtimePostgresChangesFilter<`${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`> = {
      event,
      schema: 'public',
      table,
    };
    if (filter) {
      changesFilter.filter = filter;
    }

    const setupSubscription = () => {
      try {
        console.log(`Setting up realtime subscription for ${table} (attempt ${retryCountRef.current + 1})`);
        
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            changesFilter as RealtimePostgresChangesFilter<'*'>,
            (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
              console.log(`Realtime update for ${table}:`, payload);
              onUpdate();
            }
          )
          .subscribe((status) => {
            console.log(`Realtime subscription status for ${table}:`, status);
            if (status === 'SUBSCRIBED') {
              isSubscribedRef.current = true;
              retryCountRef.current = 0; // Reset retry count on success
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error(`Realtime subscription failed for ${table}:`, status);
              isSubscribedRef.current = false;
              
              // Retry with exponential backoff, up to maxRetries
              if (retryCountRef.current < maxRetries) {
                const delay = Math.pow(2, retryCountRef.current) * 1000; // 1s, 2s, 4s
                retryCountRef.current++;
                
                retryTimeoutRef.current = setTimeout(() => {
                  console.log(`Retrying realtime subscription for ${table} (attempt ${retryCountRef.current + 1}/${maxRetries + 1})`);
                  setupSubscription();
                }, delay);
              } else {
                console.error(`Max retries reached for ${table} realtime subscription`);
              }
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error(`Error setting up realtime subscription for ${table}:`, error);
        
        // Retry with exponential backoff on error
        if (retryCountRef.current < maxRetries) {
          const delay = Math.pow(2, retryCountRef.current) * 1000;
          retryCountRef.current++;
          
          retryTimeoutRef.current = setTimeout(() => {
            console.log(`Retrying realtime subscription for ${table} after error (attempt ${retryCountRef.current + 1}/${maxRetries + 1})`);
            setupSubscription();
          }, delay);
        } else {
          console.error(`Max retries reached for ${table} realtime subscription after error`);
        }
      }
    };

    setupSubscription();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (channelRef.current && isSubscribedRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [table, event, filter, onUpdate]);
};
