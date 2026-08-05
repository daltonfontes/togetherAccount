<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle2, Mail, XCircle } from '@lucide/vue';
import { toast } from 'vue-sonner';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAcceptInvite, useDeclineInvite } from '@/composables/useInvites';
import { useHouseholdStore } from '@/stores/household.store';

const route = useRoute();
const router = useRouter();
const token = route.params.token as string;

const acceptInvite = useAcceptInvite();
const declineInvite = useDeclineInvite();
const householdStore = useHouseholdStore();

function handleAccept() {
  acceptInvite.mutate(token, {
    onSuccess: (member) => {
      householdStore.setCurrentHouseholdId(member.householdId);
      toast.success('Convite aceito! Bem-vindo(a) à casa.');
      router.push('/dashboard');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

function handleDecline() {
  declineInvite.mutate(token, {
    onSuccess: () => {
      toast.info('Convite recusado');
      router.push('/dashboard');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center">
    <Card class="w-full max-w-md">
      <CardHeader class="items-center text-center">
        <Mail class="mb-2 h-10 w-10 text-primary" />
        <CardTitle>Convite para uma casa</CardTitle>
        <CardDescription>Você foi convidado(a) a participar de uma casa compartilhada.</CardDescription>
      </CardHeader>
      <CardContent class="flex justify-center gap-3">
        <Button variant="outline" :disabled="declineInvite.isPending.value" @click="handleDecline">
          <XCircle class="h-4 w-4" />
          Recusar
        </Button>
        <Button :disabled="acceptInvite.isPending.value" @click="handleAccept">
          <CheckCircle2 class="h-4 w-4" />
          Aceitar convite
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
