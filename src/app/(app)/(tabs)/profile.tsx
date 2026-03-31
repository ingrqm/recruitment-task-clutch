import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarPicker } from '~/components/profile/avatar-picker';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { useAuth } from '~/hooks/use-auth';
import { useProfile } from '~/hooks/use-profile';
import { cn } from '~/utils/cn';

import type { Profile } from '~/types';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    setIsSigningOut(false);

    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAvatarUpload = (url: string) => {
    queryClient.setQueryData<Profile>(['profile', user?.id], (prev) =>
      prev ? { ...prev, avatar_url: url } : prev,
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="items-center gap-4 pt-12">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center px-8 pt-12">
        <AvatarPicker
          avatarUrl={profile?.avatar_url ?? null}
          onUploadComplete={handleAvatarUpload}
        />

        {(profile?.first_name || profile?.last_name) && (
          <Text className="mt-6 text-2xl font-bold text-foreground">
            {[profile.first_name, profile.last_name].filter(Boolean).join(' ')}
          </Text>
        )}

        <Text
          className={cn(
            'font-medium text-muted-foreground',
            profile?.first_name || profile?.last_name
              ? 'mt-1 text-base'
              : 'mt-6 text-2xl font-bold text-foreground',
          )}
        >
          @{profile?.username ?? 'User'}
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {user?.email}
        </Text>

        <Text className="mt-2 text-xs text-muted-foreground">
          Joined{' '}
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString()
            : ''}
        </Text>

        <View className="mt-auto w-full pb-20">
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="destructive"
            isLoading={isSigningOut}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
