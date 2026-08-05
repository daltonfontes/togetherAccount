<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Wallet2 } from '@lucide/vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api/client';
import { useVerifyMagicLink } from '@/composables/useAuth';

const verifyMagicLink = useVerifyMagicLink();
const error = ref<string | null>(null);

onMounted(() => {
  const token = new URLSearchParams(window.location.search).get('token');
  if (!token) {
    error.value = 'Link de acesso inválido.';
    return;
  }

  verifyMagicLink.mutate(
    { token },
    { onError: (err) => (error.value = getApiErrorMessage(err)) },
  );
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
        <CardTitle>{{ error ? 'Não foi possível entrar' : 'Confirmando seu link...' }}</CardTitle>
        <CardDescription>
          <template v-if="error">
            {{ error }}
            <a href="/magic-link" class="font-medium text-primary hover:underline">Peça um novo link</a>.
          </template>
          <template v-else> Só um instante enquanto validamos o seu acesso. </template>
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
