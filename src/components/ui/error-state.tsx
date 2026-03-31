import { Text, View } from 'react-native';

import { Button } from './button';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) => {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-8">
      <Text className="text-4xl">⚠️</Text>
      <Text className="text-center text-lg text-foreground">{message}</Text>
      {onRetry && (
        <Button title="Try Again" onPress={onRetry} variant="secondary" />
      )}
    </View>
  );
};
