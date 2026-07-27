"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import useCloudinaryList from "@/hooks/cloudinary/useCloudinaryList";
import { deleteCloudinaryAsset } from "@/api/cloudinary/cloudinaryAdminApi";

const cloudinaryDeleteErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 502) return "Cloudinary-side failure — safe to retry.";
    if (status === 500) return "Cloudinary is not configured on the server.";
    if (status === 404) return "Asset not found.";
  }
  return err instanceof Error ? err.message : "Delete failed";
};

const useCloudinaryListPage = () => {
  const router = useRouter();
  const { take, skip, setSkip, items, total, isLoading, error, refetch } =
    useCloudinaryList();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteItem = items.find((item) => item.id === pendingDeleteId);

  const handleDeleteConfirmed = async () => {
    if (!pendingDeleteId) return;
    try {
      const result = await deleteCloudinaryAsset(pendingDeleteId);
      toast.success(`${result.message} (Cloudinary: ${result.cloudinaryResult})`);
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(cloudinaryDeleteErrorMessage(err));
    }
  };

  return {
    take,
    skip,
    setSkip,
    items,
    total,
    isLoading,
    error,
    pendingDeleteLabel: pendingDeleteItem?.publicId ?? "this asset",
    isConfirmDeleteOpen: pendingDeleteId !== null,
    requestDelete: setPendingDeleteId,
    handleDeleteConfirmed,
    cancelDelete: () => setPendingDeleteId(null),
    goToDetail: (id: string) => router.push(`/cloudinary/${id}`),
  };
};

export default useCloudinaryListPage;
