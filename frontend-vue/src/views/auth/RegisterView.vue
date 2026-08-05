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
import { useRegister } from '@/composables/useAuth';
import { registerSchema } from '@/lib/validations/auth';

const register = useRegister();
const { defineField, errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: { fullName: '', email: '', password: '', confirmPassword: '' },
});

const [fullName, fullNameAttrs] = defineField('fullName');
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const onSubmit = handleSubmit((values) => {
  register.mutate(
    { fullName: values.fullName, email: values.email, password: values.password },
    { onError: (error) => toast.error(getApiErrorMessage(error)) },
  );
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-2xl">Criar conta</CardTitle>
      <CardDescription>Comece a organizar as finanças da sua casa em minutos</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="fullName">Nome completo</Label>
          <Input id="fullName" v-model="fullName" v-bind="fullNameAttrs" placeholder="Seu nome" autocomplete="name" />
          <FormMessage :message="errors.fullName" />
        </FormItem>
        <FormItem>
          <Label for="email">E-mail</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="voce@email.com" autocomplete="email" />
          <FormMessage :message="errors.email" />
        </FormItem>
        <FormItem>
          <Label for="password">Senha</Label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="new-password" />
          <FormMessage :message="errors.password" />
        </FormItem>
        <FormItem>
          <Label for="confirmPassword">Confirmar senha</Label>
          <Input id="confirmPassword" v-model="confirmPassword" v-bind="confirmPasswordAttrs" type="password" autocomplete="new-password" />
          <FormMessage :message="errors.confirmPassword" />
        </FormItem>
        <Button type="submit" class="w-full" :disabled="register.isPending.value">
          {{ register.isPending.value ? 'Criando conta...' : 'Criar conta' }}
        </Button>
      </form>
      <div class="mt-4">
        <GoogleAuthButton />
      </div>
      <p class="mt-4 text-center text-sm text-muted-foreground">
        Já tem uma conta?
        <RouterLink to="/login" class="font-medium text-primary hover:underline">
          Entrar
        </RouterLink>
      </p>
    </CardContent>
  </Card>
</template>
