/** Coarse file category used to pick an icon. */
export type FileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "text"
  | "unknown";

/** A slice of a file; `start` inclusive, `end` exclusive (byte offsets). */
export type FileChunk = {
  index: number;
  start: number;
  end: number;
  size: number;
  chunk: Blob;
};

/** Server upload statuses (string enum mirror of the backend values). */
export enum UploadStatus {
  NEW = "NEW",
  UPLOADING = "UPLOADING",
  COMPLETED = "COMPLETED",
  MERGING = "MERGING",
  FAILED = "FAILED",
}

/** Response of the init endpoint; `uploadedChunks` lists chunks to skip on resume. */
export type InitUploadResponse = {
  success: boolean;
  data: {
    status: "NEW" | "UPLOADING" | "COMPLETED" | "MERGING" | "FAILED";
    uploadId: string;
    uploadedChunks?: number[];
    deduplicated?: boolean;
  };
};

/** Response of a chunk upload. */
export type ChunkUploadResponse = {
  success: boolean;
  data: {
    status: string;
    uploadId: string;
    chunkIndex: number;
    uploadedChunks: number;
    totalChunks: number;
    isComplete: boolean;
  };
};

/** Client-side upload state of a single file in the UI. */
export enum FileUploadingStatusEnum {
  IDLE,
  UPLOADING,
  PAUSED,
  MERGING,
  COMPLETED,
  ERROR,
}

/** A file in the upload queue with its UI state. */
export type UploadFileItem = {
  id: string;
  file: File;
  status: FileUploadingStatusEnum;
  progress: number;
  errorMessage: string | null;
  logs: string[];
  resumableUploadId?: string;
  resultUrl?: string;
};
