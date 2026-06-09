import { CaseStudies } from "@/components/CaseStudies";
import { Contact } from "@/components/Contact";
import { Faq } from "@/components/Faq";
import { Pricing } from "@/components/Pricing";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Process } from "@/components/Process";
import { Projects } from "@/components/Projects";
import { Services } from "@/components/Services";
import { SiteSection } from "@/components/SiteSection";
import { SiteSpacingStyles } from "@/components/SiteSpacingStyles";
import { ContentPreviewListener } from "@/components/ContentPreviewListener";
import { SpacingPreviewListener } from "@/components/SpacingPreviewListener";
import { Stats } from "@/components/Stats";
import { headerPropsFromSettings } from "@/lib/header-props";
import { getSiteContent } from "@/lib/site-data";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();
  const sp = content.sectionSpacing;
  const hasHeroVideo = Boolean(content.settings.heroVideoUrl?.trim());
  const heroSpacing = hasHeroVideo ? { ...sp.hero, paddingTop: 0 } : sp.hero;
  const spacingCss = hasHeroVideo ? { ...sp, hero: heroSpacing } : sp;

  return (
    <>
      <SiteSpacingStyles spacing={spacingCss} />
      <Suspense fallback={null}>
        <SpacingPreviewListener />
      </Suspense>
      <Suspense fallback={null}>
        <ContentPreviewListener />
      </Suspense>
      <Header {...headerPropsFromSettings(content.settings)} overlay />
      <main className="overflow-x-clip">
        <SiteSection
          id="hero"
          spacing={heroSpacing}
          className={hasHeroVideo ? "home-hero-section" : undefined}
        >
          <Hero
            settings={content.settings}
            heroFeatures={content.heroFeatures}
            headerOverlay
          />
        </SiteSection>
        <SiteSection id="stats" spacing={sp.stats}>
          <Stats settings={content.settings} />
        </SiteSection>
        <SiteSection id="process" spacing={sp.process}>
          <Process />
        </SiteSection>
        <SiteSection id="projects" spacing={sp.projects}>
          <Projects projects={content.projects} settings={content.settings} />
        </SiteSection>
        <SiteSection id="cases" spacing={sp.cases}>
          <CaseStudies caseStudies={content.caseStudies} settings={content.settings} />
        </SiteSection>
        <SiteSection id="services" spacing={sp.services}>
          <Services services={content.services} settings={content.settings} />
        </SiteSection>
        <SiteSection id="pricing" spacing={sp.pricing}>
          <Pricing settings={content.settings} pricingPlans={content.pricingPlans} />
        </SiteSection>
        <SiteSection id="faq" spacing={sp.faq}>
          <Faq faqs={content.faqs} settings={content.settings} />
        </SiteSection>
        <SiteSection id="contact" spacing={sp.contact}>
          <Contact settings={content.settings} />
        </SiteSection>
      </main>
    </>
  );
}
