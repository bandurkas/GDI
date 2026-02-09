import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://gdi.id"),
  title: "Global Digital Informasi - AI & Software Solutions",
  description: "Strategic Digital Partner for the Future Economy. AI-driven software and digital solutions tailored to real business needs.",
  keywords: ["AI", "Software Solutions", "Digital Transformation", "Automation", "GDI"],
  authors: [{ name: "Global Digital Informasi" }],
  openGraph: {
    title: "Global Digital Informasi",
    description: "Strategic Digital Partner for the Future Economy.",
    url: "https://gdi.id",
    siteName: "GDI",
    images: [
      {
        url: "/gdi-logo.svg",
        width: 800,
        height: 600,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Digital Informasi",
    description: "AI-driven software and digital solutions.",
    images: ["/gdi-logo.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

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
              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Skip to main content
              </a>

              <Suspense fallback={null}>
                <LoadingBar />
              </Suspense>
              <Navbar />
              <main id="main-content" className="min-h-[70vh]">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
