import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

const TabsLayout = () => {
  return (
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
};

export default TabsLayout;
