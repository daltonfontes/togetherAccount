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
import { getApiErrorMessage } from '@/lib/api/client';
import { useAddContribution } from '@/lib/hooks/use-goals';
import { contributionSchema, type ContributionFormValues } from '@/lib/validations/goal';

export function ContributionDialog({
  householdId,
  goalId,
  open,
  onOpenChange,
}: {
  householdId: string;
  goalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addContribution = useAddContribution(householdId);
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: 0, date: new Date().toISOString().slice(0, 10), note: '' },
  });

  const onSubmit = (values: ContributionFormValues) => {
    if (!goalId) return;
    addContribution.mutate(
      { id: goalId, payload: values },
      {
        onSuccess: () => {
          toast.success('Contribuição adicionada');
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar contribuição</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <DialogFooter>
              <Button type="submit" disabled={addContribution.isPending}>
                {addContribution.isPending ? 'Salvando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
