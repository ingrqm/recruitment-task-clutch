import { atom, useAtomValue, useSetAtom } from 'jotai';

const fullscreenAtom = atom(false);

export const useIsFullscreen = () => useAtomValue(fullscreenAtom);
export const useSetFullscreen = () => useSetAtom(fullscreenAtom);
