import type { Metadata } from "next";
import { Instrument_Sans, Fraunces } from "next/font/google";
import "./globals.css";

// UI text. Instrument Sans has tighter, more characterful shapes than the
// system stack it replaces, and still reads cleanly at 13px in the form.
const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-site",
});

// Headlines only. A high-contrast serif keeps the page from reading like
// every other SaaS template while staying credible for a clinical product.
// Variable weight axis, so no `weight` list — next/font rejects `axes`
// alongside fixed weights.
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
  variable: "--font-display-site",
});

const SITE_TITLE = "DiaryDoc — Your dental clinic, connected. Chairside to billing.";
const SITE_DESCRIPTION =
  "Dental clinic software for Indian practices. FDI tooth charting, patient records, treatment plans, GST invoices with UPI QR and a waiting-room screen — running in your clinic, with or without the internet.";

/**
 * Social images have to be absolute URLs, so Next needs a base to resolve
 * "/og-image.png" against. Without this it falls back to localhost and the
 * card breaks everywhere the link is shared.
 *
 * Set NEXT_PUBLIC_SITE_URL to the production domain; on Vercel the project
 * URL is used automatically if that variable is absent.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "DiaryDoc",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    title: "DiaryDoc — Your dental clinic, connected.",
    description:
      "Charting, records, treatment plans and GST billing — running in your clinic, with or without the internet. Now taking pilot applications from Indian dental clinics.",
    type: "website",
    locale: "en_IN",
    siteName: "DiaryDoc",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DiaryDoc — dental clinic software for Indian practices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DiaryDoc — Your dental clinic, connected.",
    description:
      "Charting, records, treatment plans and GST billing — running in your clinic, with or without the internet.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
