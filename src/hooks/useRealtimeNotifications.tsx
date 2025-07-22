
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<any>(null);
  const mentionsChannelRef = useRef<any>(null);
  const commentsChannelRef = useRef<any>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // Removed .limit(50)

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const loadMoreNotifications = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Load more notifications

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading more notifications:', error);
    }
  };

  const deleteOldNotifications = async () => {
    if (!user) return;
    
    try {
      // Calculate date 1 day ago
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      // Log what will be deleted
      const { data: oldNotifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .lt('created_at', oneDayAgo.toISOString());
      console.log('Notifications to delete:', oldNotifs, 'Older than:', oneDayAgo.toISOString());
      // Use manual deletion first (more reliable)
      const { error, data } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .lt('created_at', oneDayAgo.toISOString());
      if (error) {
        console.error('Error deleting old notifications:', error);
      } else {
        console.log('Old notifications deleted successfully:', data);
      }
      // Always refresh notifications to update the UI
      await fetchNotifications();
    } catch (error) {
      console.error('Error in deleteOldNotifications:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      // Clean up any existing subscription when user logs out
      if (channelRef.current) {
        console.log('Cleaning up notifications subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (mentionsChannelRef.current) {
        console.log('Cleaning up mentions subscription');
        supabase.removeChannel(mentionsChannelRef.current);
        mentionsChannelRef.current = null;
      }
      if (commentsChannelRef.current) {
        console.log('Cleaning up comments subscription');
        supabase.removeChannel(commentsChannelRef.current);
        commentsChannelRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Delete old notifications every time user loads notifications
    deleteOldNotifications();

    // Get user's username
    const username = user.user_metadata?.username || user.email;
    console.log('Setting up notifications for user:', username);

    const setupMentionsDetection = async () => {
      console.log('Setting up mentions detection for:', username);

      // Subscribe to new thoughts
      const mentionsChannel = supabase
        .channel(`mentions_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'thoughts'
        }, async (payload) => {
          console.log('New thought detected:', payload);
          const content = payload.new?.content || '';
          const thoughtId = payload.new?.id;
          const authorId = payload.new?.user_id;

          console.log('Checking for mentions in content:', content);
          console.log('Looking for:', username, '16.azaan', '17.azaan');

          // Check if the thought mentions the current user
          if (content.includes(`@${username}`) || content.includes('16.azaan') || content.includes('17.azaan') || content.includes(username)) {
            console.log('Mention detected! Creating notification...');
            
            // Get the author's profile
            const { data: authorProfile } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', authorId)
              .single();

            const authorName = authorProfile?.full_name || authorProfile?.username || 'Someone';

            // Insert notification using RPC to bypass RLS
            const { data: notificationData, error: notificationError } = await supabase.rpc('create_notification', {
              p_user_id: user.id,
              p_type: 'mention',
              p_title: 'New Mention',
              p_content: `@${authorName} mentioned you in a thought: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
              p_link: `/thought/${thoughtId}`,
              p_is_read: false
            });

            if (notificationError) {
              console.error('Error creating notification:', notificationError);
            } else {
              console.log('Notification created successfully:', notificationData);
            }
          }
        })
        .subscribe((status) => {
          console.log('Mentions subscription status:', status);
        });

      mentionsChannelRef.current = mentionsChannel;

      // Subscribe to new comments
      const commentsChannel = supabase
        .channel(`comments_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'thoughts'
        }, async (payload) => {
          console.log('New thought detected (potential comment):', payload);
          const content = payload.new?.content || '';
          const thoughtId = payload.new?.id;
          const parentId = payload.new?.parent_id;
          const commenterId = payload.new?.user_id;

          // Only process if this is a comment (has parent_id)
          if (parentId && commenterId !== user.id) {
            console.log('Comment detected! Creating notification...');
            console.log('Parent thought ID:', parentId, 'Commenter:', commenterId, 'User:', user.id);

            // Check if this comment is on the current user's thought
            const { data: parentThought } = await supabase
              .from('thoughts')
              .select('user_id')
              .eq('id', parentId)
              .single();

            if (parentThought && parentThought.user_id === user.id) {
              console.log('Comment on user thought detected! Creating notification...');
              
              // Get the commenter's profile
              const { data: commenterProfile } = await supabase
                .from('profiles')
                .select('full_name, username')
                .eq('id', commenterId)
                .single();

              const commenterName = commenterProfile?.full_name || commenterProfile?.username || 'Someone';

              // Insert notification using RPC to bypass RLS
              const { data: notificationData, error: notificationError } = await supabase.rpc('create_comment_notification_rpc', {
                p_thought_id: parentId,
                p_commenter_id: commenterId,
                p_comment_content: content
              });

              if (notificationError) {
                console.error('Error creating comment notification:', notificationError);
              } else {
                console.log('Comment notification created successfully:', notificationData);
              }
            }
          }
        })
        .subscribe((status) => {
          console.log('Comments subscription status:', status);
        });

      commentsChannelRef.current = commentsChannel;
    };

    fetchNotifications();
    setupMentionsDetection();

    // Set up scheduled cleanup every 6 hours
    const cleanupInterval = setInterval(() => {
      deleteOldNotifications();
    }, 6 * 60 * 60 * 1000); // Run every 6 hours

    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel with unique name
    const channelName = `notifications_${user.id}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq."${user.id}"`
        },
        (payload) => {
          if (!payload) return;
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log('Notifications subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up notifications subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (mentionsChannelRef.current) {
        supabase.removeChannel(mentionsChannelRef.current);
        mentionsChannelRef.current = null;
      }
      if (commentsChannelRef.current) {
        supabase.removeChannel(commentsChannelRef.current);
        commentsChannelRef.current = null;
      }
      // Clear the cleanup interval
      clearInterval(cleanupInterval);
    };
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });
      
      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        console.log('Notification marked as read:', data);
        // Refresh notifications to update the UI
        const { data: updatedNotifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (updatedNotifications) {
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter(n => !n.is_read).length);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
      } else {
        console.log('All notifications marked as read:', data);
        // Refresh notifications to update the UI
        const { data: updatedNotifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (updatedNotifications) {
          setNotifications(updatedNotifications);
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    deleteOldNotifications
  };
};
