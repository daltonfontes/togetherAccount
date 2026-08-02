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
    surface: '#fcfcfb',
    primaryInk: '#0b0b0b',
    secondaryInk: '#52514e',
    mutedInk: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
  },
  dark: {
    surface: '#1a1a19',
    primaryInk: '#ffffff',
    secondaryInk: '#c3c2b7',
    mutedInk: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
  },
};

export function getCategoricalColor(index: number, mode: 'light' | 'dark'): string {
  const palette = categoricalPalette[mode];
  return palette[index % palette.length];
}
