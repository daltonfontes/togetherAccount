import { computed, ref, watchEffect } from 'vue';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

const theme = ref<ThemePreference>((localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? 'system');
const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function resolveIsDark(preference: ThemePreference): boolean {
  return preference === 'dark' || (preference === 'system' && systemPrefersDark.value);
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.classList.add('[&_*]:!transition-none');
  root.classList.toggle('dark', resolveIsDark(preference));
  // Force a reflow so the transition-suppression class takes effect before removal.
  void window.getComputedStyle(root).opacity;
  requestAnimationFrame(() => root.classList.remove('[&_*]:!transition-none'));
}

watchEffect(() => {
  applyTheme(theme.value);
  localStorage.setItem(STORAGE_KEY, theme.value);
});

mediaQuery.addEventListener('change', (event) => {
  systemPrefersDark.value = event.matches;
});

const resolvedTheme = computed<'light' | 'dark'>(() => (resolveIsDark(theme.value) ? 'dark' : 'light'));

export function useTheme() {
  function setTheme(preference: ThemePreference) {
    theme.value = preference;
  }

  return { theme, resolvedTheme, setTheme };
}
