"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { uploadUserFile } from "@/lib/storage-upload";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";
import Link from "next/link";

export default function DashboardProfilPage() {
  const { user, profile, refreshProfile, firebaseReady } = useAuth();
  const [phone, setPhone] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [faceitNickname, setFaceitNickname] = useState("");
  const [steamNickname, setSteamNickname] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [parentFile, setParentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone ?? "");
      setDiscordUsername(profile.discordUsername ?? "");
      setFaceitNickname(profile.faceitNickname ?? "");
      setSteamNickname(profile.steamNickname ?? "");
      setIsAdult(Boolean(profile.isAdult));
    }
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user || !firebaseReady) return;

    if (
      !phone.trim() ||
      !discordUsername.trim() ||
      !faceitNickname.trim() ||
      !steamNickname.trim()
    ) {
      setError("Vyplň všechny kontaktní údaje.");
      return;
    }
    if (!isAdult && !parentFile && !profile?.parentConsentUrl) {
      setError("Nezletilí musí nahrát souhlas zákonného zástupce.");
      return;
    }
    if (!studentFile && !profile?.studentCertUrl) {
      setError("Nahraj potvrzení studenta (ISIC / Bakaláři / jiný doklad).");
      return;
    }

    setPending(true);
    try {
      const db = getFirebaseDb();
      const uid = user.uid;
      let studentCertUrl = profile?.studentCertUrl;
      let parentConsentUrl = profile?.parentConsentUrl;

      if (studentFile) {
        const up = await uploadUserFile(uid, "student-cert", studentFile);
        studentCertUrl = up.url;
      }
      if (!isAdult && parentFile) {
        const up = await uploadUserFile(uid, "parent-consent", parentFile);
        parentConsentUrl = up.url;
      }

      const profileComplete = Boolean(
        studentCertUrl && (isAdult || parentConsentUrl)
      );

      await updateDoc(doc(db, "users", uid), {
        phone: phone.trim(),
        discordUsername: discordUsername.trim(),
        faceitNickname: faceitNickname.trim(),
        steamNickname: steamNickname.trim(),
        isAdult,
        studentCertUrl,
        parentConsentUrl: isAdult ? null : parentConsentUrl,
        profileComplete,
        updatedAt: serverTimestamp(),
      });

      const token = await user.getIdToken();
      await fetch("/api/notifications/captain-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kind: "profile_update" }),
      }).catch(() => {});
      setSentEmail(true);
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uložení selhalo.");
    } finally {
      setPending(false);
    }
  }

  if (!user) {
    return null;
  }

  if (!isFirebaseConfigured()) {
    return (
      <p className="p-10 text-center text-slate-500">
        Nakonfiguruj Firebase v .env.local.
      </p>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-xl px-4 py-10 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white">
        Profil kapitána
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Tyto údaje použijeme pro komunikaci a ověření. Oficiální kanál zůstává{" "}
        <strong className="text-[#39FF14]">Discord</strong>.
      </p>

      <GlassCard className="mt-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label>E-mail</label>
            <input
              value={user.email ?? ""}
              disabled
              className="mt-1 opacity-60"
            />
          </div>
          <div>
            <label htmlFor="phone">Telefon</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="discord">Discord uživatelské jméno</label>
            <input
              id="discord"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              className="mt-1"
              placeholder="např. jmeno#1234 nebo @handle"
              required
            />
          </div>
          <div>
            <label htmlFor="faceit">Faceit přezdívka</label>
            <input
              id="faceit"
              value={faceitNickname}
              onChange={(e) => setFaceitNickname(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="steam">Steam přezdívka</label>
            <input
              id="steam"
              value={steamNickname}
              onChange={(e) => setSteamNickname(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAdult}
              onChange={(e) => setIsAdult(e.target.checked)}
            />
            <span>Je mi 18+</span>
          </label>
          <div>
            <label htmlFor="student">Potvrzení studenta (PDF / JPG)</label>
            <input
              id="student"
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={(e) => setStudentFile(e.target.files?.[0] ?? null)}
              className="mt-1 border-0 bg-transparent p-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#39FF14]/20 file:px-3 file:py-2 file:text-[#39FF14]"
            />
            {profile?.studentCertUrl ? (
              <p className="mt-1 text-xs text-slate-500">
                Soubor už je nahraný. Nahraj nový pro přepsání.
              </p>
            ) : null}
          </div>
          {!isAdult ? (
            <div>
              <label htmlFor="parent">
                Souhlas zákonného zástupce (PDF / JPG)
              </label>
              <input
                id="parent"
                type="file"
                accept="image/*,.pdf,application/pdf"
                onChange={(e) => setParentFile(e.target.files?.[0] ?? null)}
                className="mt-1 border-0 bg-transparent p-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#39FF14]/20 file:px-3 file:py-2 file:text-[#39FF14]"
              />
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {sentEmail ? (
            <p className="text-sm text-[#39FF14]">
              Profil uložen. E-mail odeslán.
            </p>
          ) : null}
          <GlowButton type="submit" disabled={pending} className="w-full">
            {pending ? "Ukládám…" : "Uložit profil"}
          </GlowButton>
        </form>
      </GlassCard>

      {profile?.profileComplete ? (
        <p className="mt-8 text-center text-sm text-slate-400">
          <Link
            href="/dashboard/tym/registrace"
            className="text-[#39FF14] hover:underline"
          >
            Pokračovat na registraci týmu →
          </Link>
        </p>
      ) : (
        <p className="mt-8 text-center text-sm text-slate-500">
          Po dokončení profilu můžeš registrovat tým.
        </p>
      )}
    </motion.main>
  );
}
