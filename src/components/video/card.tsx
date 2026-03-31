import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { DEFAULT_VIDEO_URL_KEY } from '~/constants';

import { VideoPlayer } from './player';
import { VideoToggle } from './toggle';

import type { LayoutChangeEvent } from 'react-native';
import type { Video, VideoUrlKey } from '~/types';

type VideoCardProps = {
  video: Video;
  index: number;
  isActive: boolean;
  onScrollToVideo: (index: number) => void;
  onLayout: (height: number) => void;
};

export const VideoCard = ({
  video,
  index,
  isActive,
  onScrollToVideo,
  onLayout,
}: VideoCardProps) => {
  const [activeUrlKey, setActiveUrlKey] = useState<VideoUrlKey>(
    DEFAULT_VIDEO_URL_KEY,
  );

  const videoUrls = video.highlight_urls.highlight_video_urls;
  const thumbnailUrls = video.highlight_urls.highlight_thumbnail_urls;

  const handleTapInactive = useCallback(() => {
    onScrollToVideo(index);
  }, [index, onScrollToVideo]);

  const handleDoubleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout(event.nativeEvent.layout.height);
    },
    [onLayout],
  );

  return (
    <View className="pb-4" onLayout={handleLayout}>
      <VideoPlayer
        videoUrls={videoUrls}
        thumbnailUrls={thumbnailUrls}
        activeUrlKey={activeUrlKey}
        isActive={isActive}
        onTapInactive={isActive ? undefined : handleTapInactive}
        onDoubleTap={handleDoubleTap}
      />

      <View className="flex-row items-center justify-end px-4 pt-3">
        <VideoToggle activeKey={activeUrlKey} onToggle={setActiveUrlKey} />
      </View>
    </View>
  );
};
