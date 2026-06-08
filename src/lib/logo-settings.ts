export const DEFAULT_LOGO_IMAGE_URL = "/images/qnox-logo.webp";

export type LogoMode = "text" | "image";

export function parseLogoMode(value: string | undefined | null): LogoMode {
  return value === "text" ? "text" : "image";
}

export function parseLogoImageUrl(value: string | undefined | null): string {
  const trimmed = (value ?? "").trim();
  return trimmed || DEFAULT_LOGO_IMAGE_URL;
}
