'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api/client';
import { useCreateBankAccount } from '@/lib/hooks/use-bank-accounts';
import { AccountType } from '@/lib/types';
import { bankAccountSchema, type BankAccountFormValues } from '@/lib/validations/bank-account';

const typeLabels: Record<AccountType, string> = {
  [AccountType.CHECKING]: 'Conta corrente',
  [AccountType.SAVINGS]: 'Poupança',
  [AccountType.INVESTMENT]: 'Investimento',
  [AccountType.CASH]: 'Dinheiro',
  [AccountType.OTHER]: 'Outro',
};

export function AccountFormDialog({
  householdId,
  open,
  onOpenChange,
}: {
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createAccount = useCreateBankAccount(householdId);
  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { name: '', bank: '', type: AccountType.CHECKING, balance: 0, includeInTotal: true, color: '#3b82f6' },
  });

  const onSubmit = (values: BankAccountFormValues) => {
    createAccount.mutate(values, {
      onSuccess: () => {
        toast.success('Conta criada');
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova conta bancária</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Conta corrente Nubank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nubank" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AccountType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {typeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo inicial</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createAccount.isPending}>
                {createAccount.isPending ? 'Salvando...' : 'Criar conta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
