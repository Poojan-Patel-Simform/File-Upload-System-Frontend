"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChunksInspection } from "@/types/local-uploads/adminApi";

type ChunkInspectorViewProps = {
  chunks: ChunksInspection;
  receivedIndices: Set<number>;
  selectedIndex: number | null;
  checksum: string | null;
  isChecksumLoading: boolean;
  pendingDeleteIndex: number | null;
  confirmClearAll: boolean;
  onSquareClick: (index: number) => void;
  onChecksumDialogClose: () => void;
  onRequestDeleteSelected: () => void;
  onConfirmDeleteChunk: () => Promise<void>;
  onCancelDeleteChunk: () => void;
  onRequestClearAll: () => void;
  onConfirmClearAll: () => Promise<void>;
  onCancelClearAll: () => void;
};

const ChunkInspectorView = ({
  chunks,
  receivedIndices,
  selectedIndex,
  checksum,
  isChecksumLoading,
  pendingDeleteIndex,
  confirmClearAll,
  onSquareClick,
  onChecksumDialogClose,
  onRequestDeleteSelected,
  onConfirmDeleteChunk,
  onCancelDeleteChunk,
  onRequestClearAll,
  onConfirmClearAll,
  onCancelClearAll,
}: ChunkInspectorViewProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Chunk inspector
        </h2>
        <Button variant="destructive" size="sm" onClick={onRequestClearAll}>
          <Trash2 className="size-4" />
          Clear all chunks
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1.5">
        {Array.from({ length: chunks.totalChunks }, (_, index) => {
          const received = receivedIndices.has(index);
          return (
            <button
              key={index}
              onClick={() => onSquareClick(index)}
              title={`Chunk ${index} — ${received ? "received" : "missing"}`}
              className={cn(
                "aspect-square rounded-md border text-[10px] font-medium transition-colors",
                received
                  ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30 cursor-pointer"
                  : "border-white/10 bg-white/5 text-muted-foreground cursor-default",
              )}
            >
              {index}
            </button>
          );
        })}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) onChecksumDialogClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chunk {selectedIndex}</DialogTitle>
            <DialogDescription>
              {isChecksumLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Loading checksum…
                </span>
              ) : (
                <span className="font-mono text-xs break-all">
                  {checksum ?? "No checksum recorded for this chunk"}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <Button variant="destructive" onClick={onRequestDeleteSelected}>
            <Trash2 className="size-4" />
            Delete this chunk
          </Button>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={pendingDeleteIndex !== null}
        resourceLabel={`chunk ${pendingDeleteIndex}`}
        consequence="Removes this chunk's Redis record, forcing the client to retry uploading it."
        onConfirm={onConfirmDeleteChunk}
        onCancel={onCancelDeleteChunk}
      />

      <ConfirmDialog
        isOpen={confirmClearAll}
        resourceLabel="all chunks"
        consequence="Removes all Redis chunk records for this upload. Does not touch the DB status or on-disk files."
        onConfirm={onConfirmClearAll}
        onCancel={onCancelClearAll}
      />
    </div>
  );
};

export default ChunkInspectorView;
