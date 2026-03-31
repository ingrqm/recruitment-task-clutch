import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

const commentVideoIdAtom = atom<string | null>(null);

export const useCommentSheet = () => {
  const videoId = useAtomValue(commentVideoIdAtom);
  const setVideoId = useSetAtom(commentVideoIdAtom);

  const openComments = useCallback(
    (id: string) => setVideoId(id),
    [setVideoId],
  );
  const closeComments = useCallback(() => setVideoId(null), [setVideoId]);

  return { videoId, openComments, closeComments };
};
