import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Verified,
  Bookmark,
  BookmarkCheck,
  User
} from 'lucide-react';
import { useSavedThoughts } from '@/hooks/useSavedThoughts';
import { useRealtime } from '@/hooks/useRealtime';
import dayjs from 'dayjs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ThoughtCardProps {
  id: string;
  author: {
    name: string;
    avatar: string;
    college: string;
    verified: boolean;
    username?: string; // Added username to the interface
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags?: string[];
  image?: string;
  canDelete?: boolean;
  onDelete?: () => void;
  isLiked?: boolean;
  onLike?: () => void;
}

const ThoughtCard = ({ 
  id,
  author, 
  content, 
  timestamp, 
  likes, 
  comments, 
  tags = [],
  image,
  canDelete = false,
  onDelete,
  isLiked = false,
  onLike
}: ThoughtCardProps) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const { isThoughtSaved, saveThought, unsaveThought } = useSavedThoughts();

  useEffect(() => {
    let mounted = true;
    isThoughtSaved(id).then((val) => { if (mounted) setSaved(val); });
    return () => { mounted = false; };
  }, [id]);

  const fetchComments = async () => {
    if (!showComments) return;
    
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, username)
        `)
        .eq('parent_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      } else {
        setCommentsList(data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, id]);

  const handleToggleSave = async () => {
    if (saved) {
      setSaved(false); // Optimistic UI
      setPendingUnsave(true);
      setTimeout(async () => {
        await unsaveThought(id);
        setPendingUnsave(false);
      }, 300); // Slight latency for removal
    } else {
      setSaved(true); // Optimistic UI
      await saveThought(id);
    }
  };

  const navigate = useNavigate();

  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from('thoughts').delete().eq('id', id);
    setDeleting(false);
    if (!error && onDelete) onDelete();
  };

  // Defensive fallback for author
  const safeAuthor = author || { name: 'Anonymous', avatar: '', college: '', verified: false, username: '' };

  return (
    <Card className="w-full glass-card hover:glass-bright transition-all duration-500 group animate-fade-in card-hover relative">
      {/* Bookmark icon top right */}
      <button
        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
        onClick={handleToggleSave}
        aria-label={saved ? 'Unsave thought' : 'Save thought'}
      >
        {saved ? (
          <Bookmark className="w-4 h-4 text-white" />
        ) : (
          <Bookmark className="w-4 h-4 text-white" />
        )}
      </button>
      <CardContent className="p-3 md:p-6 space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            {safeAuthor?.username && safeAuthor.username.trim() !== '' ? (
              <div className="flex items-center space-x-2 md:space-x-4 focus:outline-none">
                <div className="cursor-pointer" onClick={() => {
                  if (safeAuthor?.username && safeAuthor.username.trim() !== '') {
                    navigate(`/profile/${safeAuthor.username}`);
                  } else if (safeAuthor?.id) {
                    navigate(`/profile/${safeAuthor.id}`);
                  }
                }}>
                  <Avatar className="w-9 h-9 md:w-12 md:h-12 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent transition-all duration-300 group-hover:ring-gray-400/50">
                    <AvatarImage src={safeAuthor.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
                      <User className="w-6 h-6 text-gray-300" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="font-semibold text-foreground text-sm md:text-base cursor-pointer" onClick={() => {
                  if (safeAuthor?.username && safeAuthor.username.trim() !== '') {
                    navigate(`/profile/${safeAuthor.username}`);
                  } else if (safeAuthor?.id) {
                    navigate(`/profile/${safeAuthor.id}`);
                  }
                }}>{safeAuthor.username}</span>
                {/* Three dots dropdown for delete, right beside username */}
                {canDelete && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 glass hover:glass-bright text-gray-300 hover:text-white transition-all duration-300 hover:scale-110"
                        disabled={deleting}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                        {deleting ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ) : (
              <>
                <Avatar className="w-9 h-9 md:w-12 md:h-12 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent transition-all duration-300 group-hover:ring-gray-400/50">
                  <AvatarImage src={safeAuthor?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
                    <User className="w-6 h-6 text-gray-300" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 md:space-y-1 flex items-center">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <span className="font-semibold text-white group-hover:text-gray-200 transition-colors duration-300 text-sm md:text-lg">Anonymous</span>
                    <span className="hidden md:inline">
                      {safeAuthor?.verified && (
                        <Verified className="w-4 h-4 text-white fill-current animate-pulse-glow" />
                      )}
                    </span>
                    {/* Three dots dropdown for delete, right beside Anonymous */}
                    {canDelete && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 glass hover:glass-bright text-gray-300 hover:text-white transition-all duration-300 hover:scale-110"
                            disabled={deleting}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                            {deleting ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="hidden md:block text-xs text-gray-300 group-hover:text-gray-200 transition-colors">{safeAuthor?.college}</p>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="space-y-2 md:space-y-4">
          <div className="text-white leading-relaxed group-hover:text-gray-100 transition-colors text-sm md:text-lg break-words break-all line-clamp-3 md:line-clamp-none">{content}</div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-0">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="glass hover:glass-bright text-white border-white/20 hover:border-gray-400/50 transition-all duration-300 hover:scale-105 cursor-pointer text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          {image && (
            <div className="rounded-xl overflow-hidden glass border border-white/10 group-hover:border-white/20 transition-all duration-300 mt-2 md:mt-0">
              <img 
                src={image} 
                alt="Thought attachment" 
                className="w-full h-40 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-col items-start pt-3 md:pt-4 border-t border-white/10 group-hover:border-white/20 transition-colors">
          <div className="flex items-center space-x-4 md:space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`flex items-center space-x-1 md:space-x-2 glass hover:glass-bright transition-all duration-300 hover:scale-110 ${
                isLiked ? 'text-red-400 glow-effect' : 'text-gray-300 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs md:text-sm font-medium">{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-1 md:space-x-2 text-gray-300 hover:text-white glass hover:glass-bright transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs md:text-sm font-medium">{comments}</span>
            </Button>
            <span className="hidden md:inline">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-300 hover:text-green-400 glass hover:glass-bright transition-all duration-300 hover:scale-110"
              >
                <Share className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </Button>
            </span>
          </div>
          {/* Timestamp below actions */}
          <div className="mt-1 text-[10px] md:text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {dayjs(timestamp).format('MMM DD, YYYY, hh:mm A')}
          </div>
        </div>
      </CardContent>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments for Thought</DialogTitle>
          </DialogHeader>
          {loadingComments ? (
            <p>Loading comments...</p>
          ) : commentsList.length === 0 ? (
            <p>No comments yet for this thought. Be the first to add one!</p>
          ) : (
            <div className="space-y-4">
              {commentsList.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8 md:w-10 md:h-10 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent transition-all duration-300">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-semibold">
                      <User className="w-5 h-5 text-gray-300" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white/10 p-3 rounded-lg">
                    <p className="text-white text-sm font-medium">{comment.profiles?.full_name}</p>
                    <p className="text-gray-300 text-xs mt-1">{comment.content}</p>
                    <p className="text-gray-400 text-xs mt-1">{dayjs(comment.created_at).format('MMM DD, YYYY, hh:mm A')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ThoughtCard;
