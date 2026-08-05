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
import { useCreateCreditCard } from '@/composables/useCreditCards';
import { CardBrand } from '@/lib/types';
import { creditCardSchema } from '@/lib/validations/credit-card';

const props = defineProps<{ householdId: string }>();
const open = defineModel<boolean>('open', { required: true });

const createCard = useCreateCreditCard(props.householdId);
const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(creditCardSchema),
  initialValues: { name: '', brand: CardBrand.OTHER, creditLimit: 0, closingDay: 1, dueDay: 10, color: '#8b5cf6' },
});

const [name, nameAttrs] = defineField('name');
const [brand, brandAttrs] = defineField('brand');
const [creditLimit, creditLimitAttrs] = defineField('creditLimit');
const [closingDay, closingDayAttrs] = defineField('closingDay');
const [dueDay, dueDayAttrs] = defineField('dueDay');

const onSubmit = handleSubmit((values) => {
  createCard.mutate(values, {
    onSuccess: () => {
      toast.success('Cartão criado');
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
        <DialogTitle>Novo cartão de crédito</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit="onSubmit">
        <FormItem>
          <Label for="name">Nome</Label>
          <Input id="name" v-model="name" v-bind="nameAttrs" placeholder="Ex: Nubank Roxinho" />
          <FormMessage :message="errors.name" />
        </FormItem>
        <FormItem>
          <Label>Bandeira</Label>
          <Select v-model="brand" v-bind="brandAttrs">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="cardBrand in Object.values(CardBrand)" :key="cardBrand" :value="cardBrand" class="capitalize">
                {{ cardBrand }}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
        <FormItem>
          <Label for="creditLimit">Limite</Label>
          <Input id="creditLimit" v-model="creditLimit" v-bind="creditLimitAttrs" type="number" step="0.01" min="0" />
          <FormMessage :message="errors.creditLimit" />
        </FormItem>
        <div class="grid grid-cols-2 gap-4">
          <FormItem>
            <Label for="closingDay">Dia de fechamento</Label>
            <Input id="closingDay" v-model="closingDay" v-bind="closingDayAttrs" type="number" min="1" max="31" />
            <FormMessage :message="errors.closingDay" />
          </FormItem>
          <FormItem>
            <Label for="dueDay">Dia de vencimento</Label>
            <Input id="dueDay" v-model="dueDay" v-bind="dueDayAttrs" type="number" min="1" max="31" />
            <FormMessage :message="errors.dueDay" />
          </FormItem>
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="createCard.isPending.value">
            {{ createCard.isPending.value ? 'Salvando...' : 'Criar cartão' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
