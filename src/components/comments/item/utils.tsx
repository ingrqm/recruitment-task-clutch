import { Text } from 'react-native';

import { getDisplayName } from '~/utils/profile';

import type { Profile } from '~/types';

export type ProfileMap = Map<string, Profile>;

const UUID_MENTION_REGEX = /@\[([a-f0-9-]+)(?::([un]))?\]/g;

export const getTimeAgo = (dateString: string): string => {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

type UuidMentionsProps = {
  content: string;
  profileMap: ProfileMap;
};

const UuidMentions = ({ content, profileMap }: UuidMentionsProps) => {
  const matches = [...content.matchAll(UUID_MENTION_REGEX)];

  const parts = matches.reduce<{
    segments: { text: string; isMention: boolean }[];
    offset: number;
  }>(
    (acc, match) => {
      const matchIndex = match.index ?? 0;
      const userId = match[1];
      const mentionType = match[2] as 'u' | 'n' | undefined;

      const segments = [...acc.segments];

      if (matchIndex > acc.offset) {
        segments.push({
          text: content.slice(acc.offset, matchIndex),
          isMention: false,
        });
      }

      const profile = profileMap.get(userId);
      const displayText = profile
        ? `@${mentionType === 'u' ? profile.username : getDisplayName(profile)}`
        : '@Unknown';
      segments.push({ text: displayText, isMention: true });

      return { segments, offset: matchIndex + match[0].length };
    },
    { segments: [], offset: 0 },
  );

  const finalSegments =
    parts.offset < content.length
      ? [
          ...parts.segments,
          { text: content.slice(parts.offset), isMention: false },
        ]
      : parts.segments;

  return (
    <Text className="text-sm text-card-foreground">
      {finalSegments.map((part, i) =>
        part.isMention ? (
          <Text key={i} className="font-semibold text-accent">
            {part.text}
          </Text>
        ) : (
          <Text key={i}>{part.text}</Text>
        ),
      )}
    </Text>
  );
};

type MentionContentProps = {
  content: string;
  profileMap: ProfileMap;
};

export const MentionContent = ({
  content,
  profileMap,
}: MentionContentProps) => {
  const hasUuidMentions = UUID_MENTION_REGEX.test(content);
  UUID_MENTION_REGEX.lastIndex = 0;

  if (hasUuidMentions) {
    return <UuidMentions content={content} profileMap={profileMap} />;
  }

  return <Text className="text-sm text-card-foreground">{content}</Text>;
};
