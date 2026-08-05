<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { RouterLink } from 'vue-router';
import { toast } from 'vue-sonner';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton.vue';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormItem from '@/components/ui/FormItem.vue';
import FormMessage from '@/components/ui/FormMessage.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import { getApiErrorMessage } from '@/lib/api/client';
import { useLogin } from '@/composables/useAuth';
import { loginSchema } from '@/lib/validations/auth';

const login = useLogin();
const { defineField, errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: '', password: '' },
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit((values) => {
  login.mutate(values, {
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-2xl">Entrar</CardTitle>
      <CardDescription>Acesse sua conta para gerenciar as finanças da casa</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="email">E-mail</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="voce@email.com" autocomplete="email" />
          <FormMessage :message="errors.email" />
        </FormItem>
        <FormItem>
          <Label for="password">Senha</Label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="current-password" />
          <FormMessage :message="errors.password" />
        </FormItem>
        <Button type="submit" class="w-full" :disabled="login.isPending.value">
          {{ login.isPending.value ? 'Entrando...' : 'Entrar' }}
        </Button>
      </form>
      <p class="mt-3 text-center text-sm">
        <RouterLink to="/magic-link" class="font-medium text-primary hover:underline">
          Entrar sem senha
        </RouterLink>
      </p>
      <div class="mt-4">
        <GoogleAuthButton />
      </div>
      <p class="mt-4 text-center text-sm text-muted-foreground">
        Não tem uma conta?
        <RouterLink to="/register" class="font-medium text-primary hover:underline">
          Cadastre-se
        </RouterLink>
      </p>
    </CardContent>
  </Card>
</template>
