import { Header } from "@/components/Header";
import { headerPropsFromSettings } from "@/lib/header-props";
import { getSiteContent } from "@/lib/site-data";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <>
      <Header {...headerPropsFromSettings(content.settings)} />
      {children}
    </>
  );
}
