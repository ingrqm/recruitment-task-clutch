import { ActivityIndicator, Pressable, Text } from 'react-native';

import { cn } from '~/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-dark',
  secondary: 'bg-card-elevated active:bg-muted',
  ghost: 'bg-transparent active:bg-card-elevated',
  destructive: 'bg-destructive active:bg-destructive/80',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive-foreground',
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'items-center justify-center rounded-lg px-6 py-3.5',
        variantStyles[variant],
        isDisabled && 'opacity-50',
      )}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#DFD5C8' : '#7A9E91'}
        />
      ) : (
        <Text
          className={cn(
            'text-center text-base font-semibold',
            variantTextStyles[variant],
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};
