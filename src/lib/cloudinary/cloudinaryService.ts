import api from "@/lib/axios";
import { unwrapEnvelope } from "@/lib/apiEnvelope";
import axios from "axios";
import {
  CLOUDINARY_SIGN_ENDPOINT,
  CLOUDINARY_SAVE_ENDPOINT,
  CLOUDINARY_MIN_CHUNK_SIZE,
  CLOUDINARY_WORKER_POOL_CONCURRENCY,
  DEFAULT_RETRIES,
} from "@/constants";
import {
  CloudinarySignApiResponse,
  CloudinarySignResult,
  CloudinarySignedData,
  CloudinarySaveRequest,
  CloudinarySaveApiResponse,
  CloudinaryChunkUploadResult,
  CloudinarySession,
  ChunkUploadContext,
  ChunkedUploadParams,
  ChunkedUploadResult,
} from "@/types/cloudinary/cloudinary";
import { FileChunk } from "@/types/upload/file";
import { withRetry } from "@/lib/upload/retryService";
import { generateFileChunks, getChunkSize } from "@/lib/upload/chunkService";
import { computeFileKey } from "@/lib/upload/indexDbService";
import { runWorkerPool } from "@/lib/upload/workerPool";
import { CloudinarySessionExpiredError } from "./cloudinaryErrors";

export const signCloudinaryUpload = async (
  publicId: string,
  fileHash: string,
): Promise<CloudinarySignResult> => {
  const response = await api.post<CloudinarySignApiResponse>(
    CLOUDINARY_SIGN_ENDPOINT,
    { publicId, fileHash },
  );

  return unwrapEnvelope(response.data);
};

export const saveCloudinaryAsset = async (
  payload: CloudinarySaveRequest,
): Promise<void> => {
  const response = await api.post<CloudinarySaveApiResponse>(
    CLOUDINARY_SAVE_ENDPOINT,
    payload,
  );

  unwrapEnvelope(response.data);
};

export const uploadChunkToCloudinary = async (
  chunk: FileChunk,
  totalFileSize: number,
  sign: CloudinarySignedData,
  uploadSessionId: string,
  signal: AbortSignal,
  onRetry: (attempt: number, delayMs: number) => void,
): Promise<CloudinaryChunkUploadResult> =>
  withRetry(
    async () => {
      const formData = new FormData();
      formData.append("file", chunk.chunk);
      formData.append("api_key", sign.apiKey);
      formData.append("timestamp", String(sign.timestamp));
      formData.append("signature", sign.signature);
      formData.append("public_id", sign.publicId);

      try {
        const response = await axios.post<CloudinaryChunkUploadResult>(
          `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
          formData,
          {
            headers: {
              "X-Unique-Upload-Id": uploadSessionId,
              "Content-Range": `bytes ${chunk.start}-${chunk.end - 1}/${totalFileSize}`,
            },
            signal,
          },
        );

        return response.data;
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status : null;
        if (status === 404 || status === 410) {
          throw new CloudinarySessionExpiredError();
        }
        throw err;
      }
    },
    { retries: DEFAULT_RETRIES, onRetry, signal },
  );

export const createSession = (file: File): CloudinarySession => {
  const uploadSessionId = crypto.randomUUID();
  const chunkSize = Math.max(
    getChunkSize(file.size),
    CLOUDINARY_MIN_CHUNK_SIZE,
  );
  const totalChunks = generateFileChunks(file, chunkSize).length;

  return {
    file,
    fileKey: computeFileKey(file),
    fileHash: null,
    uploadSessionId,
    publicId: `uploads/${uploadSessionId}`,
    chunkSize,
    totalChunks,
    completedChunks: new Set(),
    controller: null,
    sign: null,
    resultUrl: undefined,
  };
};

const runChunkWorkerPool = async (
  chunks: FileChunk[],
  concurrency: number,
  context: ChunkUploadContext,
): Promise<{ error: Error | null; expired: boolean }> => {
  const result = await runWorkerPool(chunks, concurrency, {
    isAborted: () => context.controller.signal.aborted,
    uploadOne: async (chunk) => {
      const result = await uploadChunkToCloudinary(
        chunk,
        context.file.size,
        context.sign,
        context.uploadSessionId,
        context.controller.signal,
        (attempt, delayMs) => context.onRetryLog?.(chunk, attempt, delayMs),
      );

      context.completedChunks.add(chunk.index);
      context.onChunkComplete(chunk.index, result);
    },
  });

  if (result.status === "error") {
    const expired = result.error instanceof CloudinarySessionExpiredError;
    return { error: expired ? null : result.error, expired };
  }

  return { error: null, expired: false };
};

// First and last chunks upload alone (some Cloudinary sessions require this);
// the chunks between them upload concurrently through a worker pool.
export const runCloudinaryChunkedUpload = async ({
  file,
  chunkSize,
  totalChunks,
  completedChunks,
  sign,
  uploadSessionId,
  controller,
  concurrency = CLOUDINARY_WORKER_POOL_CONCURRENCY,
  onChunkComplete,
  onRetryLog,
}: ChunkedUploadParams): Promise<ChunkedUploadResult> => {
  const allChunks = generateFileChunks(file, chunkSize);
  const pending = allChunks.filter(
    (chunk) => !completedChunks.has(chunk.index),
  );
  if (pending.length === 0) return { status: "completed" };

  const context: ChunkUploadContext = {
    file,
    sign,
    uploadSessionId,
    controller,
    completedChunks,
    onChunkComplete,
    onRetryLog,
  };

  const lastIndex = totalChunks - 1;
  const phases = [
    { chunks: pending.filter((c) => c.index === 0), concurrency: 1 },
    {
      chunks: pending.filter((c) => c.index > 0 && c.index < lastIndex),
      concurrency,
    },
    {
      chunks:
        totalChunks > 1 ? pending.filter((c) => c.index === lastIndex) : [],
      concurrency: 1,
    },
  ];

  for (const phase of phases) {
    if (phase.chunks.length === 0) continue;

    const { error, expired } = await runChunkWorkerPool(
      phase.chunks,
      phase.concurrency,
      context,
    );

    if (expired) return { status: "expired" };
    if (error) return { status: "error", error };
    if (controller.signal.aborted) return { status: "paused" };
  }

  return { status: "completed" };
};
