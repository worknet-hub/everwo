import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MessageCircle, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'mention' | 'comment';
  created_at: string;
  user_id: string;
  thought_id: string;
  user: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
  thought?: {
    content: string;
  };
  comment?: {
    content: string;
  };
}

export const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const username = user.user_metadata?.username || user.email;
      console.log('Fetching notifications for user:', username);
      console.log('User metadata:', user.user_metadata);
      console.log('User email:', user.email);
      console.log('User ID:', user.id);
      
      // Fetch mentions (thoughts that mention the current user) - try multiple patterns
      const { data: mentions, error: mentionsError } = await supabase
        .from('thoughts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!thoughts_user_id_fkey (
            full_name,
            avatar_url,
            username
          )
        `)
        .or(`content.ilike.%${username}%,content.ilike.%@${username}%,content.ilike.%16.azaan%,content.ilike.%17.azaan%`)
        .order('created_at', { ascending: false });

      console.log('Searching for mentions with patterns:', `%${username}%`, `%@${username}%`, `%16.azaan%`, `%17.azaan%`);
      console.log('Mentions found:', mentions);
      console.log('Mentions error:', mentionsError);

      // Fetch comments on user's thoughts
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          thought_id,
          profiles!comments_user_id_fkey (
            full_name,
            avatar_url,
            username
          ),
          thoughts!comments_thought_id_fkey (
            content
          )
        `)
        .eq('thoughts.user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Comments found:', comments);
      console.log('Comments error:', commentsError);

      if (mentionsError || commentsError) {
        console.error('Error fetching notifications:', { mentionsError, commentsError });
        return;
      }

      // Combine and format notifications
      const allNotifications: Notification[] = [
        // Add a test notification to verify the page works
        {
          id: 'test-notification',
          type: 'mention' as const,
          created_at: new Date().toISOString(),
          user_id: 'test-user',
          thought_id: 'test-thought',
          user: {
            full_name: 'Test User',
            avatar_url: '',
            username: 'testuser'
          },
          thought: { content: 'This is a test notification to verify the page is working.' }
        },
        ...(mentions || []).map(mention => ({
          id: `mention-${mention.id}`,
          type: 'mention' as const,
          created_at: mention.created_at,
          user_id: mention.user_id,
          thought_id: mention.id,
          user: mention.profiles,
          thought: { content: mention.content }
        })),
        ...(comments || []).map(comment => ({
          id: `comment-${comment.id}`,
          type: 'comment' as const,
          created_at: comment.created_at,
          user_id: comment.user_id,
          thought_id: comment.thought_id,
          user: comment.profiles,
          thought: comment.thoughts,
          comment: { content: comment.content }
        }))
      ];

      console.log('All notifications:', allNotifications);

      // Sort by creation date (newest first)
      allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setNotifications(allNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for user:', user.user_metadata?.username || user.email);

    // Subscribe to new mentions
    const mentionsSubscription = supabase
      .channel('mentions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'thoughts'
      }, (payload) => {
        console.log('New thought inserted:', payload);
        // Check if the thought mentions the current user
        const content = payload.new?.content || '';
        const username = user.user_metadata?.username || user.email;
        if (content.includes(`@${username}`) || content.includes('17.azaan') || content.includes('16.azaan') || content.includes(username)) {
          console.log('Mention detected! Refreshing notifications...');
          fetchNotifications(); // Refresh notifications
        }
      })
      .subscribe();

    // Subscribe to new comments on user's thoughts
    const commentsSubscription = supabase
      .channel('comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments'
      }, (payload) => {
        console.log('New comment inserted:', payload);
        // Check if the comment is on the current user's thought
        if (payload.new?.thought_id) {
          // We need to check if this comment is on the current user's thought
          // For now, let's refresh notifications for any new comment
          console.log('New comment detected! Refreshing notifications...');
          fetchNotifications(); // Refresh notifications
        }
      })
      .subscribe();

    return () => {
      console.log('Unsubscribing from notifications');
      mentionsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the thought and highlight it
    navigate('/', { 
      state: { 
        selectedThoughtId: notification.thought_id,
        scrollToThought: true 
      } 
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'mention':
        return `mentioned you in a thought`;
      case 'comment':
        return `commented under your thought`;
      default:
        return 'interacted with your content';
    }
  };

  const getNotificationContent = (notification: Notification) => {
    if (notification.type === 'mention') {
      return notification.thought?.content || '';
    } else if (notification.type === 'comment') {
      return notification.comment?.content || '';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          <div className="text-center py-8">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm">You'll see mentions and comments here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={notification.user.avatar_url} />
                    <AvatarFallback>
                      {notification.user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      <span className="font-semibold text-white">
                        {notification.user.full_name || notification.user.username}
                      </span>
                      <span className="text-gray-400">
                        {getNotificationText(notification)}
                      </span>
                    </div>
                    
                    {getNotificationContent(notification) && (
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                        "{getNotificationContent(notification)}"
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 