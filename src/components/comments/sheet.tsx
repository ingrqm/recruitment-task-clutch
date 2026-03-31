import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useComments } from '~/hooks/use-comments';
import { useProfile } from '~/hooks/use-profile';
import { getDisplayName } from '~/utils/profile';

import { CommentInput } from './input';
import { CommentItem } from './item';
import { CommentSkeletonList } from './skeleton';

import type {
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import type { Comment, Profile } from '~/types';

const SNAP_POINTS = ['50%', '80%'];

type ReplyTo = {
  id: string;
  userId: string;
  displayName: string;
};

type CommentSheetProps = {
  videoId: string | null;
  onClose: () => void;
};

const buildProfileMap = (comments: Comment[]): Map<string, Profile> => {
  const map = new Map<string, Profile>();

  const collect = (list: Comment[]) => {
    for (const comment of list) {
      if (comment.profiles) {
        map.set(comment.user_id, comment.profiles);
      }
      if (comment.replies?.length) {
        collect(comment.replies);
      }
    }
  };

  collect(comments);
  return map;
};

export const CommentSheet = ({ videoId, onClose }: CommentSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const {
    data: comments,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useComments({
    videoId: videoId ?? '',
  });
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [footerHeight, setFooterHeight] = useState(100);

  useProfile();

  const profileMap = useMemo(() => buildProfileMap(comments ?? []), [comments]);

  useEffect(() => {
    if (videoId) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
      setReplyTo(null);
    }
  }, [videoId]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setReplyTo(null);
        onClose();
      }
    },
    [onClose],
  );

  const handleReply = useCallback((comment: Comment) => {
    const displayName = comment.profiles
      ? getDisplayName(comment.profiles)
      : 'Unknown';

    setReplyTo({
      id: comment.parent_id ?? comment.id,
      userId: comment.user_id,
      displayName,
    });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

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

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        {videoId && (
          <View
            onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
            style={{ backgroundColor: 'hsl(150, 6%, 10%)' }}
          >
            <CommentInput
              videoId={videoId}
              replyTo={replyTo}
              onCancelReply={handleCancelReply}
            />
          </View>
        )}
      </BottomSheetFooter>
    ),
    [videoId, replyTo, handleCancelReply],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose
      topInset={insets.top}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: 'hsl(150, 6%, 10%)' }}
      handleIndicatorStyle={{ backgroundColor: 'hsl(20, 10%, 55%)' }}
    >
      {isLoading ? (
        <>
          <Text className="px-4 pb-3 text-lg font-semibold text-foreground">
            Comments
          </Text>
          <CommentSkeletonList />
        </>
      ) : (
        <BottomSheetFlatList
          data={comments ?? []}
          keyExtractor={(item: Comment) => item.id}
          renderItem={({ item }: { item: Comment }) => (
            <CommentItem
              comment={item}
              onReply={handleReply}
              profileMap={profileMap}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: footerHeight,
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <Text className="pb-3 text-lg font-semibold text-foreground">
              Comments
            </Text>
          }
          ListEmptyComponent={
            <View className="items-center py-12" style={{ minHeight: 120 }}>
              <Text className="text-muted-foreground">
                No comments yet. Be the first!
              </Text>
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
