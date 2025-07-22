import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, User, Hash, Trash2, MoreHorizontal, Bookmark, BookmarkCheck, MoreVertical, Globe, Lock, GraduationCap, Flag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EnhancedThoughtComposer } from './EnhancedThoughtComposer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSavedThoughts } from '@/hooks/useSavedThoughts';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { v4 as uuidv4 } from 'uuid';
// Removed: import { useRealtime } from '@/hooks/useRealtime';

interface Author {
  name: string;
  avatar: string;
  college: string;
  verified: boolean;
  username?: string;
}

interface Mention {
  id: string;
  name: string;
  type: 'person' | 'community';
  start: number;
  end: number;
}

interface EnhancedThoughtCardProps {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
  comments: number;
  tags?: string[];
  image?: string;
  mentions?: Mention[];
  communityName?: string;
  onReplyPosted: () => void;
  userId?: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  likeCount?: number;
  visibility?: 'public' | 'connections' | 'university';
}

function formatThoughtTimestamp(timestamp: string) {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWk = Math.floor(diffDay / 7);

  if (diffSec < 60) return `${diffSec}s`;
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffDay < 14) return `${diffWk}w`;
  // After 2 weeks, show date as 'MMM D, YYYY'
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const EnhancedThoughtCard = ({
  id,
  content,
  author,
  timestamp,
  likes,
  comments,
  tags = [],
  image,
  mentions = [],
  communityName,
  onReplyPosted,
  userId,
  isLiked = false,
  onToggleLike,
  likeCount,
  visibility = 'public',
}: EnhancedThoughtCardProps) => {
  // Safety check for required props
  if (!id || !content || !author) {
    console.warn('EnhancedThoughtCard: Missing required props', { id, content, author });
    return null;
  }

  const { user } = useAuth();
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { isThoughtSaved, saveThought, unsaveThought } = useSavedThoughts();
  const [saved, setSaved] = useState(false);
  const [pendingUnsave, setPendingUnsave] = useState(false);
  useEffect(() => {
    let mounted = true;
    isThoughtSaved(id).then((val) => { if (mounted) setSaved(val); });
    return () => { mounted = false; };
  }, [id]);
  // Removed useRealtime subscription for saved_thoughts
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

  const renderContentWithMentions = (text: string, mentions: Mention[]) => {
    if (!mentions.length) return text;

    let result = [];
    let lastIndex = 0;

    mentions.forEach((mention, index) => {
      // Add text before mention
      if (mention.start > lastIndex) {
        result.push(text.slice(lastIndex, mention.start));
      }

      // Add mention as badge
      result.push(
        <Badge 
          key={`mention-${index}`} 
          variant="secondary" 
          className="mx-1 inline-flex items-center space-x-1"
        >
          {mention.type === 'person' ? <User className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
          <span>@{mention.name}</span>
        </Badge>
      );

      lastIndex = mention.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  const handleReplyPosted = () => {
    setShowReplyComposer(false);
    onReplyPosted();
  };

  const handleDeleteThought = async () => {
    if (!user || userId !== user.id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete thought');
        return;
      }

      toast.success('Thought deleted successfully');
      onReplyPosted(); // Refresh the feed
    } catch (error) {
      toast.error('Failed to delete thought');
      console.error('Error deleting thought:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user && userId === user.id;

  // Defensive fallback for author
  const safeAuthor = author || { name: 'Anonymous', avatar: '', college: '', verified: false, username: '' };
  const userCollege = user?.user_metadata?.college_name || user?.user_metadata?.college || user?.college_name || user?.college || '';

  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const reportDropdownRef = React.useRef<HTMLDivElement>(null);
  const [optimisticReplies, setOptimisticReplies] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);

  // Fetch comments from thought_comments table
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('thought_comments')
      .select('*, user:profiles!user_id (full_name, username, avatar_url)')
      .eq('thought_id', id)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setReplies(data);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // Real-time subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel('realtime-comments-' + id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thought_comments',
          filter: `thought_id=eq.${id}`,
        },
        (payload) => {
          fetchComments();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reportDropdownRef.current && !reportDropdownRef.current.contains(event.target as Node)) {
        setReportOpen(false);
      }
    }
    if (reportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [reportOpen]);

  const handleReport = async () => {
    // TODO: Implement actual report logic (e.g., call API or insert report)
    toast.success('Report submitted!');
    setReportOpen(false);
    setReportReason('');
  };

  const handleLikeWithNotification = async () => {
    if (!user) return;
    // Optimistically call the like logic if provided
    if (onToggleLike) onToggleLike();
    // Only notify if the liker is not the author
    if (userId && user.id !== userId) {
      // Get username or fallback to email
      const username = user.user_metadata?.username || user.user_metadata?.full_name || user.email || 'Someone';
      // Insert notification for the author
      try {
        await supabase.rpc('create_like_notification_rpc', {
          p_thought_id: id,
          p_liker_id: user.id,
          p_liker_username: username,
          p_liker_avatar_url: user.user_metadata?.avatar_url || ''
        });
      } catch (rpcError) {
        console.error('Failed to create like notification:', rpcError);
      }
    }
  };

  const handleOptimisticReply = async () => {
    const currentUserId = user?.id || (await supabase.auth.getUser()).data?.user?.id;
    if (!replyContent.trim() || !currentUserId) return;
    // Create a temporary optimistic reply
    const tempReply = {
      id: uuidv4(),
      content: replyContent,
      user_id: currentUserId,
      user: {
        username: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Unknown',
        avatar_url: user?.user_metadata?.avatar_url || '',
      },
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      thought_id: id,
      isOptimistic: true,
    };
    setOptimisticReplies(prev => [...prev, tempReply]);
    setReplyContent("");
    setIsReplying(false);
    // Post to backend
    try {
      const { error } = await supabase.from('thought_comments').insert({
        content: tempReply.content,
        user_id: currentUserId,
        thought_id: id,
      });
      if (error) {
        console.error('Insert error:', error);
        toast.error('Failed to post comment: ' + error.message);
        setOptimisticReplies(prev => prev.filter(r => r.id !== tempReply.id));
        return;
      }
      // Call the comment notification RPC
      try {
        await supabase.rpc('create_comment_notification_rpc', {
          p_thought_id: id,
          p_commenter_id: currentUserId,
          p_comment_content: tempReply.content
        });
      } catch (rpcError) {
        console.error('Failed to create comment notification:', rpcError);
      }
    } catch (error) {
      toast.error('Failed to post reply');
      setOptimisticReplies(prev => prev.filter(r => r.id !== tempReply.id));
    }
    // onReplyPosted will be called by real-time update
  };
  // Remove optimistic replies that now exist in real replies
  useEffect(() => {
    setOptimisticReplies(prev => prev.filter(opt => !replies.some(r => r.content === opt.content && r.user_id === opt.user_id)));
  }, [replies]);

  // Merge optimisticReplies with real replies, filtering out duplicates by a unique temp id or content+user
  const mergedReplies = useMemo(() => [
    ...optimisticReplies.filter(opt => !replies.some(r => r.content === opt.content && r.user_id === opt.user_id)),
    ...(replies || [])
  ], [optimisticReplies, replies]);

  return (
    <Card className="glass-card hover:shadow-lg transition-shadow relative">
      {/* Desktop: Bookmark icon top right */}
      {/* Remove the bookmark button with absolute positioning at the top right (both desktop and mobile): */}
      {/* <button className="hidden md:block absolute top-3 right-6 z-10 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors" onClick={handleToggleSave} aria-label={saved ? 'Unsave thought' : 'Save thought'}>
        {saved ? (
          <BookmarkCheck className="w-4 h-4 text-white" />
        ) : (
          <Bookmark className="w-4 h-4 text-gray-400" />
        )}
      </button> */}
      <CardContent className="p-4 md:p-6 pb-6 relative">
        {/* Three dots menu at bottom right above the white line */}
        <div className="absolute bottom-0 right-2 z-10">
          <DropdownMenu open={reportOpen} onOpenChange={setReportOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <DropdownMenuItem onClick={handleDeleteThought} className="text-red-600 focus:bg-red-100 focus:text-red-800">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setShowReasonBox(true)}>
                  <span className="text-red-600 flex items-center"><Flag className="w-4 h-4 mr-2" /> Report</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Mobile: Bookmark icon top right */}
        {/* Remove the bookmark button with absolute positioning at the top right (both desktop and mobile): */}
        {/* <button className="block md:hidden absolute top-3 right-6 z-10 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors" onClick={handleToggleSave} aria-label={saved ? 'Unsave thought' : 'Save thought'}>
          {saved ? (
            <BookmarkCheck className="w-4 h-4 text-white" />
          ) : (
            <Bookmark className="w-4 h-4 text-gray-400" />
          )}
        </button> */}
        <div className="flex items-start space-x-1 md:space-x-2">
          {/* Mobile: Bookmark icon above avatar */}
          <div className="flex flex-col items-center">
            {/* Ensure the bookmark icon is wrapped in a native <button> with onClick={handleToggleSave} and no pointer-events-none or disabled. */}
            {/* In the flex flex-col items-center div, remove this block: */}
            {/* <button
              onClick={handleToggleSave}
              className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label={saved ? 'Unsave thought' : 'Save thought'}
              type="button"
            >
              {saved ? (
                <Bookmark className="w-6 h-6 text-white fill-current" />
              ) : (
                <Bookmark className="w-6 h-6 text-white" />
              )}
            </button> */}
            {safeAuthor.username && safeAuthor.username.trim() !== '' ? (
              <div className="flex items-start space-x-3 md:space-x-4 focus:outline-none">
                <div className="cursor-pointer" onClick={() => navigate(`/profile/${safeAuthor.username || safeAuthor.id}`)}>
                  <Avatar className="w-10 h-10 md:w-12 md:h-12">
                    <AvatarImage src={safeAuthor.avatar} />
                    <AvatarFallback>
                      <User className="w-6 h-6 text-gray-300" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm md:text-base cursor-pointer" onClick={() => navigate(`/profile/${safeAuthor.username || safeAuthor.id}`)}>{safeAuthor.username}</span>
                          <span className="text-xs text-gray-400 ml-2">{formatThoughtTimestamp(timestamp)}</span>
                        </div>
                        {safeAuthor.college && (
                          <span className="block mt-0.5 px-0.5 py-0 rounded-sm text-[8px] font-normal bg-gray-600 text-white w-fit" style={{backdropFilter: 'blur(2px)'}}>
                            {safeAuthor.college}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Report modal for non-owners */}
                  {showReasonBox && !isOwner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="bg-black/80 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10 relative">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                          onClick={() => setShowReasonBox(false)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <h3 className="text-lg font-semibold text-white mb-4">Report Thought</h3>
                        <textarea
                          className="w-full rounded-lg bg-white/10 text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-400 text-sm p-3 min-h-[80px] border border-white/20 mb-4"
                          placeholder="Why are you reporting this thought? (optional)"
                          value={reportReason}
                          onChange={e => setReportReason(e.target.value)}
                          maxLength={300}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowReasonBox(false)} className="border-white/20 text-gray-300 hover:text-white">Cancel</Button>
                          <Button className="gradient-bg" onClick={handleReport}>Submit</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {communityName && (
                    <span className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {communityName}
                      </Badge>
                      {/* Visibility icon */}
                      {visibility === 'public' ? (
                        <span title="Public"><Globe className="w-4 h-4 text-blue-400" /></span>
                      ) : visibility === 'university' ? (
                        <span title="University only"><GraduationCap className="w-4 h-4 text-purple-400" /></span>
                      ) : (
                        <span title="Connections only"><Lock className="w-4 h-4 text-yellow-400" /></span>
                      )}
                      {/* Three-dot report menu beside college name */}
                      <div className="relative">
                        {reportOpen && (
                          <div
                            ref={reportDropdownRef}
                            className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg backdrop-blur bg-white/30 border border-white/20 z-50 p-3 flex flex-col gap-2"
                            style={{ minWidth: 180 }}
                          >
                            {/* Non-clickable status option */}
                            <div className="px-3 py-2 text-xs font-semibold text-gray-700/80 cursor-default select-none flex items-center gap-2">
                              {visibility === 'public' ? (
                                <Globe className="w-4 h-4 text-blue-500" />
                              ) : visibility === 'university' ? (
                                <GraduationCap className="w-4 h-4 text-purple-500" />
                              ) : (
                                <Lock className="w-4 h-4 text-yellow-500" />
                              )}
                              {visibility === 'public' ? 'Public' : visibility === 'university' ? 'University Only' : 'Friends Only'}
                            </div>
                            <div className="h-px bg-white/30 my-1" />
                            {/* Report option */}
                            <button
                              className="w-full text-left px-3 py-2 text-xs hover:bg-white/20 rounded-lg text-red-600 font-medium"
                              onClick={() => setShowReasonBox(true)}
                            >
                              Report Thought
                            </button>
                            {showReasonBox && (
                              <textarea
                                className="w-full rounded-xl bg-white/20 text-white text-sm p-4 min-h-[60px] border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-gray-300 mt-3 shadow-lg backdrop-blur"
                                placeholder="Why are you reporting this thought? (optional)"
                                value={reportReason}
                                onChange={e => setReportReason(e.target.value)}
                                maxLength={300}
                              />
                            )}
                            <div className="flex justify-end mt-2">
                              <Button size="sm" variant="outline" className="mr-2" onClick={() => setReportOpen(false)}>Cancel</Button>
                              <Button size="sm" className="gradient-bg" onClick={handleReport}>Submit</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </span>
                  )}

                  <div className="text-foreground leading-relaxed text-sm md:text-base break-words break-all">
                    {renderContentWithMentions(content, mentions)}
                  </div>

                  {image && (
                    <img 
                      src={image} 
                      alt="Thought image" 
                      className="rounded-lg max-w-full h-auto"
                      loading="lazy"
                    />
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Change the action bar container to align items to the left: */}
                  <div className="flex items-center space-x-6 pb-2">
                    {/* Like, comment, bookmark icons */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
                      onClick={handleLikeWithNotification}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      <span className="text-gray-400">{likeCount ?? likes}</span>
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      onClick={() => setIsReplying((v) => !v)}
                    >
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">{mergedReplies.length}</span>
                    </Button>
                    <button
                      onClick={handleToggleSave}
                      aria-label={saved ? 'Unsave thought' : 'Save thought'}
                      className="p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                      type="button"
                    >
                      {saved ? (
                        <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/></svg>
                      ) : (
                        <Bookmark className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Inline reply dropdown and replies always shown when isReplying is true */}
                  {isReplying && (
                    <>
                      <div className="mt-3 bg-black/80 border border-white/10 rounded-xl p-3 shadow-xl flex flex-col gap-2">
                        <div className="flex items-center w-full">
                          <textarea
                            className="flex-1 rounded-lg bg-white/10 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary text-xs p-2 min-h-[36px] md:text-sm md:p-3 md:min-h-[44px] border-none shadow-none"
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            maxLength={500}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <button
                            className={`flex items-center justify-center p-0 w-10 h-10 rounded-full transition-colors ml-1 ${replyContent.trim() ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                            onClick={handleOptimisticReply}
                            aria-label={replyContent.trim() ? "Post reply" : "Cancel reply"}
                            type="button"
                            style={{ minWidth: '40px', minHeight: '40px' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {/* Always show replies under the post when isReplying is true */}
                      {mergedReplies.length > 0 && (
                        <div className="mt-4 space-y-4 border-l-2 border-muted pl-4 md:border-l-2 md:pl-4 bg-background/80 rounded-lg p-2 md:bg-transparent md:rounded-none md:p-0 overflow-x-auto">
                          {mergedReplies.map((reply) => {
                            console.log('Reply debug:', reply);
                            return (
                              <div key={reply.id}>
                                <div className="block md:hidden border border-white/10 rounded-lg bg-background/90 p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Avatar className="w-7 h-7">
                                      {reply.user && reply.user.avatar_url
                                        ? <AvatarImage src={reply.user.avatar_url} />
                                        : <AvatarFallback><User className="w-4 h-4 text-gray-300" /></AvatarFallback>
                                      }
                                    </Avatar>
                                    <span className="font-semibold text-xs text-white">{reply.user && reply.user.username ? reply.user.username : 'Unknown'}</span>
                                    <span className="text-[10px] text-gray-400">{dayjs(reply.created_at).format('hh:mm A')}</span>
                                    {/* Always render DropdownMenu, but conditionally render the delete item */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 ml-1"><MoreHorizontal className="h-4 w-4" /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {(user && reply.user_id === user.id) || (isOwner && user && reply.user_id !== user.id) ? (
                                          <DropdownMenuItem 
                                            onClick={async () => {
                                              // Optimistically remove the comment from UI
                                              setReplies(prev => prev.filter(r => r.id !== reply.id));
                                              await supabase.from('thought_comments').delete().eq('id', reply.id);
                                              onReplyPosted();
                                            }}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />Delete
                                          </DropdownMenuItem>
                                        ) : null}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="text-xs text-white mb-2">{reply.content}</div>
                                </div>
                                <span className="hidden md:block">
                                  <div className="md:mt-6 md:p-5 md:rounded-xl md:bg-background/80 md:space-y-3">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <Avatar className="w-9 h-9">
                                        {reply.user && reply.user.avatar_url
                                          ? <AvatarImage src={reply.user.avatar_url} />
                                          : <AvatarFallback><User className="w-5 h-5 text-gray-300" /></AvatarFallback>
                                        }
                                      </Avatar>
                                      <span className="font-semibold md:text-base text-xs text-white">{reply.user && reply.user.username ? reply.user.username : 'Unknown'}</span>
                                      <span className="text-[11px] text-gray-400">{dayjs(reply.created_at).format('hh:mm A')}</span>
                                      {/* Always render DropdownMenu, but conditionally render the delete item */}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 ml-1"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {(user && reply.user_id === user.id) || (isOwner && user && reply.user_id !== user.id) ? (
                                            <DropdownMenuItem 
                                              onClick={async () => {
                                                setOptimisticReplies(prev => prev.filter(r => r.id !== reply.id));
                                                await supabase.from('thought_comments').delete().eq('id', reply.id);
                                                onReplyPosted();
                                              }}
                                              className="text-destructive focus:text-destructive"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />Delete
                                            </DropdownMenuItem>
                                          ) : null}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <div className="md:text-base text-xs text-white mb-2">{reply.content}</div>
                                  </div>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Friends badge for connections-only thoughts */}
                  {visibility === 'connections' && (
                    <span className="absolute left-2 bottom-1 bg-green-900 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md" style={{borderRadius: '12px 12px 4px 12px', background: 'linear-gradient(90deg, #14532d 80%, #166534 100%)'}}>
                      friends
                    </span>
                  )}

                  {/* University badge for university-only thoughts */}
                  {visibility === 'university' && (
                    <span className="absolute left-2 bottom-1 bg-purple-900 text-white text-[10px] px-0.5 py-0 rounded-sm text-[8px] font-normal shadow-md" style={{borderRadius: '12px 12px 4px 12px', background: 'linear-gradient(90deg, #581c87 80%, #7c3aed 100%)'}}>
                      university
                    </span>
                  )}

                  {showReplyComposer && (
                    <div className="mt-4">
                      <EnhancedThoughtComposer
                        parentId={id}
                        placeholder="Write a reply..."
                        onThoughtPosted={handleReplyPosted}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Avatar className="w-10 h-10 md:w-12 md:h-12">
                  <AvatarImage src={safeAuthor.avatar} />
                  <AvatarFallback>
                    <User className="w-6 h-6 text-gray-300" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-foreground text-sm md:text-base">Anonymous</h4>
                      {safeAuthor.college && (
                        <span
                          className={`ml-2 mr-8 px-2 py-0.5 rounded-full text-white text-xs font-medium shadow-sm ${userCollege && safeAuthor.college && userCollege.toLowerCase() === safeAuthor.college.toLowerCase() ? 'bg-green-600' : 'bg-gray-600'}`}
                          style={{backdropFilter: 'blur(2px)'}}>
                          {safeAuthor.college}
                        </span>
                      )}
                    </div>

                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={handleDeleteThought}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {communityName && (
                    <span className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {communityName}
                      </Badge>
                      {/* Visibility icon */}
                      {visibility === 'public' ? (
                        <span title="Public"><Globe className="w-4 h-4 text-blue-400" /></span>
                      ) : visibility === 'university' ? (
                        <span title="University only"><GraduationCap className="w-4 h-4 text-purple-400" /></span>
                      ) : (
                        <span title="Connections only"><Lock className="w-4 h-4 text-yellow-400" /></span>
                      )}
                      {/* Three-dot report menu beside college name */}
                      <div className="relative">
                        {reportOpen && (
                          <div
                            ref={reportDropdownRef}
                            className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg backdrop-blur bg-white/30 border border-white/20 z-50 p-3 flex flex-col gap-2"
                            style={{ minWidth: 180 }}
                          >
                            {/* Non-clickable status option */}
                            <div className="px-3 py-2 text-xs font-semibold text-gray-700/80 cursor-default select-none flex items-center gap-2">
                              {visibility === 'public' ? (
                                <Globe className="w-4 h-4 text-blue-500" />
                              ) : visibility === 'university' ? (
                                <GraduationCap className="w-4 h-4 text-purple-500" />
                              ) : (
                                <Lock className="w-4 h-4 text-yellow-500" />
                              )}
                              {visibility === 'public' ? 'Public' : visibility === 'university' ? 'University Only' : 'Friends Only'}
                            </div>
                            <div className="h-px bg-white/30 my-1" />
                            {/* Report option */}
                            <button
                              className="w-full text-left px-3 py-2 text-xs hover:bg-white/20 rounded-lg text-red-600 font-medium"
                              onClick={() => setShowReasonBox(true)}
                            >
                              Report Thought
                            </button>
                            {showReasonBox && (
                              <textarea
                                className="w-full rounded-xl bg-white/20 text-white text-sm p-4 min-h-[60px] border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-gray-300 mt-3 shadow-lg backdrop-blur"
                                placeholder="Why are you reporting this thought? (optional)"
                                value={reportReason}
                                onChange={e => setReportReason(e.target.value)}
                                maxLength={300}
                              />
                            )}
                            <div className="flex justify-end mt-2">
                              <Button size="sm" variant="outline" className="mr-2" onClick={() => setReportOpen(false)}>Cancel</Button>
                              <Button size="sm" className="gradient-bg" onClick={handleReport}>Submit</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </span>
                  )}

                  <div className="text-foreground leading-relaxed text-sm md:text-base">
                    {renderContentWithMentions(content, mentions)}
                  </div>

                  {image && (
                    <img 
                      src={image} 
                      alt="Thought image" 
                      className="rounded-lg max-w-full h-auto"
                      loading="lazy"
                    />
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Change the action bar container to align items to the left: */}
                  <div className="flex items-center space-x-6 pb-2">
                    {/* Like, comment, bookmark icons */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
                      onClick={handleLikeWithNotification}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      <span className="text-gray-400">{likes}</span>
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2"
                      onClick={() => setShowReplyComposer(!showReplyComposer)}
                    >
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">{replies?.length ?? 0}</span>
                    </Button>
                    <button
                      onClick={handleToggleSave}
                      aria-label={saved ? 'Unsave thought' : 'Save thought'}
                      className="p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                      type="button"
                    >
                      {saved ? (
                        <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24"><path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/></svg>
                      ) : (
                        <Bookmark className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Timestamp at the absolute bottom left */}
                  <span className="absolute left-4 bottom-2 text-[10px] text-muted-foreground">{timestamp}</span>

                  {showReplyComposer && (
                    <div className="mt-4">
                      <EnhancedThoughtComposer
                        parentId={id}
                        placeholder="Write a reply..."
                        onThoughtPosted={handleReplyPosted}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedThoughtCard;
