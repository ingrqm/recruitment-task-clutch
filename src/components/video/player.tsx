import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useSetFullscreen } from '~/store/fullscreen';
import { useMute } from '~/store/mute';

import type {
  HighlightThumbnailUrls,
  HighlightVideoUrls,
  VideoUrlKey,
} from '~/types';

type VideoPlayerProps = {
  videoUrls: HighlightVideoUrls;
  thumbnailUrls: HighlightThumbnailUrls;
  activeUrlKey: VideoUrlKey;
  isActive: boolean;
  onTapInactive?: () => void;
  onDoubleTap?: () => void;
};

const setupPlayer = (p: { loop: boolean; muted: boolean }) => {
  p.loop = true;
  p.muted = true;
};

export const VideoPlayer = ({
  videoUrls,
  thumbnailUrls,
  activeUrlKey,
  isActive,
  onTapInactive,
  onDoubleTap,
}: VideoPlayerProps) => {
  const { isMuted, toggleMute, setMuted } = useMute();
  const setGlobalFullscreen = useSetFullscreen();

  const preloadAll = Platform.OS !== 'android';

  const playerAutopan = useVideoPlayer(
    activeUrlKey === 'clutch_autopan' || (preloadAll && isActive)
      ? videoUrls.clutch_autopan
      : null,
    setupPlayer,
  );
  const playerMatchWoBreaks = useVideoPlayer(
    activeUrlKey === 'match_wo_breaks' || (preloadAll && isActive)
      ? videoUrls.match_wo_breaks
      : null,
    setupPlayer,
  );
  const playerLandscape = useVideoPlayer(
    activeUrlKey === 'clutch_landscape' || (preloadAll && isActive)
      ? videoUrls.clutch_landscape
      : null,
    setupPlayer,
  );

  const players: Record<VideoUrlKey, ReturnType<typeof useVideoPlayer>> = {
    clutch_autopan: playerAutopan,
    match_wo_breaks: playerMatchWoBreaks,
    clutch_landscape: playerLandscape,
  };
  const activePlayer = players[activeUrlKey];

  const autopanPlaying = useEvent(playerAutopan, 'playingChange', {
    isPlaying: playerAutopan.playing,
  });
  const matchPlaying = useEvent(playerMatchWoBreaks, 'playingChange', {
    isPlaying: playerMatchWoBreaks.playing,
  });
  const landscapePlaying = useEvent(playerLandscape, 'playingChange', {
    isPlaying: playerLandscape.playing,
  });

  const autopanStatus = useEvent(playerAutopan, 'statusChange', {
    status: playerAutopan.status,
  });
  const matchStatus = useEvent(playerMatchWoBreaks, 'statusChange', {
    status: playerMatchWoBreaks.status,
  });
  const landscapeStatus = useEvent(playerLandscape, 'statusChange', {
    status: playerLandscape.status,
  });

  const autopanMuted = useEvent(playerAutopan, 'mutedChange', {
    muted: playerAutopan.muted,
  });
  const matchMuted = useEvent(playerMatchWoBreaks, 'mutedChange', {
    muted: playerMatchWoBreaks.muted,
  });
  const landscapeMuted = useEvent(playerLandscape, 'mutedChange', {
    muted: playerLandscape.muted,
  });

  const playingStates: Record<VideoUrlKey, { isPlaying: boolean }> = {
    clutch_autopan: autopanPlaying,
    match_wo_breaks: matchPlaying,
    clutch_landscape: landscapePlaying,
  };
  const statusStates: Record<VideoUrlKey, { status: string }> = {
    clutch_autopan: autopanStatus,
    match_wo_breaks: matchStatus,
    clutch_landscape: landscapeStatus,
  };
  const mutedStates: Record<VideoUrlKey, { muted: boolean }> = {
    clutch_autopan: autopanMuted,
    match_wo_breaks: matchMuted,
    clutch_landscape: landscapeMuted,
  };
  const { isPlaying } = playingStates[activeUrlKey];
  const { status } = statusStates[activeUrlKey];
  const { muted: playerMuted } = mutedStates[activeUrlKey];

  const thumbnailOpacity = useSharedValue(1);
  const heartScale = useSharedValue(0);
  const videoViewRef = useRef<VideoView>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const skipMuteSyncRef = useRef(false);

  useEffect(() => {
    skipMuteSyncRef.current = true;
    activePlayer.muted = isMuted;
  }, [isMuted, activePlayer]);

  useEffect(() => {
    if (skipMuteSyncRef.current) {
      skipMuteSyncRef.current = false;
      return;
    }
    if (isActive && playerMuted !== isMuted) {
      setMuted(playerMuted);
    }
  }, [isActive, playerMuted, isMuted, setMuted]);

  useEffect(() => {
    if (isActive) {
      Object.entries(players).forEach(([key, p]) => {
        if (key === activeUrlKey) {
          p.muted = isMuted;
          p.play();
        } else {
          p.pause();
        }
      });
    } else {
      Object.values(players).forEach((p) => p.pause());
      thumbnailOpacity.value = 1;
    }
  }, [
    isActive,
    isFullscreen,
    activeUrlKey,
    playerAutopan,
    playerMatchWoBreaks,
    playerLandscape,
    thumbnailOpacity,
  ]);

  useEffect(() => {
    thumbnailOpacity.value = 1;
  }, [activeUrlKey, thumbnailOpacity]);

  useEffect(() => {
    if (isActive && isPlaying && status === 'readyToPlay') {
      const timer = setTimeout(() => {
        thumbnailOpacity.value = withTiming(0, { duration: 150 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, isPlaying, status, thumbnailOpacity]);

  useEffect(() => {
    if (status === 'error') {
      thumbnailOpacity.value = 1;
    }
  }, [status, thumbnailOpacity]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    await activePlayer.replaceAsync(videoUrls[activeUrlKey]);
    activePlayer.play();
    setTimeout(() => setIsRetrying(false), 2000);
  }, [activePlayer, videoUrls, activeUrlKey]);

  const thumbnailStyle = useAnimatedStyle(() => ({
    opacity: thumbnailOpacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value > 0 ? 1 : 0,
  }));

  const handleEnterFullscreen = useCallback(() => {
    if (Platform.OS === 'android') {
      setIsFullscreen(true);
      setGlobalFullscreen(true);
    } else {
      videoViewRef.current?.enterFullscreen();
    }
  }, [setGlobalFullscreen]);

  const handleFullscreenExit = useCallback(() => {
    setIsFullscreen(false);
    setGlobalFullscreen(false);
  }, [setGlobalFullscreen]);

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      if (!isActive && onTapInactive) {
        runOnJS(onTapInactive)();
        return;
      }
      runOnJS(handleEnterFullscreen)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (onDoubleTap) {
        runOnJS(onDoubleTap)();
      }
      heartScale.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }),
      );
    });

  const tapGesture = Gesture.Exclusive(doubleTap, singleTap);

  const thumbnailUrl = thumbnailUrls[activeUrlKey];

  return (
    <View className="aspect-[4/5] w-full overflow-hidden bg-card">
      <GestureDetector gesture={tapGesture}>
        <View style={{ width: '100%', height: '100%' }}>
          {!(Platform.OS === 'android' && isFullscreen) && (
            <VideoView
              ref={videoViewRef}
              player={activePlayer}
              style={{ width: '100%', height: '100%' }}
              contentFit={isFullscreen ? 'contain' : 'cover'}
              nativeControls={isFullscreen}
              fullscreenOptions={{
                enable: true,
                orientation:
                  activeUrlKey === 'clutch_landscape' ? 'landscape' : 'default',
              }}
              onFullscreenEnter={() => {
                setIsFullscreen(true);
                setGlobalFullscreen(true);
              }}
              onFullscreenExit={handleFullscreenExit}
            />
          )}

          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
              thumbnailStyle,
            ]}
            pointerEvents="none"
          >
            <Image
              source={{ uri: thumbnailUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </Animated.View>

          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              },
              heartStyle,
            ]}
            pointerEvents="none"
          >
            <Ionicons name="heart" size={80} color="#ef4444" />
          </Animated.View>
        </View>
      </GestureDetector>

      {(status === 'error' || isRetrying) && (
        <View className="absolute inset-0 items-center justify-center bg-black/80">
          {isRetrying ? (
            <>
              <ActivityIndicator color="white" size="large" />
              <Text className="mt-3 text-sm font-medium text-white">
                Retrying...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="alert-circle-outline" size={40} color="white" />
              <Text className="mt-2 text-sm font-medium text-white">
                Video unavailable
              </Text>
              <Pressable
                onPress={handleRetry}
                className="mt-3 rounded-full bg-primary px-5 py-2"
              >
                <Text className="text-sm font-semibold text-primary-foreground">
                  Retry
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      <Pressable
        onPress={toggleMute}
        className="absolute bottom-3 right-3 h-8 w-8 items-center justify-center rounded-full bg-black/50"
        hitSlop={8}
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={16}
          color="white"
        />
      </Pressable>

      {Platform.OS === 'android' && isFullscreen && (
        <Modal
          visible
          animationType="fade"
          statusBarTranslucent
          onRequestClose={handleFullscreenExit}
        >
          <StatusBar hidden />
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            <VideoView
              player={activePlayer}
              style={{ flex: 1 }}
              contentFit="contain"
              nativeControls
              fullscreenOptions={{ enable: false }}
            />
            <Pressable
              onPress={handleFullscreenExit}
              style={{
                position: 'absolute',
                top: 48,
                right: 16,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.6)',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 10,
                zIndex: 10,
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
};
