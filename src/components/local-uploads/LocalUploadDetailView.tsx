"use client";

import { ArrowLeft, Download, Loader2, Trash2 } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ChunkInspector from "@/components/chunk/ChunkInspector";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { LocalUploadListItem } from "@/types/local-uploads/adminApi";

type LocalUploadDetailViewProps = {
  upload: LocalUploadListItem | null;
  isLoading: boolean;
  notFound: boolean;
  isDownloading: boolean;
  confirmDelete: boolean;
  onBack: () => void;
  onDownload: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
};

const LocalUploadDetailView = ({
  upload,
  isLoading,
  notFound,
  isDownloading,
  confirmDelete,
  onBack,
  onDownload,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: LocalUploadDetailViewProps) => {
  return (
    <div className="flex flex-col gap-6 px-5">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Back to local uploads
      </Button>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading upload…
        </div>
      ) : notFound || !upload ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Upload not found.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {upload.fileName}
                </h1>
                <div className="mt-2">
                  <StatusBadge status={upload.status} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={upload.status !== "COMPLETED" || isDownloading}
                  onClick={onDownload}
                >
                  <Download className="size-4" />
                  Download
                </Button>
                <Button variant="destructive" onClick={onRequestDelete}>
                  <Trash2 className="size-4" />
                  Delete permanently
                </Button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Upload ID</dt>
                <dd className="font-mono text-xs break-all">{upload.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">File hash</dt>
                <dd className="font-mono text-xs break-all">
                  {upload.fileHash}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">File size</dt>
                <dd>{(upload.fileSize / 1024 / 1024).toFixed(2)} MB</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Chunks</dt>
                <dd>
                  {upload.uploadedChunks}/{upload.totalChunks}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(upload.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(upload.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <ChunkInspector uploadId={upload.id} />

          <ConfirmDialog
            isOpen={confirmDelete}
            resourceLabel={upload.fileName}
            consequence="This permanently removes the upload record, any leftover chunks, and the file on disk. This cannot be undone."
            onConfirm={onConfirmDelete}
            onCancel={onCancelDelete}
          />
        </>
      )}
    </div>
  );
};

export default LocalUploadDetailView;
