import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { seedSeason4Rest } from "@/lib/season-seed";
import { reportSiteAction } from "@/lib/discord-webhook";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  if (id !== "s4" && id !== "sezona-4") {
    return NextResponse.json(
      { ok: false, error: "Zatím lze inicializovat jen Sezónu 4 (s4)." },
      { status: 400 }
    );
  }

  try {
    const result = await seedSeason4Rest();
    void reportSiteAction({
      content: "**Sezóna** · seed Sezóny 4",
      title: "Seed S4",
      description: `**Param:** \`${id}\``,
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Chyba serveru" },
      { status: 500 }
    );
  }
}
