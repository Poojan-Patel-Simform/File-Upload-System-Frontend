import api from "@/api/client";
import { unwrapEnvelope } from "@/lib/apiEnvelope";
import axios from "axios";
import {
  CLOUDINARY_SIGN_ENDPOINT,
  CLOUDINARY_SAVE_ENDPOINT,
  DEFAULT_RETRIES,
} from "@/constants";
import {
  CloudinarySignApiResponse,
  CloudinarySignResult,
  CloudinarySignedData,
  CloudinarySaveRequest,
  CloudinarySaveApiResponse,
  CloudinaryChunkUploadResult,
} from "@/types/cloudinary/cloudinary";
import { FileChunk } from "@/types/upload/file";
import { withRetry } from "@/lib/upload/retryService";
import { CloudinarySessionExpiredError } from "@/lib/cloudinary/cloudinaryErrors";

/**
 * Asks the backend for a signed upload payload, or a duplicate hit if this hash already exists.
 */
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

/** Persists the finished Cloudinary upload (publicId, hash, url) on the backend. */
export const saveCloudinaryAsset = async (
  payload: CloudinarySaveRequest,
): Promise<void> => {
  const response = await api.post<CloudinarySaveApiResponse>(
    CLOUDINARY_SAVE_ENDPOINT,
    payload,
  );

  unwrapEnvelope(response.data);
};

/**
 * Uploads one chunk directly to Cloudinary using a signed, resumable session, with retries.
 * Throws CloudinarySessionExpiredError (non-retryable) if the session is gone.
 */
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
              // Cloudinary reassembles chunks from the byte range (end is exclusive here).
              "Content-Range": `bytes ${chunk.start}-${chunk.end - 1}/${totalFileSize}`,
            },
            signal,
          },
        );

        return response.data;
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status : null;
        // 404/410 means Cloudinary dropped the session; surface as non-retryable.
        if (status === 404 || status === 410) {
          throw new CloudinarySessionExpiredError();
        }
        throw err;
      }
    },
    { retries: DEFAULT_RETRIES, onRetry, signal },
  );
