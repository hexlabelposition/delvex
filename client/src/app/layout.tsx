import "./globals.css";

import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body>{children}</body>
    </html>
  );
}
