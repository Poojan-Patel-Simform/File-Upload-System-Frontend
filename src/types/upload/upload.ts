import { FileChunk } from "@/types/upload/file";

/** Resume record persisted per file so an interrupted upload can continue. */
export type UploadRecord = {
  fileHash: string;
  fileName: string;
  fileSize: number;
  uploadId: string;
  totalChunks: number;
  uploadedChunks: number;
  strategy: string;
  updatedAt: number;
};

/** Mutable in-memory state of one chunked upload. */
export type UploadSession = {
  file: File;
  fileHash: string | null;
  uploadId: string | null;
  controller: AbortController | null;
  isPaused: boolean;
  remainingChunks: FileChunk[];
  uploadedCount: number;
  totalChunks: number;
};

/** Outcome of a chunk-upload strategy run. */
export type UploadChunkResult =
  | { status: "completed" }
  | { status: "paused" }
  | { status: "cancelled" }
  | { status: "error"; error: Error };

/** Inputs and callbacks handed to a chunk-upload strategy. */
export type UploadChunkArgs = {
  session: UploadSession;
  uploadId: string;
  chunks: FileChunk[];
  controller: AbortController;
  appendLog: (line: string) => void;
  reportChunkUploaded: (chunk: FileChunk) => void;
  reportLastChunkClaimed: () => void;
};

/** A chunk-upload strategy (sequential or worker pool). */
export type UploadChunk = (ctx: UploadChunkArgs) => Promise<UploadChunkResult>;
