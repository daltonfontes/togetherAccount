<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import Button from '@/components/ui/Button.vue';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormItem from '@/components/ui/FormItem.vue';
import FormMessage from '@/components/ui/FormMessage.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api/client';
import { useCreateInvite } from '@/composables/useInvites';
import { HouseholdRole } from '@/lib/types';
import { inviteSchema } from '@/lib/validations/household';

const props = defineProps<{ householdId: string }>();
const open = defineModel<boolean>('open', { required: true });

const createInvite = useCreateInvite(props.householdId);
const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(inviteSchema),
  initialValues: { email: '', role: HouseholdRole.MEMBER },
});

const [email, emailAttrs] = defineField('email');
const [role, roleAttrs] = defineField('role');

const onSubmit = handleSubmit((values) => {
  createInvite.mutate(values, {
    onSuccess: () => {
      toast.success('Convite enviado');
      resetForm();
      open.value = false;
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Convidar morador(a)</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="email">E-mail</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="pessoa@email.com" />
          <FormMessage :message="errors.email" />
        </FormItem>
        <FormItem>
          <Label>Papel</Label>
          <Select v-model="role" v-bind="roleAttrs">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="HouseholdRole.MEMBER">Membro</SelectItem>
              <SelectItem :value="HouseholdRole.ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
        <DialogFooter>
          <Button type="submit" :disabled="createInvite.isPending.value">
            {{ createInvite.isPending.value ? 'Enviando...' : 'Enviar convite' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
