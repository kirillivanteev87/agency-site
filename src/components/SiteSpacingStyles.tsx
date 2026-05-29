import { spacingToCssVars, type SpacingConfig } from "@/lib/section-spacing";

export function SiteSpacingStyles({ spacing }: { spacing: SpacingConfig }) {
  return <style dangerouslySetInnerHTML={{ __html: spacingToCssVars(spacing) }} />;
}
