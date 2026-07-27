"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { LocalUploadListItem, UploadStatus } from "@/types/local-uploads/adminApi";

const STATUS_OPTIONS: (UploadStatus | "")[] = [
  "",
  "NEW",
  "UPLOADING",
  "MERGING",
  "COMPLETED",
  "FAILED",
];

type LocalUploadsListViewProps = {
  status: UploadStatus | "";
  items: LocalUploadListItem[];
  total: number;
  take: number;
  skip: number;
  isLoading: boolean;
  error: string | null;
  downloadingId: string | null;
  pendingDeleteLabel: string;
  isConfirmDeleteOpen: boolean;
  onStatusChange: (status: UploadStatus | "") => void;
  onSkipChange: (skip: number) => void;
  onRowClick: (id: string) => void;
  onDownload: (id: string, fileName: string) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
};

const LocalUploadsListView = ({
  status,
  items,
  total,
  take,
  skip,
  isLoading,
  error,
  downloadingId,
  pendingDeleteLabel,
  isConfirmDeleteOpen,
  onStatusChange,
  onSkipChange,
  onRowClick,
  onDownload,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: LocalUploadsListViewProps) => {
  return (
    <div className="flex flex-col gap-6 px-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            Local Uploads
          </h1>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as UploadStatus | "")}
            className="rounded-xl border border-border bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {option || "All statuses"}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading uploads…
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No uploads found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">File name</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Size</th>
                  <th className="py-2 pr-4 font-medium">Chunks</th>
                  <th className="py-2 pr-4 font-medium">Updated</th>
                  <th className="py-2 pr-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick(item.id)}
                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {item.fileName}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {item.uploadedChunks}/{item.totalChunks}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="icon-sm"
                          disabled={
                            item.status !== "COMPLETED" ||
                            downloadingId === item.id
                          }
                          onClick={() => onDownload(item.id, item.fileName)}
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => onRequestDelete(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && (
          <Pagination
            take={take}
            skip={skip}
            total={total}
            onSkipChange={onSkipChange}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        resourceLabel={pendingDeleteLabel}
        consequence="This permanently removes the upload record, any leftover chunks, and the file on disk. This cannot be undone."
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  );
};

export default LocalUploadsListView;
