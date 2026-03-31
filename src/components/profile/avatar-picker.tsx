import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { AVATARS_BUCKET } from '~/constants';
import { useAuth } from '~/hooks/use-auth';
import { getSupabase } from '~/lib/supabase';

type AvatarPickerProps = {
  avatarUrl: string | null;
  onUploadComplete: (url: string) => void;
};

export const AvatarPicker = ({
  avatarUrl,
  onUploadComplete,
}: AvatarPickerProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isPickerOpening, setIsPickerOpening] = useState(false);

  const handlePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library to change your avatar.',
      );
      return;
    }

    setIsPickerOpening(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    setIsPickerOpening(false);

    if (result.canceled || !result.assets[0]) return;
    if (!user) return;

    setIsUploading(true);

    try {
      const supabase = getSupabase();
      const asset = result.assets[0];
      const filePath = `${user.id}/avatar.jpg`;

      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: 'base64',
      });

      const { error: uploadError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBust })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onUploadComplete(urlWithCacheBust);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      Alert.alert('Error', message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Pressable onPress={handlePick} disabled={isUploading || isPickerOpening}>
      <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-card-elevated">
        {isUploading || isPickerOpening ? (
          <ActivityIndicator color="#7A9E91" />
        ) : avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 96, height: 96 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Text className="text-3xl text-muted-foreground">📷</Text>
        )}
      </View>
      <Text className="mt-2 text-center text-xs text-accent">
        {isUploading
          ? 'Uploading...'
          : isPickerOpening
            ? 'Opening...'
            : 'Change Photo'}
      </Text>
    </Pressable>
  );
};
