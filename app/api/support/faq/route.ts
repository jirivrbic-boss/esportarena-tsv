import { NextResponse } from "next/server";
import { listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";
import { mergeSupportArticles } from "@/lib/support-merge-articles";
import { rowToSupportArticle, type SupportFaqRow } from "@/lib/support-firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  let extras: SupportFaqRow[] = [];
  try {
    const rows = await listCollectionDocsRest("support_faq_items", 500);
    for (const row of rows) {
      const a = rowToSupportArticle(row as Record<string, unknown> & { id: string });
      if (a) extras.push(a);
    }
  } catch {
    extras = [];
  }

  const articles = mergeSupportArticles(extras);
  return NextResponse.json({ ok: true, articles });
}
