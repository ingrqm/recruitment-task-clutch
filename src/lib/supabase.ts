import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_KEY: z.string().min(1),
});

const envResult = envSchema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
});

export const isSupabaseConfigured = envResult.success;

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseClient: SupabaseClient | null = envResult.success
  ? createClient(
      envResult.data.EXPO_PUBLIC_SUPABASE_URL,
      envResult.data.EXPO_PUBLIC_SUPABASE_KEY,
      {
        auth: {
          storage: secureStoreAdapter,
          storageKey: 'clutch-challenge-auth',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    )
  : null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env.local',
    );
  }

  return supabaseClient;
};
