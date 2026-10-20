/** Outcome of a pool run; `pausedAtIndex` is the first chunk not yet started. */
export type WorkerPoolResult =
  | { status: "completed" }
  | { status: "paused"; pausedAtIndex: number }
  | { status: "cancelled" }
  | { status: "error"; error: Error };

/** Callbacks the pool uses to check control flags and upload/report each chunk. */
export type WorkerPoolOptions<T> = {
  isAborted: () => boolean;
  isPaused?: () => boolean;
  uploadOne: (chunk: T, isLastChunk: boolean) => Promise<void>;
  onChunkDone?: (chunk: T) => void;
};

/** Uploads `chunks` with up to `concurrency` parallel workers pulling from a shared cursor. */
export const runWorkerPool = async <T>(
  chunks: T[],
  concurrency: number,
  { isAborted, isPaused, uploadOne, onChunkDone }: WorkerPoolOptions<T>,
): Promise<WorkerPoolResult> => {
  // Shared by all workers; JS is single-threaded so `cursor++` safely hands
  // each chunk to exactly one worker.
  let cursor = 0;
  let error: Error | null = null;
  let pausedAtCursor: number | null = null;

  const worker = async () => {
    while (cursor < chunks.length) {
      if (error || pausedAtCursor !== null || isAborted()) return;

      // Pause is cooperative: in-flight chunks finish, no new ones start.
      // The cursor is recorded so the caller can resume from there.
      if (isPaused?.()) {
        pausedAtCursor = cursor;
        return;
      }

      const chunk = chunks[cursor++];
      const isLastChunk = cursor >= chunks.length;

      try {
        await uploadOne(chunk, isLastChunk);
      } catch (err) {
        const wasCancelled =
          err instanceof DOMException && err.name === "AbortError";
        // Aborts are reported as "cancelled" via isAborted(), not as errors.
        if (wasCancelled) return;

        error = err instanceof Error ? err : new Error("Unknown upload error");
        return;
      }

      onChunkDone?.(chunk);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, chunks.length) }, worker),
  );

  if (isAborted()) return { status: "cancelled" };
  if (error) return { status: "error", error };
  if (pausedAtCursor !== null) {
    return { status: "paused", pausedAtIndex: pausedAtCursor };
  }

  return { status: "completed" };
};
