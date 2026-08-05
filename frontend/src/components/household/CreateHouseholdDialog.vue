<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import Button from '@/components/ui/Button.vue';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormItem from '@/components/ui/FormItem.vue';
import FormMessage from '@/components/ui/FormMessage.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import Textarea from '@/components/ui/Textarea.vue';
import { getApiErrorMessage } from '@/lib/api/client';
import { useCreateHousehold } from '@/composables/useHouseholds';
import { useHouseholdStore } from '@/stores/household.store';
import { householdSchema } from '@/lib/validations/household';

const open = defineModel<boolean>('open', { required: true });

const createHousehold = useCreateHousehold();
const householdStore = useHouseholdStore();

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(householdSchema),
  initialValues: { name: '', description: '', currency: 'BRL' },
});

const [name, nameAttrs] = defineField('name');
const [description, descriptionAttrs] = defineField('description');

const onSubmit = handleSubmit((values) => {
  createHousehold.mutate(values, {
    onSuccess: (household) => {
      householdStore.setCurrentHouseholdId(household.id);
      toast.success('Casa criada com sucesso');
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
        <DialogTitle>Criar nova casa</DialogTitle>
        <DialogDescription>
          Crie um espaço compartilhado para organizar as finanças com outras pessoas.
        </DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="name">Nome</Label>
          <Input id="name" v-model="name" v-bind="nameAttrs" placeholder="Ex: Apartamento 302" />
          <FormMessage :message="errors.name" />
        </FormItem>
        <FormItem>
          <Label for="description">Descrição (opcional)</Label>
          <Textarea id="description" v-model="description" v-bind="descriptionAttrs" placeholder="Sobre esta casa" />
          <FormMessage :message="errors.description" />
        </FormItem>
        <DialogFooter>
          <Button type="submit" :disabled="createHousehold.isPending.value">
            {{ createHousehold.isPending.value ? 'Criando...' : 'Criar casa' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
