// app/pricing/page.tsx
import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing - Affordable AI Cover Letter Plans",
  description: "Choose the perfect plan for your job search. Get unlimited cover letters with our AI-powered generator. Free trial available. Plans starting from $9/month.",
  keywords: [
    "cover letter pricing",
    "AI cover letter cost",
    "cover letter subscription",
    "job application pricing",
    "resume service pricing"
  ],
  openGraph: {
    title: "Pricing - Affordable AI Cover Letter Plans",
    description: "Choose the perfect plan for your job search. Get unlimited cover letters with our AI-powered generator. Free trial available.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Pricing - Affordable AI Cover Letter Plans",
    description: "Choose the perfect plan for your job search. Get unlimited cover letters with our AI-powered generator.",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
