/** Server-side lifecycle status of a local upload. */
export type UploadStatus =
  | "NEW"
  | "UPLOADING"
  | "MERGING"
  | "COMPLETED"
  | "FAILED";

/** A local upload row as returned by the admin API. */
export type LocalUploadListItem = {
  id: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  uploadedChunks: number;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
};

/** A chunk the server has stored; checksum may be null. */
export type ReceivedChunk = { chunkIndex: number; checksum: string | null };

/** Per-chunk received/missing breakdown for an upload. */
export type ChunksInspection = {
  uploadId: string;
  totalChunks: number;
  receivedChunks: ReceivedChunk[];
  missingChunks: number[];
};

/** Stored checksum of a single chunk. */
export type ChunkChecksum = {
  uploadId: string;
  chunkIndex: number;
  checksum: string | null;
};
