import type { Metadata } from "next";
import {
  Bebas_Neue,
  Geist,
  Geist_Mono,
  Permanent_Marker,
} from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { getSiteUrl } from "@/lib/utils";

import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const script = Permanent_Marker({
  weight: "400",
  variable: "--font-script",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name || "PSR",
    template: siteConfig.name ? `%s | ${siteConfig.name}` : "%s | PSR",
  },
  description: siteConfig.description || undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name || "PSR",
    title: siteConfig.name || "PSR",
    description: siteConfig.description || undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name || "PSR",
    description: siteConfig.description || undefined,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${script.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Footer />
        <FloatingNavigation locale={locale} dictionary={dictionary} />
      </body>
    </html>
  );
}
