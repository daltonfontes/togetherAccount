'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/api/client';
import { useRequestMagicLink } from '@/lib/hooks/use-auth';
import { magicLinkSchema, type MagicLinkFormValues } from '@/lib/validations/auth';

export default function MagicLinkPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const requestMagicLink = useRequestMagicLink();
  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: MagicLinkFormValues) => {
    requestMagicLink.mutate(values, {
      onSuccess: () => setSentTo(values.email),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  if (sentTo) {
    return (
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-primary">
            <MailCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de acesso para <strong>{sentTo}</strong>. Clique nele para entrar —
            ele expira em 15 minutos e só pode ser usado uma vez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Não recebeu?{' '}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-medium text-primary hover:underline"
            >
              Tentar de novo
            </button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Entrar sem senha</CardTitle>
        <CardDescription>
          Enviamos um link de acesso para o seu e-mail — sem senha, sem cadastro separado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="voce@email.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={requestMagicLink.isPending}>
              {requestMagicLink.isPending ? 'Enviando...' : 'Enviar link de acesso'}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Prefere usar senha?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Voltar para o login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
