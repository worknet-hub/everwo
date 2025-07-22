
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ThoughtCard from '../feed/ThoughtCard';
import { useRealtime } from '@/hooks/useRealtime';
import { CommunityThoughtComposer } from '../feed/CommunityThoughtComposer';

interface CommunityFeedProps {
  community: string;
  onBack: () => void;
}

interface Thought {
  id: string;
  content: string;
  image_url?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  community_tag: string;
  user: {
    name: string;
    avatar: string;
    college: string;
    verified: boolean;
  };
}

export const CommunityFeed = ({ community, onBack }: CommunityFeedProps) => {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInterests, setUserInterests] = useState<string[]>([]); // NEW

  // DEBUG: Log when fetchCommunityThoughts is called
  const fetchCommunityThoughts = async () => {
    console.log('Fetching community thoughts...');
    if (!user?.id) return;

    // First get user's college
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('college_name')
      .eq('id', user.id)
      .single();

    if (!userProfile?.college_name) {
      setLoading(false);
      return;
    }

    // Fetch thoughts from same college with the community tag
    const { data: thoughtsData } = await supabase
      .from('thoughts')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          college_name,
          college_verified
        )
      `)
      .eq('visibility', 'public')
      .eq('community_tag', community)
      .order('created_at', { ascending: false })
      .limit(50);

    if (thoughtsData) {
      const formattedThoughts = thoughtsData
        .filter(thought => thought.profiles?.college_name === userProfile.college_name)
        .map(thought => ({
          id: thought.id,
          content: thought.content,
          image_url: thought.image_url,
          tags: thought.tags || [],
          likes_count: thought.likes_count || 0,
          comments_count: thought.comments_count || 0,
          created_at: thought.created_at,
          community_tag: thought.community_tag,
          user: {
            name: thought.profiles?.full_name || 'Anonymous',
            avatar: thought.profiles?.avatar_url || '',
            college: thought.profiles?.college_name || '',
            verified: thought.profiles?.college_verified || false
          }
        }));
      setThoughts(formattedThoughts);
    }
    setLoading(false);
  };

  const fetchCommunityThoughtsCallback = useCallback(fetchCommunityThoughts, [community, user?.id]);

  useEffect(() => {
    fetchCommunityThoughtsCallback();
  }, [fetchCommunityThoughtsCallback]);

  // Removed useRealtime subscription for 'thoughts'

  // Fetch user interests for composer validation
  useEffect(() => {
    const fetchInterests = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('interests')
        .eq('id', user.id)
        .single();
      if (data?.interests) setUserInterests(data.interests);
    };
    fetchInterests();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Loading community...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">{community}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{community} Community</h2>
          <p className="text-muted-foreground">
            Thoughts from {community} enthusiasts at your university
          </p>
        </div>

        {/* Community Thought Composer - always posts to this community */}
        <div className="mb-8">
          <CommunityThoughtComposer
            userInterests={userInterests}
            onThoughtPosted={fetchCommunityThoughtsCallback}
            fixedCommunity={community}
          />
        </div>

        <div className="space-y-6">
          {thoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              content={`@${thought.community_tag} ${thought.content}`}
              author={thought.user}
              timestamp={new Date(thought.created_at).toLocaleString()}
              likes={thought.likes_count}
              comments={thought.comments_count}
              tags={thought.tags}
              image={thought.image_url}
            />
          ))}

          {thoughts.length === 0 && (
            <div className="text-center py-12">
              <span className="block mb-4 text-muted-foreground" style={{ fontSize: '3rem', fontWeight: 600, lineHeight: 1, textAlign: 'center' }}>@</span>
              <h3 className="text-lg font-semibold mb-2">No thoughts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share a thought in the {community} community!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
