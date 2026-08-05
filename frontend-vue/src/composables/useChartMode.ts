import { useTheme } from '@/composables/useTheme';

export function useChartMode() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}
