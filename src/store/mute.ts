import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

const INITIAL_MUTED = true;
const mutedAtom = atom(INITIAL_MUTED);

export { INITIAL_MUTED };

export const useMute = () => {
  const isMuted = useAtomValue(mutedAtom);
  const setIsMuted = useSetAtom(mutedAtom);

  const toggleMute = useCallback(
    () => setIsMuted((prev) => !prev),
    [setIsMuted],
  );
  const setMuted = useCallback(
    (value: boolean) => setIsMuted(value),
    [setIsMuted],
  );

  return { isMuted, toggleMute, setMuted };
};
