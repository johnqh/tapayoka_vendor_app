import type { ReactNode } from "react";
import { AppPageLayout } from "@sudobility/building_blocks";
import { useTopBarConfig } from "./TopBar";
import { useFooterConfig } from "./Footer";

interface ScreenContainerProps {
  children: ReactNode;
  footerVariant?: "full" | "compact";
  showFooter?: boolean;
  showBreadcrumbs?: boolean;
}

function ScreenContainer({
  children,
  footerVariant = "compact",
  showFooter = true,
}: ScreenContainerProps) {
  const topBarConfig = useTopBarConfig();
  const footerConfig = useFooterConfig(footerVariant);

  return (
    <AppPageLayout
      topBar={topBarConfig}
      footer={showFooter ? footerConfig : undefined}
      page={{ maxWidth: "full", contentPadding: "none" }}
    >
      {children}
    </AppPageLayout>
  );
}

export default ScreenContainer;
