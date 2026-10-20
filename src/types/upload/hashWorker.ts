/** Messages the hash web worker posts back to the main thread. */
export type HashWorkerMessage =
  | { type: "done"; hash: string }
  | { type: "error"; message: string };
