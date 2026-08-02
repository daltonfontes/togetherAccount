'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/api/client';
import type { TransactionInput } from '@/lib/api/transactions';
import { useBankAccounts } from '@/lib/hooks/use-bank-accounts';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreditCards } from '@/lib/hooks/use-credit-cards';
import { useHouseholdMembers } from '@/lib/hooks/use-households';
import { useCreateTransaction } from '@/lib/hooks/use-transactions';
import { RecurrenceFrequency, SplitMethod, TransactionType } from '@/lib/types';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations/transaction';

interface TransactionFormDialogProps {
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionFormDialog({ householdId, open, onOpenChange }: TransactionFormDialogProps) {
  const createTransaction = useCreateTransaction(householdId);
  const { data: members } = useHouseholdMembers(householdId);
  const { data: accounts } = useBankAccounts(householdId);
  const { data: cards } = useCreditCards(householdId);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
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
      splitUserIds: [],
    },
  });

  const type = form.watch('type');
  const isRecurring = form.watch('isRecurring');
  const isShared = form.watch('isShared');
  const { data: categories } = useCategories(householdId, type);

  React.useEffect(() => {
    if (open) {
      form.reset({
        type: TransactionType.EXPENSE,
        amount: 0,
        description: '',
        notes: '',
        date: new Date().toISOString().slice(0, 10),
        categoryId: '',
        isRecurring: false,
        recurrenceFrequency: RecurrenceFrequency.MONTHLY,
        isShared: false,
        splitMethod: SplitMethod.EQUAL,
        splitUserIds: [],
      });
    }
  }, [open, form]);

  const onSubmit = (values: TransactionFormValues) => {
    const payload: TransactionInput = {
      type: values.type,
      amount: values.amount,
      description: values.description,
      notes: values.notes || undefined,
      date: values.date,
      categoryId: values.categoryId,
      bankAccountId: values.bankAccountId || undefined,
      creditCardId: values.creditCardId || undefined,
      isRecurring: values.isRecurring,
      recurrenceFrequency: values.isRecurring ? values.recurrenceFrequency : undefined,
      isShared: values.isShared,
      splitMethod: values.isShared ? SplitMethod.EQUAL : undefined,
      splits:
        values.isShared && values.splitUserIds
          ? values.splitUserIds.map((userId) => ({ userId }))
          : undefined,
    };

    createTransaction.mutate(payload, {
      onSuccess: () => {
        toast.success('Transação registrada');
        onOpenChange(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value={TransactionType.EXPENSE}>Despesa</SelectItem>
                      <SelectItem value={TransactionType.INCOME}>Receita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta (opcional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhuma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditCardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão (opcional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cards?.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.name}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Transação recorrente</FormLabel>
                    <p className="text-xs text-muted-foreground">Repetir automaticamente</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrenceFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={RecurrenceFrequency.DAILY}>Diária</SelectItem>
                        <SelectItem value={RecurrenceFrequency.WEEKLY}>Semanal</SelectItem>
                        <SelectItem value={RecurrenceFrequency.MONTHLY}>Mensal</SelectItem>
                        <SelectItem value={RecurrenceFrequency.YEARLY}>Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isShared"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Dividir com a casa</FormLabel>
                    <p className="text-xs text-muted-foreground">Divide o valor igualmente entre as pessoas selecionadas</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isShared && (
              <FormField
                control={form.control}
                name="splitUserIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dividir com</FormLabel>
                    <div className="space-y-2 rounded-lg border p-3">
                      {members?.map((member) => {
                        const checked = field.value?.includes(member.userId) ?? false;
                        return (
                          <label key={member.userId} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                const current = field.value ?? [];
                                field.onChange(
                                  value
                                    ? [...current, member.userId]
                                    : current.filter((id) => id !== member.userId),
                                );
                              }}
                            />
                            {member.user.fullName}
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={createTransaction.isPending}>
                {createTransaction.isPending ? 'Salvando...' : 'Salvar transação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
