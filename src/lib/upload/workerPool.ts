export type WorkerPoolResult =
  | { status: "completed" }
  | { status: "paused"; pausedAtIndex: number }
  | { status: "cancelled" }
  | { status: "error"; error: Error };

export type WorkerPoolOptions<T> = {
  isAborted: () => boolean;
  isPaused?: () => boolean;
  uploadOne: (chunk: T, isLastChunk: boolean) => Promise<void>;
  onChunkDone?: (chunk: T) => void;
};

// Shared concurrency-limited chunk uploader.
export const runWorkerPool = async <T>(
  chunks: T[],
  concurrency: number,
  { isAborted, isPaused, uploadOne, onChunkDone }: WorkerPoolOptions<T>,
): Promise<WorkerPoolResult> => {
  let cursor = 0;
  let error: Error | null = null;
  let pausedAtCursor: number | null = null;

  const worker = async () => {
    while (cursor < chunks.length) {
      if (error || pausedAtCursor !== null || isAborted()) return;

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
