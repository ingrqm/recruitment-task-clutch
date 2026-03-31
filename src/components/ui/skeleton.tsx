import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '~/utils/cn';

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View className={cn('overflow-hidden rounded-lg', className)}>
      <Animated.View
        style={{ opacity }}
        className="h-full w-full bg-card-elevated"
      />
    </View>
  );
};

export const FeedSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {Array.from({ length: 2 }).map((_, i) => (
        <View key={i} className="pb-4">
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <View className="flex-row gap-4 px-4 pt-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </View>
        </View>
      ))}
    </View>
  );
};
