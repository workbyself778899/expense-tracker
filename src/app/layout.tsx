import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import CurrencyModal from "@/components/CurrencyModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker - Multi-Chart Analytics & Rich Notes",
  description:
    "Full-featured Expense Tracker built with Next.js and MongoDB. Track expenses, view interactive charts, take rich notes with H1/H2 and colors, and scribble mobile handwriting sketches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#090d16] text-slate-100"
      >
        <CurrencyProvider>
          {children}
          <CurrencyModal />
        </CurrencyProvider>
      </body>
    </html>
  );
}
