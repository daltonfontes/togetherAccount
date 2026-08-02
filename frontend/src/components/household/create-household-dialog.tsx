'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/api/client';
import { useCreateHousehold } from '@/lib/hooks/use-households';
import { useHouseholdStore } from '@/lib/stores/household-store';
import { householdSchema, type HouseholdFormValues } from '@/lib/validations/household';

interface CreateHouseholdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHouseholdDialog({ open, onOpenChange }: CreateHouseholdDialogProps) {
  const createHousehold = useCreateHousehold();
  const setCurrentHouseholdId = useHouseholdStore((state) => state.setCurrentHouseholdId);

  const form = useForm<HouseholdFormValues>({
    resolver: zodResolver(householdSchema),
    defaultValues: { name: '', description: '', currency: 'BRL' },
  });

  const onSubmit = (values: HouseholdFormValues) => {
    createHousehold.mutate(values, {
      onSuccess: (household) => {
        setCurrentHouseholdId(household.id);
        toast.success('Casa criada com sucesso');
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
          <DialogTitle>Criar nova casa</DialogTitle>
          <DialogDescription>
            Crie um espaço compartilhado para organizar as finanças com outras pessoas.
          </DialogDescription>
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
                    <Input placeholder="Ex: Apartamento 302" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Sobre esta casa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createHousehold.isPending}>
                {createHousehold.isPending ? 'Criando...' : 'Criar casa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
