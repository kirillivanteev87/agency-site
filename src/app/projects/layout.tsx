import { Header } from "@/components/Header";
import { getSiteContent } from "@/lib/site-data";

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <>
      <Header
        brandName={content.settings.brandName}
        brandHighlightText={content.settings.brandHighlightText}
        brandHighlightColor={content.settings.brandHighlightColor}
        buttonLabels={content.settings.buttonLabels}
      />
      {children}
    </>
  );
}
