import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchModal } from "@/components/layout/search-modal";
import { AccessibilityPanel } from "@/components/accessibility-panel";
import { CookieConsent } from "@/components/cookie-consent";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ScrollProgress } from "@/components/scroll-progress";
import { Chrome } from "@/components/layout/chrome";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.buckinghamkennel.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Buckingham Kennel Limited — ${site.tagline}`,
    template: `%s · Buckingham Kennel Limited`,
  },
  description: site.description,
  keywords: [
    "Buckingham Kennel Limited",
    "Buckingham Kennel",
    "dog breeder Kenya",
    "puppies for sale Kenya",
    "Royal Black German Shepherd Kenya",
    "Caucasian Shepherd Kenya",
    "White Long Coat Swiss Shepherd Kenya",
    "American Akita Kenya",
    "Kangal Kenya",
    "guard dog puppies Kenya",
    "dog kennel Nairobi",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: `Buckingham Kennel Limited — ${site.tagline}`,
    description: site.description,
    url: siteUrl,
    siteName: "Buckingham Kennel Limited",
    type: "website",
    locale: "en_KE",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Buckingham Kennel Limited",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Buckingham Kennel Limited — ${site.tagline}`,
    description: site.description,
    images: [`${siteUrl}/og-image.jpg`],
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
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Buckingham Kennel Limited",
  "url": siteUrl,
  "logo": `${siteUrl}/icon.png`,
  "image": `${siteUrl}/og-image.jpg`,
  "description": site.description,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Nairobi",
    "addressCountry": "KE",
  },
  "priceRange": "$$$",
};

const noFlash = `(function(){try{var s=JSON.parse(localStorage.getItem('bk-prefs')||'{}').state||{};var t=s.theme||'light';document.documentElement.classList.toggle('dark',t==='dark');if(s.highContrast)document.documentElement.classList.add('a11y-contrast');if(s.reduceMotion)document.documentElement.classList.add('a11y-reduce-motion');if(s.fontScale)document.documentElement.style.setProperty('--a11y-font-scale',s.fontScale);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <span
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[var(--grain)]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "160px 160px",
          }}
        />
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-volt-400 focus:px-4 focus:py-2 focus:text-graphite-900">
            Skip to content
          </a>
          <Chrome><ScrollProgress /></Chrome>
          <Chrome><Navbar /></Chrome>
          <main id="main" className="flex-1">{children}</main>
          <Chrome>
            <Footer />
            <CartDrawer />
            <MobileNav />
            <SearchModal />
            <AccessibilityPanel />
            <CookieConsent />
            <ChatWidget />
            <WhatsAppWidget />
            <ScrollToTop />
          </Chrome>
        </Providers>
      </body>
    </html>
  );
}
