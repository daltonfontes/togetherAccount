// Validated categorical / status palette (see dataviz skill references/palette.md).
// Ordering is the CVD-safety mechanism — do not re-order or cycle.
export const categoricalPalette = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

export const statusPalette = {
  light: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
  dark: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
};

export const chartChrome = {
  light: {
    surface: '#ffffff',
    primaryInk: '#000000',
    secondaryInk: '#3a3a3a',
    mutedInk: '#6b6b6b',
    gridline: 'rgba(0,0,0,0.15)',
    baseline: '#000000',
  },
  dark: {
    surface: '#212121',
    primaryInk: '#ffffff',
    secondaryInk: '#d4d4d4',
    mutedInk: '#a3a3a3',
    gridline: 'rgba(255,255,255,0.2)',
    baseline: '#ffffff',
  },
};

export function getCategoricalColor(index: number, mode: 'light' | 'dark'): string {
  const palette = categoricalPalette[mode];
  return palette[index % palette.length];
}
