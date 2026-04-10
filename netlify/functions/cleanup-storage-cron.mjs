/**
 * Plánovaná Netlify funkce — náhrada za Vercel Cron.
 * Zavolá produkční API úklidu (Firebase Admin běží v Next route handleru).
 */
export const handler = async () => {
  const base = (process.env.URL || process.env.DEPLOY_PRIME_URL || "").replace(
    /\/$/,
    ""
  );
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error(
      "[cleanup-storage-cron] Chybí URL nebo CRON_SECRET (nastav v Netlify → Environment variables)."
    );
    return { statusCode: 500, body: "Missing configuration" };
  }

  try {
    const headers = { Authorization: `Bearer ${secret}` };
    const storageRes = await fetch(`${base}/api/cron/cleanup-storage`, {
      method: "GET",
      headers,
    });
    const lfgRes = await fetch(`${base}/api/cron/cleanup-lfg`, {
      method: "GET",
      headers,
    });
    const sText = await storageRes.text();
    const lText = await lfgRes.text();
    console.log("[cron] storage", storageRes.status, sText.slice(0, 300));
    console.log("[cron] lfg", lfgRes.status, lText.slice(0, 300));
    const ok = storageRes.ok && lfgRes.ok;
    return {
      statusCode: ok ? 200 : 502,
      body: JSON.stringify({ storage: sText.slice(0, 200), lfg: lText.slice(0, 200) }),
    };
  } catch (e) {
    console.error("[cleanup-storage-cron]", e);
    return {
      statusCode: 500,
      body: e instanceof Error ? e.message : "error",
    };
  }
};
