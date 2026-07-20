import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createDocRest } from "@/lib/firebase/firestore-rest-admin";
import { notifyDiscordSupportTicket } from "@/lib/discord-webhook";
import {
  supportTicketAdminEmailHtml,
} from "@/lib/emails/support-notify";
import { getSitePublicUrl } from "@/lib/site-public-url";
import { SUPPORT_CATEGORIES } from "@/lib/support-data";
import type { SupportCategoryId } from "@/lib/support-data";

const MAX_MSG = 8000;
const MAX_SUBJ = 200;

function validEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export async function POST(request: Request) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Server nemá nakonfigurovaný přístup k databázi." },
      { status: 503 }
    );
  }

  let body: {
    email?: string;
    name?: string;
    categoryId?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const subjectRaw =
    typeof body.subject === "string" ? body.subject.trim().slice(0, MAX_SUBJ) : "";
  const subject = subjectRaw || "Dotaz z centra podpory";

  if (!validEmail(email)) {
    return NextResponse.json({ ok: false, error: "Zadej platný e-mail." }, { status: 400 });
  }
  if (!message.length || message.length > MAX_MSG) {
    return NextResponse.json(
      { ok: false, error: `Zpráva musí mít 1–${MAX_MSG} znaků.` },
      { status: 400 }
    );
  }

  let categoryId: SupportCategoryId | "" = "";
  const rawCat = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
  if (rawCat && SUPPORT_CATEGORIES.some((c) => c.id === rawCat)) {
    categoryId = rawCat as SupportCategoryId;
  }

  const now = new Date().toISOString();

  const { id: ticketId } = await createDocRest("support_tickets", {
    visitorEmail: email,
    visitorName: name || null,
    categoryId: categoryId || null,
    subject,
    message,
    createdAt: now,
    status: "open",
    adminReply: null,
    repliedAt: null,
    repliedByEmail: null,
  });

  const base = getSitePublicUrl(request);
  const adminUrl = `${base}/admin/podpora`;
  const categoryLabel = categoryId
    ? SUPPORT_CATEGORIES.find((c) => c.id === categoryId)?.label
    : undefined;

  const alertTo =
    process.env.ADMIN_ALERT_EMAIL?.trim() ?? "jiri@esportarena.cz";

  void notifyDiscordSupportTicket({
    ticketId,
    visitorEmail: email,
    subject,
    messagePreview: message,
    categoryLabel,
  });

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  let mailSent = false;
  if (resendKey && resendFrom) {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: alertTo,
      subject: `[Podpora] ${subject} — ${email}`,
      html: supportTicketAdminEmailHtml({
        ticketId,
        visitorEmail: email,
        visitorName: name || undefined,
        categoryLabel,
        subject,
        message,
        adminUrl,
      }),
    });
    mailSent = !error;
    if (error) console.warn("[support/ticket] Resend:", error.message);
  }

  return NextResponse.json({ ok: true, ticketId, mailSent });
}
