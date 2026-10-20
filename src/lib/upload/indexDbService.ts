import { DB_NAME, DB_VERSION, STORE_NAME } from "@/constants";
import { CloudinaryUploadRecord } from "@/types/cloudinary/cloudinary";

/** Builds the IndexedDB key identifying a file by name, size and mtime (cheap, no hashing needed). */
export const computeFileKey = (file: File): string =>
  `${file.name}:${file.size}:${file.lastModified}`;

/** Opens the uploads database, creating the object store (keyed by `fileKey`) on first use. */
const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "fileKey" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/** Inserts or overwrites the resumable-upload record for a file. */
export const saveUploadRecord = async (
  record: CloudinaryUploadRecord,
): Promise<void> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

/** Looks up the saved upload record for a file key, or undefined if none. */
export const getUploadRecord = async (
  fileKey: string,
): Promise<CloudinaryUploadRecord | undefined> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(fileKey);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/** Removes the saved upload record for a file key. */
export const deleteUploadRecord = async (fileKey: string): Promise<void> => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(fileKey);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
