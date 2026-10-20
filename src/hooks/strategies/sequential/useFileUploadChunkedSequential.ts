"use client";

import { uploadChunk } from "@/api/upload/uploadApi";
import { DEFAULT_RETRIES } from "@/constants";
import useFileUploadChunkedBase from "@/hooks/upload/useFileUploadChunkedBase";
import { UploadChunk } from "@/types/upload/upload";

/** Strategy: uploads chunks one at a time, in order. */
const sendChunksSequentially: UploadChunk = async ({
  session,
  uploadId,
  chunks,
  controller,
  appendLog,
  reportChunkUploaded,
  reportLastChunkClaimed,
}) => {
  for (let index = 0; index < chunks.length; index++) {
    if (controller.signal.aborted) return { status: "cancelled" };

    // Pause is checked between chunks; keep the rest so resume continues here.
    if (session.isPaused) {
      session.remainingChunks = chunks.slice(index);
      return { status: "paused" };
    }

    const chunk = chunks[index];
    const isLastChunk = index === chunks.length - 1;
    if (isLastChunk) reportLastChunkClaimed();

    try {
      await uploadChunk(chunk, uploadId, controller.signal, (attempt, delayMs) =>
        appendLog(
          `[upload] chunk ${chunk.index} failed (attempt ${attempt}/${DEFAULT_RETRIES}), retrying in ${Math.round(delayMs)}ms`,
        ),
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { status: "cancelled" };
      }
      return {
        status: "error",
        error: err instanceof Error ? err : new Error("Unknown upload error"),
      };
    }

    reportChunkUploaded(chunk);
  }

  return { status: "completed" };
};

/** Chunked upload hook using the sequential strategy. */
const useFileUploadChunkedSequential = () =>
  useFileUploadChunkedBase({
    strategy: "sequential",
    onUploadChunks: sendChunksSequentially,
  });

export default useFileUploadChunkedSequential;
