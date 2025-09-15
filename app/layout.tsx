import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Applika - AI-Powered Cover Letter Generator | Create Perfect Cover Letters in Seconds",
    template: "%s | Applika"
  },
  description: "Generate professional, personalized cover letters in seconds with Applika's AI. Upload your CV, paste job descriptions, and get custom cover letters that land you interviews. Free trial available.",
  keywords: [
    "cover letter generator",
    "AI cover letter",
    "cover letter template",
    "job application",
    "resume cover letter",
    "professional cover letter",
    "cover letter examples",
    "cover letter builder",
    "automated cover letter",
    "personalized cover letter"
  ],
  authors: [{ name: "Applika" }],
  creator: "Applika",
  publisher: "Applika",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    title: "Applika - AI-Powered Cover Letter Generator",
    description: "Generate professional, personalized cover letters in seconds with Applika's AI. Upload your CV, paste job descriptions, and get custom cover letters that land you interviews.",
    siteName: "Applika",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Applika - AI Cover Letter Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Applika - AI-Powered Cover Letter Generator",
    description: "Generate professional, personalized cover letters in seconds with Applika's AI. Upload your CV, paste job descriptions, and get custom cover letters that land you interviews.",
    images: ["/twitter-image.png"],
    creator: "@applika",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  manifest: "/manifest.json",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
