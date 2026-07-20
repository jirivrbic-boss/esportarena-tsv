import { NextResponse } from "next/server";
import { reportSiteAction } from "@/lib/discord-webhook";

type Body = {
  content?: string;
  title?: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  url?: string;
};

/**
 * Klientský fire-and-forget report do Discord Reports
 * (např. nový LFG inzerát z prohlížeče).
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!content || !title) {
    return NextResponse.json(
      { ok: false, error: "Chybí content nebo title." },
      { status: 400 }
    );
  }

  void reportSiteAction({
    content,
    title,
    description:
      typeof body.description === "string" ? body.description : undefined,
    fields: Array.isArray(body.fields) ? body.fields : undefined,
    url: typeof body.url === "string" ? body.url : undefined,
  });

  return NextResponse.json({ ok: true });
}
