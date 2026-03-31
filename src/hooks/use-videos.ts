import { useInfiniteQuery } from '@tanstack/react-query';

import { CLUTCH_API_URL } from '~/constants';

import type { VideosResponse } from '~/types';

const fetchVideos = async ({
  pageParam = 1,
}: {
  pageParam?: number;
}): Promise<VideosResponse> => {
  const response = await fetch(`${CLUTCH_API_URL}?page=${pageParam}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch videos: ${response.status}`);
  }

  return response.json();
};

export const useVideos = () => {
  return useInfiniteQuery({
    queryKey: ['videos'],
    queryFn: fetchVideos,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
  });
};
