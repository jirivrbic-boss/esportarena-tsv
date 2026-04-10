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
    const res = await fetch(`${base}/api/cron/cleanup-storage`, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
    });
    const text = await res.text();
    console.log(
      "[cleanup-storage-cron]",
      res.status,
      text.slice(0, 500)
    );
    return {
      statusCode: res.ok ? 200 : 502,
      body: text,
    };
  } catch (e) {
    console.error("[cleanup-storage-cron]", e);
    return {
      statusCode: 500,
      body: e instanceof Error ? e.message : "error",
    };
  }
};
