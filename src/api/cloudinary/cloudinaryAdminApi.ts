import api from "@/api/client";
import { unwrapEnvelope } from "@/lib/apiEnvelope";
import { CLOUDINARY_ENDPOINT } from "@/constants";
import { ApiEnvelope, PaginatedResult } from "@/types/common";
import {
  CloudinaryAssetItem,
  CloudinaryDeleteResult,
} from "@/types/cloudinary/adminApi";

/** Pagination params for the admin list endpoint. */
type ListParams = { take: number; skip: number };

/** Fetches a page of saved Cloudinary assets. */
export const listCloudinaryAssets = async (
  params: ListParams,
): Promise<PaginatedResult<CloudinaryAssetItem>> => {
  const response = await api.get<
    ApiEnvelope<PaginatedResult<CloudinaryAssetItem>>
  >(CLOUDINARY_ENDPOINT, { params });

  return unwrapEnvelope(response.data);
};

/** Fetches a single saved Cloudinary asset by id. */
export const getCloudinaryAsset = async (
  id: string,
): Promise<CloudinaryAssetItem> => {
  const response = await api.get<ApiEnvelope<CloudinaryAssetItem>>(
    `${CLOUDINARY_ENDPOINT}/${id}`,
  );

  return unwrapEnvelope(response.data);
};

/** Deletes an asset from Cloudinary and the local record. */
export const deleteCloudinaryAsset = async (
  id: string,
): Promise<CloudinaryDeleteResult> => {
  const response = await api.delete<ApiEnvelope<CloudinaryDeleteResult>>(
    `${CLOUDINARY_ENDPOINT}/${id}`,
  );

  return unwrapEnvelope(response.data);
};
