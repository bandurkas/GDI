import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Digital Informasi - AI & Software Solutions",
  description: "Strategic Digital Partner for the Future Economy. AI-driven software and digital solutions.",
};

import { CartProvider } from "@/context/CartContext";

// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as "en" | "id") || "en";

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <Providers>
          <LanguageProvider initialLanguage={lang}>
            <CartProvider>
              <Navbar />
              <main className="">
                {children}
              </main>
            </CartProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
