"use client";

import useChunkInspector from "@/hooks/local-uploads/useChunkInspector";
import ChunkInspectorView from "@/components/chunk/ChunkInspectorView";

/** Container that loads chunk state for uploadId via useChunkInspector and renders the view; hidden while loading, on error, or for single-chunk uploads. */
const ChunkInspector = ({ uploadId }: { uploadId: string }) => {
  const {
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
    cancelDeleteChunk,
  } = useChunkInspector(uploadId);

  if (isLoading || error || !chunks) return null;
  if (chunks.totalChunks <= 1) return null;

  return (
    <ChunkInspectorView
      chunks={chunks}
      receivedIndices={receivedIndices}
      selectedIndex={selectedIndex}
      checksum={checksum}
      isChecksumLoading={isChecksumLoading}
      pendingDeleteIndex={pendingDeleteIndex}
      confirmClearAll={confirmClearAll}
      onSquareClick={handleSquareClick}
      onChecksumDialogClose={closeChecksumDialog}
      onRequestDeleteSelected={requestDeleteSelected}
      onConfirmDeleteChunk={handleDeleteChunk}
      onCancelDeleteChunk={cancelDeleteChunk}
      onRequestClearAll={() => setConfirmClearAll(true)}
      onConfirmClearAll={handleClearAll}
      onCancelClearAll={() => setConfirmClearAll(false)}
    />
  );
};

export default ChunkInspector;
