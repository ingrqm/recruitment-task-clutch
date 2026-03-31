import { Text, TextInput, View } from 'react-native';

import { cn } from '~/utils/cn';

import type { TextInputProps } from 'react-native';

type InputProps = {
  label: string;
  error?: string;
} & TextInputProps;

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
      <TextInput
        className={cn(
          'rounded-lg border bg-input px-4 text-base text-foreground',
          error ? 'border-destructive' : 'border-border',
        )}
        placeholderTextColor="hsl(20 10% 55%)"
        autoCapitalize="none"
        style={{ height: 48 }}
        {...props}
      />
      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
};
