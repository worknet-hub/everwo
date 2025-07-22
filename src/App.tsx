import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import { useEffect, useState } from 'react';
import { supabase, testSupabaseConnection, testBrowserExtensions, testLikesCountTriggers } from './integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { ArrowLeft } from 'lucide-react';
import { RealtimeProfileProvider } from "@/contexts/RealtimeProfileContext";
import { RealtimeThoughtsProvider } from "@/contexts/RealtimeThoughtsContext";
import { RealtimeCommunitiesProvider } from "@/contexts/RealtimeCommunitiesContext";
import { AuthProvider } from "@/hooks/useAuth";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useReferral } from './hooks/useReferral';
import { ReferralModal } from './components/auth/ReferralModal';

// Lazy load heavy/rarely-used components
const AlumniAuthPage = lazy(() => import("./pages/AlumniAuthPage"));
const AlumniPortalPage = lazy(() => import("./pages/AlumniPortalPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const SearchPage = lazy(() => import("./components/search/SearchPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const JobHousePage = lazy(() => import("./pages/JobHousePage"));
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const ConnectionsPage = lazy(() => import("./pages/ConnectionsPage"));
const CommunitiesPage = lazy(() => import("./components/communities/CommunitiesPage"));
const MobileBottomNav = lazy(() => import("./components/layout/MobileBottomNav"));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const NoCommunitiesPage = lazy(() => import('./pages/NoCommunitiesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black">
    <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
    <span className="text-white text-lg mt-2">Loading...</span>
  </div>
);

// RequireOnboarding wrapper
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showReferralModal, closeReferralModal, userProfile } = useReferral();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setOnboardingCompleted(!!profile?.onboarding_completed);
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setOnboardingCompleted(false); // fallback or show error UI if needed
      } finally {
        setChecking(false);
      }
    };
    if (!loading) checkOnboarding();
  }, [user, loading]);

  // Add this effect to handle justOnboarded state
  useEffect(() => {
    if (location.state?.justOnboarded) {
      // Refetch onboarding status
      setChecking(true);
      const refetch = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();
          if (error) throw error;
          setOnboardingCompleted(!!profile?.onboarding_completed);
        } catch (err) {
          setOnboardingCompleted(false);
        } finally {
          setChecking(false);
          // Clear the state so it doesn't refetch every time
          navigate(location.pathname, { replace: true, state: {} });
        }
      };
      refetch();
    }
  }, [location, user]);

  useEffect(() => {
    if (checking) return;
    if (!user) return;
    if (!onboardingCompleted && location.pathname !== '/onboarding' && location.pathname !== '/auth') {
      navigate('/onboarding', { replace: true });
    }
  }, [checking, onboardingCompleted, user, location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23232b] to-[#18181b] fade-in">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Checking onboarding status...</span>
        <style>{`
          .fade-in { animation: fadeIn 0.7s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  return <>
    {children}
    {user && showReferralModal && userProfile?.id && (
      <ReferralModal isOpen={showReferralModal} onClose={closeReferralModal} userId={userProfile.id} />
    )}
  </>;
}

const AppRoutes = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <RequireOnboarding>
      <div className="min-h-screen bg-[rgba(0,0,0,0.7)] md:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <OnboardingPage />
                </Suspense>
              } />
              <Route path="/alumni-auth" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AlumniAuthPage />
                </Suspense>
              } />
              <Route path="/alumni-portal" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AlumniPortalPage />
                </Suspense>
              } />
              <Route path="/search" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SearchPage />
                </Suspense>
              } />
              {!isMobile && <Route path="/job-house" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <JobHousePage />
                </Suspense>
              } />}
              <Route path="/post-job" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PostJobPage />
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfilePage />
                </Suspense>
              } />
              <Route path="/profile/:profileId" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfilePage />
                </Suspense>
              } />
              <Route path="/messages" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <MessagesPage />
                </Suspense>
              } />
              <Route path="/connections" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ConnectionsPage />
                </Suspense>
              } />
              <Route path="/communities" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CommunitiesPage />
                </Suspense>
              } />
              <Route path="/reviews" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ReviewsPage />
                </Suspense>
              } />
              <Route path="/notifications" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NotificationsPage />
                </Suspense>
              } />
              <Route path="/no-communities" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NoCommunitiesPage />
                </Suspense>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
      {location.pathname !== "/messages" && (
        <Suspense fallback={<div className="h-16 bg-black" />}>
          <MobileBottomNav />
        </Suspense>
      )}
          </div>
    </RequireOnboarding>
  );
};

const App = () => {
  const queryClient = new QueryClient();

  // Test Supabase connection and browser extensions on app start
  useEffect(() => {
    const runTests = async () => {
      console.log('🔍 Running connection tests...');
      
      const supabaseSuccess = await testSupabaseConnection();
      if (supabaseSuccess) {
        console.log('✅ Supabase connection successful');
      } else {
        console.error('❌ Supabase connection failed');
      }
      
      const browserTest = await testBrowserExtensions();
      if (browserTest) {
        console.log('✅ No browser extension interference detected');
      } else {
        console.warn('⚠️ Browser extensions may be interfering with requests');
        console.log('💡 Try disabling browser extensions or using incognito mode');
      }
      
      const triggersTest = await testLikesCountTriggers();
      if (triggersTest) {
        console.log('✅ Likes count triggers are working correctly');
      } else {
        console.warn('⚠️ Likes count triggers may not be working');
      }
    };
    
    runTests();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RealtimeProfileProvider>
            <RealtimeThoughtsProvider>
              <RealtimeCommunitiesProvider>
                <BrowserRouter>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AppRoutes />
                  </Suspense>
                  <WelcomeModal />
                </BrowserRouter>
              </RealtimeCommunitiesProvider>
            </RealtimeThoughtsProvider>
          </RealtimeProfileProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
