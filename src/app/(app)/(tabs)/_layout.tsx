import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

const AndroidTabs = () => (
  <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: 'hsl(153, 34%, 26%)',
      tabBarInactiveTintColor: 'hsl(20, 10%, 55%)',
      tabBarStyle: {
        backgroundColor: 'hsl(150, 6%, 7%)',
        borderTopColor: 'hsl(150, 6%, 14%)',
      },
    }}
  >
    <Tabs.Screen
      name="feed"
      options={{
        title: 'Feed',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="play-circle" size={size} color={color} />
        ),
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    />
  </Tabs>
);

const IOSTabs = () => (
  <NativeTabs tintColor="hsl(153, 34%, 26%)" minimizeBehavior="onScrollDown">
    <NativeTabs.Trigger name="feed">
      <Icon sf={{ default: 'play.circle', selected: 'play.circle.fill' }} />
      <Label>Feed</Label>
    </NativeTabs.Trigger>
    <NativeTabs.Trigger name="profile">
      <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      <Label>Profile</Label>
    </NativeTabs.Trigger>
  </NativeTabs>
);

const TabsLayout = () =>
  Platform.OS === 'ios' ? <IOSTabs /> : <AndroidTabs />;

export default TabsLayout;
