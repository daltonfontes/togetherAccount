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
import { useCreateBudget } from '@/composables/useBudgets';
import { useCategories } from '@/composables/useCategories';
import { TransactionType } from '@/lib/types';
import { budgetSchema } from '@/lib/validations/budget';

const props = defineProps<{ householdId: string }>();
const open = defineModel<boolean>('open', { required: true });

const createBudget = useCreateBudget(props.householdId);
const { data: categories } = useCategories(props.householdId, TransactionType.EXPENSE);
const now = new Date();

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(budgetSchema),
  initialValues: {
    categoryId: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    limitAmount: 0,
    alertThreshold: 80,
  },
});

const [categoryId, categoryIdAttrs] = defineField('categoryId');
const [month, monthAttrs] = defineField('month');
const [year, yearAttrs] = defineField('year');
const [limitAmount, limitAmountAttrs] = defineField('limitAmount');

const onSubmit = handleSubmit((values) => {
  createBudget.mutate(values, {
    onSuccess: () => {
      toast.success('Orçamento criado');
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
        <DialogTitle>Novo orçamento</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label>Categoria</Label>
          <Select v-model="categoryId" v-bind="categoryIdAttrs">
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage :message="errors.categoryId" />
        </FormItem>
        <div class="grid grid-cols-2 gap-4">
          <FormItem>
            <Label for="month">Mês</Label>
            <Input id="month" v-model="month" v-bind="monthAttrs" type="number" min="1" max="12" />
            <FormMessage :message="errors.month" />
          </FormItem>
          <FormItem>
            <Label for="year">Ano</Label>
            <Input id="year" v-model="year" v-bind="yearAttrs" type="number" min="2000" />
            <FormMessage :message="errors.year" />
          </FormItem>
        </div>
        <FormItem>
          <Label for="limitAmount">Limite mensal</Label>
          <Input id="limitAmount" v-model="limitAmount" v-bind="limitAmountAttrs" type="number" step="0.01" min="0" />
          <FormMessage :message="errors.limitAmount" />
        </FormItem>
        <DialogFooter>
          <Button type="submit" :disabled="createBudget.isPending.value">
            {{ createBudget.isPending.value ? 'Salvando...' : 'Criar orçamento' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
