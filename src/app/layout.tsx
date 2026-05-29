import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";
import { AiChatWidget } from "@/components/AiChatWidget";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSiteContent } from "@/lib/site-data";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "REDLINE — сайты и приложения, которые приносят заявки",
  description:
    "Веб-студия полного цикла: стратегия, дизайн под конверсию, разработка и поддержка. Бесплатная консультация и смета за 24 часа.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteContent();
  const cookieTheme = (await cookies()).get("site-theme")?.value;
  const initialTheme = cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : "dark";

  return (
    <html
      lang="ru"
      className={`${geist.variable} h-full overflow-x-clip antialiased`}
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <body className="min-h-full overflow-x-clip" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <AiChatWidget buttonLabels={settings.buttonLabels} />
        </ThemeProvider>
      </body>
    </html>
  );
}
