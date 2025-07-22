import { useEffect, useState, useCallback } from 'react';
import { supabase, withRetry } from '@/integrations/supabase/client';
import EnhancedThoughtCard from '@/components/feed/EnhancedThoughtCard';
import { useRealtime } from '@/hooks/useRealtime';
import { useAuth } from '@/hooks/useAuth';

interface SavedThoughtsListProps {
  userId: string;
}

export default function SavedThoughtsList({ userId }: SavedThoughtsListProps) {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize fetchSavedThoughts to avoid recreating the function on every render
  const fetchSavedThoughts = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided, skipping fetch');
      return; // Prevent undefined userId
    }
    
    if (!user) {
      console.log('No authenticated user, skipping fetch');
      return;
    }
    
    // Check if user session is valid
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      console.log('No valid session found');
      return;
    }
    
    console.log('User session valid:', session.user.id);
    
    try {
      console.log('Fetching saved thoughts for user:', userId);
      
      // First, get the saved thought IDs with retry
      const { data: savedThoughts, error: savedError } = await withRetry(
        () => supabase
          .from('saved_thoughts')
          .select('thought_id')
          .eq('user_id', userId),
        3,
        'fetch saved thoughts'
      );
      
      console.log('Saved thoughts query result:', { data: savedThoughts, error: savedError });
      
      if (savedError) {
        console.error('Error fetching saved thoughts:', savedError);
        if (savedError.code === '406') {
          setError('Unable to load saved thoughts due to browser extension interference. Try disabling extensions or using incognito mode.');
        } else {
          setError('Failed to load saved thoughts');
        }
        setLoading(false);
        return;
      }
      
      if (!savedThoughts || savedThoughts.length === 0) {
        setThoughts([]);
        setLoading(false);
        return;
      }
      
      // Extract thought IDs
      const thoughtIds = savedThoughts.map(st => st.thought_id);
      
      console.log('Fetching thoughts with IDs:', thoughtIds);
      
      // Then fetch the actual thoughts first with retry
      const { data: thoughtsData, error: thoughtsError } = await withRetry(
        () => supabase
          .from('thoughts')
          .select('*')
          .in('id', thoughtIds),
        3,
        'fetch thoughts'
      );
      
      console.log('Thoughts query result:', { data: thoughtsData, error: thoughtsError });
      
      if (thoughtsError) {
        console.error('Error fetching thoughts:', thoughtsError);
        if (thoughtsError.code === '406') {
          setError('Unable to load thoughts due to browser extension interference. Try disabling extensions or using incognito mode.');
        } else {
          setError('Failed to load thoughts');
        }
        setLoading(false);
        return;
      }
      
      if (!thoughtsData || thoughtsData.length === 0) {
        setThoughts([]);
        setLoading(false);
        return;
      }
      
      // Then fetch the profiles separately with retry
      const userIds = [...new Set(thoughtsData.map(t => t.user_id))];
      const { data: profilesData, error: profilesError } = await withRetry(
        () => supabase
          .from('profiles')
          .select('id, full_name, avatar_url, college_name, college_verified, username')
          .in('id', userIds),
        3,
        'fetch profiles'
      );
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles
      }
      
      if (thoughtsData) {
        // Create a map of profiles for quick lookup
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
        
        const formattedThoughts = thoughtsData.map((thought) => {
          const profile = profilesMap.get(thought.user_id);
          return {
            id: thought.id,
            author: {
              name: profile?.full_name || 'Anonymous',
              avatar: profile?.avatar_url || '',
              college: profile?.college_name || '',
              verified: profile?.college_verified || false,
              username: profile?.username || '',
              id: thought.user_id
            },
            content: thought.content || '',
            timestamp: thought.created_at || new Date().toISOString(),
            likes: thought.likes_count || 0,
            comments: thought.comments_count || 0,
            tags: thought.tags || [],
            image: thought.image_url || undefined,
          };
        });
        setThoughts(formattedThoughts);
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Exception in fetchSavedThoughts:', error);
      setError('An unexpected error occurred while loading saved thoughts');
    }
    
    setLoading(false);
  }, [userId, user]);

  useEffect(() => {
    fetchSavedThoughts();
  }, [fetchSavedThoughts]);

  // Real-time updates for saved thoughts
  // Removed useRealtime subscription for saved_thoughts

  console.log('SavedThoughtsList thoughts:', thoughts);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>;
  if (!Array.isArray(thoughts)) return <div className="text-red-500">Error: thoughts is not an array.</div>;
  if (thoughts.length === 0) return <div>No saved thoughts yet.</div>;

  return (
    <div className="space-y-4">
      {thoughts.map((thought) => {
        // Safety check to ensure all required props are valid
        if (!thought || !thought.id || !thought.author) {
          console.warn('Invalid thought data:', thought);
          return null;
        }
        
        return (
          <EnhancedThoughtCard
            key={thought.id}
            id={thought.id}
            content={thought.content}
            author={thought.author}
            timestamp={thought.timestamp}
            likes={thought.likes}
            comments={thought.comments}
            tags={thought.tags}
            image={thought.image}
            onReplyPosted={fetchSavedThoughts}
          />
        );
      })}
    </div>
  );
}
