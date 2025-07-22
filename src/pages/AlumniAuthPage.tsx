
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isAdminCredentials } from '@/utils/adminUtils';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AlumniAuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptSignUpPolicy, setAcceptSignUpPolicy] = useState(false);
  const [acceptSignInPolicy, setAcceptSignInPolicy] = useState(false);
  const [signUpPolicyWarning, setSignUpPolicyWarning] = useState('');
  const [signInPolicyWarning, setSignInPolicyWarning] = useState('');
  const { user, signIn, signUp, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Redirect if already authenticated and has access
  useEffect(() => {
    const checkAlumniStatus = async () => {
      if (authLoading) return;
      
      if (user) {
        console.log('User found:', user.email, 'Is admin:', isAdmin);
        
        // If admin, grant immediate access to alumni portal
        if (isAdmin) {
          console.log('Admin detected, redirecting to alumni portal');
          navigate('/alumni-portal', { replace: true });
          return;
        }
        
        // For non-admin users, check if they have an alumni profile
        try {
          const { data: alumniProfile, error } = await supabase
            .from('alumni_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          console.log('Alumni profile check:', alumniProfile, error);
          
          if (alumniProfile) {
            navigate('/alumni-portal', { replace: true });
          } else {
            // User exists but not an alumni, redirect to regular app
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error checking alumni profile:', error);
          // If there's an error checking the profile, redirect to main app
          navigate('/', { replace: true });
        }
      }
    };
    
    checkAlumniStatus();
  }, [user, authLoading, navigate, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignUpPolicyWarning('');
    setSignInPolicyWarning('');

    if (isSignUp && !acceptSignUpPolicy) {
      setSignUpPolicyWarning('You must accept the Impersonation Policy to sign up.');
      setLoading(false);
      return;
    }
    if (!isSignUp && !acceptSignInPolicy) {
      setSignInPolicyWarning('You must accept the Impersonation Policy to sign in.');
      setLoading(false);
      return;
    }

    try {
      // Check for admin credentials first
      if (isAdminCredentials(email, password)) {
        console.log('Admin credentials detected');
        
        // Try to sign in with admin credentials
        const { error: signInError } = await signIn(email, password);
        
        if (!signInError) {
          toast.success('Admin access granted!');
          // Wait a moment for auth state to update, then navigate
          setTimeout(() => {
            navigate('/alumni-portal', { replace: true });
          }, 100);
        } else {
          // If sign in fails but credentials are admin, still grant access
          console.log('Sign in failed but admin credentials detected');
          toast.success('Admin access granted!');
          navigate('/alumni-portal', { replace: true });
        }
        return;
      }

      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, {
          full_name: fullName,
          user_type: 'alumni'
        });
        if (signUpError) throw signUpError;

        // Create alumni profile for regular users
        const { error: profileError } = await supabase
          .from('alumni_profiles')
          .insert({
            user_id: user?.id,
            full_name: fullName,
            graduation_year: parseInt(graduationYear),
            degree,
            major: major || null,
            verification_status: 'pending'
          });

        if (profileError) throw profileError;
        setShowVerificationModal(true);
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          throw signInError;
        }
        
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Checking authentication status...</span>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-6">
              <span className="text-2xl font-bold text-black">🎓</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everwo Alumni Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with fellow alumni, access exclusive opportunities, and continue your journey with the Everwo community
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <div className="order-2 lg:order-1">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">🤝 Alumni Network</h3>
                  <p className="text-gray-600">Connect with thousands of verified alumni from your college and beyond.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">💼 Exclusive Jobs</h3>
                  <p className="text-gray-600">Access job postings exclusively shared by fellow alumni in top companies.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">🎯 Mentorship</h3>
                  <p className="text-gray-600">Find mentors or become one to guide the next generation of professionals.</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">📚 Events & Learning</h3>
                  <p className="text-gray-600">Join exclusive workshops, reunions, and professional development events.</p>
                </div>
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="order-1 lg:order-2">
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {isSignUp ? 'Join Alumni Network' : 'Alumni Sign In'}
                    </h3>
                    <p className="text-gray-600">
                      {isSignUp 
                        ? 'Create your verified alumni account' 
                        : 'Welcome back to the alumni community'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-11 rounded-xl"
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear" className="text-sm font-medium">Graduation Year</Label>
                          <Select value={graduationYear} onValueChange={setGraduationYear} required>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select graduation year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="degree" className="text-sm font-medium">Degree</Label>
                          <Input
                            id="degree"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            required
                            className="h-11 rounded-xl"
                            placeholder="e.g., Bachelor of Science"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="major" className="text-sm font-medium">Major (Optional)</Label>
                          <Input
                            id="major"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            className="h-11 rounded-xl"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        {/* Impersonation Policy for Sign Up */}
                        <div className="mt-6 text-xs text-gray-600">
                          <div className="flex items-start mb-2">
                            <input
                              type="checkbox"
                              id="impersonation-policy-signup"
                              checked={acceptSignUpPolicy}
                              onChange={e => setAcceptSignUpPolicy(e.target.checked)}
                              className="mr-2 mt-1"
                            />
                            <label htmlFor="impersonation-policy-signup" className="select-none">
                              I have read and accept the <span className="font-semibold text-black">Impersonation Policy</span> below.
                            </label>
                          </div>
                          {signUpPolicyWarning && <div className="text-red-500 mb-2">{signUpPolicyWarning}</div>}
                          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-2 text-gray-700">
                            <div className="font-bold text-black mb-1">Impersonation Policy</div>
                            <div>
                              By signing up for Everwo, you confirm that the identity and university details you provide are true and your own. Any attempt to impersonate another person or falsely claim to be affiliated with a university or institution is a violation of our terms of service.<br /><br />
                              If you are found to be impersonating another individual or misrepresenting your identity, Everwo reserves the right to:
                              <ul className="list-disc ml-6 my-2">
                                <li>Suspend or terminate your account without notice</li>
                                <li>Share your account details (including IP address and login metadata) with authorized cyber crime authorities</li>
                                <li>Report such actions to India s Cyber Crime Cell under the IT Act, 2000</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Impersonation Policy for Sign In */}
                    {!isSignUp && (
                      <div className="mt-6 text-xs text-gray-600">
                        <div className="flex items-start mb-2">
                          <input
                            type="checkbox"
                            id="impersonation-policy-signin"
                            checked={acceptSignInPolicy}
                            onChange={e => setAcceptSignInPolicy(e.target.checked)}
                            className="mr-2 mt-1"
                          />
                          <label htmlFor="impersonation-policy-signin" className="select-none">
                            I have read and accept the <span className="font-semibold text-black">Impersonation Policy</span> below.
                          </label>
                        </div>
                        {signInPolicyWarning && <div className="text-red-500 mb-2">{signInPolicyWarning}</div>}
                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-2 text-gray-700">
                          <div className="font-bold text-black mb-1">Impersonation Policy</div>
                          <div>
                            By signing in to Everwo, you confirm that the identity and university details you provide are true and your own. Any attempt to impersonate another person or falsely claim to be affiliated with a university or institution is a violation of our terms of service.<br /><br />
                            If you are found to be impersonating another individual or misrepresenting your identity, Everwo reserves the right to:
                            <ul className="list-disc ml-6 my-2">
                              <li>Suspend or terminate your account without notice</li>
                              <li>Share your account details (including IP address and login metadata) with authorized cyber crime authorities</li>
                              <li>Report such actions to India s Cyber Crime Cell under the IT Act, 2000</li>
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
                        disabled={loading || !acceptSignUpPolicy}
                      >
                        {loading ? 'Please wait...' : 'Create Alumni Account'}
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

                    <div className="text-center space-y-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-sm text-gray-600 hover:text-gray-900"
                        onClick={() => setIsSignUp(!isSignUp)}
                      >
                        {isSignUp 
                          ? 'Already have an alumni account? Sign in' 
                          : "Don't have an alumni account? Sign up"
                        }
                      </Button>
                      
                      <div className="text-sm text-gray-500">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm text-gray-600 hover:text-gray-800 p-0"
                          onClick={() => navigate('/auth')}
                        >
                          ← Back to Student Portal
                        </Button>
                      </div>
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
    </div>
  );
};

export default AlumniAuthPage;
