import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider, type Language } from "@/lib/i18n/LanguageContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hbibna | Digital Loyalty Platform for Growing Businesses",
  description:
    "Hbibna is a simple, elegant customer loyalty points platform for businesses. Transparent pricing with zero setup hassle.",
  keywords: ["loyalty platform", "customer retention", "points system", "algeria loyalty", "hbibna", "digital loyalty card"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("hbibna_lang")?.value;
  const initialLang: Language = langCookie === "ar" ? "ar" : "en";
  const initialDir = initialLang === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      className={`${plusJakarta.variable} ${cairo.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-[#B88E3E]/20 selection:text-[#B88E3E]">
        <LanguageProvider initialLanguage={initialLang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
