import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { useMentionSearch } from '~/hooks/use-mention-search';
import { getDisplayName } from '~/utils/profile';

import type { Profile } from '~/types';

type MentionSuggestionsProps = {
  query: string;
  onSelect: (profile: Profile) => void;
};

export const MentionSuggestions = ({
  query,
  onSelect,
}: MentionSuggestionsProps) => {
  const { data: profiles } = useMentionSearch({ query });

  if (!profiles?.length) return null;

  return (
    <View className="border-b border-border bg-card-elevated px-2 py-1">
      {profiles.map((profile) => {
        const name = getDisplayName(profile);
        const letter = (name[0] ?? '?').toUpperCase();

        return (
          <Pressable
            key={profile.id}
            onPress={() => onSelect(profile)}
            className="flex-row items-center gap-3 rounded-lg px-3 py-2 active:bg-border"
          >
            <View className="h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary">
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: 28, height: 28 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <Text className="text-xs font-semibold text-primary-foreground">
                  {letter}
                </Text>
              )}
            </View>
            <View>
              <Text className="text-sm font-medium text-foreground">
                {name}
              </Text>
              <Text className="text-xs text-muted-foreground">
                @{profile.username}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
