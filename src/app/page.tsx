import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { WorkflowAnimation } from "@/components/landing/WorkflowAnimation";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col cloud-sky-bg selection:bg-purple-500 selection:text-white">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <WorkflowAnimation />
        <FaqAccordion />
      </main>
      <Footer />
    </div>
  );
}
