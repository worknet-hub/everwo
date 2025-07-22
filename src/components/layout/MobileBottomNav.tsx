import { Home, Briefcase, MessageCircle, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [unreadSenderCount, setUnreadSenderCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  let scrollTimeout: NodeJS.Timeout | null = null;
  let lastScrollY = window.scrollY;

  // Fetch unread message count from unique senders
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (error) {
          console.error('Error fetching unread messages:', error);
          return;
        }

        // Count unique senders
        const uniqueSenders = new Set(data?.map(msg => msg.sender_id) || []);
        setUnreadSenderCount(uniqueSenders.size);
      } catch (error) {
        console.error('Error in fetchUnreadCount:', error);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel(`messages_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq."${user.id}"`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Fetch pending connection requests count
  useEffect(() => {
    if (!user?.id) return;

    const fetchRequestsCount = async () => {
      try {
        const { data, error } = await supabase
          .from('connections')
          .select('id, viewed_at')
          .eq('addressee_id', user.id)
          .eq('status', 'pending');
        if (error) {
          console.error('Error fetching connection requests:', error);
          return;
        }
        // Only count requests that haven't been viewed
        const unviewedRequests = data?.filter(req => !req.viewed_at) || [];
        setPendingRequestsCount(unviewedRequests.length);
      } catch (error) {
        console.error('Error in fetchRequestsCount:', error);
      }
    };

    fetchRequestsCount();

    // Set up real-time subscription for connections
    const channel = supabase
      .channel(`connections_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `addressee_id=eq."${user.id}"`
        },
        () => {
          fetchRequestsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Mark connection requests as viewed when user visits connections page
  useEffect(() => {
    if (!user?.id || location.pathname !== '/connections') return;

    const markRequestsAsViewed = async () => {
      try {
        const { error } = await supabase
          .from('connections')
          .update({ viewed_at: new Date().toISOString() })
          .eq('addressee_id', user.id)
          .eq('status', 'pending')
          .is('viewed_at', null);

        if (error) {
          console.error('Error marking requests as viewed:', error);
        } else {
          console.log('Marked pending connection requests as viewed');
        }
      } catch (error) {
        console.error('Error in markRequestsAsViewed:', error);
      }
    };

    // Mark as viewed after a short delay to ensure the page has loaded
    const timeoutId = setTimeout(markRequestsAsViewed, 1000);
    return () => clearTimeout(timeoutId);
  }, [user?.id, location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = window.scrollY;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setHidden(false), 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  if (!user) return null;

  const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'People', path: '/connections', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-black backdrop-blur-lg border-t border-white/10 animate-slide-up transition-all duration-300 mb-8",
      hidden && "translate-y-full"
    )}>
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          const isMessages = item.name === 'Messages';
          const isPeople = item.name === 'People';
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-300 hover:scale-110 relative",
                isActive 
                  ? "text-white glow-effect" 
                  : "text-gray-300 hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300 relative",
                isActive ? "glass-bright" : "hover:glass"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-300"
                )} />
                {/* Notification dot for Messages */}
                {isMessages && unreadSenderCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {unreadSenderCount}
                  </div>
                )}
                {/* Notification dot for People/Connections */}
                {isPeople && pendingRequestsCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {pendingRequestsCount}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
