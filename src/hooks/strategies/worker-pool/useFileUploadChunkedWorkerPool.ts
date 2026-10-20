"use client";

import { uploadChunk } from "@/api/upload/uploadApi";
import { DEFAULT_RETRIES } from "@/constants";
import { getNetworkHint } from "@/lib/upload/networkService";
import { runWorkerPool } from "@/lib/upload/workerPool";
import useFileUploadChunkedBase from "@/hooks/upload/useFileUploadChunkedBase";
import { UploadChunk } from "@/types/upload/upload";

/** Strategy: uploads chunks in parallel, with concurrency chosen from network quality. */
const sendChunksWithWorkerPool: UploadChunk = async ({
  session,
  uploadId,
  chunks,
  controller,
  appendLog,
  reportChunkUploaded,
  reportLastChunkClaimed,
}) => {
  const concurrency = getNetworkHint().concurrency;

  const result = await runWorkerPool(chunks, concurrency, {
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

  // Save where we stopped so resume only re-sends chunks not yet started.
  if (result.status === "paused") {
    session.remainingChunks = chunks.slice(result.pausedAtIndex);
    return { status: "paused" };
  }

  return result;
};

/** Chunked upload hook using the parallel worker-pool strategy. */
const useFileUploadChunkedWorkerPool = () =>
  useFileUploadChunkedBase({
    strategy: "worker-pool",
    onUploadChunks: sendChunksWithWorkerPool,
  });

export default useFileUploadChunkedWorkerPool;
