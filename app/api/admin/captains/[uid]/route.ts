import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { adminAuth } from "@/lib/firebase/admin";
import {
  banReasonLabel,
  bannedEmailDocPath,
  isValidBanReasonId,
  normalizeBanEmail,
} from "@/lib/captain-ban";
import {
  deleteDocRest,
  getDocRest,
  listCollectionDocsRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";
import { purgeCaptainAccount } from "@/lib/purge-captain-account";
import type { GameId } from "@/lib/games";
import { reportSiteAction } from "@/lib/discord-webhook";

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

async function patchTeamsForCaptain(
  captainId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const teams = await listCollectionDocsRest("teams", 500);
  const mine = teams.filter((t) => String(t.captainId) === captainId);
  const ts = new Date().toISOString();
  await Promise.all(
    mine.map((t) =>
      upsertDocRest(`teams/${t.id}`, { ...patch, updatedAt: ts })
    )
  );
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ uid: string }> }
) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { uid } = await ctx.params;
  if (!uid) {
    return NextResponse.json({ ok: false, error: "Chybí UID." }, { status: 400 });
  }

  try {
    const profile = await getDocRest(`users/${uid}`);
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "Profil kapitána neexistuje." },
        { status: 404 }
      );
    }

    let authSummary: {
      email: string | undefined;
      emailVerified: boolean;
      disabled: boolean;
    } | null = null;
    try {
      const u = await adminAuth().getUser(uid);
      authSummary = {
        email: u.email,
        emailVerified: Boolean(u.emailVerified),
        disabled: Boolean(u.disabled),
      };
    } catch {
      authSummary = null;
    }

    const teams = (await listCollectionDocsRest("teams", 500))
      .filter((t) => String(t.captainId) === uid)
      .map((t) => ({
        id: t.id,
        teamName: String(t.teamName ?? ""),
        schoolName: String(t.schoolName ?? ""),
        status: String(t.status ?? ""),
        gameId: (t.gameId as GameId | undefined) ?? ("cs2" as GameId),
        captainEmail: String(t.captainEmail ?? ""),
        captainDiscord: String(t.captainDiscord ?? ""),
      }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName, "cs"));

    return NextResponse.json({
      ok: true,
      profile,
      auth: authSummary,
      teams,
      ban: {
        banned: Boolean(profile.banned) || Boolean(authSummary?.disabled),
        reason: String(profile.banReason ?? ""),
        reasonId: String(profile.banReasonId ?? ""),
        bannedAt: typeof profile.bannedAt === "string" ? profile.bannedAt : null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ uid: string }> }
) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { uid } = await ctx.params;
  if (!uid) {
    return NextResponse.json({ ok: false, error: "Chybí UID." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const existing = await getDocRest(`users/${uid}`);
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Profil kapitána neexistuje." },
      { status: 404 }
    );
  }

  if (body.ban === true || body.unban === true) {
    if (
      auth.user.email &&
      normalizeBanEmail(String(existing.email ?? "")) ===
        normalizeBanEmail(auth.user.email)
    ) {
      return NextResponse.json(
        { ok: false, error: "Nemůžeš zabanovat / odblokovat sám sebe." },
        { status: 400 }
      );
    }

    try {
      if (body.ban === true) {
        const reasonId = String(body.banReasonId ?? "").trim();
        const customReason =
          typeof body.banReasonCustom === "string"
            ? body.banReasonCustom.trim()
            : "";
        if (!isValidBanReasonId(reasonId)) {
          return NextResponse.json(
            { ok: false, error: "Vyber důvod banu." },
            { status: 400 }
          );
        }
        if (reasonId === "other" && customReason.length < 3) {
          return NextResponse.json(
            {
              ok: false,
              error: "U „Jiný důvod“ napiš konkrétní text (min. 3 znaky).",
            },
            { status: 400 }
          );
        }
        const reason = banReasonLabel(reasonId, customReason).slice(0, 500);
        let authEmail = "";
        try {
          authEmail = String((await adminAuth().getUser(uid)).email ?? "");
        } catch {
          authEmail = "";
        }
        const email = normalizeBanEmail(
          String(authEmail || existing.email || "")
        );
        if (!email) {
          return NextResponse.json(
            { ok: false, error: "Kapitán nemá e-mail — ban nelze nastavit." },
            { status: 400 }
          );
        }

        await adminAuth().updateUser(uid, { disabled: true });
        await adminAuth().revokeRefreshTokens(uid).catch(() => {});

        const bannedAt = new Date().toISOString();
        await upsertDocRest(bannedEmailDocPath(email), {
          email,
          reason,
          reasonId,
          uid,
          bannedAt,
          bannedBy: auth.user.email ?? null,
        });
        await upsertDocRest(`users/${uid}`, {
          banned: true,
          banReason: reason,
          banReasonId: reasonId,
          bannedAt,
          bannedBy: auth.user.email ?? null,
          updatedAt: bannedAt,
        });

        void reportSiteAction({
          content: "**Kapitán zabanován** · admin",
          title: (email || uid).slice(0, 256),
          description: [
            `**UID:** \`${uid}\``,
            `**Důvod:** ${reason}`,
          ].join("\n"),
          fields: [
            ...(auth.user.email
              ? [{ name: "Admin", value: auth.user.email, inline: true }]
              : []),
          ],
        });

        return NextResponse.json({
          ok: true,
          banned: true,
          banReason: reason,
        });
      }

      const email = normalizeBanEmail(String(existing.email ?? ""));
      try {
        await adminAuth().updateUser(uid, { disabled: false });
      } catch (e: unknown) {
        const code =
          typeof e === "object" && e !== null && "code" in e
            ? String((e as { code?: string }).code)
            : "";
        if (code !== "auth/user-not-found") throw e;
      }
      if (email) {
        await deleteDocRest(bannedEmailDocPath(email)).catch(() => false);
      }
      await upsertDocRest(`users/${uid}`, {
        banned: false,
        banReason: null,
        banReasonId: null,
        bannedAt: null,
        bannedBy: null,
        updatedAt: new Date().toISOString(),
      });

      void reportSiteAction({
        content: "**Kapitán odblokován** · admin",
        title: (email || uid).slice(0, 256),
        description: `**UID:** \`${uid}\``,
        fields: [
          ...(auth.user.email
            ? [{ name: "Admin", value: auth.user.email, inline: true }]
            : []),
        ],
      });

      return NextResponse.json({ ok: true, banned: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ban selhal.";
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  const newEmailRaw =
    typeof body.newEmail === "string" ? body.newEmail.trim() : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";
  const clearScheduledDeletion = body.clearScheduledDeletion === true;

  const str = (k: string) =>
    typeof body[k] === "string" ? (body[k] as string).trim() : undefined;
  const bool = (k: string) =>
    typeof body[k] === "boolean" ? (body[k] as boolean) : undefined;

  if (newPassword && newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, error: "Heslo musí mít alespoň 6 znaků." },
      { status: 400 }
    );
  }

  if (newEmailRaw && !isValidEmail(newEmailRaw)) {
    return NextResponse.json(
      { ok: false, error: "Neplatný formát e-mailu." },
      { status: 400 }
    );
  }

  try {
    const authUpdates: { email?: string; password?: string } = {};
    if (newEmailRaw) authUpdates.email = newEmailRaw;
    if (newPassword) authUpdates.password = newPassword;

    let finalEmail = String(existing.email ?? "");
    if (Object.keys(authUpdates).length > 0) {
      try {
        const rec = await adminAuth().updateUser(uid, authUpdates);
        finalEmail = rec.email ?? (newEmailRaw || finalEmail);
      } catch (e: unknown) {
        const code =
          typeof e === "object" && e !== null && "code" in e
            ? String((e as { code?: string }).code ?? "")
            : "";
        const msg =
          code === "auth/email-already-exists"
            ? "Tento e-mail už používá jiný účet."
            : e instanceof Error
              ? e.message
              : "Úprava účtu ve Firebase Auth selhala.";
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
      }
    }

    const firestorePatch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (newEmailRaw) {
      firestorePatch.email = finalEmail;
      if (existing.banned) {
        const oldEmail = normalizeBanEmail(String(existing.email ?? ""));
        const nextEmail = normalizeBanEmail(finalEmail);
        if (oldEmail && nextEmail && oldEmail !== nextEmail) {
          await deleteDocRest(bannedEmailDocPath(oldEmail)).catch(() => false);
          await upsertDocRest(bannedEmailDocPath(nextEmail), {
            email: nextEmail,
            reason: String(existing.banReason ?? "Ban"),
            reasonId: String(existing.banReasonId ?? "other"),
            uid,
            bannedAt: String(existing.bannedAt ?? new Date().toISOString()),
            bannedBy: existing.bannedBy ?? null,
          });
        }
      }
    }

    const firstName = str("firstName");
    const lastName = str("lastName");
    const phone = str("phone");
    const discordUsername = str("discordUsername");
    const faceitNickname = str("faceitNickname");
    const steamNickname = str("steamNickname");
    const riotId = str("riotId");
    const brawlPlayerTag = str("brawlPlayerTag");
    const eaAccount = str("eaAccount");
    const parentConsentUrl = str("parentConsentUrl");
    const studentCertUrl = str("studentCertUrl");

    if (firstName !== undefined) firestorePatch.firstName = firstName;
    if (lastName !== undefined) firestorePatch.lastName = lastName;
    if (phone !== undefined) firestorePatch.phone = phone;
    if (discordUsername !== undefined) firestorePatch.discordUsername = discordUsername;
    if (faceitNickname !== undefined) firestorePatch.faceitNickname = faceitNickname;
    if (steamNickname !== undefined) firestorePatch.steamNickname = steamNickname;
    if (riotId !== undefined) firestorePatch.riotId = riotId;
    if (brawlPlayerTag !== undefined) firestorePatch.brawlPlayerTag = brawlPlayerTag;
    if (eaAccount !== undefined) firestorePatch.eaAccount = eaAccount;

    const isAdult = bool("isAdult");
    if (isAdult !== undefined) firestorePatch.isAdult = isAdult;

    const profileComplete = bool("profileComplete");
    if (profileComplete !== undefined) {
      firestorePatch.profileComplete = profileComplete;
    }

    if (parentConsentUrl !== undefined) {
      firestorePatch.parentConsentUrl = parentConsentUrl || null;
    }
    if (studentCertUrl !== undefined) {
      firestorePatch.studentCertUrl = studentCertUrl || null;
    }

    if (clearScheduledDeletion) {
      firestorePatch.pendingDeletionExpiresAt = null;
      firestorePatch.deletionRecoveryTokenHash = null;
    }

    const keysToWrite = Object.keys(firestorePatch).filter(
      (k) => firestorePatch[k] !== undefined
    );
    if (keysToWrite.length > 0) {
      const payload: Record<string, unknown> = {};
      for (const k of keysToWrite) {
        payload[k] = firestorePatch[k];
      }
      await upsertDocRest(`users/${uid}`, payload);
    }

    if (newEmailRaw) {
      await patchTeamsForCaptain(uid, { captainEmail: finalEmail });
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "discordUsername") &&
      discordUsername !== undefined
    ) {
      await patchTeamsForCaptain(uid, {
        captainDiscord: discordUsername,
      });
    }

    const profile = await getDocRest(`users/${uid}`);
    let authSummary: {
      email: string | undefined;
      emailVerified: boolean;
      disabled: boolean;
    } | null = null;
    try {
      const u = await adminAuth().getUser(uid);
      authSummary = {
        email: u.email,
        emailVerified: Boolean(u.emailVerified),
        disabled: Boolean(u.disabled),
      };
    } catch {
      authSummary = null;
    }

    void reportSiteAction({
      content: "**Profil kapitána** · admin uložení",
      title: (finalEmail || uid).slice(0, 256),
      description: [
        `**UID:** \`${uid}\``,
        newEmailRaw ? `**Nový e-mail:** ${finalEmail}` : null,
        newPassword ? "**Heslo:** změněno" : null,
        clearScheduledDeletion ? "**Naplánované smazání:** zrušeno" : null,
      ]
        .filter(Boolean)
        .join("\n"),
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });

    return NextResponse.json({
      ok: true,
      profile,
      auth: authSummary,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ uid: string }> }
) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { uid } = await ctx.params;
  if (!uid) {
    return NextResponse.json({ ok: false, error: "Chybí UID." }, { status: 400 });
  }

  if (auth.user.uid === uid) {
    return NextResponse.json(
      { ok: false, error: "Nemůžeš smazat sám sebe." },
      { status: 400 }
    );
  }

  try {
    const profile = await getDocRest(`users/${uid}`);
    let authEmail = "";
    try {
      authEmail = String((await adminAuth().getUser(uid)).email ?? "");
    } catch {
      authEmail = "";
    }
    const email = normalizeBanEmail(
      String(profile?.email || authEmail || "")
    );
    const keepBan = Boolean(profile?.banned) && Boolean(email);

    await purgeCaptainAccount(uid);

    if (keepBan && email) {
      const existingBan = await getDocRest(bannedEmailDocPath(email));
      if (!existingBan) {
        await upsertDocRest(bannedEmailDocPath(email), {
          email,
          reason: String(profile?.banReason ?? "Ban (účet smazán)"),
          reasonId: String(profile?.banReasonId ?? "other"),
          uid,
          bannedAt: String(profile?.bannedAt ?? new Date().toISOString()),
          bannedBy: profile?.bannedBy ?? auth.user.email ?? null,
          accountDeleted: true,
        });
      } else {
        await upsertDocRest(bannedEmailDocPath(email), {
          accountDeleted: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    void reportSiteAction({
      content: "**Kapitán smazán** · admin DELETE",
      title: (email || uid).slice(0, 256),
      description: [
        `**UID:** \`${uid}\``,
        keepBan ? "**Ban e-mailu:** ponechán" : null,
      ]
        .filter(Boolean)
        .join("\n"),
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Smazání selhalo.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
