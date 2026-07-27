import api from "@/api/client";
import { UPLOADS_ENDPOINT, DEFAULT_RETRIES } from "@/constants";
import { withRetry } from "@/lib/upload/retryService";
import { sha256Hex } from "@/lib/upload/hashService";
import {
  ChunkUploadResponse,
  FileChunk,
  InitUploadResponse,
} from "@/types/upload/file";

type InitUploadPayload = {
  fileHash: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
};

export const initUpload = async (
  payload: InitUploadPayload,
): Promise<InitUploadResponse> => {
  const response = await api.post(`${UPLOADS_ENDPOINT}/init`, payload);
  return response.data;
};

export const abortUpload = async (uploadId: string): Promise<void> => {
  await api.delete(`${UPLOADS_ENDPOINT}/${uploadId}`);
};

type SingleUploadResponse = { success: boolean };

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

export const uploadChunk = async (
  chunk: FileChunk,
  uploadId: string,
  signal: AbortSignal,
  onRetry: (attempt: number, delayMs: number) => void,
): Promise<void> => {
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
