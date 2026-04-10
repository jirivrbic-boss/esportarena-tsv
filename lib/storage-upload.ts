import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
}

export async function uploadUserFile(
  uid: string,
  prefix: string,
  file: File
): Promise<{ url: string; path: string; uploadedAt: number }> {
  const storage = getFirebaseStorage();
  const path = `users/${uid}/${prefix}-${Date.now()}-${safeName(file.name)}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  return { url, path: r.fullPath, uploadedAt: Date.now() };
}

export async function uploadTeamFile(
  teamId: string,
  prefix: string,
  file: File
): Promise<{ url: string; path: string; uploadedAt: number }> {
  const storage = getFirebaseStorage();
  const path = `teams/${teamId}/${prefix}-${Date.now()}-${safeName(file.name)}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  return { url, path: r.fullPath, uploadedAt: Date.now() };
}
