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
