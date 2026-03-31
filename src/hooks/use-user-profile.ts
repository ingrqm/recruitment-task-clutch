import { useQuery } from '@tanstack/react-query';

import { getSupabase } from '~/lib/supabase';

import type { Profile } from '~/types';

const PROFILE_STALE_TIME = 5 * 60 * 1000;

export const useUserProfile = ({ userId }: { userId: string }) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<Profile> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: PROFILE_STALE_TIME,
  });
};
