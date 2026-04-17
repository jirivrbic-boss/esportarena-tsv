import {
  CMS_DEFAULTS,
  type CmsSlug,
  type HomeCms,
  type OznameniCms,
  type PravidlaCms,
} from "@/lib/cms-defaults";

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>
): T {
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(patch)) {
    const v = patch[k];
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out as T;
}

export async function getPageContent(slug: CmsSlug): Promise<HomeCms | PravidlaCms | OznameniCms> {
  const defaults = CMS_DEFAULTS[slug];
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb().collection("page_content").doc(slug).get();
    if (snap.exists) {
      const data = snap.data() as Record<string, unknown> | undefined;
      if (data && Object.keys(data).length > 0) {
        return deepMerge(defaults as Record<string, unknown>, data) as
          | HomeCms
          | PravidlaCms
          | OznameniCms;
      }
    }
  } catch {
    /* Cloudflare Workers nebo build bez firebase-admin => použij default CMS */
  }
  return defaults;
}
