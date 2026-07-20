import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { reportSiteAction } from "@/lib/discord-webhook";

type Body = {
  url?: string;
  label?: string;
};

function safeFilename(input: string) {
  const base = input.trim().toLowerCase().replace(/[^\w.-]+/g, "_");
  return base ? `${base}.bin` : "dokument.bin";
}

export async function POST(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "Chybí URL dokumentu." },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(url, { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "Dokument není dostupný nebo už byl smazán." },
        { status: upstream.status === 404 ? 404 : 502 }
      );
    }

    const bytes = await upstream.arrayBuffer();
    void reportSiteAction({
      content: "**Admin** · náhled dokumentu",
      title: (body.label ?? "Dokument").slice(0, 256),
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
        { name: "URL", value: url.slice(0, 500) },
      ],
    });
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${safeFilename(
          body.label ?? "dokument"
        )}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Stažení dokumentu selhalo." },
      { status: 500 }
    );
  }
}
