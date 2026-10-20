"use client";

import { useState } from "react";
import { toast } from "sonner";
import useUploadChunks from "@/hooks/local-uploads/useUploadChunks";
import { getChunk } from "@/api/local-uploads/localUploadsAdminApi";

/**
 * State and actions for the chunk grid of one upload: checksum dialog, single delete, clear all.
 */
const useChunkInspector = (uploadId: string) => {
  const { chunks, isLoading, error, removeChunk, removeAllChunks } =
    useUploadChunks(uploadId);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [isChecksumLoading, setIsChecksumLoading] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null,
  );
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const receivedIndices = new Set(
    chunks?.receivedChunks.map((chunk) => chunk.chunkIndex) ?? [],
  );

  const handleSquareClick = async (index: number) => {
    if (!receivedIndices.has(index)) return;
    setSelectedIndex(index);
    setIsChecksumLoading(true);
    try {
      const result = await getChunk(uploadId, index);
      setChecksum(result.checksum);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load chunk");
      setSelectedIndex(null);
    } finally {
      setIsChecksumLoading(false);
    }
  };

  const closeChecksumDialog = () => {
    setSelectedIndex(null);
    setChecksum(null);
  };

  const requestDeleteSelected = () => {
    if (selectedIndex === null) return;
    setPendingDeleteIndex(selectedIndex);
    setSelectedIndex(null);
  };

  const handleDeleteChunk = async () => {
    if (pendingDeleteIndex === null) return;
    try {
      await removeChunk(pendingDeleteIndex);
      toast.success(`Chunk ${pendingDeleteIndex} deleted`);
      setPendingDeleteIndex(null);
      setSelectedIndex(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleClearAll = async () => {
    try {
      await removeAllChunks();
      toast.success("All chunks cleared");
      setConfirmClearAll(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Clear failed");
    }
  };

  return {
    chunks,
    isLoading,
    error,
    receivedIndices,
    selectedIndex,
    checksum,
    isChecksumLoading,
    pendingDeleteIndex,
    confirmClearAll,
    setConfirmClearAll,
    handleSquareClick,
    closeChecksumDialog,
    requestDeleteSelected,
    handleDeleteChunk,
    handleClearAll,
    cancelDeleteChunk: () => setPendingDeleteIndex(null),
  };
};

export default useChunkInspector;
