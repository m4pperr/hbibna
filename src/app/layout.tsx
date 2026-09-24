import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hbibna | Digital Loyalty Platform for Growing Businesses",
  description:
    "Hbibna is a simple, elegant customer loyalty points platform for businesses. Transparent pricing with zero setup hassle.",
  keywords: ["loyalty platform", "customer retention", "points system", "algeria loyalty", "hbibna", "digital loyalty card"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} font-sans antialiased`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-[#B88E3E]/20 selection:text-[#B88E3E]">
        {children}
      </body>
    </html>
  );
}
