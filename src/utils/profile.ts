import type { Profile } from '~/types';

export const getDisplayName = (
  profile: Pick<Profile, 'first_name' | 'last_name' | 'username'>,
) => {
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ');
  return fullName || profile.username;
};
