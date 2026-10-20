"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteLocalUploadPermanent,
  downloadLocalUpload,
  getLocalUpload,
} from "@/api/local-uploads/localUploadsAdminApi";
import { LocalUploadListItem } from "@/types/local-uploads/adminApi";

/** Loads one local upload and exposes download/delete actions for the detail page. */
const useLocalUploadDetail = (uploadId: string) => {
  const router = useRouter();

  const [upload, setUpload] = useState<LocalUploadListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchUpload = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const result = await getLocalUpload(uploadId);
      setUpload(result);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    // Data fetching on mount/dependency-change is an intentional effect;
    // this rule expects state to be set only from external-event callbacks,
    // which doesn't map onto a plain fetch-on-mount hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUpload();
  }, [fetchUpload]);

  const handleDownload = async () => {
    if (!upload) return;
    setIsDownloading(true);
    try {
      await downloadLocalUpload(upload.id, upload.fileName);
      toast.success(`Downloading ${upload.fileName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      const result = await deleteLocalUploadPermanent(uploadId);
      toast.success(result.message);
      router.push("/local-uploads");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return {
    upload,
    isLoading,
    notFound,
    isDownloading,
    confirmDelete,
    setConfirmDelete,
    handleDownload,
    handleDeleteConfirmed,
    goBack: () => router.push("/local-uploads"),
  };
};

export default useLocalUploadDetail;
