import { FileChunk } from "@/types/upload/file";

/** Picks a chunk size by file size tier: bigger files get bigger chunks to cap the chunk count. */
export const getChunkSize = (fileSize: number): number => {
  const MB = 1024 * 1024;
  const GB = 1024 * MB;

  if (fileSize <= 10 * MB) {
    return 1 * MB;
  }

  if (fileSize <= 100 * MB) {
    return 5 * MB;
  }

  if (fileSize <= 1 * GB) {
    return 10 * MB;
  }

  if (fileSize <= 10 * GB) {
    return 25 * MB;
  }

  return 50 * MB;
};

/** Splits a File into contiguous Blob slices; `end` is exclusive and the last chunk may be smaller. */
export const generateFileChunks = (
  file: File,
  customChunkSize?: number,
): FileChunk[] => {
  const chunks: FileChunk[] = [];
  const resolvedChunkSize = customChunkSize ?? getChunkSize(file.size);

  let index = 0;

  for (let start = 0; start < file.size; start += resolvedChunkSize) {
    const end = Math.min(start + resolvedChunkSize, file.size);

    chunks.push({
      index,
      start,
      end,
      size: end - start,
      chunk: file.slice(start, end),
    });

    index++;
  }

  return chunks;
};
