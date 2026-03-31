import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '~/hooks/use-auth';
import { useLikedBy } from '~/hooks/use-likes';
import { useLikedBySheet } from '~/store/liked-by-sheet';
import { getDisplayName } from '~/utils/profile';

import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { Profile } from '~/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_CONTENT_HEIGHT = SCREEN_HEIGHT * 0.92;

type LikedBySheetProps = {
  videoId: string | null;
  onClose: () => void;
};

type LikedByUser = {
  user_id: string;
  profiles: Profile;
};

const LikedByItem = ({ item }: { item: LikedByUser }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { closeLikedBy } = useLikedBySheet();
  const profile = item.profiles;
  const name = getDisplayName(profile);
  const letter = (name[0] ?? '?').toUpperCase();

  const handleOpenProfile = () => {
    if (user?.id === item.user_id) return;
    closeLikedBy();
    router.push(`/(app)/user/${item.user_id}` as const);
  };

  return (
    <Pressable
      onPress={handleOpenProfile}
      className="flex-row items-center gap-3 py-3"
    >
      <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary">
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={{ width: 40, height: 40 }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <Text className="text-sm font-semibold text-primary-foreground">
            {letter}
          </Text>
        )}
      </View>
      <View>
        <Text className="text-sm font-semibold text-foreground">{name}</Text>
        <Text className="text-xs text-muted-foreground">
          @{profile.username}
        </Text>
      </View>
    </Pressable>
  );
};

export const LikedBySheet = ({ videoId, onClose }: LikedBySheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const {
    data: likedBy,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLikedBy({
    videoId: videoId ?? '',
  });

  useEffect(() => {
    if (videoId) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [videoId]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing
      maxDynamicContentSize={MAX_CONTENT_HEIGHT}
      enablePanDownToClose
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: 'hsl(150, 6%, 10%)' }}
      handleIndicatorStyle={{ backgroundColor: 'hsl(20, 10%, 55%)' }}
    >
      <Text className="px-4 pb-3 text-lg font-semibold text-foreground">
        Likes
      </Text>

      {isLoading ? (
        <BottomSheetView>
          <View className="items-center py-6">
            <Text className="text-muted-foreground">Loading...</Text>
          </View>
        </BottomSheetView>
      ) : (
        <BottomSheetFlatList
          data={likedBy ?? []}
          keyExtractor={(item: LikedByUser) => item.user_id}
          renderItem={({ item }: { item: LikedByUser }) => (
            <LikedByItem item={item} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom + 16, 32),
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View className="items-center py-6">
              <Text className="text-muted-foreground">No likes yet</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator color="#7A9E91" size="small" />
              </View>
            ) : null
          }
        />
      )}
    </BottomSheet>
  );
};
