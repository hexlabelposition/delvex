import "./globals.css";

import { siteMetadata } from "@shared/config";
import { cn } from "@shared/lib";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: siteMetadata.url,
  applicationName: siteMetadata.name,
  title: {
    default: siteMetadata.name,
    template: "%s | Delvex",
  },
  description: siteMetadata.description,
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  openGraph: {
    type: "website",
    locale: siteMetadata.locale,
    url: "/",
    siteName: siteMetadata.name,
    title: siteMetadata.name,
    description: siteMetadata.description,
    images: [siteMetadata.image],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.name,
    description: siteMetadata.description,
    images: [siteMetadata.image.url],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#26332f" },
  ],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn("font-sans antialiased", inter.variable)}>
        {children}
      </body>
    </html>
  );
}
