import { adminAuth } from "@/lib/firebase/admin";
import { deleteDocRest, listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";

/**
 * Smaže jeden tým kapitána včetně registrací na turnajích (stejná logika jako captain-delete API).
 */
export async function purgeTeamDocAndRegistrations(teamId: string): Promise<void> {
  const tournaments = await listCollectionDocsRest("tournaments", 300);
  await Promise.all(
    tournaments.map((t) =>
      deleteDocRest(`tournaments/${t.id}/registrations/${teamId}`).catch(() => false)
    )
  );
  await deleteDocRest(`teams/${teamId}`);
}

/** Trvalé smazání všech dat kapitána ve Firestore + Firebase Auth (po vypršení lhůty). */
export async function purgeCaptainAccount(uid: string): Promise<void> {
  const teams = await listCollectionDocsRest("teams", 600);
  const mine = teams.filter((t) => String(t.captainId) === uid);
  for (const team of mine) {
    await purgeTeamDocAndRegistrations(team.id as string);
  }

  await deleteDocRest(`users/${uid}`).catch(() => {});

  await adminAuth().deleteUser(uid).catch((e: unknown) => {
    const code =
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      typeof (e as { code?: string }).code === "string"
        ? (e as { code: string }).code
        : "";
    if (code === "auth/user-not-found") return;
    throw e;
  });
}
