
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProfileData {
  bio?: string;
  location?: string;
  college_name?: string;
  major?: string;
  interests?: string[];
  skills?: string[];
  portfolio?: string[];
  year_of_study?: string;
  [key: string]: any;
}

export const useProfileUpdater = () => {
  const { user } = useAuth();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const updateProfile = useCallback(async (data: ProfileData) => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    try {
      console.log('Updating profile with data:', data);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to save profile changes');
        throw error;
      } else {
        console.log('Profile updated successfully');
        toast.success('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save profile changes');
      throw error;
    }
  }, [user]);

  const debouncedUpdate = useCallback((data: ProfileData, delay: number = 1000) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateProfile(data);
    }, delay);
  }, [updateProfile]);

  const saveImmediately = useCallback(async (data: ProfileData) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    return await updateProfile(data);
  }, [updateProfile]);

  return {
    updateProfile: debouncedUpdate,
    saveImmediately
  };
};
