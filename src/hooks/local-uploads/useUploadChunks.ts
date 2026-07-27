"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteAllChunks,
  deleteChunk,
  listChunks,
} from "@/api/local-uploads/localUploadsAdminApi";
import { ChunksInspection } from "@/types/local-uploads/adminApi";

const useUploadChunks = (uploadId: string) => {
  const [chunks, setChunks] = useState<ChunksInspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setErrorMessage] = useState<string | null>(null);

  const fetchChunks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await listChunks(uploadId);
      setChunks(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load chunks",
      );
      setChunks(null);
    } finally {
      setIsLoading(false);
    }
  }, [uploadId]);

  useEffect(() => {
    // Data fetching on mount/dependency-change is an intentional effect;
    // this rule expects state to be set only from external-event callbacks,
    // which doesn't map onto a plain fetch-on-mount hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChunks();
  }, [fetchChunks]);

  const removeChunk = async (chunkIndex: number) => {
    await deleteChunk(uploadId, chunkIndex);
    await fetchChunks();
  };

  const removeAllChunks = async () => {
    await deleteAllChunks(uploadId);
    await fetchChunks();
  };

  return {
    chunks,
    isLoading,
    error,
    refetch: fetchChunks,
    removeChunk,
    removeAllChunks,
  };
};

export default useUploadChunks;
