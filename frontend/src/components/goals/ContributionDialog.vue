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
import { getApiErrorMessage } from '@/lib/api/client';
import { useAddContribution } from '@/composables/useGoals';
import { contributionSchema } from '@/lib/validations/goal';

const props = defineProps<{ householdId: string; goalId: string | null }>();
const open = defineModel<boolean>('open', { required: true });

const addContribution = useAddContribution(props.householdId);
const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(contributionSchema),
  initialValues: { amount: 0, date: new Date().toISOString().slice(0, 10), note: '' },
});

const [amount, amountAttrs] = defineField('amount');
const [date, dateAttrs] = defineField('date');

const onSubmit = handleSubmit((values) => {
  if (!props.goalId) return;
  addContribution.mutate(
    { id: props.goalId, payload: values },
    {
      onSuccess: () => {
        toast.success('Contribuição adicionada');
        resetForm();
        open.value = false;
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    },
  );
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar contribuição</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="amount">Valor</Label>
          <Input id="amount" v-model="amount" v-bind="amountAttrs" type="number" step="0.01" min="0" />
          <FormMessage :message="errors.amount" />
        </FormItem>
        <FormItem>
          <Label for="date">Data</Label>
          <Input id="date" v-model="date" v-bind="dateAttrs" type="date" />
          <FormMessage :message="errors.date" />
        </FormItem>
        <DialogFooter>
          <Button type="submit" :disabled="addContribution.isPending.value">
            {{ addContribution.isPending.value ? 'Salvando...' : 'Adicionar' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
