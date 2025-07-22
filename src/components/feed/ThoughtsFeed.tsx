
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ThoughtCard from './ThoughtCard';
import { CommunityThoughtComposer } from './CommunityThoughtComposer';
import { toast } from 'sonner';

interface Thought {
  id: string;
  content: string;
  image_url?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  author: {
    full_name: string;
    username: string;
    avatar_url: string;
    college_name: string;
    college_verified: boolean;
  };
}

const ThoughtsFeed = () => {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newThought, setNewThought] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    // Mock thoughts data with more variety
    const mockThoughts: Thought[] = [
      {
        id: '1',
        content: "Just finished my first React Native app! The journey from web development to mobile has been amazing. Special thanks to @TechMentors community for the guidance 🚀",
        image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
        tags: ["ReactNative", "Mobile", "FirstProject"],
        likes_count: 24,
        comments_count: 8,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user_id: '1',
        author: {
          full_name: "Sarah Chen",
          username: "sarahc",
          avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face",
          college_name: "MIT",
          college_verified: true
        }
      },
      {
        id: '2',
        content: "Looking for a UI/UX designer to collaborate on a climate change awareness app. This is a passion project but could lead to something bigger! DM me if interested 🌱",
        tags: ["Collaboration", "ClimateChange", "UIUX", "Startup"],
        likes_count: 15,
        comments_count: 12,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user_id: '2',
        author: {
          full_name: "Alex Rodriguez",
          username: "alexr",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
          college_name: "Stanford",
          college_verified: false
        }
      },
      {
        id: '3',
        content: "Pro tip: Always version control your Jupyter notebooks! Just lost 3 hours of work because I forgot to commit my changes. Learn from my mistakes 😅",
        tags: ["DataScience", "Git", "ProTip", "MachineLearning"],
        likes_count: 42,
        comments_count: 18,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user_id: '3',
        author: {
          full_name: "Maya Patel",
          username: "mayap",
          avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
          college_name: "Berkeley",
          college_verified: true
        }
      },
      {
        id: '4',
        content: "Excited to announce that our startup just got accepted into Y Combinator! 🎉 This journey started as a simple college project and now we're building the future of education tech. Never give up on your dreams!",
        image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
        tags: ["Startup", "YCombinator", "EdTech", "Dreams"],
        likes_count: 89,
        comments_count: 35,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        user_id: '4',
        author: {
          full_name: "David Kim",
          username: "davidk",
          avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
          college_name: "Harvard",
          college_verified: true
        }
      }
    ];
    setThoughts(mockThoughts);
  };

  const postThought = async () => {
    if (!newThought.trim() || !user) return;

    setIsPosting(true);
    try {
      // Extract hashtags from content
      const hashtags = newThought.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];
      
      // Mock posting
      const newPost: Thought = {
        id: Date.now().toString(),
        content: newThought,
        tags: hashtags,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        user_id: user.id,
        author: {
          full_name: "You",
          username: "you",
          avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face",
          college_name: "Your College",
          college_verified: false
        }
      };

      setThoughts(prev => [newPost, ...prev]);
      setNewThought('');
      toast.success('Thought posted successfully!');
    } catch (error) {
      toast.error('Failed to post thought');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts with the community... Use #hashtags to categorize your post!"
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {newThought.length}/500 characters
              </span>
              <Button 
                onClick={postThought} 
                disabled={!newThought.trim() || isPosting}
                className="gradient-bg"
              >
                {isPosting ? 'Posting...' : 'Share Thought'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Options */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Latest Thoughts</h2>
        <div className="flex space-x-2">
          <Button variant="default" size="sm">
            Following
          </Button>
          <Button variant="outline" size="sm">
            Trending
          </Button>
          <Button variant="outline" size="sm">
            Campus
          </Button>
        </div>
      </div>
      
      {/* Thoughts List */}
      <div className="space-y-6">
        {thoughts.map((thought) => (
          <ThoughtCard 
            key={thought.id} 
            author={{
              name: thought.author.full_name,
              avatar: thought.author.avatar_url,
              college: thought.author.college_name,
              verified: thought.author.college_verified,
              username: thought.author.username // Pass username to ThoughtCard
            }}
            content={thought.content}
            timestamp={new Date(thought.created_at).toLocaleString()}
            likes={thought.likes_count}
            comments={thought.comments_count}
            tags={thought.tags}
            image={thought.image_url}
          />
        ))}
      </div>
    </div>
  );
};

export default ThoughtsFeed;
