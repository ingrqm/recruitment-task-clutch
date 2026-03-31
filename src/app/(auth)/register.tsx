import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from 'expo-router';
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

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be at most 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be at most 50 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const RegisterScreen = () => {
  const { signUp } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = registerSchema.safeParse(value);
      if (!parsed.success) {
        Alert.alert('Validation Error', parsed.error.issues[0]?.message);
        return;
      }

      setIsSubmitting(true);
      const { error } = await signUp({
        email: value.email,
        password: value.password,
        username: value.username,
        firstName: value.firstName,
        lastName: value.lastName,
      });
      setIsSubmitting(false);

      if (error) {
        Alert.alert('Registration Failed', error.message);
        return;
      }

      Alert.alert(
        'Account Created',
        'Check your email to confirm your account, then sign in.',
        [
          {
            text: 'Go to Sign In',
            onPress: () => router.replace('/(auth)/login'),
          },
        ],
      );
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
              Create account
            </Text>
            <Text className="mt-2 text-muted-foreground">
              Join the Clutch community
            </Text>
          </View>

          <View className="gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <form.Field name="firstName">
                  {(field) => (
                    <Input
                      label="First Name"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      autoComplete="given-name"
                      placeholder="John"
                    />
                  )}
                </form.Field>
              </View>
              <View className="flex-1">
                <form.Field name="lastName">
                  {(field) => (
                    <Input
                      label="Last Name"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      autoComplete="family-name"
                      placeholder="Doe"
                    />
                  )}
                </form.Field>
              </View>
            </View>

            <form.Field name="username">
              {(field) => (
                <Input
                  label="Username"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  autoComplete="username"
                  placeholder="johndoe"
                />
              )}
            </form.Field>

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
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              )}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => (
                <Input
                  label="Repeat Password"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  secureTextEntry
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              )}
            </form.Field>

            <View className="mt-2">
              <Button
                title="Create Account"
                onPress={form.handleSubmit}
                isLoading={isSubmitting}
              />
            </View>
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-muted-foreground">
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="font-semibold text-accent">Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
