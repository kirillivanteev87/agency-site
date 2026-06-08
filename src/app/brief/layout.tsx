import { Header } from "@/components/Header";
import { headerPropsFromSettings } from "@/lib/header-props";
import { getSiteContent } from "@/lib/site-data";
import "./brief.css";

export default async function BriefLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <>
      <Header {...headerPropsFromSettings(content.settings)} />
      {children}
    </>
  );
}
