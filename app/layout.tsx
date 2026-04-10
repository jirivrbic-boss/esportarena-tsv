import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FirebaseNotice } from "@/components/firebase-notice";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESPORTARENA TSV · Sezóna 4 | Studentský turnaj CS2",
  description:
    "Oficiální platforma studentského turnaje CS2. Registrace kapitánů, týmů, Faceit kvalifikace a síň slávy — EsportArena Plzeň.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${inter.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#050505] text-white">
        <Providers>
          <FirebaseNotice />
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
