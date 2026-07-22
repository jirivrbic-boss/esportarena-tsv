import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/app-chrome";
import { FirebaseNotice } from "@/components/firebase-notice";
import { FirebaseRuntimeInit } from "@/components/firebase-runtime-init";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { readFirebasePublicEnvFromProcess } from "@/lib/firebase/config";
import { publicFotky } from "@/lib/public-assets";
import {
  SITE_BRAND,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
  absoluteUrl,
  getSiteOrigin,
} from "@/lib/site-seo";

const tournamentLogo = publicFotky("tournament logo.png");
const siteOrigin = getSiteOrigin();
const ogImage = absoluteUrl(tournamentLogo);

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: `%s | ${SITE_BRAND}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  applicationName: SITE_BRAND,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: "EsportArena Plzeň", url: absoluteUrl("/o-nas") }],
  creator: "EsportArena Plzeň",
  publisher: "EsportArena Plzeň",
  category: "sports",
  alternates: {
    canonical: absoluteUrl("/"),
    languages: {
      "cs-CZ": absoluteUrl("/"),
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: absoluteUrl("/"),
    siteName: SITE_BRAND,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [
      {
        url: ogImage,
        width: 512,
        height: 512,
        alt: `${SITE_BRAND} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const firebasePublic = readFirebasePublicEnvFromProcess();

  return (
    <html lang="cs" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-dvh min-w-0 flex-col bg-[#050505] text-white max-lg:overflow-x-clip">
        <SeoJsonLd />
        <FirebaseRuntimeInit config={firebasePublic} />
        <Providers>
          <div className="flex flex-1 flex-col">
            <FirebaseNotice />
            <AppChrome>{children}</AppChrome>
          </div>
        </Providers>
      </body>
    </html>
  );
}
