import { Text, View } from 'react-native';

const IndexScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Text className="text-2xl font-bold text-white">C</Text>
      </View>
      <Text className="text-xl font-bold text-foreground">
        Clutch Challenge
      </Text>
    </View>
  );
};

export default IndexScreen;
