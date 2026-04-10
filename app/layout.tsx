import type { Metadata } from "next";
import { headers } from "next/headers";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/app-chrome";
import { FirebaseNotice } from "@/components/firebase-notice";
import { FirebaseRuntimeInit } from "@/components/firebase-runtime-init";
import { readFirebasePublicEnvFromProcess } from "@/lib/firebase/config";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await headers();
  const firebasePublic = readFirebasePublicEnvFromProcess();

  return (
    <html
      lang="cs"
      className={`${inter.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-[#050505] text-white">
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
