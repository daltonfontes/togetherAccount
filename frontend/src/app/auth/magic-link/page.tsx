'use client';

import { useEffect, useRef, useState } from 'react';
import { Wallet2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api/client';
import { useVerifyMagicLink } from '@/lib/hooks/use-auth';

export default function MagicLinkCallbackPage() {
  const verifyMagicLink = useVerifyMagicLink();
  const ranOnce = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('Link de acesso inválido.');
      return;
    }

    verifyMagicLink.mutate(
      { token },
      { onError: (err) => setError(getApiErrorMessage(err)) },
    );
    // verifyMagicLink is a fresh object every render (useMutation), so it's
    // intentionally left out of the deps array to avoid re-running this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
      <div className="flex items-center gap-2 font-semibold">
        <Wallet2 className="h-6 w-6 text-primary" />
        <span>Together Account</span>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{error ? 'Não foi possível entrar' : 'Confirmando seu link...'}</CardTitle>
          <CardDescription>
            {error ? (
              <>
                {error}{' '}
                <a href="/magic-link" className="font-medium text-primary hover:underline">
                  Peça um novo link
                </a>
                .
              </>
            ) : (
              'Só um instante enquanto validamos o seu acesso.'
            )}
          </CardDescription>
        </CardHeader>
        {!error && (
          <CardContent>
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
