import { useEffect } from 'react';
import { GlobalSettingsPage } from '@sudobility/building_blocks';
import { SEOHead } from '@sudobility/seo_lib';
import { CONSTANTS } from '../config/constants';
import { analyticsService } from '../config/analytics';
import { useSetPageConfig, usePageBreadcrumbs } from '../hooks/usePageConfig';
import { useAppearanceStore } from '../stores/appearanceStore';

export default function SettingsPage() {
  const theme = useAppearanceStore((s) => s.theme);
  const fontSize = useAppearanceStore((s) => s.fontSize);
  const setTheme = useAppearanceStore((s) => s.setTheme);
  const setFontSize = useAppearanceStore((s) => s.setFontSize);

  useSetPageConfig({ scrollable: false, contentPadding: 'sm', maxWidth: '7xl' });
  usePageBreadcrumbs([{ label: 'Settings', current: true }]);

  useEffect(() => {
    analyticsService.trackPageView('/settings', 'Settings');
  }, []);

  return (
    <>
      <SEOHead title={`Settings | ${CONSTANTS.APP_NAME}`} description="" noIndex />
      <GlobalSettingsPage
        theme={theme}
        fontSize={fontSize}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
      />
    </>
  );
}
