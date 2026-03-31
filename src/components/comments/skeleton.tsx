import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const SKELETON_COUNT = 5;

const CommentSkeleton = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [opacity, delay]);

  return (
    <Animated.View style={{ opacity }} className="flex-row gap-3 py-3">
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: 'hsl(150, 6%, 16%)',
        }}
      />
      <View className="flex-1 gap-2">
        <View
          style={{
            width: 100,
            height: 12,
            borderRadius: 6,
            backgroundColor: 'hsl(150, 6%, 16%)',
          }}
        />
        <View
          style={{
            width: '80%',
            height: 12,
            borderRadius: 6,
            backgroundColor: 'hsl(150, 6%, 16%)',
          }}
        />
      </View>
    </Animated.View>
  );
};

export const CommentSkeletonList = () => {
  return (
    <View className="px-4">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <CommentSkeleton key={i} delay={i * 100} />
      ))}
    </View>
  );
};
