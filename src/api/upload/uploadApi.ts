import api from "@/api/client";
import { UPLOADS_ENDPOINT, DEFAULT_RETRIES } from "@/constants";
import { withRetry } from "@/lib/upload/retryService";
import { sha256Hex } from "@/lib/upload/hashService";
import {
  ChunkUploadResponse,
  FileChunk,
  InitUploadResponse,
} from "@/types/upload/file";

/** Metadata sent to start (or resume) a chunked upload. */
type InitUploadPayload = {
  fileHash: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
};

/** Starts a chunked upload; the response tells which chunks the server already has. */
export const initUpload = async (
  payload: InitUploadPayload,
): Promise<InitUploadResponse> => {
  const response = await api.post(`${UPLOADS_ENDPOINT}/init`, payload);
  return response.data;
};

/** Cancels an in-progress chunked upload on the server. */
export const abortUpload = async (uploadId: string): Promise<void> => {
  await api.delete(`${UPLOADS_ENDPOINT}/${uploadId}`);
};

/** Response of the traditional single-request upload. */
type SingleUploadResponse = { success: boolean };

/** Uploads the whole file in one request, reporting progress as a 0-100 percent. */
export const uploadSingleFile = async (
  file: File,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<SingleUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("fileName", file.name);
  formData.append("fileSize", String(file.size));

  const response = await api.post<SingleUploadResponse>(
    `${UPLOADS_ENDPOINT}/single`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        onProgress(
          Math.round((progressEvent.loaded * 100) / progressEvent.total),
        );
      },
    },
  );

  return response.data;
};

/**
 * Uploads one chunk with its SHA-256 checksum (server verifies integrity), retrying on failure.
 */
export const uploadChunk = async (
  chunk: FileChunk,
  uploadId: string,
  signal: AbortSignal,
  onRetry: (attempt: number, delayMs: number) => void,
): Promise<void> => {
  // Hashed once outside withRetry so retries reuse it.
  const checksum = await sha256Hex(chunk.chunk);

  await withRetry(
    async () => {
      const formData = new FormData();
      formData.append("uploadId", uploadId);
      formData.append("chunkIndex", String(chunk.index));
      formData.append("checksum", checksum);
      formData.append("file", chunk.chunk);

      const response = await api.post(`${UPLOADS_ENDPOINT}/chunk`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      });

      const chunkData: ChunkUploadResponse = response.data;
      if (!chunkData.success) {
        throw new Error(`Failed to upload chunk ${chunk.index}`);
      }
    },
    { retries: DEFAULT_RETRIES, onRetry },
  );
};
