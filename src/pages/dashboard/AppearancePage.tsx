import { useEffect } from 'react';
import { AppearanceSettings } from '@sudobility/building_blocks';
import { analyticsService } from '../../config/analytics';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { useAppearanceStore } from '../../stores/appearanceStore';

export function AppearancePage() {
  const theme = useAppearanceStore((s) => s.theme);
  const fontSize = useAppearanceStore((s) => s.fontSize);
  const setTheme = useAppearanceStore((s) => s.setTheme);
  const setFontSize = useAppearanceStore((s) => s.setFontSize);

  usePageBreadcrumbs([{ label: 'Appearance', current: true }]);

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/appearance', 'Appearance');
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 max-w-2xl">
        <AppearanceSettings
          theme={theme}
          fontSize={fontSize}
          onThemeChange={setTheme}
          onFontSizeChange={setFontSize}
        />
      </div>
    </div>
  );
}

export default AppearancePage;
