import { supabase } from '@/integrations/supabase/client';

export const setupInitialReferralCodes = async () => {
  try {
    // Set up referral codes for the 2 accounts
    // You can replace these with the actual user IDs and desired referral codes
    const initialReferralCodes = [
      {
        userId: 'your-first-user-id-here', // Replace with actual user ID
        referralCode: 'FOUNDER1'
      },
      {
        userId: 'your-second-user-id-here', // Replace with actual user ID
        referralCode: 'FOUNDER2'
      }
    ];

    for (const { userId, referralCode } of initialReferralCodes) {
      const { error } = await supabase
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', userId);

      if (error) {
        console.error(`Error setting referral code for user ${userId}:`, error);
      } else {
        console.log(`Successfully set referral code ${referralCode} for user ${userId}`);
      }
    }

    console.log('Initial referral codes setup completed!');
  } catch (error) {
    console.error('Error setting up initial referral codes:', error);
  }
};

// Function to get all users with their referral codes
export const getAllUsersWithReferralCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, referral_code, referral_count')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Users with referral codes:', data);
    return data;
  } catch (error) {
    console.error('Error fetching users with referral codes:', error);
    return null;
  }
};

// Function to get referral statistics
export const getReferralStatistics = async () => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referrer:profiles!referrals_referrer_id_fkey(full_name, username),
        referred_user:profiles!referrals_referred_user_id_fkey(full_name, username)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Referral statistics:', data);
    return data;
  } catch (error) {
    console.error('Error fetching referral statistics:', error);
    return null;
  }
};

// Function to generate and assign referral codes for all users who don't have one
export const generateReferralCodesForAllUsers = async () => {
  try {
    // Get all users who do not have a referral code
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, referral_code')
      .is('referral_code', null);

    if (error) {
      console.error('Error fetching users without referral codes:', error);
      return;
    }

    for (const user of users) {
      // Call the Supabase function to assign a referral code
      const { error: assignError } = await supabase.rpc('assign_referral_code_to_user', {
        user_id: user.id
      });
      if (assignError) {
        console.error(`Error assigning referral code to user ${user.id}:`, assignError);
      } else {
        console.log(`Referral code generated for user ${user.id}`);
      }
    }
    console.log('Referral codes generated for all users who needed one!');
  } catch (err) {
    console.error('Error generating referral codes for all users:', err);
  }
};