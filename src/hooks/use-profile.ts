import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getSupabase } from '~/lib/supabase';

import { useAuth } from './use-auth';

import type { Profile } from '~/types';

const PROFILE_STALE_TIME = 5 * 60 * 1000;

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: PROFILE_STALE_TIME,
  });
};

export const useCachedProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return queryClient.getQueryData<Profile>(['profile', user?.id]) ?? null;
};
