import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@/lib/types';

export const useAuthStore = defineStore(
  'together-account-auth',
  () => {
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const user = ref<User | null>(null);

    function setAuth(payload: { accessToken: string; refreshToken: string; user: User }) {
      accessToken.value = payload.accessToken;
      refreshToken.value = payload.refreshToken;
      user.value = payload.user;
    }

    function setUser(nextUser: User) {
      user.value = nextUser;
    }

    function setAccessToken(nextAccessToken: string) {
      accessToken.value = nextAccessToken;
    }

    function clear() {
      accessToken.value = null;
      refreshToken.value = null;
      user.value = null;
    }

    return { accessToken, refreshToken, user, setAuth, setUser, setAccessToken, clear };
  },
  {
    persist: {
      pick: ['accessToken', 'refreshToken', 'user'],
    },
  },
);
