import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Check, X, MessageCircle, Users, User, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '@/hooks/useRealtime';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { ConnectionResponseDialog } from '@/components/ui/connection-response-dialog';

interface Connection {
  connection_id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar: string;
  status: string;
  created_at: string;
  requester_id: string;
  addressee_id: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  skills: string[];
  interests: string[];
  college_name?: string; // Added for college name
  username?: string; // Added for username
  onboarding_completed?: boolean; // Added for onboarding completion status
}

export const ConnectionsView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [highlightedRequestId, setHighlightedRequestId] = useState<string | null>(null);
  const [collegeOnly, setCollegeOnly] = useState(false);
  const [showConnectionResponseDialog, setShowConnectionResponseDialog] = useState(false);
  const [connectionResponse, setConnectionResponse] = useState<'accepted' | 'rejected' | null>(null);
  const [connectionResponseLoading, setConnectionResponseLoading] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_connections', {
        p_user_id: user.id
      });
      console.log('Fetched connections after delete:', data); // Debug log
      if (error) {
        console.error('Error fetching connections:', error);
        toast.error('Failed to fetch connections');
      } else {
        // Fetch onboarding_completed for each partner
        const partnerIds = (data || []).map((c: any) => c.partner_id).filter(Boolean);
        let onboardingMap: Record<string, boolean> = {};
        if (partnerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, onboarding_completed')
            .in('id', partnerIds);
          if (profiles) {
            onboardingMap = Object.fromEntries(profiles.map((p: any) => [p.id, !!p.onboarding_completed]));
          }
        }
        console.log('onboardingMap:', onboardingMap);
        const filteredConnections = (data || []).filter((c: any) => onboardingMap[c.partner_id] === true);
        console.log('Filtered connections:', filteredConnections);
        setConnections(filteredConnections);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
      toast.error('Failed to fetch connections');
    }
  }, [user?.id]);

  const fetchCurrentUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, skills, interests, college_name, username, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (data) {
        setCurrentUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, [user?.id]);

  // Removed useRealtime subscriptions for 'connections' and 'profiles' to prevent duplicate subscriptions

  // Remove searchUsers function and button click logic for search
  // Add a derived filteredUsers variable that filters allProfiles in real time as the user types
  const searchLower = searchTerm.trim().toLowerCase();
  const filteredUsers = (collegeOnly && currentUserProfile?.college_name
    ? allProfiles.filter(profile => profile.college_name && profile.college_name.toLowerCase() === currentUserProfile.college_name.toLowerCase())
    : allProfiles
  ).filter(profile => {
    if (!searchLower) return true;
    const fullName = profile.full_name?.toLowerCase() || '';
    const username = profile.username?.toLowerCase() || '';
    const interests = (profile.interests || []).map(i => i.toLowerCase()).join(' ');
    return (
      fullName.includes(searchLower) ||
      username.includes(searchLower) ||
      interests.includes(searchLower)
    );
  });

  const getCommonInterests = (userInterests: string[], searchedUserInterests: string[]) => {
    if (!userInterests || !searchedUserInterests) return [];
    return userInterests.filter(interest => searchedUserInterests.includes(interest));
  };

  const sendConnectionRequest = async (addresseeId: string, profile?: Profile) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending connection request:', error);
        toast.error('Failed to send connection request');
      } else {
        // Optimistically update connections state
        setConnections(prev => [
          ...prev,
          {
            connection_id: data.id,
            partner_id: addresseeId,
            partner_name: profile?.full_name || '',
            partner_avatar: profile?.avatar_url || null,
            status: 'pending',
            created_at: data.created_at,
            requester_id: user.id,
            addressee_id: addresseeId,
          }
        ]);
        // Remove from searchResults immediately
        setSearchResults(prev => prev.filter(u => u.id !== addresseeId));
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      toast.error('Failed to send connection request');
    }
  };

  const handleConnectionRequest = async (connectionId: string, action: 'accepted' | 'rejected') => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: action })
        .eq('id', connectionId);

      if (error) {
        console.error('Error updating connection:', error);
        toast.error(`Failed to ${action === 'accepted' ? 'accept' : 'reject'} connection request`);
      } else {
        toast.success(`Connection request ${action === 'accepted' ? 'accepted' : 'rejected'}!`);
        
        fetchConnections();
      }
    } catch (err) {
      console.error('Error updating connection:', err);
      toast.error(`Failed to ${action === 'accepted' ? 'accept' : 'reject'} connection request`);
    }
  };

  const startConversation = (partnerId: string) => {
    navigate('/messages', { state: { selectedConversation: partnerId } });
  };

  useEffect(() => {
    if (user?.id) {
      fetchConnections();
      fetchCurrentUserProfile();
    }
  }, [fetchConnections, fetchCurrentUserProfile, user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusUser = params.get('focusUser');
    if (focusUser) {
      // Find the pending received request from this user
      const req = connections.find(
        c => c.status === 'pending' && c.addressee_id === user?.id && c.requester_id === focusUser
      );
      if (req) {
        setTimeout(() => {
          document.querySelector('[data-state="requests"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          setTimeout(() => {
            const el = document.getElementById(`request-${req.connection_id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setHighlightedRequestId(req.connection_id);
              setTimeout(() => setHighlightedRequestId(null), 3000);
            }
          }, 200);
        }, 200);
      }
    }
  }, [location.search, connections, user?.id]);

  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  // Fix: pendingSent and pendingReceived should be arrays of Connection, not booleans
  const pendingSentArr = connections.filter(
    c => c.status === 'pending' && c.requester_id === user.id
  );
  const pendingReceivedArr = connections.filter(
    c => c.status === 'pending' && c.addressee_id === user.id
  );

  // Fetch all profiles except current user
  const fetchAllProfiles = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, skills, interests, college_name, username, onboarding_completed')
        .neq('id', user.id);
      if (error) {
        console.error('Error fetching all profiles:', error);
      } else {
        // Only include users with onboarding_completed === true
        setAllProfiles((data || []).filter((p: any) => p.onboarding_completed === true));
      }
    } catch (err) {
      console.error('Error fetching all profiles:', err);
    }
  }, [user?.id]);

  // Fetch all profiles when user or their profile is loaded
  useEffect(() => {
    if (user?.id && currentUserProfile) {
      fetchAllProfiles();
    }
  }, [user?.id, currentUserProfile, fetchAllProfiles]);

  // Helper to check connection/request status
  const getConnectionStatus = (profileId: string) => {
    // Sent: current user is requester, status is pending
    const sent = connections.find(
      c => c.partner_id === profileId && c.status === 'pending' && c.requester_id === user.id
    );
    // Received: current user is addressee, status is pending
    const received = connections.find(
      c => c.partner_id === profileId && c.status === 'pending' && c.addressee_id === user.id
    );
    // Accepted: already connected
    const accepted = connections.some(
      c => c.partner_id === profileId && c.status === 'accepted'
    );
    return { sent, received, accepted };
  };

  // Handler for connect button
  const handleConnectClick = async (profile: Profile) => {
    const { sent, received } = getConnectionStatus(profile.id);
    if (received) {
      // Redirect to requests tab, scroll and highlight
      setTimeout(() => {
        const el = document.getElementById(`request-${received.connection_id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedRequestId(received.connection_id);
          setTimeout(() => setHighlightedRequestId(null), 3000);
        }
      }, 100); // Wait for tab switch
      document.querySelector('[data-state="requests"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    } else if (!sent) {
      await sendConnectionRequest(profile.id, profile);
      fetchConnections();
      fetchAllProfiles();
    } else if (sent) {
      try {
        if (sent) {
          await supabase.from('connections').delete().eq('id', sent.connection_id);
          toast.success('Connection request cancelled');
          fetchConnections();
          fetchAllProfiles();
        }
      } catch (err) {
        toast.error('Failed to cancel connection request');
      }
    }
  };

  // Filtered search results based on collegeOnly toggle and selectedInterests
  const filteredSearchResults = collegeOnly && currentUserProfile?.college_name
    ? searchResults.filter(profile => profile.college_name && profile.college_name.toLowerCase() === currentUserProfile.college_name.toLowerCase())
    : searchResults;
  const filteredAllProfiles = collegeOnly && currentUserProfile?.college_name
    ? allProfiles.filter(profile => profile.college_name && profile.college_name.toLowerCase() === currentUserProfile.college_name.toLowerCase())
    : allProfiles;

  const handleConnectionResponse = async (action: 'accepted' | 'rejected') => {
    if (!selectedConnectionId) return;
    
    setConnectionResponseLoading(true);
    try {
      if (action === 'accepted') {
        // Update the connection status to accepted
        const { error } = await supabase
          .from('connections')
          .update({ status: 'accepted' })
          .eq('id', selectedConnectionId);

        if (error) {
          console.error('Error accepting connection:', error);
          return;
        }
      } else {
        // Delete the connection request
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('id', selectedConnectionId);

        if (error) {
          console.error('Error rejecting connection:', error);
          return;
        }
      }

      // Refresh connections
      fetchConnections();
      fetchAllProfiles();
      setShowConnectionResponseDialog(false);
      setSelectedConnectionId(null);
    } catch (error) {
      console.error('Error handling connection response:', error);
    } finally {
      setConnectionResponseLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-0 sm:p-6 border-0 shadow-none rounded-none">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search"><Search className="w-5 h-5 inline" /></TabsTrigger>
          <TabsTrigger value="requests"><UserPlus className="w-5 h-5 inline" /></TabsTrigger>
          <TabsTrigger value="connections"><Users className="w-5 h-5 inline" /></TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                My Connections ({acceptedConnections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedConnections.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No connections yet. Start by searching for people to connect with!
                </p>
              ) : (
                <div className="grid gap-4 mx-0 sm:mx-0 sm:pl-2">
                  {acceptedConnections.map((connection) => (
                    <div key={connection.connection_id} className="flex items-center justify-between p-4 bg-transparent">
                      <div className="flex items-center space-x-3">
                        <div className="cursor-pointer" onClick={() => navigate(`/profile/${connection.partner_id}`)}>
                          <Avatar>
                            <AvatarImage src={connection.partner_avatar} />
                            <AvatarFallback>
                              <User className="w-6 h-6 text-gray-300" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${connection.partner_id}`)}>{connection.partner_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Connected
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => startConversation(connection.partner_id)}
                          size="sm"
                          className="flex items-center justify-center"
                          aria-label="Message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:bg-red-500/10"
                              aria-label="Remove Connection"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            className="max-w-xs rounded-2xl sm:max-w-lg"
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this connection? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    console.log('Attempting to delete connection:', connection);
                                    const { error, data } = await supabase
                                      .from('connections')
                                      .delete()
                                      .eq('id', connection.connection_id);
                                    console.log('Delete result:', { error, data });
                                    fetchConnections();
                                  } catch (err) {
                                    // Optionally handle error
                                  }
                                }}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader>
              <CardTitle>Pending Requests You Received ({pendingReceivedArr.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReceivedArr.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending connection requests.
                </p>
              ) : (
                <div className="grid gap-4 mx-0 sm:mx-0 sm:pl-2">
                  {pendingReceivedArr.map((request) => {
                    // Find the requester's profile
                    const requesterProfile = allProfiles.find(p => p.id === request.partner_id);
                    const commonInterests = getCommonInterests(currentUserProfile?.interests || [], requesterProfile?.interests || []);
                    return (
                      <div
                        key={request.connection_id}
                        id={`request-${request.connection_id}`}
                        className={`flex items-center justify-between p-4 bg-transparent transition-shadow duration-300 ${highlightedRequestId === request.connection_id ? 'ring-4 ring-green-400' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>
                            <Avatar>
                              <AvatarImage src={request.partner_avatar} />
                              <AvatarFallback>
                                <User className="w-6 h-6 text-gray-300" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <h3 className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>{request.partner_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Sent
                            </p>
                            {/* Show common interests */}
                            {commonInterests.length > 0 && (
                              <div className="flex flex-row flex-wrap gap-2 mt-1">
                                <span className="text-xs mr-2" style={{ color: '#E9E5E4' }}>Common interests:</span>
                                {commonInterests.map((interest) => (
                                  <Badge key={interest} style={{ backgroundColor: '#E9E5E4', color: '#1D4ED8', border: 'none' }} className="text-xs">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleConnectionRequest(request.connection_id, 'accepted')}
                            size="sm"
                            variant="default"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleConnectionRequest(request.connection_id, 'rejected')}
                            size="sm"
                            variant="outline"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="w-full h-px bg-white opacity-20 my-6" />
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader>
              <CardTitle>Requests You Sent ({pendingSentArr.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSentArr.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  You have not sent any pending requests.
                </p>
              ) : (
                <div className="grid gap-4 mx-0 sm:mx-0 sm:pl-2">
                  {pendingSentArr.map((request) => (
                    <div
                      key={request.connection_id}
                      className="flex items-center justify-between p-4 bg-transparent"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>
                          <Avatar>
                            <AvatarImage src={request.partner_avatar} />
                            <AvatarFallback>
                              <User className="w-6 h-6 text-gray-300" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${request.partner_id}`)}>{request.partner_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sent
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            // Cancel the sent request (delete the connection row)
                            try {
                              const { error, data } = await supabase
                                .from('connections')
                                .delete()
                                .eq('id', request.connection_id);
                              fetchConnections();
                            } catch (err) {
                              // Optionally handle error
                            }
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="glass-card border-0 shadow-none" style={{ background: '#000000B3' }}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Find People</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white font-bold mr-2">University</span>
                <Switch checked={collegeOnly} onCheckedChange={setCollegeOnly} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full flex gap-2 items-center rounded-lg border-2 border-white opacity-60 px-2 py-1">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by name, username, or interest..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 profile-input border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 bg-transparent"
                  />
                </div>
                <Search className="w-5 h-5 text-gray-400 hover:text-white" />
              </div>
              {/* Show users below search bar */}
              <div className="mt-4">
                {filteredUsers.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredUsers.map((profile) => {
                      const { sent, received, accepted } = getConnectionStatus(profile.id);
                      if (accepted) return null; // Hide already connected users
                      const common = currentUserProfile?.interests && profile.interests ? getCommonInterests(currentUserProfile.interests, profile.interests) : [];
                      return (
                        <div key={profile.id} className="relative flex flex-col items-center gap-2 p-6 bg-black/40 rounded-xl border border-white/10 shadow-md">
                          {/* College badge at top right */}
                          {profile.college_name && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-blue-900 text-white text-[9px] font-semibold tracking-wide z-10">
                              {profile.college_name}
                            </div>
                          )}
                          {/* Avatar */}
                          <Avatar className="w-16 h-16 mb-2 cursor-pointer" onClick={() => navigate(`/profile/${profile.username || profile.id}`)}>
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>
                              <User className="w-8 h-8 text-gray-300" />
                            </AvatarFallback>
                          </Avatar>
                          {/* Username centered and clickable */}
                          <div className="font-bold text-white text-xl text-center mb-1 cursor-pointer" onClick={() => navigate(`/profile/${profile.username || profile.id}`)}>
                            {profile.username || profile.full_name}
                          </div>
                          {/* Interests label */}
                          <div className="text-gray-300 text-sm font-semibold mb-1">Interests:</div>
                          {/* Interests badges, max 4, 2 rows */}
                          {profile.interests && profile.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center mb-1">
                              {profile.interests.slice(0, 4).map((interest) => (
                                <span key={interest} className="bg-[#222] text-white font-semibold rounded-2xl px-2 py-0.5 text-xs">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* +N more if more than 4 interests */}
                          {profile.interests && profile.interests.length > 4 && (
                            <div className="text-gray-400 text-sm mb-1">+{profile.interests.length - 4} more</div>
                          )}
                          {/* Common interests row */}
                          {common.length > 0 && (
                            <div className="w-full flex flex-col items-center mt-2">
                              <div className="text-gray-300 text-base font-semibold mb-1">Common:</div>
                              <div className="flex flex-wrap gap-1 justify-center">
                                {common.map((interest) => (
                                  <span key={interest} className="bg-white text-blue-700 font-bold rounded-2xl px-2 py-0.5 text-xs">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Request button centered below */}
                          <Button
                            size="sm"
                            disabled={!!received}
                            onClick={() => {
                              if (sent) {
                                supabase.from('connections').delete().eq('id', sent.connection_id).then(() => {
                                  fetchConnections();
                                  fetchAllProfiles();
                                });
                              } else if (received) {
                                // Open connection response dialog
                                setSelectedConnectionId(received.connection_id);
                                setShowConnectionResponseDialog(true);
                              } else {
                                handleConnectClick(profile);
                              }
                            }}
                            className={sent ? 'bg-gray-700 text-white' : ''}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            {sent ? 'Requested' : received ? 'Respond' : 'Request'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">No users found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ConnectionResponseDialog
        isOpen={showConnectionResponseDialog}
        onClose={() => setShowConnectionResponseDialog(false)}
        onAccept={() => handleConnectionResponse('accepted')}
        onReject={() => handleConnectionResponse('rejected')}
        loading={connectionResponseLoading}
      />
    </div>
  );
};
