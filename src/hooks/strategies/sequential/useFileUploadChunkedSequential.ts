"use client";

import { uploadChunk } from "@/api/upload/uploadApi";
import { DEFAULT_RETRIES } from "@/constants";
import { runWorkerPool } from "@/lib/upload/workerPool";
import useFileUploadChunkedBase from "@/hooks/upload/useFileUploadChunkedBase";
import { UploadChunk } from "@/types/upload/upload";

const sendChunksSequentially: UploadChunk = async ({
  session,
  uploadId,
  chunks,
  controller,
  appendLog,
  reportChunkUploaded,
  reportLastChunkClaimed,
}) => {
  const result = await runWorkerPool(chunks, 1, {
    isAborted: () => controller.signal.aborted,
    isPaused: () => session.isPaused,
    uploadOne: async (chunk, isLastChunk) => {
      if (isLastChunk) reportLastChunkClaimed();

      await uploadChunk(
        chunk,
        uploadId,
        controller.signal,
        (attempt, delayMs) =>
          appendLog(
            `[upload] chunk ${chunk.index} failed (attempt ${attempt}/${DEFAULT_RETRIES}), retrying in ${Math.round(delayMs)}ms`,
          ),
      );
    },
    onChunkDone: reportChunkUploaded,
  });

  if (result.status === "paused") {
    session.remainingChunks = chunks.slice(result.pausedAtIndex);
    return { status: "paused" };
  }

  return result;
};

const useFileUploadChunkedSequential = () =>
  useFileUploadChunkedBase({
    strategy: "sequential",
    onUploadChunks: sendChunksSequentially,
  });

export default useFileUploadChunkedSequential;
