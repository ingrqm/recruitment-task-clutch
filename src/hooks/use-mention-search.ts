import { useQuery } from '@tanstack/react-query';

import { getSupabase } from '~/lib/supabase';

import type { Profile } from '~/types';

export const useMentionSearch = ({ query }: { query: string }) => {
  const trimmed = query.trim().toLowerCase();

  return useQuery({
    queryKey: ['mention-search', trimmed],
    queryFn: async (): Promise<Profile[]> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(
          `username.ilike.%${trimmed}%,first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%`,
        )
        .limit(8);

      if (error) throw error;
      return data ?? [];
    },
    enabled: trimmed.length >= 1,
    staleTime: 300,
    placeholderData: (prev) => prev,
  });
};
