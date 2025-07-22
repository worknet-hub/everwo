import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ThoughtCard from '@/components/feed/ThoughtCard';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface UserThoughtsListProps {
  userId: string;
}

export default function UserThoughtsList({ userId }: UserThoughtsListProps) {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchUserThoughts(true);
    // eslint-disable-next-line
  }, [userId]);

  async function fetchUserThoughts(initial = false) {
    if (fetchingMore) return;
    setFetchingMore(true);
    const { data, error } = await supabase
      .from('thoughts')
      .select(`*, profiles:user_id (full_name, avatar_url, college_name, college_verified, username)`)
      .eq('user_id', userId)
      .is('parent_id', null) // Only fetch top-level thoughts, not comments/replies
      .order('created_at', { ascending: false })
      .range(initial ? 0 : offset, (initial ? 0 : offset) + PAGE_SIZE - 1);
    if (!error && data) {
      if (initial) {
        setThoughts(data);
        setOffset(PAGE_SIZE);
      } else {
        setThoughts(prev => [...prev, ...data]);
        setOffset(prev => prev + PAGE_SIZE);
      }
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoading(false);
    setFetchingMore(false);
  }

  const loadMoreItems = () => {
    if (hasMore && !fetchingMore) {
      fetchUserThoughts(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (thoughts.length === 0) return <div>No thoughts posted yet.</div>;

  // Virtualized row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (index === thoughts.length) {
      // Loading spinner at the end
      return (
        <div style={style} className="flex items-center justify-center py-4">
          {hasMore ? 'Loading more...' : 'No more thoughts.'}
        </div>
      );
    }
    const thought = thoughts[index];
    const safeAuthor = {
      name: thought.profiles?.full_name || 'Anonymous',
      avatar: thought.profiles?.avatar_url || '',
      college: thought.profiles?.college_name || '',
      verified: thought.profiles?.college_verified || false,
      username: thought.profiles?.username || '',
      id: thought.user_id // Add id for navigation fallback
    };
    return (
      <div style={style}>
        <ThoughtCard
          key={thought.id}
          id={thought.id}
          author={safeAuthor}
          content={thought.content}
          timestamp={thought.created_at}
          likes={thought.likes_count}
          comments={thought.comments_count || 0}
          tags={thought.tags}
          image={thought.image_url}
          canDelete={true}
          onDelete={() => fetchUserThoughts(true)}
        />
      </div>
    );
  };

  // When user scrolls near the end, load more
  const handleItemsRendered = ({ visibleStopIndex }: { visibleStopIndex: number }) => {
    if (visibleStopIndex >= thoughts.length - 1 && hasMore && !fetchingMore) {
      loadMoreItems();
    }
  };

  return (
    <div style={{ height: '70vh', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={thoughts.length + (hasMore ? 1 : 0)}
            itemSize={210}
            width={width}
            onItemsRendered={({ visibleStopIndex }) => handleItemsRendered({ visibleStopIndex })}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
} 