import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "DocIntel — AI Document Intelligence Platform",
  description:
    "Upload documents and receive structured, searchable data plus AI-generated insights. OCR extraction, AI classification, semantic search, and RAG chat.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
