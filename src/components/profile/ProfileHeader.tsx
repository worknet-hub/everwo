import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Star,
  Users,
  GraduationCap,
  Edit,
  MessageCircle,
  Verified,
  User,
  UserCheck,
  Heart,
  MoreVertical
} from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPendingSentRequests } from '@/hooks/useConnection';
import { AvatarUpload } from './AvatarUpload';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';
import { useRealtimeProfile } from '@/contexts/RealtimeProfileContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ProfilePictureModal } from '@/components/ui/profile-picture-modal';
import { ConnectionResponseDialog } from '@/components/ui/connection-response-dialog';
import { ReferralInfo } from './ReferralInfo';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  college_name: string;
  college_verified: boolean;
  skills: string[];
  portfolio: string[];
  rating: number;
  location: string;
  availability_status: string;
  badges: string[];
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditClick: () => void;
  onAvatarChange?: (newAvatarUrl: string) => void;
  connections?: any[];
  showMenuOnly?: boolean;
  hideMenu?: boolean;
}

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick, onAvatarChange, connections = [], showMenuOnly = false, hideMenu = false }: ProfileHeaderProps) => {
  if (!profile || !profile.id) return null;
  const { user } = useAuth();
  const { fetchConnections } = useRealtimeProfile();
  const [loading, setLoading] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [thoughtCount, setThoughtCount] = useState<number>(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [showConnectionResponseDialog, setShowConnectionResponseDialog] = useState(false);
  const [connectionResponseLoading, setConnectionResponseLoading] = useState(false);
  const navigate = useNavigate();
  const [referralOpen, setReferralOpen] = useState(false);

  // Debug: log the avatar URL
  console.log('Profile avatar_url:', profile.avatar_url);

  const isRequested = !!(user?.id && profile?.id && connections.some(c => c.requester_id === user.id && c.addressee_id === profile.id && c.status === 'pending'));
  // Determine if this is a pending received request
  const isPendingReceived = !!(user?.id && profile?.id && connections.some(c => c.addressee_id === user.id && c.requester_id === profile.id && c.status === 'pending'));

  // Fetch and subscribe to total likes
  const fetchTotalLikes = async () => {
    if (!profile?.id) return;
    console.log('Fetching total likes for user:', profile.id);
    const { data, error } = await supabase
      .from('thoughts')
      .select('likes_count')
      .eq('user_id', profile.id);
    if (!error && data) {
      const sum = data.reduce((acc, t) => acc + (t.likes_count || 0), 0);
      console.log('Total likes calculated:', sum, 'from', data.length, 'thoughts');
      setTotalLikes(sum);
    } else {
      console.error('Error fetching total likes:', error);
    }
  };

  useEffect(() => {
    fetchTotalLikes();
  }, [profile?.id]);

  // Subscribe to real-time updates for likes with better error handling
  useEffect(() => {
    if (!profile?.id) return;

    console.log('🔄 Setting up real-time subscriptions for profile:', profile.id);

    const thoughtsChannel = supabase
      .channel(`profile-thoughts-${profile.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'thoughts',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('🔄 Thoughts table updated for profile, refreshing likes count:', payload);
          fetchTotalLikes();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'thought_likes'
        },
        (payload) => {
          console.log('🔄 New like added, refreshing likes count:', payload);
          // Check if the like is for a thought by this user
          if (payload.new && payload.new.thought_id) {
            // Fetch the thought to check if it belongs to this user
            supabase
              .from('thoughts')
              .select('user_id')
              .eq('id', payload.new.thought_id)
              .single()
              .then(({ data }) => {
                if (data && data.user_id === profile.id) {
                  console.log('🔄 Like is for this user\'s thought, refreshing count');
                  fetchTotalLikes();
                }
              });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'thought_likes'
        },
        (payload) => {
          console.log('🔄 Like removed, refreshing likes count:', payload);
          // Check if the removed like was for a thought by this user
          if (payload.old && payload.old.thought_id) {
            supabase
              .from('thoughts')
              .select('user_id')
              .eq('id', payload.old.thought_id)
              .single()
              .then(({ data }) => {
                if (data && data.user_id === profile.id) {
                  console.log('🔄 Removed like was for this user\'s thought, refreshing count');
                  fetchTotalLikes();
                }
              });
          }
        }
      )
      .subscribe((status) => {
        console.log('Profile thoughts subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Profile thoughts subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Profile thoughts subscription failed');
        }
      });

    return () => {
      console.log('🔄 Cleaning up profile thoughts subscription');
      supabase.removeChannel(thoughtsChannel);
    };
  }, [profile?.id]);

  // Fetch thought count
  const fetchThoughtCount = async () => {
    if (!profile?.id) return;
    const { count, error } = await supabase
      .from('thoughts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .is('parent_id', null); // Only count top-level thoughts
    if (!error && typeof count === 'number') {
      setThoughtCount(count);
    }
  };

  useEffect(() => {
    fetchThoughtCount();
  }, [profile?.id]);

  // Subscribe to real-time updates for thought count
  useEffect(() => {
    if (!profile?.id) return;

    console.log('🔄 Setting up thought count subscription for profile:', profile.id);

    const thoughtCountChannel = supabase
      .channel(`profile-thought-count-${profile.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thoughts',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('🔄 Thoughts count updated for profile:', payload);
          fetchThoughtCount();
        }
      )
      .subscribe((status) => {
        console.log('Profile thought count subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Profile thought count subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Profile thought count subscription failed');
        }
      });

    return () => {
      console.log('🔄 Cleaning up profile thought count subscription');
      supabase.removeChannel(thoughtCountChannel);
    };
  }, [profile?.id]);

  // Manual test function to verify likes are working
  const testLikesSystem = async () => {
    console.log('🧪 Testing likes system...');
    await fetchTotalLikes();
    console.log('✅ Likes count refreshed manually');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleConnectionRequest = async () => {
    if (!user?.id || !profile?.id || loading) return;

    // Prevent duplicate requests (cancel)
    if (isRequested) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('requester_id', user.id)
          .eq('addressee_id', profile.id)
          .eq('status', 'pending');
        if (error) {
          console.error('Error cancelling request:', error);
          toast.error('Failed to cancel request');
        } else {
          toast.success('Request cancelled');
          if (fetchConnections) fetchConnections();
        }
      } catch (err) {
        console.error('Error handling connection request:', err);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fetch latest connections before sending a new request
    setLoading(true);
    try {
      const { data: latestConnections, error: fetchError } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      if (fetchError) {
        toast.error('Failed to check existing connections.');
        setLoading(false);
        return;
      }
      const alreadyExists = latestConnections.some(
        c =>
          ((c.requester_id === user.id && c.addressee_id === profile.id) ||
            (c.addressee_id === user.id && c.requester_id === profile.id)) &&
          (c.status === 'pending' || c.status === 'accepted')
      );
      if (alreadyExists) {
        toast.error('A connection request already exists.');
        setLoading(false);
        return;
      }

      // Send the request
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: profile.id,
          status: 'pending'
        });
      if (error) {
        console.error('Error sending request:', error);
        toast.error('Failed to send request');
      } else {
        toast.success('Request sent!');
        if (fetchConnections) fetchConnections();
      }
    } catch (err) {
      console.error('Error handling connection request:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    // TODO: Implement report logic (e.g., call API or open modal)
    toast.success('Report submitted!');
    setReportOpen(false);
    setReportReason('');
  };

  // Remove connection handler
  const handleRemoveConnection = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      // Find the connection between current user and profile
      const { data: connections, error } = await supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`)
        .eq('status', 'accepted');

      if (error) {
        toast.error('Failed to find connection');
        return;
      }

      if (connections && connections.length > 0) {
        // Delete the connection
        const { error: deleteError } = await supabase
          .from('connections')
          .delete()
          .eq('id', connections[0].id);

        if (deleteError) {
          toast.error('Failed to remove connection');
          return;
        }

        toast.success('Connection removed successfully');
        setShowRemoveDialog(false);
        // Refresh connections
        if (fetchConnections) {
          fetchConnections();
        }
      }
    } catch (error) {
      toast.error('Failed to remove connection');
      console.error('Error removing connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!user || !profile) return;
    
    setConnectionResponseLoading(true);
    try {
      // Find the pending connection request
      const { data: connections, error } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', profile.id)
        .eq('addressee_id', user.id)
        .eq('status', 'pending')
        .single();

      if (error) {
        toast.error('Failed to find connection request');
        return;
      }

      if (connections) {
        // Update the connection status to accepted
        const { error: updateError } = await supabase
          .from('connections')
          .update({ status: 'accepted' })
          .eq('id', connections.id);

        if (updateError) {
          toast.error('Failed to accept connection request');
          return;
        }

        toast.success('Connection request accepted!');
        setShowConnectionResponseDialog(false);
        // Refresh connections
        if (fetchConnections) {
          fetchConnections();
        }
      }
    } catch (error) {
      toast.error('Failed to accept connection request');
      console.error('Error accepting connection:', error);
    } finally {
      setConnectionResponseLoading(false);
    }
  };

  const handleRejectConnection = async () => {
    if (!user || !profile) return;
    
    setConnectionResponseLoading(true);
    try {
      // Find the pending connection request
      const { data: connections, error } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', profile.id)
        .eq('addressee_id', user.id)
        .eq('status', 'pending')
        .single();

      if (error) {
        toast.error('Failed to find connection request');
        return;
      }

      if (connections) {
        // Delete the connection request
        const { error: deleteError } = await supabase
          .from('connections')
          .delete()
          .eq('id', connections.id);

        if (deleteError) {
          toast.error('Failed to reject connection request');
          return;
        }

        toast.success('Connection request rejected');
        setShowConnectionResponseDialog(false);
        // Refresh connections
        if (fetchConnections) {
          fetchConnections();
        }
      }
    } catch (error) {
      toast.error('Failed to reject connection request');
      console.error('Error rejecting connection:', error);
    } finally {
      setConnectionResponseLoading(false);
    }
  };

  // Determine if users are connected (real-time)
  const isConnected = connections.some(
    c =>
      ((c.requester_id === user?.id && c.addressee_id === profile.id) ||
        (c.addressee_id === user?.id && c.requester_id === profile.id)) &&
      c.status === 'accepted'
  );

  const displayUsername = profile.username || 'username-not-set';
  const displayLocation = profile.location || 'Location not set';
  const displayCollege = profile.college_name || 'College not set';
  const displayBio = profile.bio || 'No bio available';

  const mutualConnections = useMemo(() => {
    if (!user?.id || !profile?.id || !connections?.length) return 0;
    // Get all accepted connections for current user
    const myConnectionIds = new Set(
      connections
        .filter(c => (c.status === 'accepted') && (c.requester_id === user.id || c.addressee_id === user.id))
        .map(c => (c.requester_id === user.id ? c.addressee_id : c.requester_id))
    );
    // Get all accepted connections for the profile user
    const theirConnectionIds = new Set(
      connections
        .filter(c => (c.status === 'accepted') && (c.requester_id === profile.id || c.addressee_id === profile.id))
        .map(c => (c.requester_id === profile.id ? c.addressee_id : c.requester_id))
    );
    // Count mutuals
    return [...myConnectionIds].filter(id => theirConnectionIds.has(id) && id !== user.id && id !== profile.id).length;
  }, [user?.id, profile?.id, connections]);

  if (showMenuOnly && !isOwnProfile && !hideMenu) {
    // Render only the three dots menu (for top left)
    return (
      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-white/10 focus:outline-none ml-2"
          onClick={() => setReportOpen((v) => !v)}
          aria-label="More options"
        >
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
        {reportOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 mt-2 w-80 backdrop-blur-lg bg-black/60 rounded-xl shadow-2xl p-4 z-50 border border-white/20"
            style={{ minWidth: 260 }}
          >
            <button
              className="w-full text-left text-red-600 font-semibold py-2 px-3 rounded hover:bg-red-50/30 focus:outline-none"
              onClick={() => setShowReasonBox((v) => !v)}
            >
              Report
            </button>
            {showReasonBox && (
              <textarea
                className="w-full rounded-xl bg-white/20 text-white text-sm p-4 min-h-[60px] border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-gray-300 mt-3 shadow-lg backdrop-blur"
                placeholder="Why are you reporting this user? (optional)"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                maxLength={300}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 relative">
      {/* Left: Avatar and Stats */}
      <div className="flex flex-row md:flex-col items-center w-full md:w-auto justify-center md:justify-start">
        {/* Only show static avatar, no upload for own profile */}
        <Avatar 
          className="w-32 h-32 cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => setShowProfilePictureModal(true)}
        >
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} loading="lazy" />
          ) : null}
          <AvatarFallback className="text-2xl">
            <User className="w-12 h-12 text-gray-300" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-row items-center space-x-6 ml-4 md:ml-0 md:mt-6">
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-lg font-bold text-white">{totalLikes}</span>
            <span className="text-xs text-gray-400 mt-1">likes</span>
          </div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-lg font-bold text-white">{thoughtCount}</span>
            <span className="text-xs text-gray-400 mt-1">thoughts</span>
          </div>
        </div>
      </div>

      {/* Right: Profile Info (below avatar/stats on desktop) */}
      <div className="flex-1 space-y-4 md:mt-0 mt-4 md:ml-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{displayUsername}</h1>
            {/* Three-dot menu for reporting (desktop only) */}
            {!isOwnProfile && !hideMenu && false && (
              <div className="hidden md:block relative">
                {/* This is now handled by showMenuOnly at the top left */}
              </div>
            )}
            {isOwnProfile && (
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={onEditClick}
                  className="flex items-center space-x-1 p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Edit profile"
                >
                  <Edit className="w-5 h-5 text-white" />
                  <span className="text-xs text-gray-400 hover:text-white transition-colors">edit profile</span>
                </button>
              </div>
            )}
            {profile.college_verified && (
              <Verified className="w-4 h-4 md:w-6 md:h-6 text-white" />
            )}
          </div>
          {/* Mutuals count, only show if not own profile and at least 1 mutual */}
          {!isOwnProfile && mutualConnections > 0 && (
            <div className="text-xs text-gray-400 font-medium mt-1 mb-1 text-center" style={{ fontSize: '13px' }}>
              {mutualConnections} mutual connection{mutualConnections !== 1 ? 's' : ''}
            </div>
          )}
          {/* Remove old likes display below username */}
          <div className="flex justify-start mt-2 mb-2">
            <div className="bg-white text-black rounded-xl px-2 py-1 font-semibold text-base shadow border border-gray-200">
              {profile.full_name}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{displayCollege}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground max-w-2xl">{displayBio}</p>

        {/* Remove the stats from the badges row below */}
        <div className="flex flex-row items-end justify-between w-full mt-2 mb-2">
          <div className="flex flex-wrap gap-2 items-end min-w-[100px]">
            {profile.badges.map((badge) => (
              <Badge key={badge} className="bg-gradient-to-r from-white to-gray-200 text-black">
                {badge}
              </Badge>
            ))}
            {profile.badges.length === 0 && (
              <span className="text-sm text-muted-foreground">No badges yet</span>
            )}
          </div>
        </div>
        {/* Remove referral button/popover from header */}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row gap-2 md:flex-col md:gap-2 mt-4 md:mt-0 items-center">
        {isOwnProfile ? (
          null
        ) : (
          <>
            {/* Respond button for pending received requests */}
            {isPendingReceived && !isConnected ? (
              <Button
                variant="outline"
                className="bg-gray-800 text-white border border-gray-700 hover:bg-gray-900"
                onClick={() => setShowConnectionResponseDialog(true)}
              >
                Respond
              </Button>
            ) : null}
            {/* Request and Message buttons if not connected and no pending request */}
            {!isConnected && !isRequested && !isPendingReceived && (
              <>
                <Button
                  variant="outline"
                  className="bg-white text-emerald-700 border border-emerald-700 rounded-lg font-semibold px-6 py-2 shadow hover:bg-emerald-50 transition-all"
                  onClick={async () => {
                    await handleConnectionRequest();
                  }}
                  disabled={loading}
                >
                  Request
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-black border border-blue-400 rounded-lg font-semibold px-6 py-2 ml-2 shadow cursor-not-allowed opacity-60"
                  disabled
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </Button>
              </>
            )}
            {/* Requested and Message buttons if request is pending (sent by user) */}
            {!isConnected && isRequested && !isPendingReceived && (
              <>
                <Button
                  variant="outline"
                  className="bg-white text-gray-400 border border-gray-300 rounded-lg font-semibold px-6 py-2 shadow cursor-not-allowed"
                  disabled
                >
                  Requested
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-black border border-blue-400 rounded-lg font-semibold px-6 py-2 ml-2 shadow cursor-not-allowed opacity-60"
                  disabled
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </Button>
              </>
            )}
            {/* Friends and Message buttons if connected */}
            {isConnected && (
              <>
                <Button
                  variant="outline"
                  className="bg-green-900 text-white border border-green-900 hover:bg-green-800"
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={loading}
                >
                  Friends
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-black border border-blue-400 rounded-lg font-semibold px-6 py-2 ml-2 shadow"
                  onClick={() => navigate(`/messages?selectedConversation=${profile.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </Button>
                {/* Remove Friend Dialog */}
                <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Friend</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to remove this user from your friends?</p>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleRemoveConnection} disabled={loading}>Yes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </>
        )}
      </div>
      <ProfilePictureModal
        isOpen={showProfilePictureModal}
        onClose={() => setShowProfilePictureModal(false)}
        imageUrl={profile.avatar_url || ''}
        username={profile.username}
      />
      <ConnectionResponseDialog
        isOpen={showConnectionResponseDialog}
        onClose={() => setShowConnectionResponseDialog(false)}
        onAccept={handleAcceptConnection}
        onReject={handleRejectConnection}
        loading={connectionResponseLoading}
      />
    </div>
  );
};