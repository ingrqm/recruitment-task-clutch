import { useForm } from '@tanstack/react-form';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useAuth } from '~/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginScreen = () => {
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      const parsed = loginSchema.safeParse(value);
      if (!parsed.success) {
        Alert.alert('Validation Error', parsed.error.issues[0]?.message);
        return;
      }

      setIsSubmitting(true);
      const { error } = await signIn({
        email: value.email,
        password: value.password,
      });
      setIsSubmitting(false);

      if (error) {
        Alert.alert('Login Failed', error.message);
      }
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-16">
          <View className="mb-12 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Text
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'System' }}
              >
                C
              </Text>
            </View>
            <Text className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </Text>
            <Text className="mt-2 text-muted-foreground">
              Sign in to your account
            </Text>
          </View>

          <View className="gap-4">
            <form.Field name="email">
              {(field) => (
                <Input
                  label="Email"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  keyboardType="email-address"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Input
                  label="Password"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  secureTextEntry
                  autoComplete="password"
                  placeholder="••••••••"
                />
              )}
            </form.Field>

            <View className="mt-2">
              <Button
                title="Sign In"
                onPress={form.handleSubmit}
                isLoading={isSubmitting}
              />
            </View>
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-muted-foreground">
              Don&apos;t have an account?
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="font-semibold text-accent">Sign Up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
