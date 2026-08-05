<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Wallet2 } from '@lucide/vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiEnvelope, User } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const router = useRouter();
const authStore = useAuthStore();
const error = ref(false);

onMounted(() => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');

  if (!accessToken || !refreshToken) {
    error.value = true;
    return;
  }

  axios
    .get<ApiEnvelope<User>>(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => {
      authStore.setAuth({ accessToken, refreshToken, user: response.data.data });
      router.replace('/dashboard');
    })
    .catch(() => {
      error.value = true;
    });
});
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
    <div class="flex items-center gap-2 font-semibold">
      <Wallet2 class="h-6 w-6 text-primary" />
      <span>Together Account</span>
    </div>
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>{{ error ? 'Não foi possível entrar' : 'Entrando com Google...' }}</CardTitle>
        <CardDescription>
          <template v-if="error">
            O login com Google falhou ou foi cancelado.
            <a href="/login" class="font-medium text-primary hover:underline">Volte e tente novamente</a>.
          </template>
          <template v-else> Só um instante enquanto confirmamos sua conta. </template>
        </CardDescription>
      </CardHeader>
      <CardContent v-if="!error">
        <div class="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div class="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
