'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Wallet2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { ApiEnvelope, User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const ranOnce = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setError(true);
      return;
    }

    axios
      .get<ApiEnvelope<User>>(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        setAuth({ accessToken, refreshToken, user: response.data.data });
        router.replace('/dashboard');
      })
      .catch(() => setError(true));
  }, [router, setAuth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
      <div className="flex items-center gap-2 font-semibold">
        <Wallet2 className="h-6 w-6 text-primary" />
        <span>Together Account</span>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{error ? 'Não foi possível entrar' : 'Entrando com Google...'}</CardTitle>
          <CardDescription>
            {error ? (
              <>
                O login com Google falhou ou foi cancelado.{' '}
                <a href="/login" className="font-medium text-primary hover:underline">
                  Volte e tente novamente
                </a>
                .
              </>
            ) : (
              'Só um instante enquanto confirmamos sua conta.'
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
