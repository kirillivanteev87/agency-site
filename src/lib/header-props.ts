import type { SiteSettingsView } from "@/components/types";

export function headerPropsFromSettings(settings: SiteSettingsView) {
  return {
    brandName: settings.brandName,
    brandHighlightText: settings.brandHighlightText,
    brandHighlightColor: settings.brandHighlightColor,
    buttonLabels: settings.buttonLabels,
    logoMode: settings.logoMode,
    logoImageUrl: settings.logoImageUrl,
  };
}
