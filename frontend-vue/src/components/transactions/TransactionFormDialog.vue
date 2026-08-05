<script setup lang="ts">
import { watch } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import Button from '@/components/ui/Button.vue';
import Checkbox from '@/components/ui/Checkbox.vue';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormItem from '@/components/ui/FormItem.vue';
import FormMessage from '@/components/ui/FormMessage.vue';
import Input from '@/components/ui/Input.vue';
import Label from '@/components/ui/Label.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Switch from '@/components/ui/Switch.vue';
import Textarea from '@/components/ui/Textarea.vue';
import { getApiErrorMessage } from '@/lib/api/client';
import type { TransactionInput } from '@/lib/api/transactions';
import { useBankAccounts } from '@/composables/useBankAccounts';
import { useCategories } from '@/composables/useCategories';
import { useCreditCards } from '@/composables/useCreditCards';
import { useHouseholdMembers } from '@/composables/useHouseholds';
import { useCreateTransaction } from '@/composables/useTransactions';
import { RecurrenceFrequency, SplitMethod, TransactionType } from '@/lib/types';
import { transactionSchema } from '@/lib/validations/transaction';

const props = defineProps<{ householdId: string }>();
const open = defineModel<boolean>('open', { required: true });

const createTransaction = useCreateTransaction(props.householdId);
const { data: members } = useHouseholdMembers(props.householdId);
const { data: accounts } = useBankAccounts(props.householdId);
const { data: cards } = useCreditCards(props.householdId);

function defaultValues() {
  return {
    type: TransactionType.EXPENSE,
    amount: 0,
    description: '',
    notes: '',
    date: new Date().toISOString().slice(0, 10),
    categoryId: '',
    bankAccountId: undefined,
    creditCardId: undefined,
    isRecurring: false,
    recurrenceFrequency: RecurrenceFrequency.MONTHLY,
    isShared: false,
    splitMethod: SplitMethod.EQUAL,
    splitUserIds: [] as string[],
  };
}

const { defineField, errors, handleSubmit, resetForm, values } = useForm({
  validationSchema: toTypedSchema(transactionSchema),
  initialValues: defaultValues(),
});

const [type, typeAttrs] = defineField('type');
const [amount, amountAttrs] = defineField('amount');
const [date, dateAttrs] = defineField('date');
const [description, descriptionAttrs] = defineField('description');
const [categoryId, categoryIdAttrs] = defineField('categoryId');
const [bankAccountId, bankAccountIdAttrs] = defineField('bankAccountId');
const [creditCardId, creditCardIdAttrs] = defineField('creditCardId');
const [notes, notesAttrs] = defineField('notes');
const [isRecurring, isRecurringAttrs] = defineField('isRecurring');
const [recurrenceFrequency, recurrenceFrequencyAttrs] = defineField('recurrenceFrequency');
const [isShared, isSharedAttrs] = defineField('isShared');
const [splitUserIds, splitUserIdsAttrs] = defineField('splitUserIds');

const { data: categories } = useCategories(props.householdId, () => values.type);

watch(open, (isOpen) => {
  if (isOpen) resetForm({ values: defaultValues() });
});

function toggleSplitUser(userId: string, checked: boolean) {
  const current = splitUserIds.value ?? [];
  splitUserIds.value = checked ? [...current, userId] : current.filter((id) => id !== userId);
}

const onSubmit = handleSubmit((formValues) => {
  const payload: TransactionInput = {
    type: formValues.type,
    amount: formValues.amount,
    description: formValues.description,
    notes: formValues.notes || undefined,
    date: formValues.date,
    categoryId: formValues.categoryId,
    bankAccountId: formValues.bankAccountId || undefined,
    creditCardId: formValues.creditCardId || undefined,
    isRecurring: formValues.isRecurring,
    recurrenceFrequency: formValues.isRecurring ? formValues.recurrenceFrequency : undefined,
    isShared: formValues.isShared,
    splitMethod: formValues.isShared ? SplitMethod.EQUAL : undefined,
    splits:
      formValues.isShared && formValues.splitUserIds
        ? formValues.splitUserIds.map((userId) => ({ userId }))
        : undefined,
  };

  createTransaction.mutate(payload, {
    onSuccess: () => {
      toast.success('Transação registrada');
      open.value = false;
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>Nova transação</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label>Tipo</Label>
          <Select v-model="type" v-bind="typeAttrs">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="TransactionType.EXPENSE">Despesa</SelectItem>
              <SelectItem :value="TransactionType.INCOME">Receita</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage :message="errors.type" />
        </FormItem>

        <div class="grid grid-cols-2 gap-4">
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
        </div>

        <FormItem>
          <Label for="description">Descrição</Label>
          <Input id="description" v-model="description" v-bind="descriptionAttrs" placeholder="Ex: Supermercado" />
          <FormMessage :message="errors.description" />
        </FormItem>

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
            <Label>Conta (opcional)</Label>
            <Select v-model="bankAccountId" v-bind="bankAccountIdAttrs">
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            <Label>Cartão (opcional)</Label>
            <Select v-model="creditCardId" v-bind="creditCardIdAttrs">
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="card in cards" :key="card.id" :value="card.id">
                  {{ card.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </div>

        <FormItem>
          <Label for="notes">Notas (opcional)</Label>
          <Textarea id="notes" v-model="notes" v-bind="notesAttrs" rows="2" />
        </FormItem>

        <FormItem class="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label>Transação recorrente</Label>
            <p class="text-xs text-muted-foreground">Repetir automaticamente</p>
          </div>
          <Switch v-model="isRecurring" v-bind="isRecurringAttrs" />
        </FormItem>

        <FormItem v-if="isRecurring">
          <Label>Frequência</Label>
          <Select v-model="recurrenceFrequency" v-bind="recurrenceFrequencyAttrs">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="RecurrenceFrequency.DAILY">Diária</SelectItem>
              <SelectItem :value="RecurrenceFrequency.WEEKLY">Semanal</SelectItem>
              <SelectItem :value="RecurrenceFrequency.MONTHLY">Mensal</SelectItem>
              <SelectItem :value="RecurrenceFrequency.YEARLY">Anual</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>

        <FormItem class="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label>Dividir com a casa</Label>
            <p class="text-xs text-muted-foreground">Divide o valor igualmente entre as pessoas selecionadas</p>
          </div>
          <Switch v-model="isShared" v-bind="isSharedAttrs" />
        </FormItem>

        <FormItem v-if="isShared">
          <Label>Dividir com</Label>
          <div class="space-y-2 rounded-lg border p-3" v-bind="splitUserIdsAttrs">
            <label v-for="member in members" :key="member.userId" class="flex items-center gap-2 text-sm">
              <Checkbox
                :model-value="splitUserIds?.includes(member.userId) ?? false"
                @update:model-value="(checked: boolean | 'indeterminate') => toggleSplitUser(member.userId, !!checked)"
              />
              {{ member.user.fullName }}
            </label>
          </div>
          <FormMessage :message="errors.splitUserIds" />
        </FormItem>

        <DialogFooter>
          <Button type="submit" :disabled="createTransaction.isPending.value">
            {{ createTransaction.isPending.value ? 'Salvando...' : 'Salvar transação' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
