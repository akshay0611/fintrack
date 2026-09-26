import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Features from "@/components/landing/features";
import FinalCta from "@/components/landing/final-cta";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import MobileShowcase from "@/components/landing/mobile-showcase";
import Navbar from "@/components/landing/navbar";
import TrustedBy from "@/components/landing/trusted-by";

const inter = Inter({ display: "swap", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrack — Personal finance, simplified",
  description:
    "FinTrack helps you track expenses, understand your spending habits, and build better financial decisions — all in one place.",
};

export default function HomePage() {
  return (
    <div
      className={`min-h-screen scroll-smooth bg-white text-ink ${inter.className}`}
    >
      <Navbar />

      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <MobileShowcase />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
