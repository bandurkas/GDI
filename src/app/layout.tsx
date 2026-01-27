import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Digital Informasi - AI & Software Solutions",
  description: "Strategic Digital Partner for the Future Economy. AI-driven software and digital solutions.",
};

import { CartProvider } from "@/context/CartContext";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <Providers>
          <CartProvider>
            <Navbar />
            <main className="">
              {children}
            </main>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
