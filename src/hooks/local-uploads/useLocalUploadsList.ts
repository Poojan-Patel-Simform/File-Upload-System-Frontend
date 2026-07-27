"use client";

import { useCallback, useEffect, useState } from "react";
import { listLocalUploads } from "@/api/local-uploads/localUploadsAdminApi";
import { LocalUploadListItem, UploadStatus } from "@/types/local-uploads/adminApi";

const TAKE = 20;

const useLocalUploadsList = () => {
  const [status, setStatus] = useState<UploadStatus | "">("");
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<LocalUploadListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setErrorMessage] = useState<string | null>(null);

  const fetchLocalUploads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await listLocalUploads({
        status: status || undefined,
        take: TAKE,
        skip,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load uploads",
      );
    } finally {
      setIsLoading(false);
    }
  }, [status, skip]);

  useEffect(() => {
    // Data fetching on mount/dependency-change is an intentional effect;
    // this rule expects state to be set only from external-event callbacks,
    // which doesn't map onto a plain fetch-on-mount hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLocalUploads();
  }, [fetchLocalUploads]);

  const handleStatusChange = (nextStatus: UploadStatus | "") => {
    setStatus(nextStatus);
    setSkip(0);
  };

  return {
    status,
    setStatus: handleStatusChange,
    take: TAKE,
    skip,
    setSkip,
    items,
    total,
    isLoading,
    error,
    refetch: fetchLocalUploads,
  };
};

export default useLocalUploadsList;
