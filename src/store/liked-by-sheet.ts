import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

const likedByVideoIdAtom = atom<string | null>(null);

export const useLikedBySheet = () => {
  const videoId = useAtomValue(likedByVideoIdAtom);
  const setVideoId = useSetAtom(likedByVideoIdAtom);

  const openLikedBy = useCallback((id: string) => setVideoId(id), [setVideoId]);
  const closeLikedBy = useCallback(() => setVideoId(null), [setVideoId]);

  return { videoId, openLikedBy, closeLikedBy };
};
