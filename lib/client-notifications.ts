/** Volání /api/notifications/captain-email z klienta; vrací chybu z API (Resend / auth). */
export async function postCaptainEmail(
  idToken: string,
  body: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const res = await fetch("/api/notifications/captain-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });
  let payload: { error?: string } = {};
  try {
    payload = (await res.json()) as { error?: string };
  } catch {
    /* */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: payload.error ?? `HTTP ${res.status}`,
      status: res.status,
    };
  }
  return { ok: true };
}
