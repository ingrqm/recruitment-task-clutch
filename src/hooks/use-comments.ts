import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { getSupabase } from '~/lib/supabase';

import { useAuth } from './use-auth';
import { useCachedProfile } from './use-profile';

import type { Comment, VideoStats } from '~/types';

const PAGE_SIZE = 20;

const groupReplies = (flat: Comment[]): Comment[] => {
  const byId = new Map<string, Comment>();
  const topLevel: Comment[] = [];
  const replyMap = new Map<string, Comment[]>();

  for (const comment of flat) {
    byId.set(comment.id, comment);
  }

  const resolveRootId = (parentId: string): string => {
    const parent = byId.get(parentId);
    if (!parent?.parent_id) return parentId;
    return resolveRootId(parent.parent_id);
  };

  for (const comment of flat) {
    if (comment.parent_id) {
      const rootId = resolveRootId(comment.parent_id);
      const existing = replyMap.get(rootId) ?? [];
      existing.push(comment);
      replyMap.set(rootId, existing);
    } else {
      topLevel.push(comment);
    }
  }

  return topLevel.map((comment) => ({
    ...comment,
    replies:
      replyMap
        .get(comment.id)
        ?.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ) ?? [],
  }));
};

export const useComments = ({ videoId }: { videoId: string }) => {
  return useInfiniteQuery({
    queryKey: ['comments', videoId],
    queryFn: async ({ pageParam = 0 }): Promise<Comment[]> => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(id, username, first_name, last_name, avatar_url)')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (error) throw error;
      return data ?? [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.reduce((sum, page) => sum + page.length, 0);
    },
    select: (data) => groupReplies(data.pages.flat()),
    enabled: !!videoId,
  });
};

type AddCommentInput = {
  content: string;
  parentId?: string;
};

export const useAddComment = ({ videoId }: { videoId: string }) => {
  const { user } = useAuth();
  const cachedProfile = useCachedProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, parentId }: AddCommentInput) => {
      if (!user) throw new Error('Must be authenticated');

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          video_id: videoId,
          content,
          parent_id: parentId ?? null,
        })
        .select('*, profiles(id, username, first_name, last_name, avatar_url)')
        .single();

      if (error) throw error;
      return data as Comment;
    },

    onMutate: async ({ content, parentId }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', videoId] });
      await queryClient.cancelQueries({
        queryKey: ['video-stats', videoId],
      });

      const previousComments = queryClient.getQueryData(['comments', videoId]);
      const previousStats = queryClient.getQueryData<VideoStats>([
        'video-stats',
        videoId,
      ]);

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        user_id: user?.id ?? '',
        video_id: videoId,
        content,
        created_at: new Date().toISOString(),
        parent_id: parentId ?? null,
        profiles: cachedProfile ?? {
          id: user?.id ?? '',
          username: user?.user_metadata?.username ?? 'You',
          first_name: user?.user_metadata?.first_name ?? null,
          last_name: user?.user_metadata?.last_name ?? null,
          avatar_url: null,
          created_at: '',
        },
        replies: [],
      };

      queryClient.setQueryData(['comments', videoId], (old: unknown) => {
        const typed = old as
          | { pages: Comment[][]; pageParams: number[] }
          | undefined;
        if (!typed) return { pages: [[optimisticComment]], pageParams: [0] };

        if (parentId) {
          return {
            ...typed,
            pages: typed.pages.map((page) =>
              page.map((c) =>
                c.id === parentId
                  ? { ...c, replies: [...(c.replies ?? []), optimisticComment] }
                  : c,
              ),
            ),
          };
        }

        return {
          ...typed,
          pages: [
            [optimisticComment, ...typed.pages[0]],
            ...typed.pages.slice(1),
          ],
        };
      });

      queryClient.setQueryData<VideoStats>(['video-stats', videoId], (old) => ({
        video_id: videoId,
        like_count: old?.like_count ?? 0,
        comment_count: (old?.comment_count ?? 0) + 1,
      }));

      return { previousComments, previousStats };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData(
          ['comments', videoId],
          context.previousComments,
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
        queryKey: ['comments', videoId],
      });
      queryClient.invalidateQueries({
        queryKey: ['video-stats', videoId],
      });
    },
  });
};
