import { useEffect, useState } from 'react';

import { getSupabase } from '~/lib/supabase';

import type { Session, User } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const ensureProfile = async (user: User) => {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!data) {
    const username =
      user.user_metadata?.username ?? `user_${user.id.slice(0, 8)}`;

    await supabase.from('profiles').upsert(
      {
        id: user.id,
        username,
        first_name: user.user_metadata?.first_name ?? null,
        last_name: user.user_metadata?.last_name ?? null,
      },
      { onConflict: 'id' },
    );
  }
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = getSupabase();

    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await ensureProfile(session.user);
      }

      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && _event === 'SIGNED_IN') {
        await ensureProfile(session.user);
      }

      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({
    email,
    password,
    username,
    firstName,
    lastName,
  }: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => {
    const supabase = getSupabase();

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingProfile) {
      return { error: { message: 'This username is already taken' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, first_name: firstName, last_name: lastName },
      },
    });

    if (error) return { error };

    if (data.user?.identities?.length === 0) {
      return {
        error: { message: 'An account with this email already exists' },
      };
    }

    return { error: null };
  };

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!state.session,
  };
};
