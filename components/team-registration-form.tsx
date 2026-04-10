"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase/client";
import { uploadTeamFile } from "@/lib/storage-upload";
import type { CaptainProfile, RosterPlayer, TeamStatus } from "@/lib/types";
import type { GameId } from "@/lib/games";
import { GAMES_BY_ID } from "@/lib/games";
import { postCaptainEmail } from "@/lib/client-notifications";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

type Draft = {
  firstName: string;
  lastName: string;
  faceitNickname: string;
  isAdult: boolean;
  studentFile: File | null;
  parentFile: File | null;
  existingStudentUrl?: string;
  existingParentUrl?: string;
};

function emptyDraft(): Draft {
  return {
    firstName: "",
    lastName: "",
    faceitNickname: "",
    isAdult: false,
    studentFile: null,
    parentFile: null,
  };
}

/** Všechny odkazy na dokumenty hráčů pro Discord (i při úpravě týmu, ne jen nové uploady). */
function collectRosterDocumentLinks(
  players: RosterPlayer[],
  prefix: string
): { label: string; url: string }[] {
  const out: { label: string; url: string }[] = [];
  players.forEach((p, i) => {
    if (p.studentCertUrl) {
      out.push({
        label: `${prefix} ${i + 1} · student`,
        url: p.studentCertUrl,
      });
    }
    if (!p.isAdult && p.parentConsentUrl) {
      out.push({
        label: `${prefix} ${i + 1} · souhlas rodiče`,
        url: p.parentConsentUrl,
      });
    }
  });
  return out;
}

function draftFromRoster(p: RosterPlayer): Draft {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    faceitNickname: p.faceitNickname,
    isAdult: p.isAdult,
    studentFile: null,
    parentFile: null,
    existingStudentUrl: p.studentCertUrl,
    existingParentUrl: p.parentConsentUrl,
  };
}

async function fetchElo(
  nickname: string,
  idToken: string
): Promise<number | null> {
  if (!nickname.trim()) return null;
  const res = await fetch(
    `/api/faceit/elo?nickname=${encodeURIComponent(nickname.trim())}`,
    { headers: { Authorization: `Bearer ${idToken}` } }
  );
  const j = await res.json();
  if (!j.ok) return null;
  return typeof j.elo === "number" ? j.elo : null;
}

export function TeamRegistrationForm({
  user,
  profile,
  gameId,
  onSaved,
}: {
  user: User;
  profile: CaptainProfile;
  gameId: GameId;
  /** Volitelně po úspěšném uložení (např. obnovit přehled na /dashboard/tymy). */
  onSaved?: () => void;
}) {
  const router = useRouter();
  const game = GAMES_BY_ID[gameId];
  const nickLabel = game.playerNickLabel;
  const usesFaceit = game.usesFaceitElo;
  const [teamId, setTeamId] = useState<string | null>(null);
  const [status, setStatus] = useState<TeamStatus | null>(null);
  const [faceitHubUrl, setFaceitHubUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [teammates, setTeammates] = useState<Draft[]>(() => [
    emptyDraft(),
    emptyDraft(),
    emptyDraft(),
    emptyDraft(),
  ]);
  const [subs, setSubs] = useState<Draft[]>([]);
  const [coachFirst, setCoachFirst] = useState("");
  const [coachLast, setCoachLast] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const loadTeam = useCallback(async () => {
    const db = getFirebaseDb();
    const q1 = query(
      collection(db, "teams"),
      where("captainId", "==", user.uid),
      where("gameId", "==", gameId)
    );
    let snap = await getDocs(q1);
    let d: QueryDocumentSnapshot<DocumentData> | null = snap.docs[0] ?? null;
    if (!d && gameId === "cs2") {
      const qLegacy = query(
        collection(db, "teams"),
        where("captainId", "==", user.uid),
        limit(25)
      );
      const legacySnap = await getDocs(qLegacy);
      const legacy = legacySnap.docs.find((docSnap) => {
        const g = docSnap.data().gameId as string | undefined;
        return g === undefined || g === null || g === "";
      });
      d = legacy ?? null;
    }
    if (!d) {
      setTeamId(null);
      setStatus(null);
      setLoadingTeam(false);
      return;
    }
    const data = d.data() as {
      status: TeamStatus;
      faceitHubUrl?: string;
      rejectionReason?: string;
      teamName?: string;
      schoolName?: string;
      teammates?: RosterPlayer[];
      substitutes?: RosterPlayer[];
      coach?: { firstName?: string; lastName?: string };
    };
    setTeamId(d.id);
    setStatus(data.status);
    setFaceitHubUrl(data.faceitHubUrl ?? null);
    setRejectionReason(data.rejectionReason ?? null);
    setTeamName(data.teamName ?? "");
    setSchoolName(data.schoolName ?? "");
    if (data.teammates?.length === 4) {
      setTeammates(data.teammates.map(draftFromRoster));
    }
    setSubs(
      data.substitutes?.length
        ? data.substitutes.map(draftFromRoster)
        : []
    );
    setCoachFirst(data.coach?.firstName ?? "");
    setCoachLast(data.coach?.lastName ?? "");
    setLoadingTeam(false);
  }, [user.uid, gameId]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  function setTeammate(i: number, patch: Partial<Draft>) {
    setTeammates((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t))
    );
  }

  function setSub(i: number, patch: Partial<Draft>) {
    setSubs((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t))
    );
  }

  async function buildRoster(
    tid: string,
    list: Draft[],
    prefix: string,
    idToken: string,
    nickLabel: string,
    usesFaceit: boolean
  ): Promise<{ players: RosterPlayer[]; storageMeta: { path: string; uploadedAt: number }[]; links: { label: string; url: string }[] }> {
    const storageMeta: { path: string; uploadedAt: number }[] = [];
    const links: { label: string; url: string }[] = [];
    const players: RosterPlayer[] = [];

    for (let i = 0; i < list.length; i++) {
      const d = list[i]!;
      if (!d.firstName.trim() || !d.lastName.trim() || !d.faceitNickname.trim()) {
        throw new Error(
          `Vyplň jméno, příjmení a ${nickLabel.toLowerCase()} u hráče ${prefix} ${i + 1}.`
        );
      }
      let studentCertUrl = "";
      if (d.studentFile) {
        const up = await uploadTeamFile(
          tid,
          `${prefix}${i}-student`,
          d.studentFile
        );
        studentCertUrl = up.url;
        storageMeta.push({ path: up.path, uploadedAt: up.uploadedAt });
        links.push({
          label: `${prefix} ${i + 1} student`,
          url: up.url,
        });
      } else if (d.existingStudentUrl) {
        studentCertUrl = d.existingStudentUrl;
      }

      let parentConsentUrl: string | undefined;
      if (!d.isAdult) {
        if (d.parentFile) {
          const up = await uploadTeamFile(
            tid,
            `${prefix}${i}-parent`,
            d.parentFile
          );
          parentConsentUrl = up.url;
          storageMeta.push({ path: up.path, uploadedAt: up.uploadedAt });
          links.push({
            label: `${prefix} ${i + 1} souhlas`,
            url: up.url,
          });
        } else if (d.existingParentUrl) {
          parentConsentUrl = d.existingParentUrl;
        }
      }

      const elo = usesFaceit
        ? await fetchElo(d.faceitNickname, idToken)
        : null;
      players.push({
        firstName: d.firstName.trim(),
        lastName: d.lastName.trim(),
        faceitNickname: d.faceitNickname.trim(),
        isAdult: d.isAdult,
        studentCertUrl: studentCertUrl || undefined,
        parentConsentUrl,
        faceitElo: elo,
      });
    }
    return { players, storageMeta, links };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!profile.profileComplete) {
      setError("Nejdřív dokonči profil kapitána.");
      router.push("/dashboard/profil");
      return;
    }

    if (status === "approved") return;

    const isNewTeam = !teamId;

    if (!teamName.trim() || !schoolName.trim()) {
      setError("Vyplň název týmu a školu.");
      return;
    }
    if (subs.length > 2) {
      setError("Maximálně 2 náhradníci.");
      return;
    }
    if (!coachFirst.trim() || !coachLast.trim()) {
      setError("Vyplň jméno a příjmení trenéra.");
      return;
    }

    for (let i = 0; i < 4; i++) {
      const d = teammates[i]!;
      if (isNewTeam && !d.studentFile) {
        setError(`Nahraj potvrzení studenta pro hráče ${i + 1}.`);
        return;
      }
      if (isNewTeam && !d.isAdult && !d.parentFile) {
        setError(`Nahraj souhlas rodiče pro nezletilého hráče ${i + 1}.`);
        return;
      }
    }
    for (let i = 0; i < subs.length; i++) {
      const d = subs[i]!;
      if (isNewTeam && !d.studentFile) {
        setError(`Nahraj potvrzení studenta pro náhradníka ${i + 1}.`);
        return;
      }
      if (isNewTeam && !d.isAdult && !d.parentFile) {
        setError(`Nahraj souhlas rodiče pro nezletilého náhradníka ${i + 1}.`);
        return;
      }
    }

    setPending(true);
    try {
      const idToken = await user.getIdToken();
      const db = getFirebaseDb();
      const tid = teamId ?? doc(collection(db, "teams")).id;
      const isNew = isNewTeam;

      if (isNew) {
        await setDoc(doc(db, "teams", tid), {
          captainId: user.uid,
          gameId,
          captainEmail: user.email ?? "",
          captainDiscord: profile.discordUsername ?? "",
          teamName: teamName.trim(),
          schoolName: schoolName.trim(),
          status: "pending",
          teammates: [],
          substitutes: [],
          coach: { firstName: "", lastName: "" },
          storageMeta: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setTeamId(tid);
      }

      const tRoster = await buildRoster(
        tid,
        teammates,
        "hrac",
        idToken,
        nickLabel,
        usesFaceit
      );
      const sRoster = await buildRoster(
        tid,
        subs,
        "nahradnik",
        idToken,
        nickLabel,
        usesFaceit
      );

      for (const p of tRoster.players) {
        if (!p.studentCertUrl) {
          throw new Error("U každého hráče musí být nahrané potvrzení studenta.");
        }
        if (!p.isAdult && !p.parentConsentUrl) {
          throw new Error("U nezletilých chybí souhlas rodiče.");
        }
      }
      for (const p of sRoster.players) {
        if (!p.studentCertUrl) {
          throw new Error("U každého náhradníka musí být potvrzení studenta.");
        }
        if (!p.isAdult && !p.parentConsentUrl) {
          throw new Error("U nezletilých náhradníků chybí souhlas rodiče.");
        }
      }

      const curSnap = await getDoc(doc(db, "teams", tid));
      const existingMeta =
        (curSnap.data()?.storageMeta as { path: string; uploadedAt: number }[]) ??
        [];
      const storageMeta = [
        ...existingMeta,
        ...tRoster.storageMeta,
        ...sRoster.storageMeta,
      ];

      await updateDoc(doc(db, "teams", tid), {
        gameId,
        teamName: teamName.trim(),
        schoolName: schoolName.trim(),
        teammates: tRoster.players,
        substitutes: sRoster.players,
        coach: {
          firstName: coachFirst.trim(),
          lastName: coachLast.trim(),
        },
        captainDiscord: profile.discordUsername ?? "",
        captainEmail: user.email ?? "",
        storageMeta,
        updatedAt: serverTimestamp(),
      });

      const eloSuffix = (p: RosterPlayer) =>
        usesFaceit ? ` · ELO: ${p.faceitElo ?? "?"}` : "";
      const playerSummary = [
        ...tRoster.players.map(
          (p, i) =>
            `${i + 1}. ${p.firstName} ${p.lastName} (${p.faceitNickname})${eloSuffix(p)}`
        ),
        ...sRoster.players.map(
          (p, i) =>
            `N${i + 1}. ${p.firstName} ${p.lastName} (${p.faceitNickname})${eloSuffix(p)}`
        ),
        `Trenér: ${coachFirst.trim()} ${coachLast.trim()}`,
      ].join("\n");

      const docLinks = [
        ...collectRosterDocumentLinks(tRoster.players, "Hráč"),
        ...collectRosterDocumentLinks(sRoster.players, "Náhradník"),
      ];

      await fetch("/api/notifications/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title: isNew
            ? `Přihlášení týmu · ${game.shortLabel}`
            : `Úprava soupisky · ${game.shortLabel}`,
          teamName: teamName.trim(),
          schoolName: schoolName.trim(),
          captainDiscord: profile.discordUsername ?? "",
          captainEmail: user.email ?? "",
          playerSummary,
          documentLinks: docLinks,
          event: isNew ? "team_created" : "roster_updated",
          gameLabel: game.label,
          teamId: tid,
        }),
      }).catch(() => {});

      const mail = await postCaptainEmail(idToken, {
        kind: "team_submitted",
        teamName: teamName.trim(),
        schoolName: schoolName.trim(),
        gameLabel: game.label,
      });
      if (!mail.ok) {
        console.warn("[captain-email] team_submitted:", mail.error);
      }

      setStatus("pending");
      await loadTeam();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Odeslání selhalo.");
    } finally {
      setPending(false);
    }
  }

  if (loadingTeam) {
    return (
      <p className="py-20 text-center text-slate-500">Načítám tým…</p>
    );
  }

  async function openFaceitHubWithNotify() {
    if (!faceitHubUrl || !teamId) return;
    try {
      const token = await user.getIdToken();
      await fetch("/api/notifications/faceit-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId }),
      });
    } catch {
      /* webhook je best-effort */
    }
    window.open(faceitHubUrl, "_blank", "noopener,noreferrer");
  }

  if (status === "approved") {
    return (
      <GlassCard className="mx-auto max-w-lg">
        <h2 className="font-[family-name:var(--font-bebas)] text-3xl text-[#39FF14]">
          Tým schválen · {game.shortLabel}
        </h2>
        {usesFaceit && faceitHubUrl ? (
          <>
            <p className="mt-2 text-slate-400">
              Přístup do Faceit kvalifikace je odemčen.
            </p>
            <GlowButton
              type="button"
              className="mt-6"
              onClick={() => void openFaceitHubWithNotify()}
            >
              Otevřít Faceit hub
            </GlowButton>
          </>
        ) : (
          <p className="mt-2 text-slate-400">
            {usesFaceit
              ? "Administrátoři doplní odkaz na Faceit hub — sleduj Discord a e-mail."
              : "Další kroky k soutěži v této hře najdeš na oficiálním Discordu turnaje."}
          </p>
        )}
      </GlassCard>
    );
  }

  if (status === "rejected") {
    return (
      <GlassCard className="mx-auto max-w-lg border-red-500/30">
        <h2 className="font-[family-name:var(--font-bebas)] text-3xl text-red-400">
          Žádost zamítnuta
        </h2>
        {rejectionReason ? (
          <p className="mt-2 text-slate-300">{rejectionReason}</p>
        ) : null}
        <p className="mt-4 text-sm text-slate-500">
          Pro opravu kontaktuj administrátory na Discordu.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="rounded-xl border border-[#39FF14]/25 bg-[#39FF14]/5 px-4 py-3 text-sm text-slate-300">
          <p className="font-semibold text-[#39FF14]">{game.label}</p>
          <p className="mt-1 text-xs text-slate-400">
            Soupiska 4 hráčů + až 2 náhradníci + trenér. Přesný formát zápasů a
            počty slotů může upřesnit organizátor na Discordu.
          </p>
          <p className="mt-2 text-xs text-slate-500">{game.playerNickHint}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label>Název týmu</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label>Název školy</label>
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
            4 hráči v sestavě
          </h3>
          <div className="mt-4 space-y-6">
            {teammates.map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#39FF14]">
                  Hráč {i + 1}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label>Jméno</label>
                    <input
                      value={t.firstName}
                      onChange={(e) =>
                        setTeammate(i, { firstName: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label>Příjmení</label>
                    <input
                      value={t.lastName}
                      onChange={(e) =>
                        setTeammate(i, { lastName: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label>{nickLabel}</label>
                    <input
                      value={t.faceitNickname}
                      onChange={(e) =>
                        setTeammate(i, { faceitNickname: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.isAdult}
                    onChange={(e) =>
                      setTeammate(i, { isAdult: e.target.checked })
                    }
                  />
                  <span>18+</span>
                </label>
                <div className="mt-3">
                  <label>Potvrzení studenta</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={(e) =>
                      setTeammate(i, {
                        studentFile: e.target.files?.[0] ?? null,
                      })
                    }
                    className="mt-1 border-0 bg-transparent p-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#39FF14]/20 file:px-3 file:py-2 file:text-[#39FF14]"
                  />
                </div>
                {!t.isAdult ? (
                  <div className="mt-2">
                    <label>Souhlas zákonného zástupce</label>
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      onChange={(e) =>
                        setTeammate(i, {
                          parentFile: e.target.files?.[0] ?? null,
                        })
                      }
                      className="mt-1 border-0 bg-transparent p-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#39FF14]/20 file:px-3 file:py-2 file:text-[#39FF14]"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
              Náhradníci (max. 2)
            </h3>
            <GlowButton
              type="button"
              variant="ghost"
              className="!py-1 !text-xs"
              disabled={subs.length >= 2}
              onClick={() => setSubs((s) => [...s, emptyDraft()])}
            >
              Přidat náhradníka
            </GlowButton>
            {subs.length > 0 ? (
              <GlowButton
                type="button"
                variant="ghost"
                className="!py-1 !text-xs"
                onClick={() => setSubs((s) => s.slice(0, -1))}
              >
                Odebrat posledního
              </GlowButton>
            ) : null}
          </div>
          <div className="mt-4 space-y-6">
            {subs.map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Náhradník {i + 1}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label>Jméno</label>
                    <input
                      value={t.firstName}
                      onChange={(e) =>
                        setSub(i, { firstName: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label>Příjmení</label>
                    <input
                      value={t.lastName}
                      onChange={(e) => setSub(i, { lastName: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label>{nickLabel}</label>
                    <input
                      value={t.faceitNickname}
                      onChange={(e) =>
                        setSub(i, { faceitNickname: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.isAdult}
                    onChange={(e) => setSub(i, { isAdult: e.target.checked })}
                  />
                  <span>18+</span>
                </label>
                <div className="mt-3">
                  <label>Potvrzení studenta</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={(e) =>
                      setSub(i, { studentFile: e.target.files?.[0] ?? null })
                    }
                    className="mt-1 border-0 bg-transparent p-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#39FF14]/20 file:px-3 file:py-2 file:text-[#39FF14]"
                  />
                </div>
                {!t.isAdult ? (
                  <div className="mt-2">
                    <label>Souhlas zákonného zástupce</label>
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      onChange={(e) =>
                        setSub(i, { parentFile: e.target.files?.[0] ?? null })
                      }
                      className="mt-1 border-0 bg-transparent p-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#39FF14]/20 file:px-3 file:py-2 file:text-[#39FF14]"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
            Trenér
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label>Jméno</label>
              <input
                value={coachFirst}
                onChange={(e) => setCoachFirst(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label>Příjmení</label>
              <input
                value={coachLast}
                onChange={(e) => setCoachLast(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        {status === "pending" ? (
          <p className="text-sm text-amber-200">
            Tvůj tým čeká na schválení. Po změně soupisky znovu odešli formulář —
            administrátoři dostanou upozornění na Discord.
          </p>
        ) : null}

        <GlowButton type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Odesílám…" : teamId ? "Uložit soupisku" : "Registrovat tým"}
        </GlowButton>
      </form>
    </GlassCard>
  );
}
