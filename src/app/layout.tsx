import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/nav";
import "./globals.css";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col h-screen antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Nav />
          <div className="flex grow h-full w-full justify-center place-items-center">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
