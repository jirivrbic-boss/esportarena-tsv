import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { sendTeamCustomEmail } from "@/lib/resend-team-status";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await ctx.params;
  let subject = "";
  let message = "";
  try {
    const body = await request.json();
    subject = typeof body.subject === "string" ? body.subject.trim() : "";
    message = typeof body.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  if (!subject || !message) {
    return NextResponse.json(
      { ok: false, error: "Vyplň předmět i text zprávy." },
      { status: 400 }
    );
  }

  try {
    const team = await getDocRest(`teams/${id}`);
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým nenalezen." }, { status: 404 });
    }
    const data = team as {
      teamName?: string;
      captainEmail?: string;
    };

    const captainEmail = (data.captainEmail ?? "").trim();
    if (!captainEmail) {
      return NextResponse.json(
        { ok: false, error: "Tým nemá uložený e-mail kapitána." },
        { status: 400 }
      );
    }

    const sent = await sendTeamCustomEmail(
      captainEmail,
      subject,
      message,
      data.teamName
    );
    if (!sent.ok) {
      return NextResponse.json(
        { ok: false, error: sent.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
