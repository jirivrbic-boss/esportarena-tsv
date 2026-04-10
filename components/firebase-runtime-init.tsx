"use client";

import { installFirebaseConfigFromServer } from "@/lib/firebase/config";

type PublicShape = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

/**
 * Předá Firebase web config ze serveru do klienta (Netlify/OpenNext někdy neinlinuje NEXT_PUBLIC_* do JS).
 * Musí být první uzel uvnitř <body> před Providers.
 */
export function FirebaseRuntimeInit({ config }: { config: PublicShape }) {
  installFirebaseConfigFromServer(config);
  return null;
}
