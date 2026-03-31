import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getSupabase } from '~/lib/supabase';

import { useAuth } from './use-auth';

import type { Profile, VideoStats } from '~/types';

const LIKES_PAGE_SIZE = 20;

type LikedByUser = {
  user_id: string;
  profiles: Profile;
};

export const useLikedBy = ({ videoId }: { videoId: string }) => {
  return useInfiniteQuery({
    queryKey: ['liked-by', videoId],
    queryFn: async ({ pageParam = 0 }): Promise<LikedByUser[]> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('likes')
        .select(
          'user_id, profiles(id, username, first_name, last_name, avatar_url, created_at)',
        )
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + LIKES_PAGE_SIZE - 1);

      if (error) throw error;
      return (data ?? []) as unknown as LikedByUser[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIKES_PAGE_SIZE) return undefined;
      return allPages.reduce((sum, page) => sum + page.length, 0);
    },
    select: (data) => data.pages.flat(),
    enabled: !!videoId,
  });
};

export const useVideoStats = ({ videoId }: { videoId: string }) => {
  return useQuery({
    queryKey: ['video-stats', videoId],
    queryFn: async (): Promise<VideoStats> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('video_stats')
        .select('*')
        .eq('video_id', videoId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data ?? { video_id: videoId, like_count: 0, comment_count: 0 };
    },
  });
};

export const useIsLiked = ({ videoId }: { videoId: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-liked', videoId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const supabase = getSupabase();
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle();

      return !!data;
    },
    enabled: !!user,
  });
};

export const useToggleLike = ({ videoId }: { videoId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isCurrentlyLiked }: { isCurrentlyLiked: boolean }) => {
      if (!user) throw new Error('Must be authenticated');

      const supabase = getSupabase();

      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, video_id: videoId });
        if (error && error.code !== '23505') throw error;
      }
    },

    onMutate: async ({ isCurrentlyLiked }) => {
      await queryClient.cancelQueries({
        queryKey: ['is-liked', videoId, user?.id],
      });
      await queryClient.cancelQueries({
        queryKey: ['video-stats', videoId],
      });

      const previousIsLiked = queryClient.getQueryData<boolean>([
        'is-liked',
        videoId,
        user?.id,
      ]);
      const previousStats = queryClient.getQueryData<VideoStats>([
        'video-stats',
        videoId,
      ]);

      queryClient.setQueryData(
        ['is-liked', videoId, user?.id],
        !isCurrentlyLiked,
      );

      queryClient.setQueryData<VideoStats>(['video-stats', videoId], (old) => {
        const current = old ?? {
          video_id: videoId,
          like_count: 0,
          comment_count: 0,
        };
        return {
          ...current,
          like_count: isCurrentlyLiked
            ? Math.max(0, current.like_count - 1)
            : current.like_count + 1,
        };
      });

      return { previousIsLiked, previousStats };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousIsLiked !== undefined) {
        queryClient.setQueryData(
          ['is-liked', videoId, user?.id],
          context.previousIsLiked,
        );
      }
      if (context?.previousStats) {
        queryClient.setQueryData(
          ['video-stats', videoId],
          context.previousStats,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['is-liked', videoId, user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['video-stats', videoId],
      });
    },
  });
};
