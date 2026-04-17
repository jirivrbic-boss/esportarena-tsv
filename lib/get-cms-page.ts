import {
  CMS_DEFAULTS,
  type CmsSlug,
  type HomeCms,
  type OznameniCms,
  type PravidlaCms,
} from "@/lib/cms-defaults";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";

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
    const data = await getDocRest(`page_content/${slug}`);
    if (data) {
      const patch = { ...data } as Record<string, unknown>;
      delete patch.id;
      if (Object.keys(patch).length > 0) {
        return deepMerge(defaults as Record<string, unknown>, patch) as
          | HomeCms
          | PravidlaCms
          | OznameniCms;
      }
    }
  } catch {
    /* Při chybě API nech default CMS obsah */
  }
  return defaults;
}
