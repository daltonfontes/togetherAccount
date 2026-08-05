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
import Textarea from '@/components/ui/Textarea.vue';
import { getApiErrorMessage } from '@/lib/api/client';
import { useCreateGoal } from '@/composables/useGoals';
import { goalSchema } from '@/lib/validations/goal';

const props = defineProps<{ householdId: string }>();
const open = defineModel<boolean>('open', { required: true });

const createGoal = useCreateGoal(props.householdId);
const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(goalSchema),
  initialValues: { name: '', description: '', targetAmount: 0, deadline: '', color: '#22c55e', icon: 'target' },
});

const [name, nameAttrs] = defineField('name');
const [description, descriptionAttrs] = defineField('description');
const [targetAmount, targetAmountAttrs] = defineField('targetAmount');
const [deadline, deadlineAttrs] = defineField('deadline');

const onSubmit = handleSubmit((values) => {
  createGoal.mutate(values, {
    onSuccess: () => {
      toast.success('Meta criada');
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
        <DialogTitle>Nova meta financeira</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="name">Nome</Label>
          <Input id="name" v-model="name" v-bind="nameAttrs" placeholder="Ex: Viagem de férias" />
          <FormMessage :message="errors.name" />
        </FormItem>
        <FormItem>
          <Label for="description">Descrição (opcional)</Label>
          <Textarea id="description" v-model="description" v-bind="descriptionAttrs" rows="2" />
        </FormItem>
        <div class="grid grid-cols-2 gap-4">
          <FormItem>
            <Label for="targetAmount">Valor alvo</Label>
            <Input id="targetAmount" v-model="targetAmount" v-bind="targetAmountAttrs" type="number" step="0.01" min="0" />
            <FormMessage :message="errors.targetAmount" />
          </FormItem>
          <FormItem>
            <Label for="deadline">Prazo (opcional)</Label>
            <Input id="deadline" v-model="deadline" v-bind="deadlineAttrs" type="date" />
          </FormItem>
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="createGoal.isPending.value">
            {{ createGoal.isPending.value ? 'Salvando...' : 'Criar meta' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
