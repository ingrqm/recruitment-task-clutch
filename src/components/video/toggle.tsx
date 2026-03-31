import { Pressable, Text, View } from 'react-native';

import { VIDEO_URL_LABELS } from '~/constants';
import { cn } from '~/utils/cn';

import type { VideoUrlKey } from '~/types';

type VideoToggleProps = {
  activeKey: VideoUrlKey;
  onToggle: (key: VideoUrlKey) => void;
};

const keys: VideoUrlKey[] = [
  'clutch_autopan',
  'match_wo_breaks',
  'clutch_landscape',
];

export const VideoToggle = ({ activeKey, onToggle }: VideoToggleProps) => {
  return (
    <View className="flex-row gap-2">
      {keys.map((key) => {
        const isActive = key === activeKey;
        return (
          <Pressable
            key={key}
            onPress={() => onToggle(key)}
            className={cn(
              'rounded-full px-3 py-1.5',
              isActive ? 'bg-primary' : 'bg-card-elevated',
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {VIDEO_URL_LABELS[key]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
