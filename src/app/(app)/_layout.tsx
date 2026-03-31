import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { CommentSheet } from '~/components/comments/sheet';
import { LikedBySheet } from '~/components/feed/liked-by-sheet';
import { useAuth } from '~/hooks/use-auth';
import { useCommentSheet } from '~/store/comment-sheet';
import { useLikedBySheet } from '~/store/liked-by-sheet';

const AppContent = () => {
  const { videoId: commentVideoId, closeComments } = useCommentSheet();
  const { videoId: likedByVideoId, closeLikedBy } = useLikedBySheet();

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'hsl(150, 6%, 3%)' },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <CommentSheet videoId={commentVideoId} onClose={closeComments} />
      <LikedBySheet videoId={likedByVideoId} onClose={closeLikedBy} />
    </View>
  );
};

const AppLayout = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7A9E91" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <AppContent />;
};

export default AppLayout;
