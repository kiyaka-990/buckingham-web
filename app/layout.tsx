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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    "dog breeder Kenya",
    "puppies for sale Kenya",
    "German Shepherd Kenya",
    "Belgian Malinois",
    "trained guard dogs",
    "Buckingham Kennel",
  ],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    locale: "en_KE",
  },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0a1533",
  width: "device-width",
  initialScale: 1,
};

const noFlash = `(function(){try{var s=JSON.parse(localStorage.getItem('bk-prefs')||'{}').state||{};var t=s.theme||'dark';document.documentElement.classList.toggle('dark',t==='dark');if(s.highContrast)document.documentElement.classList.add('a11y-contrast');if(s.reduceMotion)document.documentElement.classList.add('a11y-reduce-motion');if(s.fontScale)document.documentElement.style.setProperty('--a11y-font-scale',s.fontScale);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} dark h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brass-400 focus:px-4 focus:py-2 focus:text-forest-900">
            Skip to content
          </a>
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
