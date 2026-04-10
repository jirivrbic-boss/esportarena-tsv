"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { RulesBody } from "@/components/rules-body";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { CMS_DEFAULTS, type PravidlaCms, type RuleSection } from "@/lib/cms-defaults";

export default function DashboardPravidlaPage() {
  const [sections, setSections] = useState<RuleSection[]>(
    (CMS_DEFAULTS.pravidla as PravidlaCms).sections
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    void getDoc(doc(getFirebaseDb(), "page_content", "pravidla")).then((snap) => {
      const data = snap.data() as { sections?: RuleSection[] } | undefined;
      if (data?.sections && data.sections.length > 0) {
        setSections(data.sections);
      }
    });
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Pravidla turnaje
      </h1>
      <p className="mt-3 text-slate-400">
        Stručný oficiální rámec pro CS2 část ESPORTARENA TSV — Sezóna 4. Detailní
        rozvrh a případné výjimky vždy na{" "}
        <strong className="text-[#39FF14]">Discordu</strong>.
      </p>
      <RulesBody sections={sections} />
    </motion.main>
  );
}
