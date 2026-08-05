<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { RouterLink } from 'vue-router';
import { toast } from 'vue-sonner';
import { MailCheck } from '@lucide/vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormItem from '@/components/ui/FormItem.vue';
import FormMessage from '@/components/ui/FormMessage.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import { getApiErrorMessage } from '@/lib/api/client';
import { useRequestMagicLink } from '@/composables/useAuth';
import { magicLinkSchema } from '@/lib/validations/auth';

const sentTo = ref<string | null>(null);
const requestMagicLink = useRequestMagicLink();
const { defineField, errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(magicLinkSchema),
  initialValues: { email: '' },
});

const [email, emailAttrs] = defineField('email');

const onSubmit = handleSubmit((values) => {
  requestMagicLink.mutate(values, {
    onSuccess: () => {
      sentTo.value = values.email;
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
});
</script>

<template>
  <Card v-if="sentTo">
    <CardHeader>
      <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-primary">
        <MailCheck class="h-5 w-5 text-primary-foreground" />
      </div>
      <CardTitle class="text-2xl">Verifique seu e-mail</CardTitle>
      <CardDescription>
        Enviamos um link de acesso para <strong>{{ sentTo }}</strong>. Clique nele para entrar —
        ele expira em 15 minutos e só pode ser usado uma vez.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p class="text-center text-sm text-muted-foreground">
        Não recebeu?
        <button type="button" class="font-medium text-primary hover:underline" @click="sentTo = null">
          Tentar de novo
        </button>
      </p>
    </CardContent>
  </Card>
  <Card v-else>
    <CardHeader>
      <CardTitle class="text-2xl">Entrar sem senha</CardTitle>
      <CardDescription>
        Enviamos um link de acesso para o seu e-mail — sem senha, sem cadastro separado.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="email">E-mail</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="voce@email.com" autocomplete="email" />
          <FormMessage :message="errors.email" />
        </FormItem>
        <Button type="submit" class="w-full" :disabled="requestMagicLink.isPending.value">
          {{ requestMagicLink.isPending.value ? 'Enviando...' : 'Enviar link de acesso' }}
        </Button>
      </form>
      <p class="mt-4 text-center text-sm text-muted-foreground">
        Prefere usar senha?
        <RouterLink to="/login" class="font-medium text-primary hover:underline">
          Voltar para o login
        </RouterLink>
      </p>
    </CardContent>
  </Card>
</template>
