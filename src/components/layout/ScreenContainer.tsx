import type { ReactNode } from "react";
import { AppPageLayout } from "@sudobility/building_blocks";
import { useTopBarConfig } from "./TopBar";
import { useFooterConfig } from "./Footer";
import { PageConfigProvider } from "../../context/PageConfigContext";
import { usePageConfig } from "../../hooks/usePageConfig";

interface ScreenContainerProps {
  children: ReactNode;
  footerVariant?: "full" | "compact";
  showFooter?: boolean;
  showBreadcrumbs?: boolean;
}

function ScreenContainerInner({
  children,
  footerVariant = "compact",
  showFooter = true,
}: ScreenContainerProps) {
  const topBarConfig = useTopBarConfig();
  const footerConfig = useFooterConfig(footerVariant);
  const pageConfigOverrides = usePageConfig();

  return (
    <AppPageLayout
      topBar={topBarConfig}
      footer={showFooter ? footerConfig : undefined}
      page={{ maxWidth: "full", contentPadding: "none", ...pageConfigOverrides }}
    >
      {children}
    </AppPageLayout>
  );
}

function ScreenContainer(props: ScreenContainerProps) {
  return (
    <PageConfigProvider>
      <ScreenContainerInner {...props} />
    </PageConfigProvider>
  );
}

export default ScreenContainer;
