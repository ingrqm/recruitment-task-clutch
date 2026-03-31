import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '~/hooks/use-auth';
import { useCommentSheet } from '~/store/comment-sheet';
import { cn } from '~/utils/cn';
import { getDisplayName } from '~/utils/profile';

import { getTimeAgo, MentionContent } from './utils';

import type { ProfileMap } from './utils';
import type { Comment } from '~/types';

type CommentItemProps = {
  comment: Comment;
  onReply: (comment: Comment) => void;
  profileMap: ProfileMap;
  isReply?: boolean;
};

export const CommentItem = ({
  comment,
  onReply,
  profileMap,
  isReply = false,
}: CommentItemProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { closeComments } = useCommentSheet();
  const fullName = comment.profiles
    ? getDisplayName(comment.profiles)
    : 'Unknown';
  const avatarUrl = comment.profiles?.avatar_url ?? null;
  const avatarLetter = (fullName[0] ?? '?').toUpperCase();
  const timeAgo = getTimeAgo(comment.created_at);

  const handleOpenProfile = () => {
    if (user?.id === comment.user_id) return;
    closeComments();
    router.push(`/(app)/user/${comment.user_id}` as const);
  };

  return (
    <View>
      <View className={cn('flex-row gap-3 py-3', isReply && 'pl-10')}>
        <Pressable
          onPress={handleOpenProfile}
          className="h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 32, height: 32 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={avatarUrl}
            />
          ) : (
            <Text className="text-sm font-semibold text-primary-foreground">
              {avatarLetter}
            </Text>
          )}
        </Pressable>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Pressable onPress={handleOpenProfile} hitSlop={4}>
              <Text className="text-sm font-semibold text-foreground">
                {fullName}
              </Text>
            </Pressable>
            <Text className="text-xs text-muted-foreground">{timeAgo}</Text>
          </View>

          <MentionContent content={comment.content} profileMap={profileMap} />

          <Pressable onPress={() => onReply(comment)} hitSlop={8}>
            <Text className="text-xs font-medium text-muted-foreground">
              Reply
            </Text>
          </Pressable>
        </View>
      </View>

      {!isReply &&
        comment.replies?.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            onReply={onReply}
            profileMap={profileMap}
            isReply
          />
        ))}
    </View>
  );
};
