import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider, type Language } from "@/lib/i18n/LanguageContext";
import { ServiceWorkerRegister } from "@/components/common/ServiceWorkerRegister";
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
  icons: {
    icon: [
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/hbibna-logo.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/assets/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("hbibna_lang")?.value;
  const initialLang: Language = langCookie === "ar" ? "ar" : (langCookie === "fr" ? "fr" : "en");
  const initialDir = initialLang === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      className={`${plusJakarta.variable} ${cairo.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#FFDE59" />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-rounded flex flex-col selection:bg-black selection:text-[#FFDE59]">
        <LanguageProvider initialLanguage={initialLang}>
          <ServiceWorkerRegister />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
