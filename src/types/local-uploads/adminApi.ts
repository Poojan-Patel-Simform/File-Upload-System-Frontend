export type UploadStatus =
  | "NEW"
  | "UPLOADING"
  | "MERGING"
  | "COMPLETED"
  | "FAILED";

export type LocalUploadListItem = {
  id: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  uploadedChunks: number;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReceivedChunk = { chunkIndex: number; checksum: string | null };

export type ChunksInspection = {
  uploadId: string;
  totalChunks: number;
  receivedChunks: ReceivedChunk[];
  missingChunks: number[];
};

export type ChunkChecksum = {
  uploadId: string;
  chunkIndex: number;
  checksum: string | null;
};
