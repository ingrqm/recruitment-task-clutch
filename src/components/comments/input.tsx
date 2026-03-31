import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddComment } from '~/hooks/use-comments';
import { cn } from '~/utils/cn';
import { getDisplayName } from '~/utils/profile';

import { MentionSuggestions } from './mention-suggestions';

import type { Profile } from '~/types';

type MentionType = 'u' | 'n';

type TrackedMention = {
  userId: string;
  displayName: string;
  mentionType: MentionType;
};

type ReplyTo = {
  id: string;
  userId: string;
  displayName: string;
};

type CommentInputProps = {
  videoId: string;
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onSubmit: () => void;
};

const extractMentionQuery = (text: string): string | null => {
  const match = text.match(/@([\w\s]*)$/);
  return match ? match[1].trim() : null;
};

const buildStorageContent = (
  text: string,
  mentions: TrackedMention[],
): string => {
  const sorted = [...mentions].sort(
    (a, b) => b.displayName.length - a.displayName.length,
  );

  return sorted.reduce(
    (content, mention) =>
      content.replaceAll(
        `@${mention.displayName}`,
        `@[${mention.userId}:${mention.mentionType}]`,
      ),
    text,
  );
};

export const CommentInput = ({
  videoId,
  replyTo,
  onCancelReply,
  onSubmit,
}: CommentInputProps) => {
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState<TrackedMention[]>([]);
  const inputRef = useRef<{ focus: () => void }>(null);
  const insets = useSafeAreaInsets();
  const addComment = useAddComment({ videoId });

  useEffect(() => {
    if (replyTo) {
      const mention: TrackedMention = {
        userId: replyTo.userId,
        displayName: replyTo.displayName,
        mentionType: 'n',
      };
      setText(`@${replyTo.displayName} `);
      setMentions([mention]);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setText('');
      setMentions([]);
    }
  }, [replyTo]);

  const mentionQuery = extractMentionQuery(text);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const storageContent = buildStorageContent(trimmed, mentions);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addComment.mutate(
      { content: storageContent, parentId: replyTo?.id },
      {
        onError: (error) => {
          Alert.alert('Comment failed', error.message);
        },
      },
    );
    setText('');
    setMentions([]);
    onCancelReply();
    onSubmit();
  };

  const handleMentionSelect = useCallback(
    (profile: Profile) => {
      const query = extractMentionQuery(text);
      const isUsernameMatch =
        query && profile.username.toLowerCase().startsWith(query.toLowerCase());
      const insertText = isUsernameMatch
        ? profile.username
        : getDisplayName(profile);
      const mentionType: MentionType = isUsernameMatch ? 'u' : 'n';

      setText((prev) => prev.replace(/@[\w\s]*$/, `@${insertText} `));
      setMentions((prev) => [
        ...prev,
        { userId: profile.id, displayName: insertText, mentionType },
      ]);
      inputRef.current?.focus();
    },
    [text],
  );

  return (
    <View>
      {mentionQuery !== null && mentionQuery.length > 0 && (
        <MentionSuggestions
          query={mentionQuery}
          onSelect={handleMentionSelect}
        />
      )}

      {replyTo && (
        <View className="flex-row items-center justify-between border-t border-border px-4 py-2">
          <Text className="text-xs text-muted-foreground">
            Replying to{' '}
            <Text className="font-semibold text-accent">
              {replyTo.displayName}
            </Text>
          </Text>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <Text className="text-xs font-semibold text-muted-foreground">
              ✕
            </Text>
          </Pressable>
        </View>
      )}

      <View
        className={cn(
          'flex-row items-center gap-2 px-4 pt-3',
          !replyTo && 'border-t border-border',
        )}
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <BottomSheetTextInput
          ref={inputRef as React.RefObject<never>}
          value={text}
          onChangeText={setText}
          placeholder={
            replyTo ? `Reply to ${replyTo.displayName}...` : 'Add a comment...'
          }
          placeholderTextColor="hsl(20 10% 55%)"
          style={{
            flex: 1,
            borderRadius: 9999,
            backgroundColor: 'hsl(150, 6%, 14%)',
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 14,
            color: 'hsl(20, 10%, 98%)',
          }}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!text.trim() || addComment.isPending}
          className={cn(
            'rounded-full bg-primary px-4 py-2.5',
            !text.trim() && 'opacity-50',
          )}
        >
          <Text className="text-sm font-semibold text-primary-foreground">
            Post
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
