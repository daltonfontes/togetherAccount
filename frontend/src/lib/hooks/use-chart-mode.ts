'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';

export function useChartMode(): 'light' | 'dark' {
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    setMode(resolvedTheme === 'dark' ? 'dark' : 'light');
  }, [resolvedTheme]);

  return mode;
}
