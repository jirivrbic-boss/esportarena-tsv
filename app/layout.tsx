import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/app-chrome";
import { FirebaseNotice } from "@/components/firebase-notice";
import { FirebaseRuntimeInit } from "@/components/firebase-runtime-init";
import { readFirebasePublicEnvFromProcess } from "@/lib/firebase/config";
import { publicFotky } from "@/lib/public-assets";

const tournamentLogo = publicFotky("tournament logo.png");

export const metadata: Metadata = {
  title: "ESPORTARENA TSV · Sezóna 4 | Studentský turnaj",
  description:
    "Portál studentského turnaje ESPORTARENA TSV pro české a slovenské školy — Counter-Strike 2, League of Legends, Brawl Stars a EA SPORTS FC 26. Pravidla podle her, registrace kapitánů a týmů, Faceit kvalifikace u CS2 — EsportArena Plzeň.",
  icons: {
    icon: [{ url: tournamentLogo, type: "image/png" }],
    apple: [{ url: tournamentLogo, type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const firebasePublic = readFirebasePublicEnvFromProcess();

  return (
    <html lang="cs" className="h-full antialiased" data-scroll-behavior="smooth">
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
