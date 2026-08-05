<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormItem from '@/components/ui/FormItem.vue';
import FormMessage from '@/components/ui/FormMessage.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api/client';
import { useCurrentUser } from '@/composables/useAuth';
import { useChangePassword, useUpdateProfile } from '@/composables/useSettings';
import { useTheme } from '@/composables/useTheme';
import { passwordSchema, profileSchema } from '@/lib/validations/settings';

const user = useCurrentUser();
const { theme, setTheme } = useTheme();
const updateProfile = useUpdateProfile();
const changePassword = useChangePassword();

const profileForm = useForm({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: { fullName: user.value?.fullName ?? '', phone: user.value?.phone ?? '' },
});
const [fullName, fullNameAttrs] = profileForm.defineField('fullName');
const [phone, phoneAttrs] = profileForm.defineField('phone');

const onProfileSubmit = profileForm.handleSubmit((values) => {
  updateProfile.mutate(values, {
    onSuccess: () => toast.success('Perfil atualizado'),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
});

const passwordForm = useForm({
  validationSchema: toTypedSchema(passwordSchema),
  initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
});
const [currentPassword, currentPasswordAttrs] = passwordForm.defineField('currentPassword');
const [newPassword, newPasswordAttrs] = passwordForm.defineField('newPassword');
const [confirmPassword, confirmPasswordAttrs] = passwordForm.defineField('confirmPassword');

const onPasswordSubmit = passwordForm.handleSubmit((values) => {
  changePassword.mutate(
    { currentPassword: values.currentPassword, newPassword: values.newPassword },
    {
      onSuccess: () => {
        toast.success('Senha alterada com sucesso');
        passwordForm.resetForm();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    },
  );
});
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <PageHeader title="Configurações" description="Gerencie seu perfil e preferências" />

    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onProfileSubmit">
          <FormItem>
            <Label for="fullName">Nome completo</Label>
            <Input id="fullName" v-model="fullName" v-bind="fullNameAttrs" />
            <FormMessage :message="profileForm.errors.value.fullName" />
          </FormItem>
          <FormItem>
            <Label for="phone">Telefone (opcional)</Label>
            <Input id="phone" v-model="phone" v-bind="phoneAttrs" />
          </FormItem>
          <Button type="submit" :disabled="updateProfile.isPending.value">
            {{ updateProfile.isPending.value ? 'Salvando...' : 'Salvar perfil' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>Escolha entre tema claro, escuro ou automático</CardDescription>
      </CardHeader>
      <CardContent>
        <Select :model-value="theme" @update:model-value="(value) => setTheme(value as typeof theme)">
          <SelectTrigger class="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Senha</CardTitle>
        <CardDescription>Altere sua senha de acesso</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onPasswordSubmit">
          <FormItem>
            <Label for="currentPassword">Senha atual</Label>
            <Input id="currentPassword" v-model="currentPassword" v-bind="currentPasswordAttrs" type="password" />
            <FormMessage :message="passwordForm.errors.value.currentPassword" />
          </FormItem>
          <FormItem>
            <Label for="newPassword">Nova senha</Label>
            <Input id="newPassword" v-model="newPassword" v-bind="newPasswordAttrs" type="password" />
            <FormMessage :message="passwordForm.errors.value.newPassword" />
          </FormItem>
          <FormItem>
            <Label for="confirmPassword">Confirmar nova senha</Label>
            <Input id="confirmPassword" v-model="confirmPassword" v-bind="confirmPasswordAttrs" type="password" />
            <FormMessage :message="passwordForm.errors.value.confirmPassword" />
          </FormItem>
          <Button type="submit" :disabled="changePassword.isPending.value">
            {{ changePassword.isPending.value ? 'Alterando...' : 'Alterar senha' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
