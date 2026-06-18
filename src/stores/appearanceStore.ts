import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, FontSize } from '@sudobility/building_blocks';

const FONT_SIZE_PX: Record<string, string> = {
  [FontSize.SMALL]: '14px',
  [FontSize.MEDIUM]: '16px',
  [FontSize.LARGE]: '18px',
};

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function isDark(theme: Theme): boolean {
  if (theme === Theme.DARK) return true;
  if (theme === Theme.LIGHT) return false;
  return prefersDark();
}

/**
 * Apply the resolved theme (Tailwind `dark` class) and font size (root
 * font-size, which scales all rem-based sizing) to the document root.
 */
export function applyAppearance(theme: Theme, fontSize: FontSize): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', isDark(theme));
  root.style.fontSize = FONT_SIZE_PX[fontSize] ?? FONT_SIZE_PX[FontSize.MEDIUM];
}

interface AppearanceState {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      theme: Theme.SYSTEM,
      fontSize: FontSize.MEDIUM,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'tapayoka-appearance' }
  )
);

/**
 * Applies the persisted appearance to the DOM and keeps it in sync with the
 * store and the OS color scheme (when theme is "system"). Call once at the
 * app root.
 */
export function useAppearanceEffect(): void {
  const theme = useAppearanceStore((s) => s.theme);
  const fontSize = useAppearanceStore((s) => s.fontSize);

  useEffect(() => {
    applyAppearance(theme, fontSize);
  }, [theme, fontSize]);

  useEffect(() => {
    if (theme !== Theme.SYSTEM) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyAppearance(Theme.SYSTEM, fontSize);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, fontSize]);
}
