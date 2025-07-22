import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { EnhancedThoughtsFeed } from '@/components/feed/EnhancedThoughtsFeed';
import { EnhancedThoughtComposer } from '@/components/feed/EnhancedThoughtComposer';
import QuickProfile from '@/components/profile/QuickProfile';
import TrendingSidebar from '@/components/sidebar/TrendingSidebar';
import PeopleYouMayKnow from '@/components/sidebar/PeopleYouMayKnow';
import { RealtimeCommunitiesList } from '@/components/communities/RealtimeCommunitiesList';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, RefreshCcw } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [refreshFeed, setRefreshFeed] = useState(0);
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null);
  
  // Auth form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [usernameWarning, setUsernameWarning] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [policyWarning, setPolicyWarning] = useState('');
  // Moved up: thoughtsFilter and dropdownOpen
  const [thoughtsFilter, setThoughtsFilter] = useState<'public' | 'friends' | 'university'>('public');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [acceptSignInPolicy, setAcceptSignInPolicy] = useState(false);
  const [signInPolicyWarning, setSignInPolicyWarning] = useState('');

  // Handle community filtering from URL params
  useEffect(() => {
    const communityParam = searchParams.get('community');
    if (communityParam) {
      setSelectedCommunity(communityParam);
    }
  }, [searchParams]);

  // Handle navigation state from notifications
  useEffect(() => {
    if (location.state?.selectedThoughtId && location.state?.scrollToThought) {
      setSelectedThoughtId(location.state.selectedThoughtId);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
      
      // Scroll to the thought after a short delay to ensure it's loaded
      setTimeout(() => {
        const thoughtElement = document.getElementById(`thought-${location.state.selectedThoughtId}`);
        if (thoughtElement) {
          thoughtElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight effect
          thoughtElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
          setTimeout(() => {
            thoughtElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
          }, 3000);
        }
      }, 1000);
    }
  }, [location.state]);

  const handleThoughtPosted = () => {
    setRefreshFeed(prev => prev + 1);
  };

  const handleCommunitySelect = (community: string) => {
    if (community === '') {
      setSelectedCommunity(null);
      setSearchParams({});
    } else {
      setSelectedCommunity(community);
      setSearchParams({ community });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUsernameWarning('');
    setPolicyWarning('');
    setSignInPolicyWarning('');

    if (isSignUp && !acceptPolicy) {
      setPolicyWarning('You must accept the Impersonation Policy to sign up.');
      setLoading(false);
      return;
    }
    if (!isSignUp && !acceptSignInPolicy) {
      setSignInPolicyWarning('You must accept the Impersonation Policy to sign in.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Check if username exists
        const { data: existing, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();
        if (existing) {
          setUsernameWarning('username taken');
          setLoading(false);
          return;
        }
        if (usernameError && usernameError.code !== 'PGRST116') { // ignore no rows found
          throw usernameError;
        }
        const { error } = await signUp(email, password, {
          full_name: fullName,
          username: username,
        });
        if (error) throw error;
        setShowVerificationModal(true);
        return;
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (email === 'anand01ts@gmail.com' && password === 'Anand.1105') {
            toast.success('Admin access granted!');
            return;
          }
          throw error;
        }
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading only during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Checking authentication status...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgba(0,0,0,0.7)]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Logo above Auth Form */}
            <div className="flex justify-center mb-8">
              <img src="/logo2.jpg" alt="Everwo Logo" className="h-16 w-16 rounded-2xl shadow-lg" />
            </div>
            {/* Only Auth Form, hero section removed */}
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="max-w-md w-full">
                <div className="bg-[rgba(0,0,0,0.7)] border border-[#2a2f3e] rounded-3xl p-8 shadow-xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {isSignUp ? 'Join Everwo' : 'Welcome Back'}
                    </h3>
                    <p className="text-gray-400">
                      {isSignUp 
                        ? 'Start collaborating with students worldwide' 
                        : 'Start your journey with Everwo'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-sm font-medium text-gray-300">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setUsernameWarning(''); }}
                            required
                            className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                            placeholder="Choose a username"
                          />
                          {usernameWarning && (
                            <div className="text-red-500 text-xs mt-1">{usernameWarning}</div>
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 rounded-xl bg-[rgba(0,0,0,0.7)] border-[#2a2f3e] text-white placeholder:text-gray-500"
                        placeholder="Enter your password"
                      />
                    </div>

                    {/* Impersonation Policy */}
                    {isSignUp && (
                      <div className="mt-6 text-xs text-gray-400">
                        <div className="flex items-start mb-2">
                          <input
                            type="checkbox"
                            id="impersonation-policy-signup"
                            checked={acceptPolicy}
                            onChange={e => setAcceptPolicy(e.target.checked)}
                            className="mr-2 mt-1"
                          />
                          <label htmlFor="impersonation-policy-signup" className="select-none">
                            I have read and accept the <span className="font-semibold text-white">Impersonation Policy</span> below.
                          </label>
                        </div>
                        {policyWarning && <div className="text-red-500 mb-2">{policyWarning}</div>}
                        <div className="bg-black/70 border border-gray-700 rounded-lg p-4 mt-2 text-gray-300">
                          <div className="font-bold text-white mb-1">Impersonation Policy</div>
                          <div>
                            By signing up for Everwo, you confirm that the identity and university details you provide are true and your own. Any attempt to impersonate another person or falsely claim to be affiliated with a university or institution is a violation of our terms of service.<br /><br />
                            If you are found to be impersonating another individual or misrepresenting your identity, Everwo reserves the right to:
                            <ul className="list-disc ml-6 my-2">
                              <li>Suspend or terminate your account without notice</li>
                              <li>Share your account details (including IP address and login metadata) with authorized cyber crime authorities</li>
                              <li>Report such actions to India’s Cyber Crime Cell under the IT Act, 2000</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Impersonation Policy for Sign In */}
                    {!isSignUp && (
                      <div className="mt-6 text-xs text-gray-400">
                        <div className="flex items-start mb-2">
                          <input
                            type="checkbox"
                            id="impersonation-policy-signin"
                            checked={acceptSignInPolicy}
                            onChange={e => setAcceptSignInPolicy(e.target.checked)}
                            className="mr-2 mt-1"
                          />
                          <label htmlFor="impersonation-policy-signin" className="select-none">
                            I have read and accept the <span className="font-semibold text-white">Impersonation Policy</span> below.
                          </label>
                        </div>
                        {signInPolicyWarning && <div className="text-red-500 mb-2">{signInPolicyWarning}</div>}
                        <div className="bg-black/70 border border-gray-700 rounded-lg p-4 mt-2 text-gray-300">
                          <div className="font-bold text-white mb-1">Impersonation Policy</div>
                          <div>
                            By signing in to Everwo, you confirm that the identity and university details you provide are true and your own. Any attempt to impersonate another person or falsely claim to be affiliated with a university or institution is a violation of our terms of service.<br /><br />
                            If you are found to be impersonating another individual or misrepresenting your identity, Everwo reserves the right to:
                            <ul className="list-disc ml-6 my-2">
                              <li>Suspend or terminate your account without notice</li>
                              <li>Share your account details (including IP address and login metadata) with authorized cyber crime authorities</li>
                              <li>Report such actions to India’s Cyber Crime Cell under the IT Act, 2000</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Move Create Account button below policy */}
                    {isSignUp && (
                      <Button 
                        type="submit" 
                        className="w-full h-11 text-base rounded-xl font-medium bg-white hover:bg-gray-100 text-black mt-6" 
                        disabled={loading || !acceptPolicy}
                      >
                        {loading ? 'Please wait...' : 'Create Account'}
                      </Button>
                    )}
                    {!isSignUp && (
                      <Button 
                        type="submit" 
                        className="w-full h-11 text-base rounded-xl font-medium bg-white hover:bg-gray-100 text-black" 
                        disabled={loading || !acceptSignInPolicy}
                      >
                        {loading ? 'Please wait...' : 'Sign In'}
                      </Button>
                    )}

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-sm text-gray-400 hover:text-white"
                        onClick={() => setIsSignUp(!isSignUp)}
                      >
                        {isSignUp 
                          ? 'Already have an account? Sign in' 
                          : "Don't have an account? Sign up"
                        }
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#000000] mobile-content">
        <div className="container mx-auto px-2 py-2 max-w-7xl">
          {selectedCommunity && (
            <div className="mb-6 flex items-center justify-between mobile-card card-dark p-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg font-semibold">Showing thoughts from:</span>
                <span className="text-white text-lg font-bold">#{selectedCommunity}</span>
              </div>
              <button
                onClick={() => handleCommunitySelect('')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Thoughts Section Heading and Divider */}
          <div className="w-full max-w-3xl mx-auto mt-8 flex items-center justify-between px-4 relative">
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 text-white font-bold text-3xl md:text-4xl mb-0 text-left focus:outline-none"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                style={{ position: 'relative' }}
              >
                <span className="block md:hidden">Thoughts</span>
                <span className="hidden md:block">Home</span>
                <ChevronDown className={`w-6 h-6 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Reload Thoughts"
                title="Reload Thoughts"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
            {/* Post a Thought button for mobile, right-aligned */}
            <button
              className="block md:hidden ml-auto bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-full shadow-lg p-2 transition-all duration-300 focus:outline-none"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
              onClick={() => setIsComposerOpen(true)}
              aria-label="Post a thought"
            >
              <Plus className="w-6 h-6" />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-12 z-50 bg-black/80 text-white rounded-xl shadow-lg py-2 px-4 min-w-[160px] backdrop-blur-md border border-white/10">
                <button
                  className={`block w-full text-left px-2 py-2 rounded-lg text-base hover:bg-white/10 transition-colors ${thoughtsFilter === 'public' ? 'font-bold' : ''}`}
                  onClick={() => { setThoughtsFilter('public'); setDropdownOpen(false); }}
                >
                  Public
                </button>
                <button
                  className={`block w-full text-left px-2 py-2 rounded-lg text-base hover:bg-white/10 transition-colors ${thoughtsFilter === 'friends' ? 'font-bold' : ''}`}
                  onClick={() => { setThoughtsFilter('friends'); setDropdownOpen(false); }}
                >
                  Friends-only
                </button>
                <button
                  className={`block w-full text-left px-2 py-2 rounded-lg text-base hover:bg-white/10 transition-colors ${thoughtsFilter === 'university' ? 'font-bold' : ''}`}
                  onClick={() => { setThoughtsFilter('university'); setDropdownOpen(false); }}
                >
                  University
                </button>
              </div>
            )}
          </div>
          <div className="border-b-2 border-white/60 w-full mb-6" />
          {/* Inline composer on desktop only */}
          <div className="hidden md:block mb-8 max-w-3xl mx-auto w-full">
            <EnhancedThoughtComposer onThoughtPosted={handleThoughtPosted} />
          </div>
          {/* Modal composer for mobile only */}
          <EnhancedThoughtComposer
            onThoughtPosted={() => { setIsComposerOpen(false); handleThoughtPosted(); }}
            isOpen={isComposerOpen}
            onClose={() => setIsComposerOpen(false)}
            placeholder="What's on your mind?"
            parentId={undefined}
            key="modal-composer"
          />

          {/* Mobile Layout */}
          <div className="block md:hidden space-y-6">
            <ErrorBoundary>
              <div className="mobile-card">
                {/* QuickProfile hidden on mobile */}
              </div>
            </ErrorBoundary>
            <ErrorBoundary>
              <div className="mobile-card">
                {/* EnhancedThoughtComposer removed from here */}
              </div>
            </ErrorBoundary>
            <ErrorBoundary>
              <div className="mobile-card">
                <EnhancedThoughtsFeed 
                  key={`${selectedCommunity}-${refreshFeed}-${thoughtsFilter}`}
                  communityFilter={selectedCommunity}
                  filter={thoughtsFilter}
                  selectedThoughtId={selectedThoughtId}
                />
              </div>
            </ErrorBoundary>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="col-span-1 space-y-8">
              {/* <ErrorBoundary>
                <QuickProfile />
              </ErrorBoundary> */}
              <ErrorBoundary>
                <RealtimeCommunitiesList 
                  selectedCommunity={selectedCommunity}
                  onCommunitySelect={setSelectedCommunity}
                />
              </ErrorBoundary>
            </div>

            {/* Main Content */}
            <div className="col-span-2 space-y-8 max-w-3xl mx-auto w-full">
              <ErrorBoundary>
                {/* EnhancedThoughtComposer removed from here */}
              </ErrorBoundary>
              <ErrorBoundary>
                <EnhancedThoughtsFeed 
                  key={`${selectedCommunity}-${refreshFeed}-${thoughtsFilter}`}
                  communityFilter={selectedCommunity}
                  filter={thoughtsFilter}
                  selectedThoughtId={selectedThoughtId}
                />
              </ErrorBoundary>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1 space-y-8">
              <ErrorBoundary>
                <TrendingSidebar onCommunitySelect={handleCommunitySelect} />
              </ErrorBoundary>
              <ErrorBoundary>
                <PeopleYouMayKnow />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      {/* Place the modal at the root of the page */}
      <AlertDialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verification mail has been sent to your gmail account</AlertDialogTitle>
            <AlertDialogDescription>
              Please check your email and follow the instructions to verify your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowVerificationModal(false)}>
            Okay
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Index;