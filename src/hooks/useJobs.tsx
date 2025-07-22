
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';
import type { Tables } from '@/integrations/supabase/types';

export type Job = Tables<'jobs'> & {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
  } | null;
};

interface UseJobsOptions {
  type?: 'job' | 'service' | 'all';
  searchTerm?: string;
  location?: string;
}

export const useJobs = ({ type = 'all', searchTerm = '', location = '' }: UseJobsOptions = {}) => {
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Removed useRealtime subscription for 'jobs'

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', type, searchTerm, location, refetchTrigger],
    queryFn: async () => {
      console.log('useJobs: Starting query with params:', { type, searchTerm, location });
      
      // First, get jobs without the join
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      // Filter by type if specified
      if (type !== 'all') {
        console.log('useJobs: Filtering by type:', type);
        query = query.eq('type', type);
      }

      // Filter by search term
      if (searchTerm) {
        console.log('useJobs: Filtering by search term:', searchTerm);
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Filter by location
      if (location && location !== 'all') {
        console.log('useJobs: Filtering by location:', location);
        if (location === 'remote') {
          query = query.eq('location_type', 'remote');
        } else if (location === 'hybrid') {
          query = query.eq('location_type', 'hybrid');
        } else if (location === 'on-site') {
          query = query.eq('location_type', 'on-site');
        }
      }

      const { data: jobsData, error: jobsError } = await query;
      
      if (jobsError) {
        console.error('useJobs: Jobs query error:', jobsError);
        throw jobsError;
      }

      console.log('useJobs: Jobs data received:', { jobsCount: jobsData?.length });

      if (!jobsData || jobsData.length === 0) {
        console.log('useJobs: No jobs found, returning empty array');
        return [];
      }

      // Get unique user IDs from jobs
      const userIds = [...new Set(jobsData.map(job => job.user_id))];
      console.log('useJobs: Fetching profiles for user IDs:', userIds);

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, rating')
        .in('id', userIds);

      if (profilesError) {
        console.error('useJobs: Profiles query error:', profilesError);
        // Don't throw error, just continue without profiles
      }

      console.log('useJobs: Profiles data received:', { profilesCount: profilesData?.length });

      // Combine jobs with their profiles
      const jobsWithProfiles = jobsData.map(job => ({
        ...job,
        profiles: profilesData?.find(profile => profile.id === job.user_id) || null
      })) as Job[];

      console.log('useJobs: Final result:', { 
        jobsWithProfilesCount: jobsWithProfiles.length,
        sampleJob: jobsWithProfiles[0]
      });
      
      return jobsWithProfiles;
    },
  });

  useEffect(() => {
    refetch();
  }, [refetchTrigger, refetch]);

  console.log('useJobs: Hook state:', { jobsCount: jobs.length, isLoading, error });

  return {
    jobs,
    isLoading,
    error,
    refetch
  };
};
