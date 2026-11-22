import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Providers } from "@/components/Providers";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    template: `%s • ${BRAND_NAME}`,
  },
  description:
    "Handcrafted indoor water fountains from Bengal, designed for meditative calm, acoustic stillness, and mindful spaces.",
  applicationName: BRAND_NAME,
  keywords: [
    BRAND_NAME,
    "handcrafted fountains",
    "Bangladesh",
    "indoor water fountain",
    "artisanal stoneware",
  ],
  openGraph: {
    title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description:
      "Handcrafted indoor fountains, shaped in small batches for quiet, restorative spaces.",
    type: "website",
    siteName: BRAND_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fbf1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <a
              href="#main-content"
              className="sr-only z-[200] rounded bg-primary px-4 py-3 text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
