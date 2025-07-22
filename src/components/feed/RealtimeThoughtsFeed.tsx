import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ThoughtCard from './ThoughtCard';
import { useRealtime } from '@/hooks/useRealtime';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useRealtimeThoughts } from "@/contexts/RealtimeThoughtsContext";
import { useRealtimeLikes } from '@/hooks/useRealtimeLikes';

interface Thought {
  id: string;
  content: string;
  image_url?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: {
    name: string;
    avatar: string;
    college: string;
    verified: boolean;
    username: string;
  };
}

export const RealtimeThoughtsFeed = () => {
  const { thoughts } = useRealtimeThoughts();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onlineUsers } = useUserPresence('thoughts-feed');

  // Get all thought IDs for real-time likes
  const thoughtIds = thoughts.map((t: any) => t.id);
  const { likes, toggleLike } = useRealtimeLikes(thoughtIds);

  useEffect(() => {
    setLoading(false);
  }, [thoughts]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Loading thoughts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 text-center">
        <p>{error}</p>
        <button 
          onClick={() => {}}
          className="mt-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Online Users Indicator */}
      <div className="flex items-center space-x-2 p-4 backdrop-blur-sm bg-[#10151f]/80 border border-white/10 rounded-lg">
        <Users className="w-4 h-4 text-gray-300" />
        <span className="text-sm text-gray-300">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
        </span>
        <div className="flex space-x-1">
          {onlineUsers.slice(0, 3).map((user, index) => (
            <Badge key={user.user_id} variant="outline" className="text-xs bg-white/20 text-white border-white/10">
              {user.username}
            </Badge>
          ))}
          {onlineUsers.length > 3 && (
            <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/10">
              +{onlineUsers.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* Thoughts List */}
      {thoughts.map((thought: any) => (
        <ThoughtCard
          key={thought.id}
          content={thought.content}
          author={thought.user}
          timestamp={thought.created_at}
          likes={likes[thought.id]?.count ?? thought.likes_count}
          comments={thought.comments_count}
          tags={thought.tags}
          image={thought.image_url}
          isLiked={likes[thought.id]?.isLiked ?? false}
          onLike={() => toggleLike(thought.id)}
        />
      ))}

      {thoughts.length === 0 && (
        <div className="text-center py-12 text-gray-300">
          No thoughts yet. Be the first to share something!
        </div>
      )}
    </div>
  );
};
