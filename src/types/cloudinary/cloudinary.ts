import { FileChunk } from "@/types/upload/file";

/** Signed params needed to upload directly to Cloudinary. */
export type CloudinarySignedData = {
  duplicate: false;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  publicId: string;
};

/** Returned instead of signed data when the file already exists, so no upload is needed. */
export type CloudinaryDuplicateResult = {
  duplicate: true;
  publicId: string;
  url: string;
};

/** Sign response: discriminate on `duplicate`. */
export type CloudinarySignResult =
  | CloudinarySignedData
  | CloudinaryDuplicateResult;

/** Raw envelope for the sign endpoint. */
export type CloudinarySignApiResponse =
  | { success: true; data: CloudinarySignResult }
  | { success: false; message: string; error: string };

/** Payload to record a finished upload. */
export type CloudinarySaveRequest = {
  publicId: string;
  fileHash: string;
  url: string;
};

/** Raw envelope for the save endpoint. */
export type CloudinarySaveApiResponse =
  | { success: true; data: unknown }
  | { success: false; message: string; error: string };

// Cloudinary's own response body for a chunk POST.
export type CloudinaryChunkUploadResult = {
  done: boolean;
  public_id?: string;
  secure_url?: string;
  bytes?: number;
  format?: string;
  etag?: string;
};

/** In-memory state of one Cloudinary upload (progress, abort controller, signature). */
export type CloudinarySession = {
  file: File;
  fileKey: string;
  fileHash: string | null;
  uploadSessionId: string;
  publicId: string;
  chunkSize: number;
  totalChunks: number;
  completedChunks: Set<number>;
  controller: AbortController | null;
  sign: CloudinarySignedData | null;
  resultUrl?: string;
};

/** Inputs for runCloudinaryChunkedUpload. */
export type ChunkedUploadParams = {
  file: File;
  chunkSize: number;
  totalChunks: number;
  completedChunks: Set<number>;
  sign: CloudinarySignedData;
  uploadSessionId: string;
  controller: AbortController;
  concurrency?: number;
  onChunkComplete: (index: number, result: CloudinaryChunkUploadResult) => void;
  onRetryLog?: (chunk: FileChunk, attempt: number, delayMs: number) => void;
};

/** Outcome of a chunked run; `expired` means the session must be restarted. */
export type ChunkedUploadResult =
  | { status: "completed" }
  | { status: "paused" }
  | { status: "expired" }
  | { status: "error"; error: Error };

/** Shared state passed to each chunk upload in the worker pool. */
export type ChunkUploadContext = {
  file: File;
  sign: CloudinarySignedData;
  uploadSessionId: string;
  controller: AbortController;
  completedChunks: Set<number>;
  onChunkComplete: (index: number, result: CloudinaryChunkUploadResult) => void;
  onRetryLog?: (chunk: FileChunk, attempt: number, delayMs: number) => void;
};

/** Serializable session snapshot persisted (IndexedDB) so an upload can resume. */
export type CloudinaryUploadRecord = {
  fileKey: string;
  fileHash: string;
  uploadSessionId: string;
  publicId: string;
  chunkSize: number;
  totalChunks: number;
  completedChunks: number[];
  resultUrl?: string;
};
