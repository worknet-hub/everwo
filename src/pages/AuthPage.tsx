import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from '@/components/ui/alert-dialog';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [policyWarning, setPolicyWarning] = useState('');
  const [usernameWarning, setUsernameWarning] = useState('');
  const [acceptSignUpPolicy, setAcceptSignUpPolicy] = useState(false);
  const [acceptSignInPolicy, setAcceptSignInPolicy] = useState(false);
  const [signUpPolicyWarning, setSignUpPolicyWarning] = useState('');
  const [signInPolicyWarning, setSignInPolicyWarning] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeWarning, setReferralCodeWarning] = useState('');
  const [referralCodeValid, setReferralCodeValid] = useState<null | boolean>(null);
  const [referralCodeChecking, setReferralCodeChecking] = useState(false);
  const referralCodeTimeout = useRef<NodeJS.Timeout | null>(null);
  const { user, signIn, signUp, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated - only once when user changes
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Redirecting authenticated user to home');
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // On mount, check if the user has already accepted the policy
  useEffect(() => {
    const checkPolicyAccepted = async () => {
      if (!email) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('impersonation_policy_accepted')
        .eq('email', email)
        .single();
      if (profile?.impersonation_policy_accepted) {
        setPolicyAccepted(true);
        setAcceptPolicy(true); // Automatically accept if already accepted
      } else {
        setPolicyAccepted(false);
        setAcceptPolicy(false);
      }
    };
    if (isSignUp) checkPolicyAccepted();
  }, [email, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUsernameWarning('');
    setPolicyWarning('');
    setSignUpPolicyWarning('');
    setSignInPolicyWarning('');
    setReferralCodeWarning('');

    // if (isSignUp && !acceptSignUpPolicy) {
    //   setSignUpPolicyWarning('You must accept the Impersonation Policy to sign up.');
    //   setLoading(false);
    //   return;
    // }
    // if (!isSignUp && !acceptSignInPolicy) {
    //   setSignInPolicyWarning('You must accept the Impersonation Policy to sign in.');
    //   setLoading(false);
    //   return;
    // }

    try {
      if (isSignUp) {
        if (!referralCode.trim()) {
          setReferralCodeWarning('Referral code is required.');
          setLoading(false);
          return;
        }
        if (referralCodeValid !== true) {
          setReferralCodeWarning('Referral code is invalid. Please enter a valid one.');
          setLoading(false);
          return;
        }
        // Check if username exists
        const { data: existing, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();
        if (existing) {
          // setUsernameWarning('username taken'); // This state variable is not defined
          toast.error('Username already taken.');
          setLoading(false);
          return;
        }
        if (usernameError && usernameError.code !== 'PGRST116') { // ignore no rows found
          throw usernameError;
        }
        const { error } = await signUp(email, password, {
          full_name: fullName,
          username: username,
          referral_code: referralCode.trim(),
          impersonation_policy_accepted: true,
        });
        if (error) throw error;
        // Get the new user's ID from the session
        const { data: session } = await supabase.auth.getSession();
        const newUserId = session?.session?.user?.id;
        if (newUserId) {
          await supabase.rpc('validate_and_assign_referral_code', {
            user_id: newUserId,
            referral_code_input: referralCode.trim()
          });
        }
        setShowVerificationModal(true); // Show modal after signup
        return;
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('impersonation_policy_accepted')
          .eq('email', email)
          .single();
        // if (!profile?.impersonation_policy_accepted) {
        //   // setPolicyWarning('You must accept the Impersonation Policy to sign in.'); // This state variable is not defined
        //   toast.error('You must accept the Impersonation Policy to sign in.');
        //   setLoading(false);
        //   return;
        // }
        const { error } = await signIn(email, password);
        if (error) {
          // Check if it's admin credentials even if auth fails
          if (email === 'anand01ts@gmail.com' && password === 'Anand.1105') {
            toast.success('Admin access granted!');
            navigate('/');
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

  const handleReferralCodeChange = (value: string) => {
    setReferralCode(value.toUpperCase());
    setReferralCodeWarning('');
    setReferralCodeValid(null);
    if (referralCodeTimeout.current) clearTimeout(referralCodeTimeout.current);
    if (!value.trim()) {
      setReferralCodeValid(null);
      return;
    }
    setReferralCodeChecking(true);
    referralCodeTimeout.current = setTimeout(async () => {
      // Use the new check_referral_code_exists function for real-time validation
      const { data, error } = await supabase.rpc('check_referral_code_exists', {
        referral_code_input: value.trim()
      });
      if (error || !data || data.exists !== true) {
        setReferralCodeValid(false);
      } else {
        setReferralCodeValid(true);
      }
      setReferralCodeChecking(false);
    }, 500);
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

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col items-center">
              <img src="/logo.webp" alt="Logo" className="w-32 h-32 object-contain mb-1.5" />
            </div>

            <div className="flex min-h-[80vh] items-center justify-center">
              <div className="max-w-md w-full">
                <div className="bg-[rgba(0,0,0,0.7)] border rounded-3xl p-8 shadow-xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      EVERWO
                    </h3>
                    <p className="text-muted-foreground">
                      {isSignUp 
                        ? 'Start collaborating with students worldwide' 
                        : 'Continue your journey with us'
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
                    {/* Referral code field always visible and required on signup */}
                    {isSignUp && (
                      <div className="mb-2">
                        <Label htmlFor="referralCode">Referral Code</Label>
                        <Input
                          id="referralCode"
                          type="text"
                          value={referralCode}
                          onChange={e => handleReferralCodeChange(e.target.value)}
                          placeholder="Enter referral code"
                          className="mt-1"
                          required
                        />
                        {referralCodeChecking && (
                          <div className="text-blue-500 text-xs mt-1">Checking referral code...</div>
                        )}
                        {referralCodeValid === true && !referralCodeChecking && (
                          <div className="text-green-500 text-xs mt-1">Referral code is valid!</div>
                        )}
                        {referralCodeValid === false && !referralCodeChecking && (
                          <div className="text-red-500 text-xs mt-1">Referral code is invalid.</div>
                        )}
                        {referralCodeWarning && (
                          <div className="text-red-500 text-xs mt-1">{referralCodeWarning}</div>
                        )}
                      </div>
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

                    {/* Impersonation Policy for Sign Up */}
                    {isSignUp && (
                      <div className="mt-6 text-xs text-gray-400">
                        <div className="flex items-start mb-2">
                          <input
                            type="checkbox"
                            id="impersonation-policy-signup"
                            checked={acceptSignUpPolicy}
                            onChange={e => setAcceptSignUpPolicy(e.target.checked)}
                            className="mr-2 mt-1"
                          />
                          <label htmlFor="impersonation-policy-signup" className="select-none">
                            I have read and accept the <span className="font-semibold text-white">Impersonation Policy</span> below.
                          </label>
                        </div>
                        {signUpPolicyWarning && <div className="text-red-500 mb-2">{signUpPolicyWarning}</div>}
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
                        disabled={loading || !acceptSignUpPolicy || !referralCode.trim() || referralCodeValid !== true}
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
};

export default AuthPage;
