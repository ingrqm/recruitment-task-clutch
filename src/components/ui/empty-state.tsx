import { Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <View className="flex-1 items-center justify-center gap-2 p-8">
      <Text className="text-center text-lg font-semibold text-foreground">
        {title}
      </Text>
      {description && (
        <Text className="text-center text-muted-foreground">{description}</Text>
      )}
    </View>
  );
};
