
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { supabase } from '@/integrations/supabase/client';

const OnboardingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!loading && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
        if (profile?.onboarding_completed) {
      navigate('/', { replace: true });
        } else {
          setProfileChecked(true);
        }
    }
    };
    checkOnboarding();
  }, [user, loading, navigate]);

  if (loading || !user || !profileChecked) {
    return null;
  }

  return <OnboardingContainer />;
};

export default OnboardingPage;
