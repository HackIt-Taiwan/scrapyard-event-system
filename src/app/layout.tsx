import Nav from "@/components/nav";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Scrapyard",
    default: "Scrapyard - 2025 台灣高中生黑客松",
  },
  description: "Scrapyard 是一個專為台灣高中生打造的黑客松活動，旨在培養創新思維和實作能力。",
  keywords: ["黑客松", "hackathon", "高中生", "程式設計", "創新", "科技", "台灣", "教育"],
  authors: [{ name: "HackIT" }],
  creator: "HackIT",
  publisher: "HackIT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://scrapyard.hackit.tw"),
  openGraph: {
    title: "Scrapyard - 2025 台灣高中生黑客松",
    description: "Scrapyard 是一個專為台灣高中生打造的黑客松活動，旨在培養創新思維和實作能力。",
    url: "https://scrapyard.hackit.tw",
    siteName: "Scrapyard",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Scrapyard Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scrapyard - 2025 台灣高中生黑客松",
    description: "Scrapyard 是一個專為台灣高中生打造的黑客松活動，旨在培養創新思維和實作能力。",
    images: ["/banner.png"],
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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <div className="flex min-h-screen flex-col">
            <Nav />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
