import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name || "Home",
    template: siteConfig.name ? `%s | ${siteConfig.name}` : "%s",
  },
  description: siteConfig.description || undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name || undefined,
    title: siteConfig.name || undefined,
    description: siteConfig.description || undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name || undefined,
    description: siteConfig.description || undefined,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
