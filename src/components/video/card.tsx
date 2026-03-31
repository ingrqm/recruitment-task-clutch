import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { CommentButton } from '~/components/feed/comment-button';
import { LikeButton } from '~/components/feed/like-button';
import { DEFAULT_VIDEO_URL_KEY } from '~/constants';
import { useIsLiked, useToggleLike } from '~/hooks/use-likes';

import { VideoPlayer } from './player';
import { VideoToggle } from './toggle';

import type { LayoutChangeEvent } from 'react-native';
import type { Video, VideoUrlKey } from '~/types';

type VideoCardProps = {
  video: Video;
  index: number;
  isActive: boolean;
  onOpenComments: (videoId: string) => void;
  onShowLikedBy: (videoId: string) => void;
  onScrollToVideo: (index: number) => void;
  onLayout: (height: number) => void;
};

export const VideoCard = ({
  video,
  index,
  isActive,
  onOpenComments,
  onShowLikedBy,
  onScrollToVideo,
  onLayout,
}: VideoCardProps) => {
  const [activeUrlKey, setActiveUrlKey] = useState<VideoUrlKey>(
    DEFAULT_VIDEO_URL_KEY,
  );

  const videoUrls = video.highlight_urls.highlight_video_urls;
  const thumbnailUrls = video.highlight_urls.highlight_thumbnail_urls;
  const videoId = String(video.id);

  const handleOpenComments = useCallback(() => {
    onOpenComments(videoId);
  }, [onOpenComments, videoId]);

  const { data: isLiked } = useIsLiked({ videoId });
  const toggleLike = useToggleLike({ videoId });

  const handleTapInactive = useCallback(() => {
    onScrollToVideo(index);
  }, [index, onScrollToVideo]);

  const handleDoubleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isLiked) {
      toggleLike.mutate({ isCurrentlyLiked: false });
    }
  }, [isLiked, toggleLike]);

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

      <View className="flex-row items-center justify-between px-4 pt-3">
        <View className="flex-row items-center gap-4">
          <LikeButton videoId={videoId} onShowLikedBy={onShowLikedBy} />
          <CommentButton videoId={videoId} onPress={handleOpenComments} />
        </View>
        <VideoToggle activeKey={activeUrlKey} onToggle={setActiveUrlKey} />
      </View>
    </View>
  );
};
