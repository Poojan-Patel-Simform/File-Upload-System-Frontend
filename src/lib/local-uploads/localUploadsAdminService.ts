import axios from "axios";
import api from "@/lib/axios";
import { unwrapEnvelope } from "@/lib/apiEnvelope";
import { UPLOADS_ENDPOINT } from "@/constants";
import { ApiEnvelope, PaginatedResult } from "@/types/common";
import {
  ChunkChecksum,
  ChunksInspection,
  LocalUploadListItem,
  UploadStatus,
} from "@/types/local-uploads/adminApi";

type ListLocalUploadsParams = {
  status?: UploadStatus;
  take: number;
  skip: number;
};

export const listLocalUploads = async (
  params: ListLocalUploadsParams,
): Promise<PaginatedResult<LocalUploadListItem>> => {
  const response = await api.get<ApiEnvelope<PaginatedResult<LocalUploadListItem>>>(
    UPLOADS_ENDPOINT,
    { params },
  );

  return unwrapEnvelope(response.data);
};

export const getLocalUpload = async (uploadId: string): Promise<LocalUploadListItem> => {
  const response = await api.get<ApiEnvelope<LocalUploadListItem>>(
    `${UPLOADS_ENDPOINT}/${uploadId}`,
  );

  return unwrapEnvelope(response.data);
};

const extractFileName = (contentDisposition: string | undefined) => {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : null;
};

const parseBlobErrorMessage = async (
  data: unknown,
  fallback: string,
): Promise<string> => {
  if (!(data instanceof Blob)) return fallback;
  try {
    const text = await data.text();
    const body = JSON.parse(text) as ApiEnvelope<unknown>;
    return !body.success ? body.message : fallback;
  } catch {
    return fallback;
  }
};

export const downloadLocalUpload = async (
  uploadId: string,
  fallbackFileName: string,
): Promise<void> => {
  try {
    const response = await api.get(
      `${UPLOADS_ENDPOINT}/${uploadId}/download`,
      { responseType: "blob" },
    );

    const fileName =
      extractFileName(response.headers["content-disposition"]) ??
      fallbackFileName;

    const url = URL.createObjectURL(response.data as Blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const fallback =
        status === 409
          ? "Upload is not completed yet"
          : status === 404
            ? "Upload or file not found"
            : "Download failed";
      const message = await parseBlobErrorMessage(
        err.response?.data,
        fallback,
      );
      throw new Error(message);
    }
    throw err;
  }
};

export const deleteLocalUploadPermanent = async (
  uploadId: string,
): Promise<{ uploadId: string; message: string }> => {
  const response = await api.delete<
    ApiEnvelope<{ uploadId: string; message: string }>
  >(`${UPLOADS_ENDPOINT}/${uploadId}/permanent`);

  return unwrapEnvelope(response.data);
};

export const listChunks = async (
  uploadId: string,
): Promise<ChunksInspection> => {
  const response = await api.get<ApiEnvelope<ChunksInspection>>(
    `${UPLOADS_ENDPOINT}/${uploadId}/chunks`,
  );

  return unwrapEnvelope(response.data);
};

export const getChunk = async (
  uploadId: string,
  chunkIndex: number,
): Promise<ChunkChecksum> => {
  const response = await api.get<ApiEnvelope<ChunkChecksum>>(
    `${UPLOADS_ENDPOINT}/${uploadId}/chunks/${chunkIndex}`,
  );

  return unwrapEnvelope(response.data);
};

export const deleteChunk = async (
  uploadId: string,
  chunkIndex: number,
): Promise<{ uploadId: string; chunkIndex: number; deleted: boolean }> => {
  const response = await api.delete<
    ApiEnvelope<{ uploadId: string; chunkIndex: number; deleted: boolean }>
  >(`${UPLOADS_ENDPOINT}/${uploadId}/chunks/${chunkIndex}`);

  return unwrapEnvelope(response.data);
};

export const deleteAllChunks = async (
  uploadId: string,
): Promise<{ uploadId: string; deleted: boolean }> => {
  const response = await api.delete<
    ApiEnvelope<{ uploadId: string; deleted: boolean }>
  >(`${UPLOADS_ENDPOINT}/${uploadId}/chunks`);

  return unwrapEnvelope(response.data);
};
