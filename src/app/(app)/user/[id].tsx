import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '~/components/ui/skeleton';
import { useUserProfile } from '~/hooks/use-user-profile';
import { cn } from '~/utils/cn';
import { getDisplayName } from '~/utils/profile';

const UserProfileScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: profile, isLoading, isError } = useUserProfile({ userId: id });

  const displayName = profile ? getDisplayName(profile) : '';
  const letter = (displayName[0] ?? '?').toUpperCase();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: profile ? `@${profile.username}` : '',
          headerStyle: { backgroundColor: 'hsl(150, 6%, 3%)' },
          contentStyle: { backgroundColor: 'hsl(150, 6%, 3%)' },
          headerTintColor: 'hsl(20, 10%, 98%)',
          headerBackTitle: 'Back',
        }}
      />

      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        {isLoading ? (
          <View className="items-center gap-4 pt-12">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </View>
        ) : isError || !profile ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">User not found</Text>
          </View>
        ) : (
          <View className="flex-1 items-center px-8 pt-12">
            <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary">
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: 96, height: 96 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <Text className="text-3xl font-bold text-primary-foreground">
                  {letter}
                </Text>
              )}
            </View>

            {(profile.first_name || profile.last_name) && (
              <Text className="mt-6 text-2xl font-bold text-foreground">
                {[profile.first_name, profile.last_name]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
            )}

            <Text
              className={cn(
                'font-medium text-muted-foreground',
                profile.first_name || profile.last_name
                  ? 'mt-1 text-base'
                  : 'mt-6 text-2xl font-bold text-foreground',
              )}
            >
              @{profile.username}
            </Text>

            <Text className="mt-2 text-xs text-muted-foreground">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default UserProfileScreen;
