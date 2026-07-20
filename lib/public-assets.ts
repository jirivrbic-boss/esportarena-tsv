/** Statické soubory v `public/fotky`. */
export const PUBLIC_FOTKY_PREFIX = "/fotky";

/** Statické PDF a další soubory v `public/dokumenty`. */
export const PUBLIC_DOKUMENTY_PREFIX = "/dokumenty";

/** URL k souboru v `public/fotky` (správně zakóduje mezery a diakritiku). */
export function publicFotky(filename: string): string {
  const clean = filename.replace(/^\/+/, "");
  return `${PUBLIC_FOTKY_PREFIX}/${clean.split("/").map(encodeURIComponent).join("/")}`;
}

/** URL k souboru v `public/dokumenty`. */
export function publicDokument(filename: string): string {
  const clean = filename.replace(/^\/+/, "");
  return `${PUBLIC_DOKUMENTY_PREFIX}/${clean.split("/").map(encodeURIComponent).join("/")}`;
}
