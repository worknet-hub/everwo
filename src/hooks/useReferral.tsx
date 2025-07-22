import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useReferral = () => {
  const { user } = useAuth();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkReferralStatus();
    }
  }, [user]);

  const checkReferralStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // If referral_code is missing, generate one and refetch
      if (!profile.referral_code) {
        await supabase.rpc('assign_referral_code_to_user', { user_id: user.id });
        // Refetch profile
        const { data: refreshedProfile, error: refreshError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!refreshError && refreshedProfile) {
          profile = refreshedProfile;
        }
      }

      setUserProfile(profile);

      // Show referral modal if user hasn't been referred by anyone
      if (!profile.referred_by) {
        setShowReferralModal(true);
      }
    } catch (error) {
      console.error('Error checking referral status:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeReferralModal = () => {
    setShowReferralModal(false);
  };

  const getUserReferralCode = () => {
    return userProfile?.referral_code;
  };

  const getReferralStats = async () => {
    if (!user) return null;

    try {
      // Get referrals made by this user
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:profiles!referrals_referred_user_id_fkey(
            id,
            full_name,
            username,
            created_at
          )
        `)
        .eq('referrer_id', user.id);

      // Handle error gracefully instead of throwing
      if (error) {
        console.error('Error getting referral stats:', error);
        return {
          referralCount: userProfile?.referral_count || 0,
          referrals: []
        };
      }

      return {
        referralCount: userProfile?.referral_count || 0,
        referrals: referrals || []
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        referralCount: userProfile?.referral_count || 0,
        referrals: []
      };
    }
  };

  return {
    showReferralModal,
    closeReferralModal,
    userProfile,
    loading,
    getUserReferralCode,
    getReferralStats
  };
}; 