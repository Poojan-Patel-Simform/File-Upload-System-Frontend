"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  deleteCloudinaryAsset,
  getCloudinaryAsset,
} from "@/api/cloudinary/cloudinaryAdminApi";
import { CloudinaryAssetItem } from "@/types/cloudinary/adminApi";

const cloudinaryDeleteErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 502) return "Cloudinary-side failure — safe to retry.";
    if (status === 500) return "Cloudinary is not configured on the server.";
    if (status === 404) return "Asset not found.";
  }
  return err instanceof Error ? err.message : "Delete failed";
};

const useCloudinaryDetail = (assetId: string) => {
  const router = useRouter();

  const [asset, setAsset] = useState<CloudinaryAssetItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchAsset = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const result = await getCloudinaryAsset(assetId);
      setAsset(result);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    // Data fetching on mount/dependency-change is an intentional effect;
    // this rule expects state to be set only from external-event callbacks,
    // which doesn't map onto a plain fetch-on-mount hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAsset();
  }, [fetchAsset]);

  const handleDeleteConfirmed = async () => {
    try {
      const result = await deleteCloudinaryAsset(assetId);
      toast.success(`${result.message} (Cloudinary: ${result.cloudinaryResult})`);
      router.push("/cloudinary");
    } catch (err) {
      toast.error(cloudinaryDeleteErrorMessage(err));
    }
  };

  return {
    asset,
    isLoading,
    notFound,
    confirmDelete,
    setConfirmDelete,
    handleDeleteConfirmed,
    goBack: () => router.push("/cloudinary"),
  };
};

export default useCloudinaryDetail;
