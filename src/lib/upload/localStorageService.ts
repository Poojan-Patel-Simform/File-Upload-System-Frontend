import { UploadRecord } from "@/types/upload/upload";
import { STORAGE_KEY_PREFIX } from "@/constants";

// Resume records are keyed by file content hash, so the same file is
// recognised even if it is renamed or re-selected.
const keyFor = (fileHash: string) => `${STORAGE_KEY_PREFIX}${fileHash}`;

/** Reads the saved resume record for a file hash; null if missing, corrupt, or on the server. */
export const getResumableUpload = (
  fileHash: string | null | undefined,
): UploadRecord | null => {
  if (!fileHash || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(fileHash));
    if (!raw) return null;
    return JSON.parse(raw) as UploadRecord;
  } catch {
    return null;
  }
};

/** Saves a resume record; storage errors (quota, private mode) are swallowed since resume is best-effort. */
export const putResumableUpload = (record: UploadRecord): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      keyFor(record.fileHash),
      JSON.stringify(record),
    );
  } catch {}
};

/** Deletes the resume record for a file hash (best-effort). */
export const clearResumableUpload = (
  fileHash: string | null | undefined,
): void => {
  if (!fileHash || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(keyFor(fileHash));
  } catch {}
};
