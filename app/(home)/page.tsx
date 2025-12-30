import { ModernHero } from "@/components/home/ModernHero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Stats from "@/components/home/Stats";
import TrustSection from "@/components/home/TrustSection";
import Testimonials from "@/components/home/Testimonials";
import PricingPreview from "@/components/home/PricingPreview";
import { FeaturedBlogs } from "@/components/blog/FeaturedBlogs";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

import { ChristmasBanner } from "@/components/marketing/ChristmasBanner";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/30">
      <ChristmasBanner />
      <ModernHero />
      <div className="space-y-32 pb-32">
        <Features />
        <HowItWorks />
        <Stats />
        <TrustSection />
        <Testimonials />
        <PricingPreview />
        <FeaturedBlogs />
        <FAQ />

        <section
          id="contact"
          className="container mx-auto px-4 max-w-4xl py-12"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Have questions about our plans or the platform? We're here to
              help.
            </p>
          </div>
          <ContactForm />
        </section>

        <CTA />
        <Footer />
      </div>
    </div>
  );
}
