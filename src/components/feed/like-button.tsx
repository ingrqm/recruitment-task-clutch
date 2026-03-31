import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';

import { useIsLiked, useToggleLike, useVideoStats } from '~/hooks/use-likes';

type LikeButtonProps = {
  videoId: string;
  onShowLikedBy: (videoId: string) => void;
};

export const LikeButton = ({ videoId, onShowLikedBy }: LikeButtonProps) => {
  const { data: stats } = useVideoStats({ videoId });
  const { data: isLiked } = useIsLiked({ videoId });
  const toggleLike = useToggleLike({ videoId });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike.mutate({ isCurrentlyLiked: !!isLiked });
  };

  return (
    <Pressable onPress={handlePress} className="flex-row items-center gap-1.5">
      <View className="h-8 w-8 items-center justify-center">
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={22}
          color={isLiked ? '#ef4444' : 'hsl(20, 10%, 55%)'}
        />
      </View>
      <Pressable onPress={() => onShowLikedBy(videoId)} hitSlop={4}>
        <Text className="text-sm font-medium text-muted-foreground">
          {stats?.like_count ?? 0}
        </Text>
      </Pressable>
    </Pressable>
  );
};
