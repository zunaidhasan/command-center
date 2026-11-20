import { create } from 'zustand';
import { UserProfile } from '@/types/profile';
import { INITIAL_PROFILE } from '@/services/initial-data';
import { StorageAdapter } from '@/services/storage';

interface ProfileState {
  profile: UserProfile;
  isLoading: boolean;

  initProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (avatarDataUrl: string) => Promise<void>;
  removeAvatar: () => Promise<void>;
  resetToDefault: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: INITIAL_PROFILE,
  isLoading: true,

  initProfile: async () => {
    try {
      const saved = await StorageAdapter.get<UserProfile>('user_profile', INITIAL_PROFILE);
      set({ profile: saved, isLoading: false });
    } catch (err) {
      console.error('[ProfileStore] Failed to load profile:', err);
      set({ profile: INITIAL_PROFILE, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    const updated: UserProfile = {
      ...current,
      ...updates,
      socialLinks: {
        ...current.socialLinks,
        ...(updates.socialLinks || {}),
      },
      updatedAt: Date.now(),
    };

    set({ profile: updated });
    await StorageAdapter.set('user_profile', updated);
  },

  updateAvatar: async (avatarDataUrl) => {
    await get().updateProfile({ avatarUrl: avatarDataUrl });
  },

  removeAvatar: async () => {
    await get().updateProfile({ avatarUrl: undefined });
  },

  resetToDefault: async () => {
    set({ profile: INITIAL_PROFILE });
    await StorageAdapter.set('user_profile', INITIAL_PROFILE);
  },
}));
