"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useLocalUploadsList from "@/hooks/local-uploads/useLocalUploadsList";
import { downloadLocalUpload, deleteLocalUploadPermanent } from "@/api/local-uploads/localUploadsAdminApi";

const useLocalUploadsListPage = () => {
  const router = useRouter();
  const {
    status,
    setStatus,
    take,
    skip,
    setSkip,
    items,
    total,
    isLoading,
    error,
    refetch,
  } = useLocalUploadsList();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDeleteItem = items.find((item) => item.id === pendingDeleteId);

  const handleDownload = async (id: string, fileName: string) => {
    setDownloadingId(id);
    try {
      await downloadLocalUpload(id, fileName);
      toast.success(`Downloading ${fileName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDeleteId) return;
    try {
      const result = await deleteLocalUploadPermanent(pendingDeleteId);
      toast.success(result.message);
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return {
    status,
    setStatus,
    take,
    skip,
    setSkip,
    items,
    total,
    isLoading,
    error,
    downloadingId,
    pendingDeleteLabel: pendingDeleteItem?.fileName ?? "this upload",
    isConfirmDeleteOpen: pendingDeleteId !== null,
    requestDelete: setPendingDeleteId,
    handleDownload,
    handleDeleteConfirmed,
    cancelDelete: () => setPendingDeleteId(null),
    goToDetail: (id: string) => router.push(`/local-uploads/${id}`),
  };
};

export default useLocalUploadsListPage;
