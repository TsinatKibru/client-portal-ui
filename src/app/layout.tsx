import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Client Portal v2 - Next.js 15.1.3",
};

import { Toaster } from "sonner";
import { BrandProvider } from "@/components/providers/BrandProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <BrandProvider>
            {children}
            <Toaster position="top-center" richColors />
          </BrandProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
