import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AiChatWidget } from "@/components/AiChatWidget";
import { getSiteContent } from "@/lib/site-data";
import "./globals.css";

/** Geist — headings only; body text uses Open Sans via globals.css */
const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

/** CMS reads Postgres at request time — skip static prerender during `next build`. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Создание сайтов и приложений",
  description:
    "Веб-студия полного цикла: стратегия, дизайн под конверсию, разработка и поддержка. Бесплатная консультация и смета за 24 часа.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteContent();

  return (
    <html
      lang="ru"
      className={`${geist.variable} h-full overflow-x-clip antialiased`}
      data-theme="dark"
    >
      <body className="min-h-full overflow-x-clip">
        {children}
        <AiChatWidget buttonLabels={settings.buttonLabels} />
      </body>
    </html>
  );
}
