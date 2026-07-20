import { Resend } from "resend";
import type { AnnouncementCategory } from "@/lib/announcements";
import { ANNOUNCEMENT_CATEGORY_LABEL } from "@/lib/announcements";
import { resolveAnnouncementRecipientEmails } from "@/lib/announcement-recipients";
import { announcementNotifyEmailHtml } from "@/lib/emails/announcement-templates";

const BATCH_SIZE = 50;

export type AnnouncementEmailResult = {
  attempted: number;
  sent: number;
  failed: number;
  skippedNoResend: boolean;
  error?: string;
};

export async function notifyCaptainsAboutAnnouncement(input: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  authorName: string;
  publicUrl: string;
}): Promise<AnnouncementEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!key || !from) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skippedNoResend: true,
      error: "Resend není nakonfigurováno (RESEND_API_KEY / RESEND_FROM).",
    };
  }

  let recipients: string[];
  try {
    recipients = await resolveAnnouncementRecipientEmails(input.category);
  } catch (e) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skippedNoResend: false,
      error: e instanceof Error ? e.message : "Nelze načíst příjemce.",
    };
  }

  if (recipients.length === 0) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skippedNoResend: false,
    };
  }

  const html = announcementNotifyEmailHtml(input);
  const subject = `Oznámení · ${ANNOUNCEMENT_CATEGORY_LABEL[input.category]} · ${input.title}`.slice(
    0,
    180
  );
  const resend = new Resend(key);

  let sent = 0;
  let failed = 0;
  let lastError: string | undefined;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const payloads = chunk.map((to) => ({
      from,
      to,
      subject,
      html,
    }));

    try {
      const { data, error } = await resend.batch.send(payloads);
      if (error) {
        failed += chunk.length;
        lastError = error.message;
        continue;
      }
      const ids = data?.data ?? [];
      if (ids.length > 0) {
        sent += ids.length;
        if (ids.length < chunk.length) failed += chunk.length - ids.length;
      } else {
        // starší tvar odpovědi / prázdný detail — bereme chunk jako odeslaný
        sent += chunk.length;
      }
    } catch (e) {
      failed += chunk.length;
      lastError = e instanceof Error ? e.message : "Batch send selhal.";
    }
  }

  return {
    attempted: recipients.length,
    sent,
    failed,
    skippedNoResend: false,
    error: lastError,
  };
}
