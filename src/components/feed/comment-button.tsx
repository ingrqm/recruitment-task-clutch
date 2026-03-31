import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { useVideoStats } from '~/hooks/use-likes';

type CommentButtonProps = {
  videoId: string;
  onPress: () => void;
};

export const CommentButton = ({ videoId, onPress }: CommentButtonProps) => {
  const { data: stats } = useVideoStats({ videoId });

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-1.5">
      <View className="h-8 w-8 items-center justify-center">
        <Ionicons
          name="chatbubble-outline"
          size={20}
          color="hsl(20, 10%, 55%)"
        />
      </View>
      <Text className="text-sm font-medium text-muted-foreground">
        {stats?.comment_count ?? 0}
      </Text>
    </Pressable>
  );
};
