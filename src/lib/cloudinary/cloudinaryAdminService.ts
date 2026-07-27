import api from "@/lib/axios";
import { unwrapEnvelope } from "@/lib/apiEnvelope";
import { CLOUDINARY_ENDPOINT } from "@/constants";
import { ApiEnvelope, PaginatedResult } from "@/types/common";
import {
  CloudinaryAssetItem,
  CloudinaryDeleteResult,
} from "@/types/cloudinary/adminApi";

type ListParams = { take: number; skip: number };

export const listCloudinaryAssets = async (
  params: ListParams,
): Promise<PaginatedResult<CloudinaryAssetItem>> => {
  const response = await api.get<
    ApiEnvelope<PaginatedResult<CloudinaryAssetItem>>
  >(CLOUDINARY_ENDPOINT, { params });

  return unwrapEnvelope(response.data);
};

export const getCloudinaryAsset = async (
  id: string,
): Promise<CloudinaryAssetItem> => {
  const response = await api.get<ApiEnvelope<CloudinaryAssetItem>>(
    `${CLOUDINARY_ENDPOINT}/${id}`,
  );

  return unwrapEnvelope(response.data);
};

export const deleteCloudinaryAsset = async (
  id: string,
): Promise<CloudinaryDeleteResult> => {
  const response = await api.delete<ApiEnvelope<CloudinaryDeleteResult>>(
    `${CLOUDINARY_ENDPOINT}/${id}`,
  );

  return unwrapEnvelope(response.data);
};
