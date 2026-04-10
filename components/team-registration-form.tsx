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
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase/client";
import { uploadTeamFile } from "@/lib/storage-upload";
import type { CaptainProfile, RosterPlayer, TeamStatus } from "@/lib/types";
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

async function fetchElo(nickname: string): Promise<number | null> {
  if (!nickname.trim()) return null;
  const res = await fetch(
    `/api/faceit/elo?nickname=${encodeURIComponent(nickname.trim())}`
  );
  const j = await res.json();
  if (!j.ok) return null;
  return typeof j.elo === "number" ? j.elo : null;
}

export function TeamRegistrationForm({
  user,
  profile,
}: {
  user: User;
  profile: CaptainProfile;
}) {
  const router = useRouter();
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
    const q = query(
      collection(db, "teams"),
      where("captainId", "==", user.uid),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      setTeamId(null);
      setStatus(null);
      setLoadingTeam(false);
      return;
    }
    const d = snap.docs[0]!;
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
  }, [user.uid]);

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
    prefix: string
  ): Promise<{ players: RosterPlayer[]; storageMeta: { path: string; uploadedAt: number }[]; links: { label: string; url: string }[] }> {
    const storageMeta: { path: string; uploadedAt: number }[] = [];
    const links: { label: string; url: string }[] = [];
    const players: RosterPlayer[] = [];

    for (let i = 0; i < list.length; i++) {
      const d = list[i]!;
      if (!d.firstName.trim() || !d.lastName.trim() || !d.faceitNickname.trim()) {
        throw new Error(`Vyplň jméno, příjmení a Faceit u hráče ${prefix} ${i + 1}.`);
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

      const elo = await fetchElo(d.faceitNickname);
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
      router.push("/profil");
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
      const db = getFirebaseDb();
      const tid = teamId ?? doc(collection(db, "teams")).id;
      const isNew = isNewTeam;

      if (isNew) {
        await setDoc(doc(db, "teams", tid), {
          captainId: user.uid,
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

      const tRoster = await buildRoster(tid, teammates, "hrac");
      const sRoster = await buildRoster(tid, subs, "nahradnik");

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

      const playerSummary = [
        ...tRoster.players.map(
          (p, i) =>
            `${i + 1}. ${p.firstName} ${p.lastName} (${p.faceitNickname}) ELO: ${p.faceitElo ?? "?"}`
        ),
        ...sRoster.players.map(
          (p, i) =>
            `N${i + 1}. ${p.firstName} ${p.lastName} (${p.faceitNickname}) ELO: ${p.faceitElo ?? "?"}`
        ),
        `Trenér: ${coachFirst.trim()} ${coachLast.trim()}`,
      ].join("\n");

      const docLinks = [...tRoster.links, ...sRoster.links];

      await fetch("/api/notifications/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: isNew ? "Nový tým" : "Aktualizace soupisky",
          teamName: teamName.trim(),
          schoolName: schoolName.trim(),
          captainDiscord: profile.discordUsername ?? "",
          captainEmail: user.email ?? "",
          playerSummary,
          documentLinks: docLinks,
          event: isNew ? "team_created" : "roster_updated",
        }),
      }).catch(() => {});

      const token = await user.getIdToken();
      await fetch("/api/notifications/captain-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind: "team_submitted",
          teamName: teamName.trim(),
          schoolName: schoolName.trim(),
        }),
      }).catch(() => {});

      setStatus("pending");
      await loadTeam();
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

  if (status === "approved" && faceitHubUrl) {
    return (
      <GlassCard className="mx-auto max-w-lg">
        <h2 className="font-[family-name:var(--font-bebas)] text-3xl text-[#39FF14]">
          Tým schválen
        </h2>
        <p className="mt-2 text-slate-400">
          Přístup do Faceit kvalifikace je odemčen.
        </p>
        <GlowButton href={faceitHubUrl} className="mt-6">
          Otevřít Faceit hub
        </GlowButton>
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
                    <label>Faceit přezdívka</label>
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
                    <label>Faceit přezdívka</label>
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
