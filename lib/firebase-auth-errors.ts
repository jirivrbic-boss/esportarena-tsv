import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Tento e-mail už má založený účet.",
  "auth/invalid-credential": "Neplatný e-mail nebo heslo.",
  "auth/invalid-email": "Neplatný formát e-mailu.",
  "auth/missing-password": "Vyplň heslo.",
  "auth/too-many-requests":
    "Příliš mnoho pokusů. Zkus to prosím znovu za chvíli.",
  "auth/user-disabled":
    "Tento účet je zabanovaný — nelze se přihlásit. Kontaktuj podporu, pokud jde o omyl.",
  "auth/user-not-found": "Účet s tímto e-mailem neexistuje.",
  "auth/wrong-password": "Neplatný e-mail nebo heslo.",
  "auth/weak-password": "Heslo je příliš slabé — použij alespoň 6 znaků.",
  "auth/expired-action-code":
    "Odkaz pro obnovu hesla vypršel. Požádej o nový e-mail.",
  "auth/invalid-action-code":
    "Odkaz pro obnovu hesla je neplatný nebo už byl použit. Požádej o nový e-mail.",
  "auth/requires-recent-login":
    "Pro změnu hesla zadej znovu aktuální heslo.",
  "auth/network-request-failed":
    "Nepodařilo se spojit se serverem. Zkontroluj internet a zkus to znovu.",
};

export function toFriendlyAuthError(error: unknown, fallback: string): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? fallback;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
