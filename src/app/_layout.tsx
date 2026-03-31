import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ErrorBoundary } from '~/components/ui/error-boundary';
import { useAuth } from '~/hooks/use-auth';
import { queryClient } from '~/lib/query-client';
import { isSupabaseConfigured } from '~/lib/supabase';
import '~/global.css';

SplashScreen.preventAutoHideAsync();

const MissingConfigScreen = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>C</Text>
      </View>
      <Text style={styles.title}>Supabase Not Configured</Text>
      <Text style={styles.subtitle}>
        Copy .env.example to .env.local and fill in your Supabase project URL
        and anon key, then restart the app.
      </Text>
      <View style={styles.codeBlock}>
        <Text style={styles.code}>cp .env.example .env.local</Text>
      </View>
    </View>
  );
};

const RootLayoutInner = () => {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
};

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {isSupabaseConfigured ? <RootLayoutInner /> : <MissingConfigScreen />}
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090A09',
    paddingHorizontal: 32,
  },
  icon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#2C5945',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D9C8B4',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A7A6B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  codeBlock: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#161916',
    padding: 16,
  },
  code: {
    fontSize: 12,
    color: '#7A9E8E',
    fontFamily: 'monospace',
  },
});
