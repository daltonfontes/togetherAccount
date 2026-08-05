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
import { useCreateBankAccount } from '@/composables/useBankAccounts';
import { AccountType } from '@/lib/types';
import { bankAccountSchema } from '@/lib/validations/bank-account';

const typeLabels: Record<AccountType, string> = {
  [AccountType.CHECKING]: 'Conta corrente',
  [AccountType.SAVINGS]: 'Poupança',
  [AccountType.INVESTMENT]: 'Investimento',
  [AccountType.CASH]: 'Dinheiro',
  [AccountType.OTHER]: 'Outro',
};

const props = defineProps<{ householdId: string }>();
const open = defineModel<boolean>('open', { required: true });

const createAccount = useCreateBankAccount(props.householdId);
const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(bankAccountSchema),
  initialValues: { name: '', bank: '', type: AccountType.CHECKING, balance: 0, includeInTotal: true, color: '#3b82f6' },
});

const [name, nameAttrs] = defineField('name');
const [bank, bankAttrs] = defineField('bank');
const [type, typeAttrs] = defineField('type');
const [balance, balanceAttrs] = defineField('balance');

const onSubmit = handleSubmit((values) => {
  createAccount.mutate(values, {
    onSuccess: () => {
      toast.success('Conta criada');
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
        <DialogTitle>Nova conta bancária</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="name">Nome</Label>
          <Input id="name" v-model="name" v-bind="nameAttrs" placeholder="Ex: Conta corrente Nubank" />
          <FormMessage :message="errors.name" />
        </FormItem>
        <div class="grid grid-cols-2 gap-4">
          <FormItem>
            <Label for="bank">Banco (opcional)</Label>
            <Input id="bank" v-model="bank" v-bind="bankAttrs" placeholder="Ex: Nubank" />
          </FormItem>
          <FormItem>
            <Label>Tipo</Label>
            <Select v-model="type" v-bind="typeAttrs">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="accountType in Object.values(AccountType)" :key="accountType" :value="accountType">
                  {{ typeLabels[accountType] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        <FormItem>
          <Label for="balance">Saldo inicial</Label>
          <Input id="balance" v-model="balance" v-bind="balanceAttrs" type="number" step="0.01" />
          <FormMessage :message="errors.balance" />
        </FormItem>
        <DialogFooter>
          <Button type="submit" :disabled="createAccount.isPending.value">
            {{ createAccount.isPending.value ? 'Salvando...' : 'Criar conta' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
