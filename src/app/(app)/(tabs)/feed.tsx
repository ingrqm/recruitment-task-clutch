import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '~/components/ui/empty-state';
import { ErrorState } from '~/components/ui/error-state';
import { FeedSkeleton } from '~/components/ui/skeleton';
import { VideoCard } from '~/components/video';
import { useVideos } from '~/hooks/use-videos';
import { useLikedBySheet } from '~/store/liked-by-sheet';

import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { Video } from '~/types';

const FALLBACK_ITEM_HEIGHT = 300;

const FeedScreen = () => {
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVideos();

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isAppActive, setIsAppActive] = useState(true);
  const { openLikedBy } = useLikedBySheet();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setIsAppActive(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  const listRef = useRef<FlashListRef<Video>>(null);
  const itemHeightRef = useRef(FALLBACK_ITEM_HEIGHT);
  const activeIndexRef = useRef(0);

  const videos = data?.pages.flatMap((page) => page.data) ?? [];

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      const scrollY = contentOffset.y;
      const viewportHeight = layoutMeasurement.height;
      const centerY = scrollY + viewportHeight / 2;

      const rawIndex = Math.floor(
        (centerY + itemHeightRef.current * 0.1) / itemHeightRef.current,
      );
      const clamped = Math.max(0, Math.min(rawIndex, videos.length - 1));

      if (clamped !== activeIndexRef.current) {
        activeIndexRef.current = clamped;
        setActiveVideoIndex(clamped);
      }
    },
    [videos.length],
  );

  const handleItemLayout = useCallback((height: number) => {
    if (height > 0 && itemHeightRef.current === FALLBACK_ITEM_HEIGHT) {
      itemHeightRef.current = height;
    }
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScrollToVideo = useCallback((index: number) => {
    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  }, []);

  if (isLoading) return <FeedSkeleton />;
  if (isError)
    return <ErrorState message="Failed to load feed" onRetry={refetch} />;
  if (videos.length === 0) {
    return <EmptyState title="No videos yet" description="Check back later!" />;
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <FlashList
          ref={listRef}
          data={videos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <VideoCard
              video={item}
              index={index}
              isActive={index === activeVideoIndex && isAppActive}
              onShowLikedBy={openLikedBy}
              onScrollToVideo={handleScrollToVideo}
              onLayout={handleItemLayout}
            />
          )}
          drawDistance={700}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#7A9E91"
            />
          }
        />
      </SafeAreaView>
    </View>
  );
};

export default FeedScreen;
