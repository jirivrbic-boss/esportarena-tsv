import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDocRest, upsertDocRest } from "@/lib/firebase/firestore-rest-admin";
import { supportTicketReplyUserEmailHtml } from "@/lib/emails/support-notify";
import { verifyAdminBearer } from "@/lib/server-auth";
import { rowToTicket } from "@/lib/support-firestore";
import { reportSiteAction } from "@/lib/discord-webhook";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Chybí ID." }, { status: 400 });
  }

  let body: { adminReply?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const adminReply =
    typeof body.adminReply === "string" ? body.adminReply.trim() : "";
  if (!adminReply) {
    return NextResponse.json({ ok: false, error: "Vyplň text odpovědi." }, { status: 400 });
  }

  const raw = await getDocRest(`support_tickets/${id}`);
  if (!raw) {
    return NextResponse.json({ ok: false, error: "Ticket neexistuje." }, { status: 404 });
  }

  const ticket = rowToTicket(raw as Record<string, unknown> & { id: string });
  if (!ticket) {
    return NextResponse.json({ ok: false, error: "Neplatná data ticketu." }, { status: 500 });
  }

  const prevReply = ticket.adminReply?.trim() ?? "";
  const now = new Date().toISOString();
  const skippedEmail = prevReply.length > 0;

  try {
    await upsertDocRest(`support_tickets/${id}`, {
      adminReply,
      repliedAt: now,
      repliedByEmail: auth.user.email,
      status: "answered",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Uložení selhalo";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  let mailSent = false;
  if (key && from && !skippedEmail) {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to: ticket.visitorEmail,
      subject: "Odpověď na váš dotaz — ESPORTARENA TSV",
      html: supportTicketReplyUserEmailHtml({ adminReply }),
    });
    mailSent = !error;
    if (error) console.warn("[support/reply] Resend:", error.message);
  }

  void reportSiteAction({
    content: "**Podpora** · odpověď na ticket",
    title: (ticket.subject ?? id).slice(0, 256),
    description: [
      `**Ticket ID:** \`${id}\``,
      `**Návštěvník:** ${ticket.visitorEmail}`,
      skippedEmail ? "**E-mail:** přeskočen (už odpovězeno)" : `**E-mail odeslán:** ${mailSent ? "ano" : "ne"}`,
      "",
      adminReply.slice(0, 900),
    ].join("\n"),
    fields: [
      ...(auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : []),
    ],
  });

  return NextResponse.json({ ok: true, mailSent, skippedEmail });
}
