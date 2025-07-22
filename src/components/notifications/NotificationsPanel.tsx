
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, Check, MessageSquare, Users, Briefcase, Heart, Hash, User, ChevronDown } from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const NotificationsPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loadMoreNotifications, deleteOldNotifications } = useRealtimeNotifications();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  // Mark all notifications as read and clean up old ones when the panel opens
  useEffect(() => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
    // Clean up old notifications when panel opens
    deleteOldNotifications();
  }, []); // Empty dependency array means this runs once when component mounts

  // Reset showAll when notifications change (panel reopened)
  useEffect(() => {
    setShowAll(false);
  }, [notifications.length]); // Reset when notification count changes

  // Determine how many notifications to show
  const now = new Date();
  // Only show notifications from the last 24 hours
  const recentNotifications = notifications.filter(n => {
    const createdAt = new Date(n.created_at);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= 24;
  });
  const shouldShowAll = unreadCount > 7;
  const notificationsToShow = shouldShowAll || showAll ? recentNotifications : recentNotifications.slice(0, 7);
  const hasMoreNotifications = recentNotifications.length > 7 && !shouldShowAll;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'connection':
        return <Users className="w-4 h-4" />;
      case 'gig':
        return <Briefcase className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'mention':
        return <User className="w-4 h-4" />;
      case 'community':
        return <Hash className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleString();
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-white text-black';
      case 'connection':
        return 'bg-white text-black';
      case 'gig':
        return 'bg-white text-black';
      case 'like':
        return 'bg-white text-black';
      case 'mention':
        return 'bg-white text-black';
      case 'community':
        return 'bg-white text-black';
      default:
        return 'bg-white text-black';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {notificationsToShow.length} of {notifications.length}
              </span>
            )}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notificationsToShow.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-1">
              {notificationsToShow.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                markAsRead(notification.id);
                                navigate(`/thoughts/${notification.thought_id}`);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMoreNotifications && (
                <div className="p-4 border-t border-muted">
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await loadMoreNotifications();
                      setShowAll(true);
                    }}
                    className="w-full flex items-center justify-center space-x-2 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span>Load More ({notifications.length - 7} more)</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
