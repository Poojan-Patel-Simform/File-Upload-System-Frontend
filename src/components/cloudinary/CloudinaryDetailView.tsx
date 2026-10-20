"use client";

import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { CloudinaryAssetItem } from "@/types/cloudinary/adminApi";

type CloudinaryDetailViewProps = {
  asset: CloudinaryAssetItem | null;
  isLoading: boolean;
  notFound: boolean;
  confirmDelete: boolean;
  onBack: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
};

/** Presentational detail page for one Cloudinary asset with a delete action; shows loading and not-found states. */
const CloudinaryDetailView = ({
  asset,
  isLoading,
  notFound,
  confirmDelete,
  onBack,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: CloudinaryDetailViewProps) => {
  return (
    <div className="flex flex-col gap-6 px-5">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Back to Cloudinary assets
      </Button>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading asset…
        </div>
      ) : notFound || !asset ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Asset not found.
        </p>
      ) : (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="flex items-start justify-end gap-4">
            <Button variant="destructive" onClick={onRequestDelete}>
              <Trash2 className="size-4" />
              Delete permanently
            </Button>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Public ID</dt>
              <dd className="font-mono text-xs break-all">{asset.publicId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">File hash</dt>
              <dd className="font-mono text-xs break-all">{asset.fileHash}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">URL</dt>
              <dd className="text-xs break-all">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {asset.url}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(asset.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(asset.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        resourceLabel={asset?.publicId ?? "this asset"}
        consequence="This deletes the asset from Cloudinary and removes its record. This cannot be undone."
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  );
};

export default CloudinaryDetailView;
