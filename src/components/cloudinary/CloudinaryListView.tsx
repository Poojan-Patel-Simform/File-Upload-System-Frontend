"use client";

import { Loader2, Trash2 } from "lucide-react";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { CloudinaryAssetItem } from "@/types/cloudinary/adminApi";

type CloudinaryListViewProps = {
  items: CloudinaryAssetItem[];
  total: number;
  take: number;
  skip: number;
  isLoading: boolean;
  error: string | null;
  pendingDeleteLabel: string;
  isConfirmDeleteOpen: boolean;
  onSkipChange: (skip: number) => void;
  onRowClick: (id: string) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
};

/** Presentational table of Cloudinary assets with pagination and delete confirmation; take/skip/total drive paging. */
const CloudinaryListView = ({
  items,
  total,
  take,
  skip,
  isLoading,
  error,
  pendingDeleteLabel,
  isConfirmDeleteOpen,
  onSkipChange,
  onRowClick,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: CloudinaryListViewProps) => {
  return (
    <div className="flex flex-col gap-6 px-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <h1 className="text-lg font-semibold text-foreground">
          Cloudinary assets
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading assets…
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No Cloudinary assets found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Public ID</th>
                  <th className="py-2 pr-4 font-medium">File hash</th>
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
                      {item.publicId}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {item.fileHash.slice(0, 12)}…
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <div
                        className="flex items-center justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
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
        consequence="This deletes the asset from Cloudinary and removes its record. This cannot be undone."
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  );
};

export default CloudinaryListView;
